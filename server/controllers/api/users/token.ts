import express from "express"
import RateLimit from "express-rate-limit"
import { logger } from "@server/helpers/logger"
import { CONFIG } from "@server/initializers/config"
import {
  getAuthNameFromRefreshGrant,
  getBypassFromExternalAuth,
  getBypassFromPasswordGrant,
  setAuthBypassToken,
  cleanupExpiredTokens
} from "@server/lib/auth/external-auth"
import { handleOAuthToken } from "@server/lib/auth/oauth"
import { BypassLogin, revokeToken } from "@server/lib/auth/oauth-model"
import { Hooks } from "@server/lib/plugins/hooks"
import {
  asyncMiddleware,
  authenticate,
  openapiOperationDoc
} from "@server/middlewares"
import { buildUUID } from "@shared/extra-utils"
import { ScopedToken } from "@shared/models/users/user-scoped-token"
import { generateRandomString } from "@server/helpers/utils"
import { UserRole } from "@shared/models"
import {
  MINUTES_STORED,
  MINIMUM_QUOTA,
  POCKETNET_PROXY_META_TEST,
  PLUGIN_EXTERNAL_AUTH_TOKEN_LIFETIME,
  AUTH_ERROR_STATUS,
  AUTH_ERRORS,
  GRAFANA_LOGS_PATH
} from "@server/initializers/constants"
import fetch from "node-fetch"
import { getServerActor } from "@server/models/application/application"
import moment from "moment"

const { Api } = require("./../../../lib/auth/blockChainAuth/api.js")
const signatureChecker = require("./../../../lib/auth/blockChainAuth/authMethods.js")
const generateError = require("./../../../lib/auth/blockChainAuth/errorGenerator.js")
const ReputationStorageController = require("./../../../lib/auth/blockChainAuth/reputationCache.js")
const getUserQuota = require("./../../../lib/auth/blockChainAuth/quotaCalculator.js")

const tokensRouter = express.Router()

const api = new Api({
  options: {
    listofproxies: POCKETNET_PROXY_META_TEST
  }
})

const reputationController = new ReputationStorageController(MINUTES_STORED)

api.init()

POCKETNET_PROXY_META_TEST.map((proxy) => api.addproxy(proxy))

// Token is the key, expiration date is the value
const authBypassTokens = new Map<
string,
{
  expires: Date
  user: {
    username: string
    email: string
    displayName: string
    role: UserRole
  }
  authName: string
  npmName: string
}
>()

async function createUserFromBlockChain (
  res: express.Response,
  address: String,
  userQuota?: Number
) {
  const bypassToken = await generateRandomString(32)

  const expires = new Date()
  expires.setTime(expires.getTime() + PLUGIN_EXTERNAL_AUTH_TOKEN_LIFETIME)

  const user: any = {
    username: address,
    email: `${address}@example.com`,
    role: UserRole.USER,
    displayName: address,
    userQuota
  }

  setAuthBypassToken(bypassToken, {
    expires,
    user,
    npmName: 'blockChainAuth',
    authName: 'blockChainAuth'
  })

  // Cleanup expired tokens
  cleanupExpiredTokens()

  res.json({ externalAuthToken: bypassToken, username: user.username })
}

function createGrafanaErrorBody ({
  level = "error",
  date = moment().format("YYYY-MM-DD hh:mm:ss"),
  moduleVersion = "",
  code = 400,
  payload = "",
  err = "",
  guid = "",
  userAgent = ""
}) {
  const parametersOrder = [
    level,
    date,
    moduleVersion,
    code,
    payload,
    err,
    userAgent,
    guid
  ].map((element) => (typeof element !== "number" ? `'${element}'` : element))

  return `(${parametersOrder.join(",")})`
}

const loginRateLimiter = RateLimit({
  windowMs: CONFIG.RATES_LIMIT.LOGIN.WINDOW_MS,
  max: CONFIG.RATES_LIMIT.LOGIN.MAX
})

tokensRouter.post(
  "/token",
  loginRateLimiter,
  openapiOperationDoc({ operationId: "getOAuthToken" }),
  asyncMiddleware(handleToken)
)

tokensRouter.post(
  "/blockChainAuth",
  loginRateLimiter,
  openapiOperationDoc({ operationId: "getOAuthToken" }),
  asyncMiddleware(handleTokenBlockChain)
)

tokensRouter.post(
  "/revoke-token",
  openapiOperationDoc({ operationId: "revokeOAuthToken" }),
  authenticate,
  asyncMiddleware(handleTokenRevocation)
)

tokensRouter.get("/scoped-tokens", authenticate, getScopedTokens)

tokensRouter.post(
  "/scoped-tokens",
  authenticate,
  asyncMiddleware(renewScopedTokens)
)

// ---------------------------------------------------------------------------

export { tokensRouter }
// ---------------------------------------------------------------------------

async function handleTokenBlockChain (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const setHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    )

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    )

    res.setHeader("Access-Control-Allow-Credentials", true)

    return res
  }
  //

  setHeaders(res)

  const { address, nonce, pubkey, signature, v } = req.body

  if (!address) {
    return res
      .status(AUTH_ERROR_STATUS)
      .send(generateError(AUTH_ERRORS.NO_ADDRESS, "NO_ADDRESS"))
  }

  const authDataValid = signatureChecker.v1({
    address,
    nonce,
    pubkey,
    signature,
    v
  })

  if (!authDataValid.valid) {
    return res
      .status(AUTH_ERROR_STATUS)
      .send(
        generateError(
          AUTH_ERRORS[authDataValid.error],
          authDataValid.error,
          authDataValid.body || ""
        )
      )
  }

  const storedQuota = reputationController.check(address)

  if (storedQuota.valid) {
    return createUserFromBlockChain(res, address, storedQuota.quota)
  }

  // Check user reputation
  return api
    .rpc("getuserstate", [ address ])
    .then((data: any) => {
      const userQuota = getUserQuota(data)

      if (
        typeof data.balance === "undefined" ||
        typeof data.reputation === "undefined"
      ) {
        return createUserFromBlockChain(res, address, MINIMUM_QUOTA)
        .then(() => getServerActor())
        .then((server) => {
          return fetch(GRAFANA_LOGS_PATH, {
            method: "post",
            headers: {
              "Content-Type": "text/plain"
            },
            body: createGrafanaErrorBody({
              level: "ServerError",
              code: 508,
              userAgent: "PeertubeServer",
              payload: JSON.stringify({
                text: "Proxy returned empty response",
                server: server.url,
                proxy: data.bastyonProxy
              }),
              err: "PROXY_EMPTY_RESPONSE"
            })
          })
        })
      }

      if (userQuota) {
        reputationController.set(address, userQuota)

        return createUserFromBlockChain(res, address, userQuota)
      } else {
        return res.status(AUTH_ERROR_STATUS).send(
          generateError(AUTH_ERRORS.QUOTA_ERROR, "QUOTA_ERROR", {
            coins: data.balance,
            reputation: data.reputation
          })
        )
      }
    })
    .catch((err: any = {}) => {
      // temporary solution befory dynamic reputation
      return createUserFromBlockChain(res, address, MINIMUM_QUOTA)
      .then(() => getServerActor())
      .then((server) => {
        return fetch(GRAFANA_LOGS_PATH, {
          method: "post",
          headers: {
            "Content-Type": "text/plain"
          },
          body: createGrafanaErrorBody({
            level: "ServerError",
            code: err.code,
            userAgent: "PeertubeServer",
            payload: JSON.stringify({
              text: "Proxy returned no response",
              body: err,
              server: server.url,
              proxy: err.bastyonProxy
            }),
            err: "PROXY_NO_RESPONSE"
          })
        })
      })
    })
}

async function handleToken (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const grantType = req.body.grant_type

  try {
    const bypassLogin = await buildByPassLogin(req, grantType)

    const refreshTokenAuthName =
      grantType === "refresh_token"
        ? await getAuthNameFromRefreshGrant(req.body.refresh_token)
        : undefined

    const options = {
      refreshTokenAuthName,
      bypassLogin
    }

    const token = await handleOAuthToken(req, options)

    res.set("Cache-Control", "no-store")
    res.set("Pragma", "no-cache")

    Hooks.runAction("action:api.user.oauth2-got-token", {
      username: token.user.username,
      ip: req.ip,
      req,
      res
    })

    return res.json({
      token_type: "Bearer",

      access_token: token.accessToken,
      refresh_token: token.refreshToken,

      expires_in: token.accessTokenExpiresIn,
      refresh_token_expires_in: token.refreshTokenExpiresIn
    })
  } catch (err) {
    logger.warn("Login error", { err })

    return res.fail({
      status: err.code,
      message: err.message,
      type: err.name
    })
  }
}

async function handleTokenRevocation (
  req: express.Request,
  res: express.Response
) {
  const token = res.locals.oauth.token

  const result = await revokeToken(token, { req, explicitLogout: true })

  return res.json(result)
}

function getScopedTokens (req: express.Request, res: express.Response) {
  const user = res.locals.oauth.token.user

  return res.json({
    feedToken: user.feedToken
  } as ScopedToken)
}

async function renewScopedTokens (req: express.Request, res: express.Response) {
  const user = res.locals.oauth.token.user

  user.feedToken = buildUUID()
  await user.save()

  return res.json({
    feedToken: user.feedToken
  } as ScopedToken)
}

async function buildByPassLogin (
  req: express.Request,
  grantType: string
): Promise<BypassLogin> {
  if (grantType !== "password") return undefined

  if (req.body.externalAuthToken) {
    // Consistency with the getBypassFromPasswordGrant promise
    return getBypassFromExternalAuth(
      req.body.username,
      req.body.externalAuthToken
    )
  }

  return getBypassFromPasswordGrant(req.body.username, req.body.password)
}
