"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoCaption = exports.getPreview = exports.lazyStaticRouter = void 0;
const tslib_1 = require("tslib");
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const videos_torrent_cache_1 = require("@server/lib/files-cache/videos-torrent-cache");
const http_error_codes_1 = require("../../shared/models/http/http-error-codes");
const logger_1 = require("../helpers/logger");
const constants_1 = require("../initializers/constants");
const files_cache_1 = require("../lib/files-cache");
const local_actor_1 = require("../lib/local-actor");
const middlewares_1 = require("../middlewares");
const actor_image_1 = require("../models/actor/actor-image");
const lazyStaticRouter = express_1.default.Router();
exports.lazyStaticRouter = lazyStaticRouter;
lazyStaticRouter.use(cors_1.default());
lazyStaticRouter.use(constants_1.LAZY_STATIC_PATHS.AVATARS + ':filename', middlewares_1.asyncMiddleware(getActorImage));
lazyStaticRouter.use(constants_1.LAZY_STATIC_PATHS.BANNERS + ':filename', middlewares_1.asyncMiddleware(getActorImage));
lazyStaticRouter.use(constants_1.LAZY_STATIC_PATHS.PREVIEWS + ':filename', middlewares_1.asyncMiddleware(getPreview));
lazyStaticRouter.use(constants_1.LAZY_STATIC_PATHS.VIDEO_CAPTIONS + ':filename', middlewares_1.asyncMiddleware(getVideoCaption));
lazyStaticRouter.use(constants_1.LAZY_STATIC_PATHS.TORRENTS + ':filename', middlewares_1.asyncMiddleware(getTorrent));
function getActorImage(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filename = req.params.filename;
        if (local_actor_1.actorImagePathUnsafeCache.has(filename)) {
            return res.sendFile(local_actor_1.actorImagePathUnsafeCache.get(filename), { maxAge: constants_1.STATIC_MAX_AGE.SERVER });
        }
        const image = yield actor_image_1.ActorImageModel.loadByName(filename);
        if (!image)
            return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
        if (image.onDisk === false) {
            if (!image.fileUrl)
                return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
            logger_1.logger.info('Lazy serve remote actor image %s.', image.fileUrl);
            try {
                yield local_actor_1.pushActorImageProcessInQueue({ filename: image.filename, fileUrl: image.fileUrl, type: image.type });
            }
            catch (err) {
                logger_1.logger.warn('Cannot process remote actor image %s.', image.fileUrl, { err });
                return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
            }
            image.onDisk = true;
            image.save()
                .catch(err => logger_1.logger.error('Cannot save new actor image disk state.', { err }));
        }
        const path = image.getPath();
        local_actor_1.actorImagePathUnsafeCache.set(filename, path);
        return res.sendFile(path, { maxAge: constants_1.STATIC_MAX_AGE.LAZY_SERVER }, (err) => {
            if (!err)
                return;
            if (err.status === http_error_codes_1.HttpStatusCode.NOT_FOUND_404 && !image.isOwned()) {
                logger_1.logger.error('Cannot lazy serve actor image %s.', filename, { err });
                local_actor_1.actorImagePathUnsafeCache.del(filename);
                image.onDisk = false;
                image.save()
                    .catch(err => logger_1.logger.error('Cannot save new actor image disk state.', { err }));
            }
            return next(err);
        });
    });
}
function getPreview(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield files_cache_1.VideosPreviewCache.Instance.getFilePath(req.params.filename);
        if (!result)
            return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
        return res.sendFile(result.path, { maxAge: constants_1.STATIC_MAX_AGE.LAZY_SERVER });
    });
}
exports.getPreview = getPreview;
function getVideoCaption(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield files_cache_1.VideosCaptionCache.Instance.getFilePath(req.params.filename);
        if (!result)
            return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
        return res.sendFile(result.path, { maxAge: constants_1.STATIC_MAX_AGE.LAZY_SERVER });
    });
}
exports.getVideoCaption = getVideoCaption;
function getTorrent(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield videos_torrent_cache_1.VideosTorrentCache.Instance.getFilePath(req.params.filename);
        if (!result)
            return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
        return res.sendFile(result.path, { maxAge: constants_1.STATIC_MAX_AGE.SERVER });
    });
}
