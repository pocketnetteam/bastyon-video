"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVideoResumable = exports.addVideoLegacy = exports.uploadRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const upload_1 = require("@server/helpers/upload");
const uuid_1 = require("@server/helpers/uuid");
const webtorrent_1 = require("@server/helpers/webtorrent");
const url_1 = require("@server/lib/activitypub/url");
const paths_1 = require("@server/lib/paths");
const video_1 = require("@server/lib/video");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const video_state_1 = require("@server/lib/video-state");
const doc_1 = require("@server/middlewares/doc");
const core_1 = require("@uploadx/core");
const models_1 = require("../../../../shared/models");
const audit_logger_1 = require("../../../helpers/audit-logger");
const database_utils_1 = require("../../../helpers/database-utils");
const express_utils_1 = require("../../../helpers/express-utils");
const ffprobe_utils_1 = require("../../../helpers/ffprobe-utils");
const logger_1 = require("../../../helpers/logger");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const videos_1 = require("../../../lib/activitypub/videos");
const notifier_1 = require("../../../lib/notifier");
const hooks_1 = require("../../../lib/plugins/hooks");
const thumbnail_1 = require("../../../lib/thumbnail");
const video_blacklist_1 = require("../../../lib/video-blacklist");
const middlewares_1 = require("../../../middlewares");
const schedule_video_update_1 = require("../../../models/video/schedule-video-update");
const video_2 = require("../../../models/video/video");
const video_file_1 = require("../../../models/video/video-file");
const lTags = (0, logger_1.loggerTagsFactory)('api', 'video');
const auditLogger = (0, audit_logger_1.auditLoggerFactory)('videos');
const uploadRouter = express_1.default.Router();
exports.uploadRouter = uploadRouter;
const uploadxMiddleware = core_1.uploadx.upload({ directory: (0, upload_1.getResumableUploadPath)() });
const reqVideoFileAdd = (0, express_utils_1.createReqFiles)(['videofile', 'thumbnailfile', 'previewfile'], Object.assign({}, constants_1.MIMETYPES.VIDEO.MIMETYPE_EXT, constants_1.MIMETYPES.IMAGE.MIMETYPE_EXT), {
    videofile: config_1.CONFIG.STORAGE.TMP_DIR,
    thumbnailfile: config_1.CONFIG.STORAGE.TMP_DIR,
    previewfile: config_1.CONFIG.STORAGE.TMP_DIR
});
const reqVideoFileAddResumable = (0, express_utils_1.createReqFiles)(['thumbnailfile', 'previewfile'], constants_1.MIMETYPES.IMAGE.MIMETYPE_EXT, {
    thumbnailfile: (0, upload_1.getResumableUploadPath)(),
    previewfile: (0, upload_1.getResumableUploadPath)()
});
uploadRouter.post('/upload', (0, doc_1.openapiOperationDoc)({ operationId: 'uploadLegacy' }), middlewares_1.authenticate, reqVideoFileAdd, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosAddLegacyValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(addVideoLegacy));
uploadRouter.post('/upload-resumable', (0, doc_1.openapiOperationDoc)({ operationId: 'uploadResumableInit' }), middlewares_1.authenticate, reqVideoFileAddResumable, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosAddResumableInitValidator), uploadxMiddleware);
uploadRouter.delete('/upload-resumable', middlewares_1.authenticate, uploadxMiddleware);
uploadRouter.put('/upload-resumable', (0, doc_1.openapiOperationDoc)({ operationId: 'uploadResumable' }), middlewares_1.authenticate, uploadxMiddleware, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosAddResumableValidator), (0, middlewares_1.asyncMiddleware)(addVideoResumable));
function addVideoLegacy(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        req.setTimeout(1000 * 60 * 10, () => {
            logger_1.logger.error('Video upload has timed out.');
            return res.fail({
                status: models_1.HttpStatusCode.REQUEST_TIMEOUT_408,
                message: 'Video upload has timed out.'
            });
        });
        const videoPhysicalFile = req.files['videofile'][0];
        const videoInfo = req.body;
        const files = req.files;
        return addVideo({ res, videoPhysicalFile, videoInfo, files });
    });
}
exports.addVideoLegacy = addVideoLegacy;
function addVideoResumable(_req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoPhysicalFile = res.locals.videoFileResumable;
        const videoInfo = videoPhysicalFile.metadata;
        const files = { previewfile: videoInfo.previewfile };
        return addVideo({ res, videoPhysicalFile, videoInfo, files });
    });
}
exports.addVideoResumable = addVideoResumable;
function addVideo(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { res, videoPhysicalFile, videoInfo, files } = options;
        const videoChannel = res.locals.videoChannel;
        const user = res.locals.oauth.token.User;
        const videoResolutionInfo = yield (0, ffprobe_utils_1.getVideoFileResolution)(videoPhysicalFile.path);
        const MAX_IMAGE_SIZE = 640 * 640;
        const wallpaperResolution = videoResolutionInfo.width * videoResolutionInfo.height;
        const denominator = wallpaperResolution > MAX_IMAGE_SIZE ? wallpaperResolution / MAX_IMAGE_SIZE : 1;
        const size = {
            width: Math.floor(videoResolutionInfo.width / Math.sqrt(denominator)),
            height: Math.floor(videoResolutionInfo.height / Math.sqrt(denominator))
        };
        videoInfo.aspectRatio = size.width / size.height;
        const videoData = (0, video_1.buildLocalVideoFromReq)(videoInfo, videoChannel.id);
        videoData.state = (0, video_state_1.buildNextVideoState)();
        videoData.duration = videoPhysicalFile.duration;
        const video = new video_2.VideoModel(videoData);
        video.VideoChannel = videoChannel;
        video.url = (0, url_1.getLocalVideoActivityPubUrl)(video);
        const videoFile = yield buildNewFile(videoPhysicalFile);
        const destination = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(video, videoFile);
        yield (0, fs_extra_1.move)(videoPhysicalFile.path, destination);
        videoPhysicalFile.filename = (0, path_1.basename)(destination);
        videoPhysicalFile.path = destination;
        const [thumbnailModel, previewModel] = yield (0, video_1.buildVideoThumbnailsFromReq)({
            video,
            files,
            fallback: type => (0, thumbnail_1.generateVideoMiniature)({ video, videoFile, type, size }),
            size
        });
        const { videoCreated } = yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const sequelizeOptions = { transaction: t };
            const videoCreated = yield video.save(sequelizeOptions);
            yield videoCreated.addAndSaveThumbnail(thumbnailModel, t);
            yield videoCreated.addAndSaveThumbnail(previewModel, t);
            videoCreated.VideoChannel = res.locals.videoChannel;
            videoFile.videoId = video.id;
            yield videoFile.save(sequelizeOptions);
            video.VideoFiles = [videoFile];
            yield (0, video_1.setVideoTags)({ video, tags: videoInfo.tags, transaction: t });
            if (videoInfo.scheduleUpdate) {
                yield schedule_video_update_1.ScheduleVideoUpdateModel.create({
                    videoId: video.id,
                    updateAt: new Date(videoInfo.scheduleUpdate.updateAt),
                    privacy: videoInfo.scheduleUpdate.privacy || null
                }, sequelizeOptions);
            }
            yield (0, video_blacklist_1.autoBlacklistVideoIfNeeded)({
                video,
                user,
                isRemote: false,
                isNew: true,
                transaction: t
            });
            auditLogger.create((0, audit_logger_1.getAuditIdFromRes)(res), new audit_logger_1.VideoAuditView(videoCreated.toFormattedDetailsJSON()));
            logger_1.logger.info('Video with name %s and uuid %s created.', videoInfo.name, videoCreated.uuid, lTags(videoCreated.uuid));
            return { videoCreated };
        }));
        yield videoCreated.VideoChannel.setAsUpdated();
        createTorrentFederate(video, videoFile)
            .then(() => {
            if (video.state === 6) {
                return (0, video_1.addMoveToObjectStorageJob)(video);
            }
            if (video.state === 2) {
                return (0, video_1.addOptimizeOrMergeAudioJob)(videoCreated, videoFile, user);
            }
        })
            .catch(err => logger_1.logger.error('Cannot add optimize/merge audio job for %s.', videoCreated.uuid, Object.assign({ err }, lTags(videoCreated.uuid))));
        hooks_1.Hooks.runAction('action:api.video.uploaded', { video: videoCreated });
        return res.json({
            video: {
                id: videoCreated.id,
                shortUUID: (0, uuid_1.uuidToShort)(videoCreated.uuid),
                uuid: videoCreated.uuid
            }
        });
    });
}
function buildNewFile(videoPhysicalFile) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoFile = new video_file_1.VideoFileModel({
            extname: (0, core_utils_1.getLowercaseExtension)(videoPhysicalFile.filename),
            size: videoPhysicalFile.size,
            videoStreamingPlaylistId: null,
            metadata: yield (0, ffprobe_utils_1.getMetadataFromFile)(videoPhysicalFile.path)
        });
        if (videoFile.isAudio()) {
            videoFile.resolution = constants_1.DEFAULT_AUDIO_RESOLUTION;
        }
        else {
            videoFile.fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(videoPhysicalFile.path);
            videoFile.resolution = (yield (0, ffprobe_utils_1.getVideoFileResolution)(videoPhysicalFile.path)).resolution;
        }
        videoFile.filename = (0, paths_1.generateWebTorrentVideoFilename)(videoFile.resolution, videoFile.extname);
        return videoFile;
    });
}
function createTorrentAndSetInfoHashAsync(video, fileArg) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, webtorrent_1.createTorrentAndSetInfoHash)(video, fileArg);
        const refreshedFile = yield video_file_1.VideoFileModel.loadWithVideo(fileArg.id);
        if (!refreshedFile)
            return fileArg.removeTorrent();
        refreshedFile.infoHash = fileArg.infoHash;
        refreshedFile.torrentFilename = fileArg.torrentFilename;
        return refreshedFile.save();
    });
}
function createTorrentFederate(video, videoFile) {
    return createTorrentAndSetInfoHashAsync(video, videoFile)
        .catch(err => logger_1.logger.error('Cannot create torrent file for video %s', video.url, Object.assign({ err }, lTags(video.uuid))))
        .then(() => video_2.VideoModel.loadAndPopulateAccountAndServerAndTags(video.id))
        .then(refreshedVideo => {
        if (!refreshedVideo)
            return;
        notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(refreshedVideo);
        return (0, database_utils_1.retryTransactionWrapper)(() => {
            return database_1.sequelizeTypescript.transaction(t => (0, videos_1.federateVideoIfNeeded)(refreshedVideo, true, t));
        });
    })
        .catch(err => logger_1.logger.error('Cannot federate or notify video creation %s', video.url, Object.assign({ err }, lTags(video.uuid))));
}
