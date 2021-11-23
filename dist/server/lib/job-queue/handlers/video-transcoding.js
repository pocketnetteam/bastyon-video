"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewWebTorrentFileResolution = exports.createHlsJobIfEnabled = exports.processVideoTranscoding = void 0;
const tslib_1 = require("tslib");
const video_1 = require("@server/lib/video");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const video_state_1 = require("@server/lib/video-state");
const user_1 = require("@server/models/user/user");
const video_job_info_1 = require("@server/models/video/video-job-info");
const database_utils_1 = require("../../../helpers/database-utils");
const ffprobe_utils_1 = require("../../../helpers/ffprobe-utils");
const logger_1 = require("../../../helpers/logger");
const config_1 = require("../../../initializers/config");
const video_2 = require("../../../models/video/video");
const video_transcoding_1 = require("../../transcoding/video-transcoding");
const constants_1 = require("../../../initializers/constants");
const handlers = {
    'new-resolution-to-hls': handleHLSJob,
    'new-resolution-to-webtorrent': handleNewWebTorrentResolutionJob,
    'merge-audio-to-webtorrent': handleWebTorrentMergeAudioJob,
    'optimize-to-webtorrent': handleWebTorrentOptimizeJob
};
const lTags = (0, logger_1.loggerTagsFactory)('transcoding');
function processVideoTranscoding(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        logger_1.logger.info('Processing transcoding job %d.', job.id, lTags(payload.videoUUID));
        const video = yield video_2.VideoModel.loadAndPopulateAccountAndServerAndTags(payload.videoUUID);
        if (!video) {
            logger_1.logger.info('Do not process job %d, video does not exist.', job.id, lTags(payload.videoUUID));
            return undefined;
        }
        const user = yield user_1.UserModel.loadByChannelActorId(video.VideoChannel.actorId);
        const handler = handlers[payload.type];
        if (!handler) {
            throw new Error('Cannot find transcoding handler for ' + payload.type);
        }
        yield handler(job, payload, video, user);
        return video;
    });
}
exports.processVideoTranscoding = processVideoTranscoding;
function handleHLSJob(job, payload, video, user) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Handling HLS transcoding job for %s.', video.uuid, lTags(video.uuid));
        const videoFileInput = payload.copyCodecs
            ? (video.getWebTorrentFile(payload.resolution) || video.getMaxQualityFile())
            : video.getMaxQualityFile();
        const videoOrStreamingPlaylist = videoFileInput.getVideoOrStreamingPlaylist();
        yield video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(videoOrStreamingPlaylist, videoFileInput, videoInputPath => {
            return (0, video_transcoding_1.generateHlsPlaylistResolution)({
                video,
                videoInputPath,
                resolution: payload.resolution,
                copyCodecs: payload.copyCodecs,
                isPortraitMode: payload.isPortraitMode || false,
                job
            });
        });
        logger_1.logger.info('HLS transcoding job for %s ended.', video.uuid, lTags(video.uuid));
        yield (0, database_utils_1.retryTransactionWrapper)(onHlsPlaylistGeneration, video, user, payload);
    });
}
function handleNewWebTorrentResolutionJob(job, payload, video, user) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Handling WebTorrent transcoding job for %s.', video.uuid, lTags(video.uuid));
        yield (0, video_transcoding_1.transcodeNewWebTorrentResolution)(video, payload.resolution, payload.isPortraitMode || false, job);
        logger_1.logger.info('WebTorrent transcoding job for %s ended.', video.uuid, lTags(video.uuid));
        yield (0, database_utils_1.retryTransactionWrapper)(onNewWebTorrentFileResolution, video, user, payload);
    });
}
function handleWebTorrentMergeAudioJob(job, payload, video, user) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Handling merge audio transcoding job for %s.', video.uuid, lTags(video.uuid));
        yield (0, video_transcoding_1.mergeAudioVideofile)(video, payload.resolution, job);
        logger_1.logger.info('Merge audio transcoding job for %s ended.', video.uuid, lTags(video.uuid));
        yield (0, database_utils_1.retryTransactionWrapper)(onVideoFileOptimizer, video, payload, 'video', user);
    });
}
function handleWebTorrentOptimizeJob(job, payload, video, user) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Handling optimize transcoding job for %s.', video.uuid, lTags(video.uuid));
        const { transcodeType } = yield (0, video_transcoding_1.optimizeOriginalVideofile)(video, video.getMaxQualityFile(), job);
        logger_1.logger.info('Optimize transcoding job for %s ended.', video.uuid, lTags(video.uuid));
        yield (0, database_utils_1.retryTransactionWrapper)(onVideoFileOptimizer, video, payload, transcodeType, user);
    });
}
function onHlsPlaylistGeneration(video, user, payload) {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (payload.isMaxQuality && config_1.CONFIG.TRANSCODING.WEBTORRENT.ENABLED === false) {
            for (const file of video.VideoFiles) {
                yield video.removeFileAndTorrent(file);
                yield file.destroy();
            }
            video.VideoFiles = [];
            yield createLowerResolutionsJobs({
                video,
                user,
                videoFileResolution: payload.resolution,
                isPortraitMode: payload.isPortraitMode,
                isNewVideo: (_a = payload.isNewVideo) !== null && _a !== void 0 ? _a : true,
                type: 'hls'
            });
        }
        yield video_job_info_1.VideoJobInfoModel.decrease(video.uuid, 'pendingTranscode');
        yield (0, video_state_1.moveToNextState)(video, payload.isNewVideo);
    });
}
function onVideoFileOptimizer(videoArg, payload, transcodeType, user) {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { resolution, isPortraitMode } = yield videoArg.getMaxQualityResolution();
        const videoDatabase = yield video_2.VideoModel.loadAndPopulateAccountAndServerAndTags(videoArg.uuid);
        if (!videoDatabase)
            return undefined;
        const originalFileHLSPayload = Object.assign(Object.assign({}, payload), { isPortraitMode, resolution: videoDatabase.getMaxQualityFile().resolution > constants_1.MAX_ALLOWED_RESOLUTION
                ? constants_1.MAX_ALLOWED_RESOLUTION
                : videoDatabase.getMaxQualityFile().resolution, copyCodecs: transcodeType !== 'quick-transcode', isMaxQuality: true });
        const hasHls = yield createHlsJobIfEnabled(user, originalFileHLSPayload);
        const hasNewResolutions = yield createLowerResolutionsJobs({
            video: videoDatabase,
            user,
            videoFileResolution: resolution,
            isPortraitMode,
            type: 'webtorrent',
            isNewVideo: (_a = payload.isNewVideo) !== null && _a !== void 0 ? _a : true
        });
        yield video_job_info_1.VideoJobInfoModel.decrease(videoDatabase.uuid, 'pendingTranscode');
        if (!hasHls && !hasNewResolutions) {
            yield (0, video_state_1.moveToNextState)(videoDatabase, payload.isNewVideo);
        }
    });
}
function onNewWebTorrentFileResolution(video, user, payload) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield createHlsJobIfEnabled(user, Object.assign(Object.assign({}, payload), { copyCodecs: true, isMaxQuality: false }));
        yield video_job_info_1.VideoJobInfoModel.decrease(video.uuid, 'pendingTranscode');
        yield (0, video_state_1.moveToNextState)(video, payload.isNewVideo);
    });
}
exports.onNewWebTorrentFileResolution = onNewWebTorrentFileResolution;
function createHlsJobIfEnabled(user, payload) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!payload || config_1.CONFIG.TRANSCODING.ENABLED !== true || config_1.CONFIG.TRANSCODING.HLS.ENABLED !== true)
            return false;
        const jobOptions = {
            priority: yield (0, video_1.getTranscodingJobPriority)(user)
        };
        const hlsTranscodingPayload = {
            type: 'new-resolution-to-hls',
            videoUUID: payload.videoUUID,
            resolution: payload.resolution,
            isPortraitMode: payload.isPortraitMode,
            copyCodecs: payload.copyCodecs,
            isMaxQuality: payload.isMaxQuality,
            isNewVideo: payload.isNewVideo
        };
        yield (0, video_1.addTranscodingJob)(hlsTranscodingPayload, jobOptions);
        return true;
    });
}
exports.createHlsJobIfEnabled = createHlsJobIfEnabled;
function createLowerResolutionsJobs(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { video, user, videoFileResolution, isPortraitMode, isNewVideo, type } = options;
        const resolutionsEnabled = (0, ffprobe_utils_1.computeResolutionsToTranscode)(videoFileResolution, 'vod');
        const resolutionCreated = [];
        for (const resolution of resolutionsEnabled) {
            let dataInput;
            if (config_1.CONFIG.TRANSCODING.WEBTORRENT.ENABLED && type === 'webtorrent') {
                dataInput = {
                    type: 'new-resolution-to-webtorrent',
                    videoUUID: video.uuid,
                    resolution,
                    isPortraitMode,
                    isNewVideo
                };
                resolutionCreated.push('webtorrent-' + resolution);
            }
            if (config_1.CONFIG.TRANSCODING.HLS.ENABLED && type === 'hls') {
                dataInput = {
                    type: 'new-resolution-to-hls',
                    videoUUID: video.uuid,
                    resolution,
                    isPortraitMode,
                    copyCodecs: false,
                    isMaxQuality: false,
                    isNewVideo
                };
                resolutionCreated.push('hls-' + resolution);
            }
            if (!dataInput)
                continue;
            const jobOptions = {
                priority: yield (0, video_1.getTranscodingJobPriority)(user)
            };
            yield (0, video_1.addTranscodingJob)(dataInput, jobOptions);
        }
        if (resolutionCreated.length === 0) {
            logger_1.logger.info('No transcoding jobs created for video %s (no resolutions).', video.uuid, lTags(video.uuid));
            return false;
        }
        logger_1.logger.info('New resolutions %s transcoding jobs created for video %s and origin file resolution of %d.', type, video.uuid, videoFileResolution, Object.assign({ resolutionCreated }, lTags(video.uuid)));
        return true;
    });
}
