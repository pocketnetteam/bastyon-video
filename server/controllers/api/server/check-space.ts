import * as express from "express"
import { asyncMiddleware } from "../../../middlewares"
import { CONFIG } from "../../../../server/initializers/config"
import { FULL_DISC_SPACE_PERCENTAGE } from "../../../../server/initializers/constants"
import checkDiskSpace from "check-disk-space"
import { cacheRoute } from '../../../middlewares/cache/cache'
import { ROUTE_CACHE_LIFETIME } from '../../../initializers/constants'

const spaceRouter = express.Router()

spaceRouter.get(
  "/space",
  cacheRoute(ROUTE_CACHE_LIFETIME.STATS),
  asyncMiddleware(getSpace)
)

async function getSpace (_req: express.Request, res: express.Response) {
  return checkDiskSpace(CONFIG.STORAGE.VIDEOS_DIR).then((diskSpace) =>
    res.json({
      ...diskSpace,
      isFull: diskSpace.free / diskSpace.size >= FULL_DISC_SPACE_PERCENTAGE
    })
  )
}

// ---------------------------------------------------------------------------

export { spaceRouter }
