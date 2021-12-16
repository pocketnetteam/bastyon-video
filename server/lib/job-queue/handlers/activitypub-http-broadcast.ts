import { map } from 'bluebird'
import { Job } from 'bull'
import { ActivitypubHttpBroadcastPayload } from '@shared/models'
import { logger } from '../../../helpers/logger'
import { doRequest } from '../../../helpers/requests'
import { BROADCAST_CONCURRENCY, LOGGER_ENDPOINT } from '../../../initializers/constants'
import { ActorFollowScoreCache } from '../../files-cache'
import { buildGlobalHeaders, buildSignedRequestOptions, computeBody } from './utils/activitypub-http-utils'

import { getServerActor } from '@server/models/application/application'
import fetch from "node-fetch"

async function processActivityPubHttpBroadcast (job: Job) {
  logger.info('Processing ActivityPub broadcast in job %d.', job.id)

  const payload = job.data as ActivitypubHttpBroadcastPayload

  const body = await computeBody(payload)
  const httpSignatureOptions = await buildSignedRequestOptions(payload)

  const options = {
    method: 'POST' as 'POST',
    json: body,
    httpSignature: httpSignatureOptions,
    headers: buildGlobalHeaders(body)
  }

  const badUrls: string[] = []
  const goodUrls: string[] = []

  await map(payload.uris, uri => {
    return doRequest(uri, options)
      .then(() => goodUrls.push(uri))
      .catch((err) => {
        badUrls.push(uri)

        return getServerActor().then(server => {
          fetch(LOGGER_ENDPOINT, {
            method: "post",
            body: JSON.stringify({
              server: server.url,
              type: "BrodcastFail",
              requestUrl: uri,
              requestOptions: body,
              err
            })
          })
        })
      })
  }, { concurrency: BROADCAST_CONCURRENCY })

  return ActorFollowScoreCache.Instance.updateActorFollowsScore(goodUrls, badUrls)
}

// ---------------------------------------------------------------------------

export {
  processActivityPubHttpBroadcast
}
