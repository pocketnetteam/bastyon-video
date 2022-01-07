import express from 'express'
import { move, remove, ensureDir } from 'fs-extra'
import { extname, join, parse } from 'path'
import { HttpStatusCode } from '../../../../shared/models'
import { createReqFiles } from '../../../helpers/express-utils'
import { logger } from '../../../helpers/logger'
import { CONFIG } from '../../../initializers/config'
import { MIMETYPES, STATIC_PATHS, WEBSERVER } from '../../../initializers/constants'
import { asyncMiddleware, asyncRetryTransactionMiddleware, authenticate } from '../../../middlewares'
import * as Jimp from 'jimp'
import { ImageModel } from '@server/models/image/image'

// All images will have a thumbnail version
var THUMBNAIL_SIZE = 256;
// Only images with size > 600 will have a regular version
var REGULAR_SIZE = 600;

const uploadRouter = express.Router()

const reqImageFileAdd = createReqFiles(
  [ 'imagefile' ],
  Object.assign({}, MIMETYPES.IMAGE.MIMETYPE_EXT),
  {
    imagefile: CONFIG.STORAGE.TMP_DIR
  }
)

uploadRouter.post('/upload',
  authenticate,
  reqImageFileAdd,
  asyncRetryTransactionMiddleware(addImageLegacy)
)

// ---------------------------------------------------------------------------

export {
  uploadRouter
}

// ---------------------------------------------------------------------------

export async function addImageLegacy (req: express.Request, res: express.Response) {

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
  
  // Check file is an image
  if (!imageFile.mimetype || !MIMETYPES.IMAGE.MIMETYPE_EXT[imageFile.mimetype]) {
    logger.error('Wrong file type (must be an image).');
    return res.sendStatus(HttpStatusCode.UNSUPPORTED_MEDIA_TYPE_415);
  }

  return addImage({ req, res, imageFile })
}

async function addImage (options: {
  req: express.Request
  res: express.Response
  imageFile: any
}) {
  const { req, res, imageFile } = options

  // Check if we are uploading an avatar image
  var isAvatar =  false, thumbnailSize = THUMBNAIL_SIZE, regularSize = REGULAR_SIZE;
  if (req && req.query && req.query.type == "avatar") {
    isAvatar = true;
    thumbnailSize = 44;
    regularSize = 100;
  }

  // Get image ID
  imageFile.imageId = parse(imageFile.filename).name;
  imageFile.extname = parse(imageFile.filename).ext;

  // Create a model object
  const image = new ImageModel({
    id: imageFile.imageId,
    originalname: imageFile.originalname,
    filename: imageFile.filename,
    thumbnailname: imageFile.filename,
    size: imageFile.size,
    mimetype: imageFile.mimetype,
    extname: imageFile.extname
  });

  // Ensure image directory exists
  await ensureDir(join(CONFIG.STORAGE.IMAGES_DIR, imageFile.imageId));

  // Move image inside folder
  const newDestination = join(CONFIG.STORAGE.IMAGES_DIR, imageFile.imageId);
  const newPath = join(newDestination, imageFile.filename);
  await move(imageFile.path, newPath);
  imageFile.path = newPath;
  imageFile.destination = newDestination;

  // Create a thumbnail version of the image
  image.thumbnailname = imageFile.imageId + '-thumbnail' + imageFile.extname;

  Jimp.read(imageFile.path).then(async (destImage) => {

    var originalSize = { w: destImage.getWidth(), h: destImage.getHeight() };

    // Create the thumbnail image
    var newThumbnailSize = calculateImageSizeReduction(originalSize, thumbnailSize);
    destImage.scaleToFit(newThumbnailSize.w, newThumbnailSize.h).quality(90).write(join(imageFile.destination, image.thumbnailname));

    // Determine images static path
    var imageStaticUrl = ImageModel.getImageStaticUrl(imageFile.imageId, imageFile.filename, req.headers.host);
    var thumbnailStaticUrl = ImageModel.getImageStaticUrl(imageFile.imageId, image.thumbnailname, req.headers.host);

    // If image is smaller than 600, delete original and use the thumbnail only
    if (isAvatar == false && originalSize.w < 600 && originalSize.h < 600) {
      await remove(imageFile.path);
      image.filename = image.thumbnailname;
      imageFile.path = join(imageFile.destination, image.filename);
      imageStaticUrl = thumbnailStaticUrl;
    }
    // Else, we keep the original image, but we lower its size
    else {
      var newRegularSize = calculateImageSizeReduction(originalSize, regularSize);
      destImage.scaleToFit(newRegularSize.w, newRegularSize.h).write(join(imageFile.destination, imageFile.filename));
    }

    // We can now generate the torrent file
    const torrentHash = await ImageModel.generateTorrentForImage(imageFile.imageId, imageFile.destination);
    
    // Save the info hash into the image object
    image.infoHash = torrentHash;

    // Save image in database
    image.save();

    // Done
    return res.json({
      status: 'success',
      image: {
        id: imageFile.imageId,
        url: imageStaticUrl,
        thumbnailUrl: thumbnailStaticUrl
      }
    });

  })
  .catch(err => {
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