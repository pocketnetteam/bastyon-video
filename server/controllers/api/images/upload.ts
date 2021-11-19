import express from 'express'
import { move, ensureDir, writeFile } from 'fs-extra'
import { join, parse } from 'path'
import { createTorrentPromise } from '@server/helpers/webtorrent'
import { HttpStatusCode } from '../../../../shared/models'
import { createReqFiles } from '../../../helpers/express-utils'
import { logger } from '../../../helpers/logger'
import { CONFIG } from '../../../initializers/config'
import { MIMETYPES, STATIC_PATHS, WEBSERVER } from '../../../initializers/constants'
import { asyncRetryTransactionMiddleware, authenticate } from '../../../middlewares'
import * as Jimp from 'jimp'
import { ImageModel } from '@server/models/image/image'
import parseTorrent from 'parse-torrent'

const THUMBNAIL_SIZE = 256;

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

  return addImage({ res, imageFile })
}

async function addImage (options: {
  res: express.Response
  imageFile: any
}) {
  const { res, imageFile } = options

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

    var w = destImage.getWidth(), h = destImage.getHeight();
    var newW = w, newH = h;
    // If image thumbnail needs resizing (it must be small)
    if (w > THUMBNAIL_SIZE || h > THUMBNAIL_SIZE) {
      // Set width and height to the max
      newW = newH = THUMBNAIL_SIZE;
      // If image has a 1:1 ratio, nothing to change
      // Else, we must calculate a new size to keep the right ratio
      if (w != h) {
        var ratio = (w > h) ? w / h : h / w;
        if (w > h)
          newH = THUMBNAIL_SIZE / ratio;
        else
          newW = THUMBNAIL_SIZE / ratio;
      }
    }
    // Create the thumbnail image
    destImage.scaleToFit(newW, newH).quality(90).write(join(imageFile.destination, image.thumbnailname));

    // Determine images static path
    const imageStaticUrl = join(WEBSERVER.URL, STATIC_PATHS.IMAGES, imageFile.imageId, imageFile.filename);
    const thumbnailStaticUrl = join(WEBSERVER.URL, STATIC_PATHS.IMAGES, imageFile.imageId, image.thumbnailname);

    // We can now generate the torrent file
    const torrentArgs = {
      name: imageFile.imageId,
      createdBy: 'PeerTube',
      announceList: [
        [ WEBSERVER.WS + '://' + WEBSERVER.HOSTNAME + ':' + WEBSERVER.PORT + '/tracker/socket' ],
        [ WEBSERVER.URL + '/tracker/announce' ]
      ],
      urlList: [
        WEBSERVER.URL + join(STATIC_PATHS.IMAGES_WEBSEED)
      ]
    }
    const torrentContent = await createTorrentPromise(imageFile.destination, torrentArgs);
    const torrentPath = join(CONFIG.STORAGE.TORRENTS_DIR, imageFile.imageId + '.torrent');

    // Get the torrent info hash
    const parsedTorrent = parseTorrent(torrentContent);
    image.infoHash = parsedTorrent.infoHash;

    logger.info('Creating torrent %s.', torrentPath);
    // Writing the torrent file
    await writeFile(torrentPath, torrentContent);

    // Save image in database
    image.save();

    // Done
    return res.json({
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
