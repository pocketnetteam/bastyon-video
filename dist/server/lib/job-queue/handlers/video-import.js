"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoImport = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const core_utils_1 = require("@server/helpers/core-utils");
const database_utils_1 = require("@server/helpers/database-utils");
const youtube_dl_1 = require("@server/helpers/youtube-dl");
const moderation_1 = require("@server/lib/moderation");
const paths_1 = require("@server/lib/paths");
const hooks_1 = require("@server/lib/plugins/hooks");
const server_config_manager_1 = require("@server/lib/server-config-manager");
const user_1 = require("@server/lib/user");
const video_1 = require("@server/lib/video");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const video_state_1 = require("@server/lib/video-state");
const thumbnail_1 = require("@server/models/video/thumbnail");
const ffprobe_utils_1 = require("../../../helpers/ffprobe-utils");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const webtorrent_1 = require("../../../helpers/webtorrent");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const video_2 = require("../../../models/video/video");
const video_file_1 = require("../../../models/video/video-file");
const video_import_1 = require("../../../models/video/video-import");
const videos_1 = require("../../activitypub/videos");
const notifier_1 = require("../../notifier");
const thumbnail_2 = require("../../thumbnail");
function processVideoImport(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        if (payload.type === 'youtube-dl')
            return processYoutubeDLImport(job, payload);
        if (payload.type === 'magnet-uri' || payload.type === 'torrent-file')
            return processTorrentImport(job, payload);
    });
}
exports.processVideoImport = processVideoImport;
function processTorrentImport(job, payload) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Processing torrent video import in job %d.', job.id);
        const videoImport = yield getVideoImportOrDie(payload.videoImportId);
        const options = {
            type: payload.type,
            videoImportId: payload.videoImportId
        };
        const target = {
            torrentName: videoImport.torrentName ? (0, utils_1.getSecureTorrentName)(videoImport.torrentName) : undefined,
            uri: videoImport.magnetUri
        };
        return processFile(() => (0, webtorrent_1.downloadWebTorrentVideo)(target, constants_1.VIDEO_IMPORT_TIMEOUT), videoImport, options);
    });
}
function processYoutubeDLImport(job, payload) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Processing youtubeDL video import in job %d.', job.id);
        const videoImport = yield getVideoImportOrDie(payload.videoImportId);
        const options = {
            type: payload.type,
            videoImportId: videoImport.id
        };
        const youtubeDL = new youtube_dl_1.YoutubeDL(videoImport.targetUrl, server_config_manager_1.ServerConfigManager.Instance.getEnabledResolutions('vod'));
        return processFile(() => youtubeDL.downloadYoutubeDLVideo(payload.fileExt, constants_1.VIDEO_IMPORT_TIMEOUT), videoImport, options);
    });
}
function getVideoImportOrDie(videoImportId) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoImport = yield video_import_1.VideoImportModel.loadAndPopulateVideo(videoImportId);
        if (!videoImport || !videoImport.Video) {
            throw new Error('Cannot import video %s: the video import or video linked to this import does not exist anymore.');
        }
        return videoImport;
    });
}
function processFile(downloader, videoImport, options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let tempVideoPath;
        let videoFile;
        try {
            tempVideoPath = yield downloader();
            const stats = yield (0, fs_extra_1.stat)(tempVideoPath);
            const isAble = yield (0, user_1.isAbleToUploadVideo)(videoImport.User.id, stats.size);
            if (isAble === false) {
                throw new Error('The user video quota is exceeded with this video to import.');
            }
            const { resolution } = yield (0, ffprobe_utils_1.getVideoFileResolution)(tempVideoPath);
            const fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(tempVideoPath);
            const duration = yield (0, ffprobe_utils_1.getDurationFromVideoFile)(tempVideoPath);
            const fileExt = (0, core_utils_1.getLowercaseExtension)(tempVideoPath);
            const videoFileData = {
                extname: fileExt,
                resolution,
                size: stats.size,
                filename: (0, paths_1.generateWebTorrentVideoFilename)(resolution, fileExt),
                fps,
                videoId: videoImport.videoId
            };
            videoFile = new video_file_1.VideoFileModel(videoFileData);
            const hookName = options.type === 'youtube-dl'
                ? 'filter:api.video.post-import-url.accept.result'
                : 'filter:api.video.post-import-torrent.accept.result';
            const acceptParameters = {
                videoImport,
                video: videoImport.Video,
                videoFilePath: tempVideoPath,
                videoFile,
                user: videoImport.User
            };
            const acceptedResult = yield hooks_1.Hooks.wrapFun(moderation_1.isPostImportVideoAccepted, acceptParameters, hookName);
            if (acceptedResult.accepted !== true) {
                logger_1.logger.info('Refused imported video.', { acceptedResult, acceptParameters });
                videoImport.state = 4;
                yield videoImport.save();
                throw new Error(acceptedResult.errorMessage);
            }
            const videoWithFiles = Object.assign(videoImport.Video, { VideoFiles: [videoFile], VideoStreamingPlaylists: [] });
            const videoImportWithFiles = Object.assign(videoImport, { Video: videoWithFiles });
            const videoDestFile = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(videoImportWithFiles.Video, videoFile);
            yield (0, fs_extra_1.move)(tempVideoPath, videoDestFile);
            tempVideoPath = null;
            let thumbnailModel;
            let thumbnailSave;
            if (!videoImportWithFiles.Video.getMiniature()) {
                thumbnailModel = yield (0, thumbnail_2.generateVideoMiniature)({
                    video: videoImportWithFiles.Video,
                    videoFile,
                    type: 1
                });
                thumbnailSave = thumbnailModel.toJSON();
            }
            let previewModel;
            let previewSave;
            if (!videoImportWithFiles.Video.getPreview()) {
                previewModel = yield (0, thumbnail_2.generateVideoMiniature)({
                    video: videoImportWithFiles.Video,
                    videoFile,
                    type: 2
                });
                previewSave = previewModel.toJSON();
            }
            yield (0, webtorrent_1.createTorrentAndSetInfoHash)(videoImportWithFiles.Video, videoFile);
            const videoFileSave = videoFile.toJSON();
            const { videoImportUpdated, video } = yield (0, database_utils_1.retryTransactionWrapper)(() => {
                return database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const videoImportToUpdate = videoImportWithFiles;
                    const video = yield video_2.VideoModel.load(videoImportToUpdate.videoId, t);
                    if (!video)
                        throw new Error('Video linked to import ' + videoImportToUpdate.videoId + ' does not exist anymore.');
                    const videoFileCreated = yield videoFile.save({ transaction: t });
                    video.duration = duration;
                    video.state = (0, video_state_1.buildNextVideoState)(video.state);
                    yield video.save({ transaction: t });
                    if (thumbnailModel)
                        yield video.addAndSaveThumbnail(thumbnailModel, t);
                    if (previewModel)
                        yield video.addAndSaveThumbnail(previewModel, t);
                    const videoForFederation = yield video_2.VideoModel.loadAndPopulateAccountAndServerAndTags(video.uuid, t);
                    yield (0, videos_1.federateVideoIfNeeded)(videoForFederation, true, t);
                    videoImportToUpdate.state = 2;
                    const videoImportUpdated = yield videoImportToUpdate.save({ transaction: t });
                    videoImportUpdated.Video = video;
                    videoImportToUpdate.Video = Object.assign(video, { VideoFiles: [videoFileCreated] });
                    logger_1.logger.info('Video %s imported.', video.uuid);
                    return { videoImportUpdated, video: videoForFederation };
                })).catch(err => {
                    if (thumbnailModel)
                        thumbnailModel = new thumbnail_1.ThumbnailModel(thumbnailSave);
                    if (previewModel)
                        previewModel = new thumbnail_1.ThumbnailModel(previewSave);
                    videoFile = new video_file_1.VideoFileModel(videoFileSave);
                    throw err;
                });
            });
            notifier_1.Notifier.Instance.notifyOnFinishedVideoImport({ videoImport: videoImportUpdated, success: true });
            if (video.isBlacklisted()) {
                const videoBlacklist = Object.assign(video.VideoBlacklist, { Video: video });
                notifier_1.Notifier.Instance.notifyOnVideoAutoBlacklist(videoBlacklist);
            }
            else {
                notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(video);
            }
            if (video.state === 6) {
                return (0, video_1.addMoveToObjectStorageJob)(videoImportUpdated.Video);
            }
            if (video.state === 2) {
                yield (0, video_1.addOptimizeOrMergeAudioJob)(videoImportUpdated.Video, videoFile, videoImport.User);
            }
        }
        catch (err) {
            try {
                if (tempVideoPath)
                    yield (0, fs_extra_1.remove)(tempVideoPath);
            }
            catch (errUnlink) {
                logger_1.logger.warn('Cannot cleanup files after a video import error.', { err: errUnlink });
            }
            videoImport.error = err.message;
            if (videoImport.state !== 4) {
                videoImport.state = 3;
            }
            yield videoImport.save();
            notifier_1.Notifier.Instance.notifyOnFinishedVideoImport({ videoImport, success: false });
            throw err;
        }
    });
}
