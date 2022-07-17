import { map } from 'bluebird'
import { Job } from 'bull'
import { buildGlobalHeaders, buildSignedRequestOptions, computeBody } from '@server/lib/activitypub/send'
import { ActorFollowHealthCache } from '@server/lib/actor-follow-health-cache'
import { ActivitypubHttpBroadcastPayload } from '@shared/models'
import { logger } from '../../../helpers/logger'
import { doRequest } from '../../../helpers/requests'
import { BROADCAST_CONCURRENCY, LOGGER_ENDPOINT } from '../../../initializers/constants'

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

  await map(payload.uris, async uri => {
    try {
      await doRequest(uri, options)
      goodUrls.push(uri)
    } catch (err) {
      logger.debug('HTTP broadcast to %s failed.', uri, { err })
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
    }
  }, { concurrency: BROADCAST_CONCURRENCY })

  return ActorFollowHealthCache.Instance.updateActorFollowsHealth(goodUrls, badUrls)
}

// ---------------------------------------------------------------------------

export {
  processActivityPubHttpBroadcast
}
