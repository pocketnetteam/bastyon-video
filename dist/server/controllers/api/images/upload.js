"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImageLegacy = exports.uploadRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const models_1 = require("../../../../shared/models");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const middlewares_1 = require("../../../middlewares");
const Jimp = tslib_1.__importStar(require("jimp"));
const image_1 = require("@server/models/image/image");
var THUMBNAIL_SIZE = 256;
var REGULAR_SIZE = 600;
const uploadRouter = express_1.default.Router();
exports.uploadRouter = uploadRouter;
const reqImageFileAdd = express_utils_1.createReqFiles(['imagefile'], Object.assign({}, constants_1.MIMETYPES.IMAGE.MIMETYPE_EXT), {
    imagefile: config_1.CONFIG.STORAGE.TMP_DIR
});
uploadRouter.post('/upload', middlewares_1.authenticate, reqImageFileAdd, middlewares_1.asyncRetryTransactionMiddleware(addImageLegacy));
function addImageLegacy(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        return addImage({ req, res, imageFile });
    });
}
exports.addImageLegacy = addImageLegacy;
function addImage(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { req, res, imageFile } = options;
        var isAvatar = false, thumbnailSize = THUMBNAIL_SIZE, regularSize = REGULAR_SIZE;
        if (req && req.query && req.query.type == "avatar") {
            isAvatar = true;
            thumbnailSize = 44;
            regularSize = 100;
        }
        imageFile.imageId = path_1.parse(imageFile.filename).name;
        imageFile.extname = path_1.parse(imageFile.filename).ext;
        const image = new image_1.ImageModel({
            id: imageFile.imageId,
            originalname: imageFile.originalname,
            filename: imageFile.filename,
            thumbnailname: imageFile.filename,
            size: imageFile.size,
            mimetype: imageFile.mimetype,
            extname: imageFile.extname
        });
        yield fs_extra_1.ensureDir(path_1.join(config_1.CONFIG.STORAGE.IMAGES_DIR, imageFile.imageId));
        const newDestination = path_1.join(config_1.CONFIG.STORAGE.IMAGES_DIR, imageFile.imageId);
        const newPath = path_1.join(newDestination, imageFile.filename);
        yield fs_extra_1.move(imageFile.path, newPath);
        imageFile.path = newPath;
        imageFile.destination = newDestination;
        image.thumbnailname = imageFile.imageId + '-thumbnail' + imageFile.extname;
        Jimp.read(imageFile.path).then((destImage) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var originalSize = { w: destImage.getWidth(), h: destImage.getHeight() };
            var thumbnailSize = calculateImageSizeReduction(originalSize, thumbnailSize);
            destImage.scaleToFit(thumbnailSize.w, thumbnailSize.h).quality(90).write(path_1.join(imageFile.destination, image.thumbnailname));
            var imageStaticUrl = image_1.ImageModel.getImageStaticUrl(imageFile.imageId, imageFile.filename);
            var thumbnailStaticUrl = image_1.ImageModel.getImageStaticUrl(imageFile.imageId, image.thumbnailname);
            if (isAvatar == false && originalSize.w < 600 && originalSize.h < 600) {
                yield fs_extra_1.remove(imageFile.path);
                image.filename = image.thumbnailname;
                imageFile.path = path_1.join(imageFile.destination, image.filename);
                imageStaticUrl = thumbnailStaticUrl;
            }
            else {
                var regularSize = calculateImageSizeReduction(originalSize, regularSize);
                destImage.scaleToFit(regularSize.w, regularSize.h).write(path_1.join(imageFile.destination, imageFile.filename));
            }
            const torrentHash = yield image_1.ImageModel.generateTorrentForImage(imageFile.imageId, imageFile.destination);
            image.infoHash = torrentHash;
            image.save();
            return res.json({
                status: 'success',
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
function calculateImageSizeReduction(destImage, maxSize) {
    var w = destImage.w, h = destImage.h;
    var newW = w, newH = h;
    if (w > maxSize || h > maxSize) {
        newW = newH = maxSize;
        if (w != h) {
            var ratio = (w > h) ? w / h : h / w;
            if (w > h)
                newH = maxSize / ratio;
            else
                newW = maxSize / ratio;
        }
    }
    return { w: newW, h: newH };
}
