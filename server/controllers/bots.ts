import express from 'express'
import { HttpStatusCode } from '@shared/models'

const botsRouter = express.Router()

// Sitemap generation is disabled: it loaded every local video in memory and crashed the process on large instances
botsRouter.use('/sitemap.xml', (_req: express.Request, res: express.Response) => {
  return res.sendStatus(HttpStatusCode.NOT_FOUND_404)
})

// ---------------------------------------------------------------------------

export {
  botsRouter
}
