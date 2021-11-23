"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToken = exports.revokeToken = exports.getUser = exports.getRefreshToken = exports.getClient = exports.getAccessToken = void 0;
const tslib_1 = require("tslib");
const oauth2_server_1 = require("oauth2-server");
const plugin_manager_1 = require("@server/lib/plugins/plugin-manager");
const actor_1 = require("@server/models/actor/actor");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const user_1 = require("../../models/user/user");
const oauth_client_1 = require("../../models/oauth/oauth-client");
const oauth_token_1 = require("../../models/oauth/oauth-token");
const user_2 = require("../user");
const tokens_cache_1 = require("./tokens-cache");
function getAccessToken(bearerToken) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.debug('Getting access token (bearerToken: ' + bearerToken + ').');
        if (!bearerToken)
            return undefined;
        let tokenModel;
        if (tokens_cache_1.TokensCache.Instance.hasToken(bearerToken)) {
            tokenModel = tokens_cache_1.TokensCache.Instance.getByToken(bearerToken);
        }
        else {
            tokenModel = yield oauth_token_1.OAuthTokenModel.getByTokenAndPopulateUser(bearerToken);
            if (tokenModel)
                tokens_cache_1.TokensCache.Instance.setToken(tokenModel);
        }
        if (!tokenModel)
            return undefined;
        if (tokenModel.User.pluginAuth) {
            const valid = yield plugin_manager_1.PluginManager.Instance.isTokenValid(tokenModel, 'access');
            if (valid !== true)
                return undefined;
        }
        return tokenModel;
    });
}
exports.getAccessToken = getAccessToken;
function getClient(clientId, clientSecret) {
    logger_1.logger.debug('Getting Client (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ').');
    return oauth_client_1.OAuthClientModel.getByIdAndSecret(clientId, clientSecret);
}
exports.getClient = getClient;
function getRefreshToken(refreshToken) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.debug('Getting RefreshToken (refreshToken: ' + refreshToken + ').');
        const tokenInfo = yield oauth_token_1.OAuthTokenModel.getByRefreshTokenAndPopulateClient(refreshToken);
        if (!tokenInfo)
            return undefined;
        const tokenModel = tokenInfo.token;
        if (tokenModel.User.pluginAuth) {
            const valid = yield plugin_manager_1.PluginManager.Instance.isTokenValid(tokenModel, 'refresh');
            if (valid !== true)
                return undefined;
        }
        return tokenInfo;
    });
}
exports.getRefreshToken = getRefreshToken;
function getUser(usernameOrEmail, password, bypassLogin) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (bypassLogin && bypassLogin.bypass === true) {
            logger_1.logger.info('Bypassing oauth login by plugin %s.', bypassLogin.pluginName);
            let user = yield user_1.UserModel.loadByEmail(bypassLogin.user.email);
            if (!user)
                user = yield createUserFromExternal(bypassLogin.pluginName, bypassLogin.user);
            if (bypassLogin.user.userQuota) {
                user.videoQuotaDaily = bypassLogin.user.userQuota;
                yield user.save();
            }
            if (!user)
                throw new oauth2_server_1.AccessDeniedError('Cannot create such user: an actor with that name already exists.');
            if (user.pluginAuth !== null) {
                if (user.pluginAuth !== bypassLogin.pluginName)
                    return null;
                checkUserValidityOrThrow(user);
                return user;
            }
        }
        logger_1.logger.debug('Getting User (username/email: ' + usernameOrEmail + ', password: ******).');
        const user = yield user_1.UserModel.loadByUsernameOrEmail(usernameOrEmail);
        if (!user || user.pluginAuth !== null || !password)
            return null;
        const passwordMatch = yield user.isPasswordMatch(password);
        if (passwordMatch !== true)
            return null;
        checkUserValidityOrThrow(user);
        if (config_1.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION && user.emailVerified === false) {
            throw new oauth2_server_1.AccessDeniedError('User email is not verified.');
        }
        return user;
    });
}
exports.getUser = getUser;
function revokeToken(tokenInfo, options = {}) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { req, explicitLogout } = options;
        const token = yield oauth_token_1.OAuthTokenModel.getByRefreshTokenAndPopulateUser(tokenInfo.refreshToken);
        if (token) {
            let redirectUrl;
            if (explicitLogout === true && token.User.pluginAuth && token.authName) {
                redirectUrl = yield plugin_manager_1.PluginManager.Instance.onLogout(token.User.pluginAuth, token.authName, token.User, req);
            }
            tokens_cache_1.TokensCache.Instance.clearCacheByToken(token.accessToken);
            token.destroy()
                .catch(err => logger_1.logger.error('Cannot destroy token when revoking token.', { err }));
            return { success: true, redirectUrl };
        }
        return { success: false };
    });
}
exports.revokeToken = revokeToken;
function saveToken(token, client, user, options = {}) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { refreshTokenAuthName, bypassLogin } = options;
        let authName = null;
        if ((bypassLogin === null || bypassLogin === void 0 ? void 0 : bypassLogin.bypass) === true) {
            authName = bypassLogin.authName;
        }
        else if (refreshTokenAuthName) {
            authName = refreshTokenAuthName;
        }
        logger_1.logger.debug('Saving token ' + token.accessToken + ' for client ' + client.id + ' and user ' + user.id + '.');
        const tokenToCreate = {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            authName,
            oAuthClientId: client.id,
            userId: user.id
        };
        const tokenCreated = yield oauth_token_1.OAuthTokenModel.create(tokenToCreate);
        user.lastLoginDate = new Date();
        yield user.save();
        return {
            accessToken: tokenCreated.accessToken,
            accessTokenExpiresAt: tokenCreated.accessTokenExpiresAt,
            refreshToken: tokenCreated.refreshToken,
            refreshTokenExpiresAt: tokenCreated.refreshTokenExpiresAt,
            client,
            user,
            accessTokenExpiresIn: buildExpiresIn(tokenCreated.accessTokenExpiresAt),
            refreshTokenExpiresIn: buildExpiresIn(tokenCreated.refreshTokenExpiresAt)
        };
    });
}
exports.saveToken = saveToken;
function createUserFromExternal(pluginAuth, options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const actor = yield actor_1.ActorModel.loadLocalByName(options.username);
        if (actor)
            return null;
        const userToCreate = new user_1.UserModel({
            username: options.username,
            password: null,
            email: options.email,
            nsfwPolicy: config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY,
            autoPlayVideo: true,
            role: options.role,
            videoQuota: config_1.CONFIG.USER.VIDEO_QUOTA,
            videoQuotaDaily: options.userQuota || config_1.CONFIG.USER.VIDEO_QUOTA_DAILY,
            adminFlags: 0,
            pluginAuth
        });
        const { user } = yield (0, user_2.createUserAccountAndChannelAndPlaylist)({
            userToCreate,
            userDisplayName: options.displayName
        });
        return user;
    });
}
function checkUserValidityOrThrow(user) {
    if (user.blocked)
        throw new oauth2_server_1.AccessDeniedError('User is blocked.');
}
function buildExpiresIn(expiresAt) {
    return Math.floor((expiresAt.getTime() - new Date().getTime()) / 1000);
}
