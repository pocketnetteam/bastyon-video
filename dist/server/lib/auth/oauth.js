"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOAuthAuthenticate = exports.handleOAuthToken = void 0;
const tslib_1 = require("tslib");
const oauth2_server_1 = require("oauth2-server");
const core_utils_1 = require("@server/helpers/core-utils");
const constants_1 = require("../../initializers/constants");
const oauth_model_1 = require("./oauth-model");
const oAuthServer = new (require('oauth2-server'))({
    accessTokenLifetime: constants_1.OAUTH_LIFETIME.ACCESS_TOKEN,
    refreshTokenLifetime: constants_1.OAUTH_LIFETIME.REFRESH_TOKEN,
    model: require('./oauth-model')
});
function handleOAuthToken(req, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const request = new oauth2_server_1.Request(req);
        const { refreshTokenAuthName, bypassLogin } = options;
        if (request.method !== 'POST') {
            throw new oauth2_server_1.InvalidRequestError('Invalid request: method must be POST');
        }
        if (!request.is(['application/x-www-form-urlencoded'])) {
            throw new oauth2_server_1.InvalidRequestError('Invalid request: content must be application/x-www-form-urlencoded');
        }
        const clientId = request.body.client_id;
        const clientSecret = request.body.client_secret;
        if (!clientId || !clientSecret) {
            throw new oauth2_server_1.InvalidClientError('Invalid client: cannot retrieve client credentials');
        }
        const client = yield oauth_model_1.getClient(clientId, clientSecret);
        if (!client) {
            throw new oauth2_server_1.InvalidClientError('Invalid client: client is invalid');
        }
        const grantType = request.body.grant_type;
        if (!grantType) {
            throw new oauth2_server_1.InvalidRequestError('Missing parameter: `grant_type`');
        }
        if (!['password', 'refresh_token'].includes(grantType)) {
            throw new oauth2_server_1.UnsupportedGrantTypeError('Unsupported grant type: `grant_type` is invalid');
        }
        if (!client.grants.includes(grantType)) {
            throw new oauth2_server_1.UnauthorizedClientError('Unauthorized client: `grant_type` is invalid');
        }
        if (grantType === 'password') {
            return handlePasswordGrant({
                request,
                client,
                bypassLogin
            });
        }
        return handleRefreshGrant({
            request,
            client,
            refreshTokenAuthName
        });
    });
}
exports.handleOAuthToken = handleOAuthToken;
function handleOAuthAuthenticate(req, res, authenticateInQuery = false) {
    const options = authenticateInQuery
        ? { allowBearerTokensInQueryString: true }
        : {};
    return oAuthServer.authenticate(new oauth2_server_1.Request(req), new oauth2_server_1.Response(res), options);
}
exports.handleOAuthAuthenticate = handleOAuthAuthenticate;
function handlePasswordGrant(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { request, client, bypassLogin } = options;
        if (!request.body.username) {
            throw new oauth2_server_1.InvalidRequestError('Missing parameter: `username`');
        }
        if (!bypassLogin && !request.body.password) {
            throw new oauth2_server_1.InvalidRequestError('Missing parameter: `password`');
        }
        const user = yield oauth_model_1.getUser(request.body.username, request.body.password, bypassLogin);
        if (!user)
            throw new oauth2_server_1.InvalidGrantError('Invalid grant: user credentials are invalid');
        const token = yield buildToken();
        return oauth_model_1.saveToken(token, client, user, { bypassLogin });
    });
}
function handleRefreshGrant(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { request, client, refreshTokenAuthName } = options;
        if (!request.body.refresh_token) {
            throw new oauth2_server_1.InvalidRequestError('Missing parameter: `refresh_token`');
        }
        const refreshToken = yield oauth_model_1.getRefreshToken(request.body.refresh_token);
        if (!refreshToken) {
            throw new oauth2_server_1.InvalidGrantError('Invalid grant: refresh token is invalid');
        }
        if (refreshToken.client.id !== client.id) {
            throw new oauth2_server_1.InvalidGrantError('Invalid grant: refresh token is invalid');
        }
        if (refreshToken.refreshTokenExpiresAt && refreshToken.refreshTokenExpiresAt < new Date()) {
            throw new oauth2_server_1.InvalidGrantError('Invalid grant: refresh token has expired');
        }
        yield oauth_model_1.revokeToken({ refreshToken: refreshToken.refreshToken });
        const token = yield buildToken();
        return oauth_model_1.saveToken(token, client, refreshToken.user, { refreshTokenAuthName });
    });
}
function generateRandomToken() {
    return core_utils_1.randomBytesPromise(256)
        .then(buffer => core_utils_1.sha1(buffer));
}
function getTokenExpiresAt(type) {
    const lifetime = type === 'access'
        ? constants_1.OAUTH_LIFETIME.ACCESS_TOKEN
        : constants_1.OAUTH_LIFETIME.REFRESH_TOKEN;
    return new Date(Date.now() + lifetime * 1000);
}
function buildToken() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const [accessToken, refreshToken] = yield Promise.all([generateRandomToken(), generateRandomToken()]);
        return {
            accessToken,
            refreshToken,
            accessTokenExpiresAt: getTokenExpiresAt('access'),
            refreshTokenExpiresAt: getTokenExpiresAt('refresh')
        };
    });
}
