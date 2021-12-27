import { CONFIG } from '@server/initializers/config'
import { asyncMiddleware, authenticate } from '@server/middlewares'
import { ImageModel } from '@server/models/image/image'
import express from 'express'
import { logger } from '../../../helpers/logger'
import { Op } from 'sequelize'
import { uploadRouter } from './upload'
import { HttpStatusCode } from '@shared/models'
import { join } from 'path'
import { remove } from 'fs-extra'

const imagesRouter = express.Router()

const LIMIT_LIST_QUERY = 10;
const DEFAULT_ORDER_BY = 'updatedAt';
const DEFAULT_ORDER_DIRECTION = 'DESC';

imagesRouter.use('/', uploadRouter)

imagesRouter.get('/',
  asyncMiddleware(listImages)
)

imagesRouter.delete('/:imageId',
  authenticate,
  asyncMiddleware(deleteImage)
)

// ---------------------------------------------------------------------------

export {
  imagesRouter
}

// ---------------------------------------------------------------------------
async function listImages (req: express.Request, res: express.Response) {
  // Define the query args using query params and default value
  const limit = (req.query.limit && req.query.limit > 0 && req.query.limit <= LIMIT_LIST_QUERY) ? req.query.limit : LIMIT_LIST_QUERY;
  var order_by = DEFAULT_ORDER_BY, order_direction = DEFAULT_ORDER_DIRECTION;
  if (req.query.order && req.query.order.length >= 2 && req.query.order.startsWith('-')) {
    order_direction = 'ASC';
    order_by = req.query.order.substring(1);
  }
  else if (req.query.order && req.query.order.length >= 1)
    order_by = req.query.order
  const offset = (req.query.offset) ? req.query.offset : 0;
  // Query database
  const images = await ImageModel.findAll({
    where: {
      createdAt: {
        [Op.gt]: req.query.createdAt || new Date(0)
      }
    },
    order: [[order_by, order_direction]],
    limit: limit,
    offset: offset
  });
  // Return result
  return res.json(images);
}

// Function called to delete an image
async function deleteImage(req: express.Request, res: express.Response) {
  // Query database
  const image = await ImageModel.findOne({
    where: {
      id: req.params.imageId
    }
  });
  // If no image found, returns error
  if (image == null) {
    logger.error('Delete image: Cannot find image with ID: ' + req.params.imageId);
    return res.sendStatus(HttpStatusCode.NOT_FOUND_404);
  }
  // Delete the folder with the images and the torrent
  const imgPath = join(CONFIG.STORAGE.IMAGES_DIR, req.params.imageId);
  const torrentPath = ImageModel.getTorrentStaticPath(req.params.imageId);
  try {
    await remove(imgPath);
  } catch(err) {
    logger.error('Delete image: Cannot delete image folder: ' + imgPath);
    logger.error(err);
    return res.sendStatus(HttpStatusCode.INTERNAL_SERVER_ERROR_500);
  }
  try {
    await remove(torrentPath);
  } catch(err) { }
  // Update database
  await image.destroy();
  // Return
  return res.json({
    status: 'success'
  });
}