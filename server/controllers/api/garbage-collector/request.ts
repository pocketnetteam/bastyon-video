import express from 'express'
import { asyncRetryTransactionMiddleware, authenticate } from '../../../middlewares'
import { GarbageCollectorScheduler } from '@server/lib/schedulers/garbage-collector-scheduler'

const requestRouter = express.Router()

requestRouter.post('/request',
  authenticate,
  asyncRetryTransactionMiddleware(startGarbageCollector)
)

// ---------------------------------------------------------------------------

export {
  requestRouter
}

// ---------------------------------------------------------------------------

export async function startGarbageCollector (req: express.Request, res: express.Response) {
    GarbageCollectorScheduler.Instance.execute();
    // Done
    return res.json({ status: 'success' });
}
