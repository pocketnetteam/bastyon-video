"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokensRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const express_rate_limit_1 = (0, tslib_1.__importDefault)(require("express-rate-limit"));
const logger_1 = require("@server/helpers/logger");
const uuid_1 = require("@server/helpers/uuid");
const config_1 = require("@server/initializers/config");
const external_auth_1 = require("@server/lib/auth/external-auth");
const oauth_1 = require("@server/lib/auth/oauth");
const oauth_model_1 = require("@server/lib/auth/oauth-model");
const hooks_1 = require("@server/lib/plugins/hooks");
const middlewares_1 = require("@server/middlewares");
const tokensRouter = express_1.default.Router();
exports.tokensRouter = tokensRouter;
const loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.CONFIG.RATES_LIMIT.LOGIN.WINDOW_MS,
    max: config_1.CONFIG.RATES_LIMIT.LOGIN.MAX
});
tokensRouter.post('/token', loginRateLimiter, (0, middlewares_1.openapiOperationDoc)({ operationId: 'getOAuthToken' }), (0, middlewares_1.asyncMiddleware)(handleToken));
tokensRouter.post('/revoke-token', (0, middlewares_1.openapiOperationDoc)({ operationId: 'revokeOAuthToken' }), middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(handleTokenRevocation));
tokensRouter.get('/scoped-tokens', middlewares_1.authenticate, getScopedTokens);
tokensRouter.post('/scoped-tokens', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(renewScopedTokens));
function handleToken(req, res, next) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const grantType = req.body.grant_type;
        try {
            const bypassLogin = yield buildByPassLogin(req, grantType);
            const refreshTokenAuthName = grantType === 'refresh_token'
                ? yield (0, external_auth_1.getAuthNameFromRefreshGrant)(req.body.refresh_token)
                : undefined;
            const options = {
                refreshTokenAuthName,
                bypassLogin
            };
            const token = yield (0, oauth_1.handleOAuthToken)(req, options);
            res.set('Cache-Control', 'no-store');
            res.set('Pragma', 'no-cache');
            hooks_1.Hooks.runAction('action:api.user.oauth2-got-token', { username: token.user.username, ip: req.ip });
            return res.json({
                token_type: 'Bearer',
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
                expires_in: token.accessTokenExpiresIn,
                refresh_token_expires_in: token.refreshTokenExpiresIn
            });
        }
        catch (err) {
            logger_1.logger.warn('Login error', { err });
            return res.fail({
                status: err.code,
                message: err.message,
                type: err.name
            });
        }
    });
}
function handleTokenRevocation(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const token = res.locals.oauth.token;
        const result = yield (0, oauth_model_1.revokeToken)(token, { req, explicitLogout: true });
        return res.json(result);
    });
}
function getScopedTokens(req, res) {
    const user = res.locals.oauth.token.user;
    return res.json({
        feedToken: user.feedToken
    });
}
function renewScopedTokens(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.oauth.token.user;
        user.feedToken = (0, uuid_1.buildUUID)();
        yield user.save();
        return res.json({
            feedToken: user.feedToken
        });
    });
}
function buildByPassLogin(req, grantType) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (grantType !== 'password')
            return undefined;
        if (req.body.externalAuthToken) {
            return (0, external_auth_1.getBypassFromExternalAuth)(req.body.username, req.body.externalAuthToken);
        }
        return (0, external_auth_1.getBypassFromPasswordGrant)(req.body.username, req.body.password);
    });
}
