"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuxingSession = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const chokidar_1 = require("chokidar");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const stream_1 = require("stream");
const ffmpeg_utils_1 = require("@server/helpers/ffmpeg-utils");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const video_file_1 = require("@server/models/video/video-file");
const paths_1 = require("../../paths");
const video_transcoding_profiles_1 = require("../../transcoding/video-transcoding-profiles");
const user_1 = require("../../user");
const live_quota_store_1 = require("../live-quota-store");
const live_segment_sha_store_1 = require("../live-segment-sha-store");
const live_utils_1 = require("../live-utils");
const memoizee = require("memoizee");
class MuxingSession extends stream_1.EventEmitter {
    constructor(options) {
        super();
        this.segmentsToProcessPerPlaylist = {};
        this.isAbleToUploadVideoWithCache = memoizee((userId) => {
            return user_1.isAbleToUploadVideo(userId, 1000);
        }, { maxAge: constants_1.MEMOIZE_TTL.LIVE_ABLE_TO_UPLOAD });
        this.hasClientSocketInBadHealthWithCache = memoizee((sessionId) => {
            return this.hasClientSocketInBadHealth(sessionId);
        }, { maxAge: constants_1.MEMOIZE_TTL.LIVE_CHECK_SOCKET_HEALTH });
        this.context = options.context;
        this.user = options.user;
        this.sessionId = options.sessionId;
        this.videoLive = options.videoLive;
        this.streamingPlaylist = options.streamingPlaylist;
        this.rtmpUrl = options.rtmpUrl;
        this.fps = options.fps;
        this.bitrate = options.bitrate;
        this.ratio = options.ratio;
        this.allResolutions = options.allResolutions;
        this.videoId = this.videoLive.Video.id;
        this.videoUUID = this.videoLive.Video.uuid;
        this.saveReplay = this.videoLive.saveReplay;
        this.lTags = logger_1.loggerTagsFactory('live', this.sessionId, this.videoUUID);
    }
    runMuxing() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.createFiles();
            const outPath = yield this.prepareDirectories();
            this.ffmpegCommand = config_1.CONFIG.LIVE.TRANSCODING.ENABLED
                ? yield ffmpeg_utils_1.getLiveTranscodingCommand({
                    rtmpUrl: this.rtmpUrl,
                    outPath,
                    masterPlaylistName: this.streamingPlaylist.playlistFilename,
                    resolutions: this.allResolutions,
                    fps: this.fps,
                    bitrate: this.bitrate,
                    ratio: this.ratio,
                    availableEncoders: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableEncoders(),
                    profile: config_1.CONFIG.LIVE.TRANSCODING.PROFILE
                })
                : ffmpeg_utils_1.getLiveMuxingCommand(this.rtmpUrl, outPath, this.streamingPlaylist.playlistFilename);
            logger_1.logger.info('Running live muxing/transcoding for %s.', this.videoUUID, this.lTags);
            yield this.watchTSFiles(outPath);
            this.watchMasterFile(outPath);
            this.ffmpegCommand.on('error', (err, stdout, stderr) => {
                this.onFFmpegError(err, stdout, stderr, outPath);
            });
            this.ffmpegCommand.on('end', () => this.onFFmpegEnded(outPath));
            this.ffmpegCommand.run();
        });
    }
    abort() {
        if (!this.ffmpegCommand)
            return;
        this.ffmpegCommand.kill('SIGINT');
    }
    destroy() {
        this.removeAllListeners();
        this.isAbleToUploadVideoWithCache.clear();
        this.hasClientSocketInBadHealthWithCache.clear();
    }
    onFFmpegError(err, stdout, stderr, outPath) {
        var _a;
        this.onFFmpegEnded(outPath);
        if ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.includes('Exiting normally'))
            return;
        logger_1.logger.error('Live transcoding error.', Object.assign({ err, stdout, stderr }, this.lTags));
        this.emit('ffmpeg-error', ({ sessionId: this.sessionId }));
    }
    onFFmpegEnded(outPath) {
        logger_1.logger.info('RTMP transmuxing for video %s ended. Scheduling cleanup', this.rtmpUrl, this.lTags);
        setTimeout(() => {
            Promise.all([this.tsWatcher.close(), this.masterWatcher.close()])
                .then(() => {
                for (const key of Object.keys(this.segmentsToProcessPerPlaylist)) {
                    this.processSegments(outPath, this.segmentsToProcessPerPlaylist[key]);
                }
            })
                .catch(err => {
                logger_1.logger.error('Cannot close watchers of %s or process remaining hash segments.', outPath, Object.assign({ err }, this.lTags));
            });
            this.emit('after-cleanup', { videoId: this.videoId });
        }, 1000);
    }
    watchMasterFile(outPath) {
        this.masterWatcher = chokidar_1.watch(outPath + '/' + this.streamingPlaylist.playlistFilename);
        this.masterWatcher.on('add', () => {
            this.emit('master-playlist-created', { videoId: this.videoId });
            this.masterWatcher.close()
                .catch(err => logger_1.logger.error('Cannot close master watcher of %s.', outPath, Object.assign({ err }, this.lTags)));
        });
    }
    watchTSFiles(outPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const startStreamDateTime = new Date().getTime();
            this.tsWatcher = chokidar_1.watch(outPath + '/*.ts');
            const playlistIdMatcher = /^([\d+])-/;
            const existingFiles = yield fs_extra_1.readdir(outPath);
            yield Promise.all(existingFiles.map(fileName => fileName.includes('.ts') ? fs_extra_1.unlink(path_1.join(outPath, fileName)) : Promise.resolve()));
            const addHandler = (segmentPath) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                logger_1.logger.debug('Live add handler of %s.', segmentPath, this.lTags);
                const playlistId = path_1.basename(segmentPath).match(playlistIdMatcher)[0];
                const segmentsToProcess = this.segmentsToProcessPerPlaylist[playlistId] || [];
                this.processSegments(outPath, segmentsToProcess);
                this.segmentsToProcessPerPlaylist[playlistId] = [segmentPath];
                if (this.hasClientSocketInBadHealthWithCache(this.sessionId)) {
                    this.emit('bad-socket-health', { videoId: this.videoId });
                    return;
                }
                if (this.isDurationConstraintValid(startStreamDateTime) !== true) {
                    this.emit('duration-exceeded', { videoId: this.videoId });
                    return;
                }
                if ((yield this.isQuotaExceeded(segmentPath)) === true) {
                    this.emit('quota-exceeded', { videoId: this.videoId });
                }
            });
            const deleteHandler = segmentPath => live_segment_sha_store_1.LiveSegmentShaStore.Instance.removeSegmentSha(this.videoUUID, segmentPath);
            this.tsWatcher.on('add', p => addHandler(p));
            this.tsWatcher.on('unlink', p => deleteHandler(p));
        });
    }
    isQuotaExceeded(segmentPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.saveReplay !== true)
                return false;
            try {
                const segmentStat = yield fs_extra_1.stat(segmentPath);
                live_quota_store_1.LiveQuotaStore.Instance.addQuotaTo(this.user.id, this.videoLive.id, segmentStat.size);
                const canUpload = yield this.isAbleToUploadVideoWithCache(this.user.id);
                return canUpload !== true;
            }
            catch (err) {
                logger_1.logger.error('Cannot stat %s or check quota of %d.', segmentPath, this.user.id, Object.assign({ err }, this.lTags));
            }
        });
    }
    createFiles() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.allResolutions.length; i++) {
                const resolution = this.allResolutions[i];
                const existingFile = yield video_file_1.VideoFileModel.loadByPlaylistId(this.streamingPlaylist.id, resolution);
                const file = existingFile || new video_file_1.VideoFileModel({
                    resolution,
                    size: -1,
                    extname: '.ts',
                    infoHash: null,
                    fps: this.fps,
                    videoStreamingPlaylistId: this.streamingPlaylist.id
                });
                if (!existingFile) {
                    video_file_1.VideoFileModel.customUpsert(file, 'streaming-playlist', null)
                        .catch(err => logger_1.logger.error('Cannot create file for live streaming.', Object.assign({ err }, this.lTags)));
                }
            }
        });
    }
    prepareDirectories() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const outPath = paths_1.getLiveDirectory(this.videoLive.Video);
            yield fs_extra_1.ensureDir(outPath);
            const replayDirectory = path_1.join(outPath, constants_1.VIDEO_LIVE.REPLAY_DIRECTORY);
            if (this.videoLive.saveReplay === true) {
                yield fs_extra_1.ensureDir(replayDirectory);
            }
            return outPath;
        });
    }
    isDurationConstraintValid(streamingStartTime) {
        const maxDuration = config_1.CONFIG.LIVE.MAX_DURATION;
        if (maxDuration < 0)
            return true;
        const now = new Date().getTime();
        const max = streamingStartTime + maxDuration;
        return now <= max;
    }
    processSegments(hlsVideoPath, segmentPaths) {
        bluebird_1.mapSeries(segmentPaths, (previousSegment) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield live_segment_sha_store_1.LiveSegmentShaStore.Instance.addSegmentSha(this.videoUUID, previousSegment);
            if (this.saveReplay) {
                yield this.addSegmentToReplay(hlsVideoPath, previousSegment);
            }
        })).catch(err => logger_1.logger.error('Cannot process segments in %s', hlsVideoPath, Object.assign({ err }, this.lTags)));
    }
    hasClientSocketInBadHealth(sessionId) {
        const rtmpSession = this.context.sessions.get(sessionId);
        if (!rtmpSession) {
            logger_1.logger.warn('Cannot get session %s to check players socket health.', sessionId, this.lTags);
            return;
        }
        for (const playerSessionId of rtmpSession.players) {
            const playerSession = this.context.sessions.get(playerSessionId);
            if (!playerSession) {
                logger_1.logger.error('Cannot get player session %s to check socket health.', playerSession, this.lTags);
                continue;
            }
            if (playerSession.socket.writableLength > constants_1.VIDEO_LIVE.MAX_SOCKET_WAITING_DATA) {
                return true;
            }
        }
        return false;
    }
    addSegmentToReplay(hlsVideoPath, segmentPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const segmentName = path_1.basename(segmentPath);
            const dest = path_1.join(hlsVideoPath, constants_1.VIDEO_LIVE.REPLAY_DIRECTORY, live_utils_1.buildConcatenatedName(segmentName));
            try {
                const data = yield fs_extra_1.readFile(segmentPath);
                yield fs_extra_1.appendFile(dest, data);
            }
            catch (err) {
                logger_1.logger.error('Cannot copy segment %s to replay directory.', segmentPath, Object.assign({ err }, this.lTags));
            }
        });
    }
}
exports.MuxingSession = MuxingSession;
