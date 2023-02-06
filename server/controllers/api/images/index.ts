import { asyncMiddleware } from '@server/middlewares'
import express from 'express'
import { Op } from 'sequelize'
import { uploadRouter } from './upload'
import { ImageModel } from '@server/models/image/image'
import { parse } from 'path'

const imagesRouter = express.Router()

const LIMIT_LIST_QUERY = 100;
const DEFAULT_ORDER_BY = 'createdAt';
const DEFAULT_ORDER_DIRECTION = 'DESC';

imagesRouter.use('/', uploadRouter)

imagesRouter.get('/',
  asyncMiddleware(listImages)
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
  var imagesUrl = images.map((i) => {
    return {
      url: ImageModel.getImageStaticUrl(parse(i.filename).name, i.originalname),
      regular: ImageModel.getImageStaticUrl(parse(i.filename).name, i.filename),
      thumbnail: ImageModel.getImageStaticUrl(parse(i.filename).name, i.thumbnailname)
    }
  });
  // Return result
  return res.json(imagesUrl);
}