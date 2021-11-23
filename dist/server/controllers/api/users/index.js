"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const express_rate_limit_1 = (0, tslib_1.__importDefault)(require("express-rate-limit"));
const token_1 = require("@server/controllers/api/users/token");
const hooks_1 = require("@server/lib/plugins/hooks");
const oauth_token_1 = require("@server/models/oauth/oauth-token");
const shared_1 = require("../../../../shared");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const audit_logger_1 = require("../../../helpers/audit-logger");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const emailer_1 = require("../../../lib/emailer");
const notifier_1 = require("../../../lib/notifier");
const redis_1 = require("../../../lib/redis");
const user_1 = require("../../../lib/user");
const middlewares_1 = require("../../../middlewares");
const validators_1 = require("../../../middlewares/validators");
const user_2 = require("../../../models/user/user");
const me_1 = require("./me");
const my_abuses_1 = require("./my-abuses");
const my_blocklist_1 = require("./my-blocklist");
const my_history_1 = require("./my-history");
const my_notifications_1 = require("./my-notifications");
const my_subscriptions_1 = require("./my-subscriptions");
const my_video_playlists_1 = require("./my-video-playlists");
const auditLogger = (0, audit_logger_1.auditLoggerFactory)('users');
const signupRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.CONFIG.RATES_LIMIT.SIGNUP.WINDOW_MS,
    max: config_1.CONFIG.RATES_LIMIT.SIGNUP.MAX,
    skipFailedRequests: true
});
const askSendEmailLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.CONFIG.RATES_LIMIT.ASK_SEND_EMAIL.WINDOW_MS,
    max: config_1.CONFIG.RATES_LIMIT.ASK_SEND_EMAIL.MAX
});
const usersRouter = express_1.default.Router();
exports.usersRouter = usersRouter;
usersRouter.use('/', token_1.tokensRouter);
usersRouter.use('/', my_notifications_1.myNotificationsRouter);
usersRouter.use('/', my_subscriptions_1.mySubscriptionsRouter);
usersRouter.use('/', my_blocklist_1.myBlocklistRouter);
usersRouter.use('/', my_history_1.myVideosHistoryRouter);
usersRouter.use('/', my_video_playlists_1.myVideoPlaylistsRouter);
usersRouter.use('/', my_abuses_1.myAbusesRouter);
usersRouter.use('/', me_1.meRouter);
usersRouter.get('/autocomplete', middlewares_1.userAutocompleteValidator, (0, middlewares_1.asyncMiddleware)(autocompleteUsers));
usersRouter.get('/', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), middlewares_1.paginationValidator, middlewares_1.usersSortValidator, middlewares_1.setDefaultSort, middlewares_1.setDefaultPagination, middlewares_1.usersListValidator, (0, middlewares_1.asyncMiddleware)(listUsers));
usersRouter.post('/:id/block', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), (0, middlewares_1.asyncMiddleware)(validators_1.usersBlockingValidator), validators_1.ensureCanManageUser, (0, middlewares_1.asyncMiddleware)(blockUser));
usersRouter.post('/:id/unblock', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), (0, middlewares_1.asyncMiddleware)(validators_1.usersBlockingValidator), validators_1.ensureCanManageUser, (0, middlewares_1.asyncMiddleware)(unblockUser));
usersRouter.get('/:id', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), (0, middlewares_1.asyncMiddleware)(middlewares_1.usersGetValidator), getUser);
usersRouter.post('/', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), (0, middlewares_1.asyncMiddleware)(middlewares_1.usersAddValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(createUser));
usersRouter.post('/register', signupRateLimiter, (0, middlewares_1.asyncMiddleware)(middlewares_1.ensureUserRegistrationAllowed), middlewares_1.ensureUserRegistrationAllowedForIP, (0, middlewares_1.asyncMiddleware)(middlewares_1.usersRegisterValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(registerUser));
usersRouter.put('/:id', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), (0, middlewares_1.asyncMiddleware)(middlewares_1.usersUpdateValidator), validators_1.ensureCanManageUser, (0, middlewares_1.asyncMiddleware)(updateUser));
usersRouter.delete('/:id', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(1), (0, middlewares_1.asyncMiddleware)(middlewares_1.usersRemoveValidator), validators_1.ensureCanManageUser, (0, middlewares_1.asyncMiddleware)(removeUser));
usersRouter.post('/ask-reset-password', (0, middlewares_1.asyncMiddleware)(validators_1.usersAskResetPasswordValidator), (0, middlewares_1.asyncMiddleware)(askResetUserPassword));
usersRouter.post('/:id/reset-password', (0, middlewares_1.asyncMiddleware)(validators_1.usersResetPasswordValidator), (0, middlewares_1.asyncMiddleware)(resetUserPassword));
usersRouter.post('/ask-send-verify-email', askSendEmailLimiter, (0, middlewares_1.asyncMiddleware)(validators_1.usersAskSendVerifyEmailValidator), (0, middlewares_1.asyncMiddleware)(reSendVerifyUserEmail));
usersRouter.post('/:id/verify-email', (0, middlewares_1.asyncMiddleware)(validators_1.usersVerifyEmailValidator), (0, middlewares_1.asyncMiddleware)(verifyUserEmail));
function createUser(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        const userToCreate = new user_2.UserModel({
            username: body.username,
            password: body.password,
            email: body.email,
            nsfwPolicy: config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY,
            autoPlayVideo: true,
            role: body.role,
            videoQuota: body.videoQuota,
            videoQuotaDaily: body.videoQuotaDaily,
            adminFlags: body.adminFlags || 0
        });
        const createPassword = userToCreate.password === '';
        if (createPassword) {
            userToCreate.password = yield (0, utils_1.generateRandomString)(20);
        }
        const { user, account, videoChannel } = yield (0, user_1.createUserAccountAndChannelAndPlaylist)({
            userToCreate,
            channelNames: body.channelName && { name: body.channelName, displayName: body.channelName }
        });
        auditLogger.create((0, audit_logger_1.getAuditIdFromRes)(res), new audit_logger_1.UserAuditView(user.toFormattedJSON()));
        logger_1.logger.info('User %s with its channel and account created.', body.username);
        if (createPassword) {
            logger_1.logger.info('Sending to user %s a create password email', body.username);
            const verificationString = yield redis_1.Redis.Instance.setCreatePasswordVerificationString(user.id);
            const url = constants_1.WEBSERVER.URL + '/reset-password?userId=' + user.id + '&verificationString=' + verificationString;
            yield emailer_1.Emailer.Instance.addPasswordCreateEmailJob(userToCreate.username, user.email, url);
        }
        hooks_1.Hooks.runAction('action:api.user.created', { body, user, account, videoChannel });
        return res.json({
            user: {
                id: user.id,
                account: {
                    id: account.id
                }
            }
        });
    });
}
function registerUser(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        const userToCreate = new user_2.UserModel({
            username: body.username,
            password: body.password,
            email: body.email,
            nsfwPolicy: config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY,
            autoPlayVideo: true,
            role: shared_1.UserRole.USER,
            videoQuota: config_1.CONFIG.USER.VIDEO_QUOTA,
            videoQuotaDaily: config_1.CONFIG.USER.VIDEO_QUOTA_DAILY,
            emailVerified: config_1.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION ? false : null
        });
        const { user, account, videoChannel } = yield (0, user_1.createUserAccountAndChannelAndPlaylist)({
            userToCreate: userToCreate,
            userDisplayName: body.displayName || undefined,
            channelNames: body.channel
        });
        auditLogger.create(body.username, new audit_logger_1.UserAuditView(user.toFormattedJSON()));
        logger_1.logger.info('User %s with its channel and account registered.', body.username);
        if (config_1.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION) {
            yield (0, user_1.sendVerifyUserEmail)(user);
        }
        notifier_1.Notifier.Instance.notifyOnNewUserRegistration(user);
        hooks_1.Hooks.runAction('action:api.user.registered', { body, user, account, videoChannel });
        return res.type('json').status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function unblockUser(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        yield changeUserBlock(res, user, false);
        hooks_1.Hooks.runAction('action:api.user.unblocked', { user });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function blockUser(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        const reason = req.body.reason;
        yield changeUserBlock(res, user, true, reason);
        hooks_1.Hooks.runAction('action:api.user.blocked', { user });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function getUser(req, res) {
    return res.json(res.locals.user.toFormattedJSON({ withAdminFlags: true }));
}
function autocompleteUsers(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const resultList = yield user_2.UserModel.autoComplete(req.query.search);
        return res.json(resultList);
    });
}
function listUsers(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const resultList = yield user_2.UserModel.listForApi({
            start: req.query.start,
            count: req.query.count,
            sort: req.query.sort,
            search: req.query.search,
            blocked: req.query.blocked
        });
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total, { withAdminFlags: true }));
    });
}
function removeUser(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        auditLogger.delete((0, audit_logger_1.getAuditIdFromRes)(res), new audit_logger_1.UserAuditView(user.toFormattedJSON()));
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield user.destroy({ transaction: t });
        }));
        hooks_1.Hooks.runAction('action:api.user.deleted', { user });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function updateUser(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        const userToUpdate = res.locals.user;
        const oldUserAuditView = new audit_logger_1.UserAuditView(userToUpdate.toFormattedJSON());
        const roleChanged = body.role !== undefined && body.role !== userToUpdate.role;
        const keysToUpdate = [
            'password',
            'email',
            'emailVerified',
            'videoQuota',
            'videoQuotaDaily',
            'role',
            'adminFlags',
            'pluginAuth'
        ];
        for (const key of keysToUpdate) {
            if (body[key] !== undefined)
                userToUpdate.set(key, body[key]);
        }
        const user = yield userToUpdate.save();
        if (roleChanged || body.password !== undefined)
            yield oauth_token_1.OAuthTokenModel.deleteUserToken(userToUpdate.id);
        auditLogger.update((0, audit_logger_1.getAuditIdFromRes)(res), new audit_logger_1.UserAuditView(user.toFormattedJSON()), oldUserAuditView);
        hooks_1.Hooks.runAction('action:api.user.updated', { user });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function askResetUserPassword(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        const verificationString = yield redis_1.Redis.Instance.setResetPasswordVerificationString(user.id);
        const url = constants_1.WEBSERVER.URL + '/reset-password?userId=' + user.id + '&verificationString=' + verificationString;
        yield emailer_1.Emailer.Instance.addPasswordResetEmailJob(user.username, user.email, url);
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function resetUserPassword(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        user.password = req.body.password;
        yield user.save();
        yield redis_1.Redis.Instance.removePasswordVerificationString(user.id);
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function reSendVerifyUserEmail(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        yield (0, user_1.sendVerifyUserEmail)(user);
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function verifyUserEmail(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = res.locals.user;
        user.emailVerified = true;
        if (req.body.isPendingEmail === true) {
            user.email = user.pendingEmail;
            user.pendingEmail = null;
        }
        yield user.save();
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function changeUserBlock(res, user, block, reason) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const oldUserAuditView = new audit_logger_1.UserAuditView(user.toFormattedJSON());
        user.blocked = block;
        user.blockedReason = reason || null;
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield oauth_token_1.OAuthTokenModel.deleteUserToken(user.id, t);
            yield user.save({ transaction: t });
        }));
        yield emailer_1.Emailer.Instance.addUserBlockJob(user, block, reason);
        auditLogger.update((0, audit_logger_1.getAuditIdFromRes)(res), new audit_logger_1.UserAuditView(user.toFormattedJSON()), oldUserAuditView);
    });
}
