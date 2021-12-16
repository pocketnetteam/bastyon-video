"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVideo = exports.updateRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const share_1 = require("@server/lib/activitypub/share");
const video_1 = require("@server/lib/video");
const doc_1 = require("@server/middlewares/doc");
const models_1 = require("../../../../shared/models");
const audit_logger_1 = require("../../../helpers/audit-logger");
const database_utils_1 = require("../../../helpers/database-utils");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const videos_1 = require("../../../lib/activitypub/videos");
const notifier_1 = require("../../../lib/notifier");
const hooks_1 = require("../../../lib/plugins/hooks");
const video_blacklist_1 = require("../../../lib/video-blacklist");
const middlewares_1 = require("../../../middlewares");
const schedule_video_update_1 = require("../../../models/video/schedule-video-update");
const video_2 = require("../../../models/video/video");
const lTags = logger_1.loggerTagsFactory('api', 'video');
const auditLogger = audit_logger_1.auditLoggerFactory('videos');
const updateRouter = express_1.default.Router();
exports.updateRouter = updateRouter;
const reqVideoFileUpdate = express_utils_1.createReqFiles(['thumbnailfile', 'previewfile'], constants_1.MIMETYPES.IMAGE.MIMETYPE_EXT, {
    thumbnailfile: config_1.CONFIG.STORAGE.TMP_DIR,
    previewfile: config_1.CONFIG.STORAGE.TMP_DIR
});
updateRouter.put('/:id', doc_1.openapiOperationDoc({ operationId: 'putVideo' }), middlewares_1.authenticate, reqVideoFileUpdate, middlewares_1.asyncMiddleware(middlewares_1.videosUpdateValidator), middlewares_1.asyncRetryTransactionMiddleware(updateVideo));
function updateVideo(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoInstance = res.locals.videoAll;
        const videoFieldsSave = videoInstance.toJSON();
        const oldVideoAuditView = new audit_logger_1.VideoAuditView(videoInstance.toFormattedDetailsJSON());
        const videoInfoToUpdate = req.body;
        const wasConfidentialVideo = videoInstance.isConfidential();
        const hadPrivacyForFederation = videoInstance.hasPrivacyForFederation();
        const [thumbnailModel, previewModel] = yield video_1.buildVideoThumbnailsFromReq({
            video: videoInstance,
            files: req.files,
            fallback: () => Promise.resolve(undefined),
            automaticallyGenerated: false
        });
        try {
            const videoInstanceUpdated = yield database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const sequelizeOptions = { transaction: t };
                const oldVideoChannel = videoInstance.VideoChannel;
                const keysToUpdate = [
                    'name',
                    'category',
                    'licence',
                    'language',
                    'nsfw',
                    'waitTranscoding',
                    'support',
                    'description',
                    'commentsEnabled',
                    'downloadEnabled'
                ];
                for (const key of keysToUpdate) {
                    if (videoInfoToUpdate[key] !== undefined)
                        videoInstance.set(key, videoInfoToUpdate[key]);
                }
                if (videoInfoToUpdate.originallyPublishedAt !== undefined && videoInfoToUpdate.originallyPublishedAt !== null) {
                    videoInstance.originallyPublishedAt = new Date(videoInfoToUpdate.originallyPublishedAt);
                }
                let isNewVideo = false;
                if (videoInfoToUpdate.privacy !== undefined) {
                    isNewVideo = yield updateVideoPrivacy({ videoInstance, videoInfoToUpdate, hadPrivacyForFederation, transaction: t });
                }
                const videoInstanceUpdated = yield videoInstance.save(sequelizeOptions);
                if (thumbnailModel)
                    yield videoInstanceUpdated.addAndSaveThumbnail(thumbnailModel, t);
                if (previewModel)
                    yield videoInstanceUpdated.addAndSaveThumbnail(previewModel, t);
                if (videoInfoToUpdate.tags !== undefined) {
                    yield video_1.setVideoTags({ video: videoInstanceUpdated, tags: videoInfoToUpdate.tags, transaction: t });
                }
                if (res.locals.videoChannel && videoInstanceUpdated.channelId !== res.locals.videoChannel.id) {
                    yield videoInstanceUpdated.$set('VideoChannel', res.locals.videoChannel, { transaction: t });
                    videoInstanceUpdated.VideoChannel = res.locals.videoChannel;
                    if (hadPrivacyForFederation === true)
                        yield share_1.changeVideoChannelShare(videoInstanceUpdated, oldVideoChannel, t);
                }
                yield updateSchedule(videoInstanceUpdated, videoInfoToUpdate, t);
                yield video_blacklist_1.autoBlacklistVideoIfNeeded({
                    video: videoInstanceUpdated,
                    user: res.locals.oauth.token.User,
                    isRemote: false,
                    isNew: false,
                    transaction: t
                });
                yield videos_1.federateVideoIfNeeded(videoInstanceUpdated, isNewVideo, t);
                auditLogger.update(audit_logger_1.getAuditIdFromRes(res), new audit_logger_1.VideoAuditView(videoInstanceUpdated.toFormattedDetailsJSON()), oldVideoAuditView);
                logger_1.logger.info('Video with name %s and uuid %s updated.', videoInstance.name, videoInstance.uuid, lTags(videoInstance.uuid));
                return videoInstanceUpdated;
            }));
            if (wasConfidentialVideo) {
                notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(videoInstanceUpdated);
            }
            hooks_1.Hooks.runAction('action:api.video.updated', { video: videoInstanceUpdated, body: req.body });
        }
        catch (err) {
            database_utils_1.resetSequelizeInstance(videoInstance, videoFieldsSave);
            throw err;
        }
        return res.type('json')
            .status(models_1.HttpStatusCode.NO_CONTENT_204)
            .end();
    });
}
exports.updateVideo = updateVideo;
function updateVideoPrivacy(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { videoInstance, videoInfoToUpdate, hadPrivacyForFederation, transaction } = options;
        const isNewVideo = videoInstance.isNewVideo(videoInfoToUpdate.privacy);
        const newPrivacy = parseInt(videoInfoToUpdate.privacy.toString(), 10);
        videoInstance.setPrivacy(newPrivacy);
        if (hadPrivacyForFederation && !videoInstance.hasPrivacyForFederation()) {
            yield video_2.VideoModel.sendDelete(videoInstance, { transaction });
        }
        return isNewVideo;
    });
}
function updateSchedule(videoInstance, videoInfoToUpdate, transaction) {
    if (videoInfoToUpdate.scheduleUpdate) {
        return schedule_video_update_1.ScheduleVideoUpdateModel.upsert({
            videoId: videoInstance.id,
            updateAt: new Date(videoInfoToUpdate.scheduleUpdate.updateAt),
            privacy: videoInfoToUpdate.scheduleUpdate.privacy || null
        }, { transaction });
    }
    else if (videoInfoToUpdate.scheduleUpdate === null) {
        return schedule_video_update_1.ScheduleVideoUpdateModel.deleteByVideoId(videoInstance.id, transaction);
    }
}
