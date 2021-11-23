"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoCaptionsRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const captions_utils_1 = require("../../../helpers/captions-utils");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const videos_1 = require("../../../lib/activitypub/videos");
const middlewares_1 = require("../../../middlewares");
const validators_1 = require("../../../middlewares/validators");
const video_caption_1 = require("../../../models/video/video-caption");
const reqVideoCaptionAdd = (0, express_utils_1.createReqFiles)(['captionfile'], constants_1.MIMETYPES.VIDEO_CAPTIONS.MIMETYPE_EXT, {
    captionfile: config_1.CONFIG.STORAGE.CAPTIONS_DIR
});
const videoCaptionsRouter = express_1.default.Router();
exports.videoCaptionsRouter = videoCaptionsRouter;
videoCaptionsRouter.get('/:videoId/captions', (0, middlewares_1.asyncMiddleware)(validators_1.listVideoCaptionsValidator), (0, middlewares_1.asyncMiddleware)(listVideoCaptions));
videoCaptionsRouter.put('/:videoId/captions/:captionLanguage', middlewares_1.authenticate, reqVideoCaptionAdd, (0, middlewares_1.asyncMiddleware)(validators_1.addVideoCaptionValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(addVideoCaption));
videoCaptionsRouter.delete('/:videoId/captions/:captionLanguage', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(validators_1.deleteVideoCaptionValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(deleteVideoCaption));
function listVideoCaptions(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const data = yield video_caption_1.VideoCaptionModel.listVideoCaptions(res.locals.videoId.id);
        return res.json((0, utils_1.getFormattedObjects)(data, data.length));
    });
}
function addVideoCaption(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoCaptionPhysicalFile = req.files['captionfile'][0];
        const video = res.locals.videoAll;
        const captionLanguage = req.params.captionLanguage;
        const videoCaption = new video_caption_1.VideoCaptionModel({
            videoId: video.id,
            filename: video_caption_1.VideoCaptionModel.generateCaptionName(captionLanguage),
            language: captionLanguage
        });
        yield (0, captions_utils_1.moveAndProcessCaptionFile)(videoCaptionPhysicalFile, videoCaption);
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield video_caption_1.VideoCaptionModel.insertOrReplaceLanguage(videoCaption, t);
            yield (0, videos_1.federateVideoIfNeeded)(video, false, t);
        }));
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function deleteVideoCaption(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const video = res.locals.videoAll;
        const videoCaption = res.locals.videoCaption;
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield videoCaption.destroy({ transaction: t });
            yield (0, videos_1.federateVideoIfNeeded)(video, false, t);
        }));
        logger_1.logger.info('Video caption %s of video %s deleted.', videoCaption.language, video.uuid);
        return res.type('json').status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
