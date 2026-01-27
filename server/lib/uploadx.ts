import express from 'express'
import { getResumableUploadPath } from '@server/helpers/upload'
import { Uploadx } from '@uploadx/core'
import { logger, loggerTagsFactory } from '@server/helpers/logger'

const lTags = loggerTagsFactory('uploadx')

const uploadx = new Uploadx({
  directory: getResumableUploadPath(),

  expiration: { maxAge: undefined, rolling: true },

  // Could be big with thumbnails/previews
  maxMetadataSize: '10MB',

  userIdentifier: (_, res: express.Response) => {
    if (!res.locals.oauth) return undefined

    return res.locals.oauth.token.user.id + ''
  },

  // Add error handler to prevent server crashes
  onError: (error: Error, req: express.Request, res: express.Response) => {
    logger.error('Uploadx error occurred', { error: error.message, stack: error.stack, ...lTags() })
    
    // Validate that the error didn't come from malformed chunk data
    if (error.message.includes('Promise') || error.message.includes('invalid') || error.message.includes('malformed')) {
      logger.warn('Detected potentially malformed chunk data', { error: error.message, ...lTags() })
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Upload failed',
        message: 'An error occurred during upload processing. Please try again.'
      })
    }
  }
})

export {
  uploadx
}
