import { asyncMiddleware } from '@server/middlewares'
import express from 'express'
import { Op } from 'sequelize'
import { requestRouter } from './request'
import { GarbageCollectorHistoryModel } from '@server/models/garbage-collector/garbage-collector-history'

const garbageCollectorRouter = express.Router()

const LIMIT_LIST_QUERY = 10;
const DEFAULT_ORDER_BY = 'createdAt';
const DEFAULT_ORDER_DIRECTION = 'DESC';

garbageCollectorRouter.use('/', requestRouter)

garbageCollectorRouter.get('/',
  asyncMiddleware(listGarbageCollectorHistory)
)

// ---------------------------------------------------------------------------

export {
  garbageCollectorRouter
}

// ---------------------------------------------------------------------------
async function listGarbageCollectorHistory (req: express.Request, res: express.Response) {
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
  const gbHistory = await GarbageCollectorHistoryModel.findAll({
    where: {
      createdAt: {
        [Op.gt]: req.query.createdAt || new Date(0)
      }
    },
    order: [[order_by, order_direction]],
    limit: limit,
    offset: offset
  });
  const nbHistory = await GarbageCollectorHistoryModel.count();
  var nbPages = Math.ceil(nbHistory / limit);
  nbPages = (isNaN(nbPages) || nbPages <= 0) ? 1 : nbPages;
  // Return result
  return res.json({ history: gbHistory, nbPages: nbPages });
}