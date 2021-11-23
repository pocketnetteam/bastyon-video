"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const express_utils_1 = require("@server/helpers/express-utils");
const uuid_1 = require("@server/helpers/uuid");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const url_1 = require("@server/lib/activitypub/url");
const videos_1 = require("@server/lib/activitypub/videos");
const hooks_1 = require("@server/lib/plugins/hooks");
const video_1 = require("@server/lib/video");
const video_live_1 = require("@server/middlewares/validators/videos/video-live");
const video_live_2 = require("@server/models/video/video-live");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const logger_1 = require("../../../helpers/logger");
const database_1 = require("../../../initializers/database");
const thumbnail_1 = require("../../../lib/thumbnail");
const middlewares_1 = require("../../../middlewares");
const video_2 = require("../../../models/video/video");
const liveRouter = express_1.default.Router();
exports.liveRouter = liveRouter;
const reqVideoFileLive = (0, express_utils_1.createReqFiles)(['thumbnailfile', 'previewfile'], constants_1.MIMETYPES.IMAGE.MIMETYPE_EXT, {
    thumbnailfile: config_1.CONFIG.STORAGE.TMP_DIR,
    previewfile: config_1.CONFIG.STORAGE.TMP_DIR
});
liveRouter.post('/live', middlewares_1.authenticate, reqVideoFileLive, (0, middlewares_1.asyncMiddleware)(video_live_1.videoLiveAddValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(addLiveVideo));
liveRouter.get('/live/:videoId', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(video_live_1.videoLiveGetValidator), getLiveVideo);
liveRouter.put('/live/:videoId', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(video_live_1.videoLiveGetValidator), video_live_1.videoLiveUpdateValidator, (0, middlewares_1.asyncRetryTransactionMiddleware)(updateLiveVideo));
function getLiveVideo(req, res) {
    const videoLive = res.locals.videoLive;
    return res.json(videoLive.toFormattedJSON());
}
function updateLiveVideo(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        const video = res.locals.videoAll;
        const videoLive = res.locals.videoLive;
        videoLive.saveReplay = body.saveReplay || false;
        videoLive.permanentLive = body.permanentLive || false;
        video.VideoLive = yield videoLive.save();
        yield (0, videos_1.federateVideoIfNeeded)(video, false);
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function addLiveVideo(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoInfo = req.body;
        const videoData = (0, video_1.buildLocalVideoFromReq)(videoInfo, res.locals.videoChannel.id);
        videoData.isLive = true;
        videoData.state = 4;
        videoData.duration = 0;
        const video = new video_2.VideoModel(videoData);
        video.url = (0, url_1.getLocalVideoActivityPubUrl)(video);
        const videoLive = new video_live_2.VideoLiveModel();
        videoLive.saveReplay = videoInfo.saveReplay || false;
        videoLive.permanentLive = videoInfo.permanentLive || false;
        videoLive.streamKey = (0, uuid_1.buildUUID)();
        const [thumbnailModel, previewModel] = yield (0, video_1.buildVideoThumbnailsFromReq)({
            video,
            files: req.files,
            fallback: type => {
                return (0, thumbnail_1.updateVideoMiniatureFromExisting)({
                    inputPath: constants_1.ASSETS_PATH.DEFAULT_LIVE_BACKGROUND,
                    video,
                    type,
                    automaticallyGenerated: true,
                    keepOriginal: true
                });
            }
        });
        const { videoCreated } = yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const sequelizeOptions = { transaction: t };
            const videoCreated = yield video.save(sequelizeOptions);
            if (thumbnailModel)
                yield videoCreated.addAndSaveThumbnail(thumbnailModel, t);
            if (previewModel)
                yield videoCreated.addAndSaveThumbnail(previewModel, t);
            videoCreated.VideoChannel = res.locals.videoChannel;
            videoLive.videoId = videoCreated.id;
            videoCreated.VideoLive = yield videoLive.save(sequelizeOptions);
            yield (0, video_1.setVideoTags)({ video, tags: videoInfo.tags, transaction: t });
            yield (0, videos_1.federateVideoIfNeeded)(videoCreated, true, t);
            logger_1.logger.info('Video live %s with uuid %s created.', videoInfo.name, videoCreated.uuid);
            return { videoCreated };
        }));
        hooks_1.Hooks.runAction('action:api.live-video.created', { video: videoCreated });
        return res.json({
            video: {
                id: videoCreated.id,
                shortUUID: (0, uuid_1.uuidToShort)(videoCreated.uuid),
                uuid: videoCreated.uuid
            }
        });
    });
}
