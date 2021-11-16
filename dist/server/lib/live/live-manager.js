"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveManager = void 0;
const tslib_1 = require("tslib");
const net_1 = require("net");
const core_utils_1 = require("@server/helpers/core-utils");
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const video_1 = require("@server/models/video/video");
const video_live_1 = require("@server/models/video/video-live");
const video_streaming_playlist_1 = require("@server/models/video/video-streaming-playlist");
const videos_1 = require("../activitypub/videos");
const job_queue_1 = require("../job-queue");
const peertube_socket_1 = require("../peertube-socket");
const paths_1 = require("../paths");
const live_quota_store_1 = require("./live-quota-store");
const live_segment_sha_store_1 = require("./live-segment-sha-store");
const shared_1 = require("./shared");
const NodeRtmpSession = require('node-media-server/src/node_rtmp_session');
const context = require('node-media-server/src/node_core_ctx');
const nodeMediaServerLogger = require('node-media-server/src/node_core_logger');
nodeMediaServerLogger.setLogType(0);
const config = {
    rtmp: {
        port: config_1.CONFIG.LIVE.RTMP.PORT,
        chunk_size: constants_1.VIDEO_LIVE.RTMP.CHUNK_SIZE,
        gop_cache: constants_1.VIDEO_LIVE.RTMP.GOP_CACHE,
        ping: constants_1.VIDEO_LIVE.RTMP.PING,
        ping_timeout: constants_1.VIDEO_LIVE.RTMP.PING_TIMEOUT
    },
    transcoding: {
        ffmpeg: 'ffmpeg'
    }
};
const lTags = logger_1.loggerTagsFactory('live');
class LiveManager {
    constructor() {
        this.muxingSessions = new Map();
        this.videoSessions = new Map();
        this.watchersPerVideo = new Map();
    }
    init() {
        const events = this.getContext().nodeEvent;
        events.on('postPublish', (sessionId, streamPath) => {
            logger_1.logger.debug('RTMP received stream', Object.assign({ id: sessionId, streamPath }, lTags(sessionId)));
            const splittedPath = streamPath.split('/');
            if (splittedPath.length !== 3 || splittedPath[1] !== constants_1.VIDEO_LIVE.RTMP.BASE_PATH) {
                logger_1.logger.warn('Live path is incorrect.', Object.assign({ streamPath }, lTags(sessionId)));
                return this.abortSession(sessionId);
            }
            this.handleSession(sessionId, streamPath, splittedPath[2])
                .catch(err => logger_1.logger.error('Cannot handle sessions.', Object.assign({ err }, lTags(sessionId))));
        });
        events.on('donePublish', sessionId => {
            logger_1.logger.info('Live session ended.', Object.assign({ sessionId }, lTags(sessionId)));
        });
        config_1.registerConfigChangedHandler(() => {
            if (!this.rtmpServer && config_1.CONFIG.LIVE.ENABLED === true) {
                this.run();
                return;
            }
            if (this.rtmpServer && config_1.CONFIG.LIVE.ENABLED === false) {
                this.stop();
            }
        });
        this.handleBrokenLives()
            .catch(err => logger_1.logger.error('Cannot handle broken lives.', Object.assign({ err }, lTags())));
        setInterval(() => this.updateLiveViews(), constants_1.VIEW_LIFETIME.LIVE);
    }
    run() {
        logger_1.logger.info('Running RTMP server on port %d', config.rtmp.port, lTags());
        this.rtmpServer = net_1.createServer(socket => {
            const session = new NodeRtmpSession(config, socket);
            session.run();
        });
        this.rtmpServer.on('error', err => {
            logger_1.logger.error('Cannot run RTMP server.', Object.assign({ err }, lTags()));
        });
        this.rtmpServer.listen(config_1.CONFIG.LIVE.RTMP.PORT);
    }
    stop() {
        logger_1.logger.info('Stopping RTMP server.', lTags());
        this.rtmpServer.close();
        this.rtmpServer = undefined;
        this.getContext().sessions.forEach((session) => {
            if (session instanceof NodeRtmpSession) {
                session.stop();
            }
        });
    }
    isRunning() {
        return !!this.rtmpServer;
    }
    stopSessionOf(videoId) {
        const sessionId = this.videoSessions.get(videoId);
        if (!sessionId)
            return;
        this.videoSessions.delete(videoId);
        this.abortSession(sessionId);
    }
    addViewTo(videoId) {
        if (this.videoSessions.has(videoId) === false)
            return;
        let watchers = this.watchersPerVideo.get(videoId);
        if (!watchers) {
            watchers = [];
            this.watchersPerVideo.set(videoId, watchers);
        }
        watchers.push(new Date().getTime());
    }
    getContext() {
        return context;
    }
    abortSession(sessionId) {
        const session = this.getContext().sessions.get(sessionId);
        if (session) {
            session.stop();
            this.getContext().sessions.delete(sessionId);
        }
        const muxingSession = this.muxingSessions.get(sessionId);
        if (muxingSession) {
            muxingSession.abort();
            this.muxingSessions.delete(sessionId);
        }
    }
    handleSession(sessionId, streamPath, streamKey) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const pendingStreamJobs = yield job_queue_1.JobQueue.Instance.getQueues('video-live-ending', ['delayed']);
            const currentSessionJob = pendingStreamJobs.find((job) => job.data.name === streamKey);
            const videoLive = currentSessionJob
                ? yield video_live_1.VideoLiveModel.loadByStreamKeyLiveEnded(streamKey)
                : yield video_live_1.VideoLiveModel.loadByStreamKey(streamKey);
            if (currentSessionJob) {
                yield currentSessionJob.remove();
            }
            if (!videoLive) {
                logger_1.logger.warn('Unknown live video with stream key %s.', streamKey, lTags(sessionId));
                return this.abortSession(sessionId);
            }
            const video = videoLive.Video;
            if (video.isBlacklisted()) {
                logger_1.logger.warn('Video is blacklisted. Refusing stream %s.', streamKey, lTags(sessionId, video.uuid));
                return this.abortSession(sessionId);
            }
            live_segment_sha_store_1.LiveSegmentShaStore.Instance.cleanupShaSegments(video.uuid);
            const oldStreamingPlaylist = yield video_streaming_playlist_1.VideoStreamingPlaylistModel.loadHLSPlaylistByVideo(video.id);
            this.videoSessions.set(video.id, sessionId);
            const rtmpUrl = 'rtmp://127.0.0.1:' + config.rtmp.port + streamPath;
            const now = Date.now();
            const probe = yield ffprobe_utils_1.ffprobePromise(rtmpUrl);
            const [{ resolution, ratio }, fps, bitrate] = yield Promise.all([
                ffprobe_utils_1.getVideoFileResolution(rtmpUrl, probe),
                ffprobe_utils_1.getVideoFileFPS(rtmpUrl, probe),
                ffprobe_utils_1.getVideoFileBitrate(rtmpUrl, probe)
            ]);
            logger_1.logger.info('%s probing took %d ms (bitrate: %d, fps: %d, resolution: %d)', rtmpUrl, Date.now() - now, bitrate, fps, resolution, lTags(sessionId, video.uuid));
            const allResolutions = this.buildAllResolutionsToTranscode(resolution);
            logger_1.logger.info('Will mux/transcode live video of original resolution %d.', resolution, Object.assign({ allResolutions }, lTags(sessionId, video.uuid)));
            let streamingPlaylist;
            if (oldStreamingPlaylist) {
                Object.assign(oldStreamingPlaylist, { Video: video });
                streamingPlaylist = oldStreamingPlaylist;
            }
            else {
                streamingPlaylist = yield this.createLivePlaylist(video, allResolutions);
            }
            return this.runMuxingSession({
                sessionId,
                videoLive,
                streamingPlaylist,
                rtmpUrl,
                fps,
                bitrate,
                ratio,
                allResolutions
            });
        });
    }
    runMuxingSession(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { sessionId, videoLive, streamingPlaylist, allResolutions, fps, bitrate, ratio, rtmpUrl } = options;
            const videoUUID = videoLive.Video.uuid;
            const localLTags = lTags(sessionId, videoUUID);
            const user = yield user_1.UserModel.loadByLiveId(videoLive.id);
            live_quota_store_1.LiveQuotaStore.Instance.addNewLive(user.id, videoLive.id);
            const muxingSession = new shared_1.MuxingSession({
                context: this.getContext(),
                user,
                sessionId,
                videoLive,
                streamingPlaylist,
                rtmpUrl,
                bitrate,
                ratio,
                fps,
                allResolutions
            });
            muxingSession.on('master-playlist-created', () => this.publishAndFederateLive(videoLive, localLTags));
            muxingSession.on('bad-socket-health', ({ videoId }) => {
                logger_1.logger.error('Too much data in client socket stream (ffmpeg is too slow to transcode the video).' +
                    ' Stopping session of video %s.', videoUUID, localLTags);
                this.stopSessionOf(videoId);
            });
            muxingSession.on('duration-exceeded', ({ videoId }) => {
                logger_1.logger.info('Stopping session of %s: max duration exceeded.', videoUUID, localLTags);
                this.stopSessionOf(videoId);
            });
            muxingSession.on('quota-exceeded', ({ videoId }) => {
                logger_1.logger.info('Stopping session of %s: user quota exceeded.', videoUUID, localLTags);
                this.stopSessionOf(videoId);
            });
            muxingSession.on('ffmpeg-error', ({ sessionId }) => this.abortSession(sessionId));
            muxingSession.on('ffmpeg-end', ({ videoId }) => {
                this.onMuxingFFmpegEnd(videoId);
            });
            muxingSession.on('after-cleanup', ({ videoId }) => {
                this.muxingSessions.delete(sessionId);
                muxingSession.destroy();
                return this.onAfterMuxingCleanup(videoId, false, videoLive.streamKey)
                    .catch(err => logger_1.logger.error('Error in end transmuxing.', Object.assign({ err }, localLTags)));
            });
            this.muxingSessions.set(sessionId, muxingSession);
            muxingSession.runMuxing()
                .catch(err => {
                logger_1.logger.error('Cannot run muxing.', Object.assign({ err }, localLTags));
                this.abortSession(sessionId);
            });
        });
    }
    publishAndFederateLive(live, localLTags) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const videoId = live.videoId;
            try {
                const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(videoId);
                logger_1.logger.info('Will publish and federate live %s.', video.url, localLTags);
                video.state = 1;
                yield video.save();
                live.Video = video;
                setTimeout(() => {
                    videos_1.federateVideoIfNeeded(video, false)
                        .catch(err => logger_1.logger.error('Cannot federate live video %s.', video.url, Object.assign({ err }, localLTags)));
                    peertube_socket_1.PeerTubeSocket.Instance.sendVideoLiveNewState(video);
                }, constants_1.VIDEO_LIVE.SEGMENT_TIME_SECONDS * 1000 * constants_1.VIDEO_LIVE.EDGE_LIVE_DELAY_SEGMENTS_NOTIFICATION);
            }
            catch (err) {
                logger_1.logger.error('Cannot save/federate live video %d.', videoId, Object.assign({ err }, localLTags));
            }
        });
    }
    onMuxingFFmpegEnd(videoId) {
        this.watchersPerVideo.delete(videoId);
        this.videoSessions.delete(videoId);
    }
    onAfterMuxingCleanup(videoUUID, cleanupNow = false, jobName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const fullVideo = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(videoUUID);
                if (!fullVideo)
                    return;
                const live = yield video_live_1.VideoLiveModel.loadByVideoId(fullVideo.id);
                if (!live.permanentLive) {
                    job_queue_1.JobQueue.Instance.createJob({
                        type: 'video-live-ending',
                        payload: {
                            videoId: fullVideo.id,
                            name: jobName
                        }
                    }, { delay: 500000 });
                    fullVideo.state = 5;
                }
                else {
                    fullVideo.state = 4;
                }
                yield fullVideo.save();
                peertube_socket_1.PeerTubeSocket.Instance.sendVideoLiveNewState(fullVideo);
                yield videos_1.federateVideoIfNeeded(fullVideo, false);
            }
            catch (err) {
                logger_1.logger.error('Cannot save/federate new video state of live streaming of video %d.', videoUUID, Object.assign({ err }, lTags(videoUUID)));
            }
        });
    }
    updateLiveViews() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isRunning())
                return;
            if (!core_utils_1.isTestInstance())
                logger_1.logger.info('Updating live video views.', lTags());
            for (const videoId of this.watchersPerVideo.keys()) {
                const notBefore = new Date().getTime() - constants_1.VIEW_LIFETIME.LIVE;
                const watchers = this.watchersPerVideo.get(videoId);
                const numWatchers = watchers.length;
                const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(videoId);
                video.views = numWatchers;
                yield video.save();
                yield videos_1.federateVideoIfNeeded(video, false);
                peertube_socket_1.PeerTubeSocket.Instance.sendVideoViewsUpdate(video);
                const newWatchers = watchers.filter(w => w > notBefore);
                this.watchersPerVideo.set(videoId, newWatchers);
                logger_1.logger.debug('New live video views for %s is %d.', video.url, numWatchers, lTags());
            }
        });
    }
    handleBrokenLives() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const videoUUIDs = yield video_1.VideoModel.listPublishedLiveUUIDs();
            for (const uuid of videoUUIDs) {
                yield this.onAfterMuxingCleanup(uuid, true);
            }
        });
    }
    buildAllResolutionsToTranscode(originResolution) {
        const resolutionsEnabled = config_1.CONFIG.LIVE.TRANSCODING.ENABLED
            ? ffprobe_utils_1.computeResolutionsToTranscode(originResolution, 'live')
            : [];
        return resolutionsEnabled.concat([originResolution]);
    }
    createLivePlaylist(video, allResolutions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const playlist = yield video_streaming_playlist_1.VideoStreamingPlaylistModel.loadOrGenerate(video);
            playlist.playlistFilename = paths_1.generateHLSMasterPlaylistFilename(true);
            playlist.segmentsSha256Filename = paths_1.generateHlsSha256SegmentsFilename(true);
            playlist.p2pMediaLoaderPeerVersion = constants_1.P2P_MEDIA_LOADER_PEER_VERSION;
            playlist.type = 1;
            playlist.assignP2PMediaLoaderInfoHashes(video, allResolutions);
            return playlist.save();
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.LiveManager = LiveManager;
