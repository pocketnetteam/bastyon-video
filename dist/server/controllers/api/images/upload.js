"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImageLegacy = exports.uploadRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const models_1 = require("../../../../shared/models");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const middlewares_1 = require("../../../middlewares");
const Jimp = (0, tslib_1.__importStar)(require("jimp"));
const image_1 = require("@server/models/image/image");
const THUMBNAIL_SIZE = 256;
const uploadRouter = express_1.default.Router();
exports.uploadRouter = uploadRouter;
const reqImageFileAdd = (0, express_utils_1.createReqFiles)(['imagefile'], Object.assign({}, constants_1.MIMETYPES.IMAGE.MIMETYPE_EXT), {
    imagefile: config_1.CONFIG.STORAGE.TMP_DIR
});
uploadRouter.post('/upload', middlewares_1.authenticate, reqImageFileAdd, (0, middlewares_1.asyncRetryTransactionMiddleware)(addImageLegacy));
function addImageLegacy(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        req.setTimeout(1000 * 60 * 10, () => {
            logger_1.logger.error('Image upload has timed out.');
            return res.fail({
                status: models_1.HttpStatusCode.REQUEST_TIMEOUT_408,
                message: 'Image upload has timed out.'
            });
        });
        if (!req.files || !req.files['imagefile']) {
            logger_1.logger.error('Missing image file.');
            return res.sendStatus(models_1.HttpStatusCode.NOT_FOUND_404);
        }
        const imageFile = req.files['imagefile'][0];
        return addImage({ res, imageFile });
    });
}
exports.addImageLegacy = addImageLegacy;
function addImage(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { res, imageFile } = options;
        imageFile.imageId = (0, path_1.parse)(imageFile.filename).name;
        imageFile.extname = (0, path_1.parse)(imageFile.filename).ext;
        const image = new image_1.ImageModel({
            id: imageFile.imageId,
            originalname: imageFile.originalname,
            filename: imageFile.filename,
            thumbnailname: imageFile.filename,
            size: imageFile.size,
            mimetype: imageFile.mimetype,
            extname: imageFile.extname
        });
        yield (0, fs_extra_1.ensureDir)((0, path_1.join)(config_1.CONFIG.STORAGE.IMAGES_DIR, imageFile.imageId));
        const newDestination = (0, path_1.join)(config_1.CONFIG.STORAGE.IMAGES_DIR, imageFile.imageId);
        const newPath = (0, path_1.join)(newDestination, imageFile.filename);
        yield (0, fs_extra_1.move)(imageFile.path, newPath);
        imageFile.path = newPath;
        imageFile.destination = newDestination;
        image.thumbnailname = imageFile.imageId + '-thumbnail' + imageFile.extname;
        Jimp.read(imageFile.path).then((destImage) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            var w = destImage.getWidth(), h = destImage.getHeight();
            var newW = w, newH = h;
            if (w > THUMBNAIL_SIZE || h > THUMBNAIL_SIZE) {
                newW = newH = THUMBNAIL_SIZE;
                if (w != h) {
                    var ratio = (w > h) ? w / h : h / w;
                    if (w > h)
                        newH = THUMBNAIL_SIZE / ratio;
                    else
                        newW = THUMBNAIL_SIZE / ratio;
                }
            }
            destImage.scaleToFit(newW, newH).quality(90).write((0, path_1.join)(imageFile.destination, image.thumbnailname));
            const imageStaticUrl = image_1.ImageModel.getImageStaticUrl(imageFile.imageId, imageFile.filename);
            const thumbnailStaticUrl = image_1.ImageModel.getImageStaticUrl(imageFile.imageId, image.thumbnailname);
            const torrentHash = yield image_1.ImageModel.generateTorrentForImage(imageFile.imageId, imageFile.destination);
            image.infoHash = torrentHash;
            image.save();
            return res.json({
                image: {
                    id: imageFile.imageId,
                    url: imageStaticUrl,
                    thumbnailUrl: thumbnailStaticUrl
                }
            });
        }))
            .catch(err => {
            logger_1.logger.error(err);
            return res.sendStatus(models_1.HttpStatusCode.INTERNAL_SERVER_ERROR_500);
        });
    });
}
