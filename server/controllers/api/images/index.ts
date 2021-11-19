import express from 'express'
import { uploadRouter } from './upload'

const imagesRouter = express.Router()

imagesRouter.use('/', uploadRouter)

// ---------------------------------------------------------------------------

export {
  imagesRouter
}

// ---------------------------------------------------------------------------
