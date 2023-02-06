import { createReqFiles } from '@server/helpers/express-utils'
import { MIMETYPES } from '@server/initializers/constants'
import express from 'express'
import { asyncRetryTransactionMiddleware, authenticate } from '../../../middlewares'
import { logger } from "../../../helpers/logger"
import { HttpStatusCode } from '@shared/models'
import { ImageModel } from '@server/models/image/image'
import { join, parse } from 'path'
import { ensureDir, move, remove } from 'fs-extra'
import { CONFIG } from '@server/initializers/config'
import * as Jimp from 'jimp'

// All images will have a thumbnail version
var THUMBNAIL_SIZE = 256;
// Only images with size > 1280 will have a regular version
var REGULAR_SIZE = 1280;
// Maximum megapixels allowed for an image
var MAX_MEGAPIXELS_ALLOWED = 16;

const uploadRouter = express.Router()

const reqImageFileAdd = createReqFiles(
    [ "imagefile" ],
    { ...MIMETYPES.IMAGE.MIMETYPE_EXT }
  )

uploadRouter.post('/upload',
  authenticate,
  reqImageFileAdd,
  asyncRetryTransactionMiddleware(uploadImage)
)

// ---------------------------------------------------------------------------

export {
  uploadRouter
}

// ---------------------------------------------------------------------------

export async function uploadImage (req: express.Request, res: express.Response) {
    
    // Uploading the image could be long
    // Set timeout to 10 minutes, as Express's default is 2 minutes
    req.setTimeout(1000 * 60 * 10, () => {
        logger.error('Image upload has timed out.')
        return res.fail({
        status: HttpStatusCode.REQUEST_TIMEOUT_408,
        message: 'Image upload has timed out.'
        })
    })

    if (!req.files || !req.files['imagefile']) {
        logger.error('Missing image file.');
        return res.sendStatus(HttpStatusCode.NOT_FOUND_404);
    }

    const imageFile = req.files['imagefile'][0]

    // Check if we are uploading an avatar image
    var isAvatar =  false, thumbnailSize = THUMBNAIL_SIZE, regularSize = REGULAR_SIZE;
    if (req && req.query && req.query.type == "avatar") {
        isAvatar = true;
        thumbnailSize = 44;
        regularSize = 100;
    }

    // Create a model object
    const image = new ImageModel({
        id: parse(imageFile.filename).name,
        originalname: imageFile.originalname,
        filename: imageFile.filename,
        thumbnailname: imageFile.filename,
        size: imageFile.size,
        mimetype: imageFile.mimetype,
        extname: parse(imageFile.filename).ext
    });
    // Create a thumbnail version of the image
    image.thumbnailname = image.id + '-thumbnail' + image.extname;
    image.originalname = image.id + '-original' + image.extname;

    // Ensure image directory exists
    const imageFolderPath = join(CONFIG.STORAGE.IMAGES_DIR, image.id);
    await ensureDir(imageFolderPath);

    // Move image inside folder
    const imagePath = join(imageFolderPath, image.originalname);
    await move(imageFile.path, imagePath);

    Jimp.read(imagePath).then(async (destImage) => {

        var originalSize = { w: destImage.getWidth(), h: destImage.getHeight() };

        // Check image is not too big
        if (originalSize.w * originalSize.h > MAX_MEGAPIXELS_ALLOWED*1000*1000) {
          logger.error('Image is too big (' + ((originalSize.w * originalSize.h) / 1000*1000) + ' megapixels), max allowed: ' + MAX_MEGAPIXELS_ALLOWED)
          return res.fail({
            status: HttpStatusCode.BAD_REQUEST_400,
            message: 'Image is too big'
          })
        }

        var maxImageSize = (originalSize.w > originalSize.h) ? originalSize.w : originalSize.h;
        // Images static path
        var imageStaticUrl = ImageModel.getImageStaticUrl(parse(image.filename).name, image.originalname, req.headers.host);
        var imageRegularStaticUrl;
        var thumbnailStaticUrl;

        // If image size is already smaller or equal than the thumbnail size
        // No need to create a regular size, nor a thumbnail size
        if (maxImageSize <= thumbnailSize) {
          imageRegularStaticUrl = imageStaticUrl;
          thumbnailStaticUrl = imageStaticUrl;
        }
        // If image size is smaller or equal than the regular size
        // No need to create a regular size, but need to create a thumbnail size
        else if (maxImageSize <= regularSize) {
          imageRegularStaticUrl = imageStaticUrl;
          // Create the thumbnail image
          var newThumbnailSize = calculateImageSizeReduction(originalSize, thumbnailSize);
          destImage.scaleToFit(newThumbnailSize.w, newThumbnailSize.h).write(join(imageFolderPath, image.thumbnailname));
          thumbnailStaticUrl = ImageModel.getImageStaticUrl(parse(image.filename).name, image.thumbnailname, req.headers.host);
        }
        // Else, image size is big
        // Need to create a regular size and a thumbnail size
        else {
          // Create the regular image
          var newRegularSize = calculateImageSizeReduction(originalSize, regularSize);
          destImage.scaleToFit(newRegularSize.w, newRegularSize.h).write(join(imageFolderPath, image.filename));
          imageRegularStaticUrl = ImageModel.getImageStaticUrl(parse(image.filename).name, image.filename, req.headers.host);
          // Create the thumbnail image
          var newThumbnailSize = calculateImageSizeReduction(originalSize, thumbnailSize);
          destImage.scaleToFit(newThumbnailSize.w, newThumbnailSize.h).write(join(imageFolderPath, image.thumbnailname));
          thumbnailStaticUrl = ImageModel.getImageStaticUrl(parse(image.filename).name, image.thumbnailname, req.headers.host);
        }

        // Save image in database
        image.save();

        // Done
        return res.json({
            status: "success",
            url: imageStaticUrl,
            regular: imageRegularStaticUrl,
            thumbnail: thumbnailStaticUrl
        });

    }).catch(err => {
        logger.error(err);
        return res.sendStatus(HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    });
}

// Take the "destImage" size, and reduce it (if needed) to not exceed the "maxSize" passed in parameter
function calculateImageSizeReduction(destImage, maxSize) {
    var w = destImage.w, h = destImage.h;
    var newW = w, newH = h;
    // If image needs resizing
    if (w > maxSize || h > maxSize) {
      // Set width and height to the max
      newW = newH = maxSize;
      // If image has a 1:1 ratio, nothing to change
      // Else, we must calculate a new size to keep the right ratio
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