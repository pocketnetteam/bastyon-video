"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCanManageUser = exports.ensureAuthUserOwnsAccountValidator = exports.userAutocompleteValidator = exports.usersVerifyEmailValidator = exports.usersAskSendVerifyEmailValidator = exports.usersResetPasswordValidator = exports.usersAskResetPasswordValidator = exports.usersGetValidator = exports.ensureUserRegistrationAllowedForIP = exports.ensureUserRegistrationAllowed = exports.usersVideoRatingValidator = exports.usersUpdateMeValidator = exports.usersUpdateValidator = exports.usersRemoveValidator = exports.usersBlockingValidator = exports.usersRegisterValidator = exports.deleteMeValidator = exports.usersAddValidator = exports.usersListValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const lodash_1 = require("lodash");
const hooks_1 = require("@server/lib/plugins/hooks");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const users_1 = require("../../../shared/models/users");
const misc_1 = require("../../helpers/custom-validators/misc");
const plugins_1 = require("../../helpers/custom-validators/plugins");
const users_2 = require("../../helpers/custom-validators/users");
const video_channels_1 = require("../../helpers/custom-validators/video-channels");
const logger_1 = require("../../helpers/logger");
const theme_utils_1 = require("../../lib/plugins/theme-utils");
const redis_1 = require("../../lib/redis");
const signup_1 = require("../../lib/signup");
const actor_1 = require("../../models/actor/actor");
const user_1 = require("../../models/user/user");
const shared_1 = require("./shared");
const usersListValidator = [
    (0, express_validator_1.query)('blocked')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .isBoolean().withMessage('Should be a valid boolean banned state'),
    (req, res, next) => {
        logger_1.logger.debug('Checking usersList parameters', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.usersListValidator = usersListValidator;
const usersAddValidator = [
    (0, express_validator_1.body)('username').custom(users_2.isUserUsernameValid).withMessage('Should have a valid username (lowercase alphanumeric characters)'),
    (0, express_validator_1.body)('password').custom(users_2.isUserPasswordValidOrEmpty).withMessage('Should have a valid password'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Should have a valid email'),
    (0, express_validator_1.body)('channelName').optional().custom(video_channels_1.isVideoChannelUsernameValid).withMessage('Should have a valid channel name'),
    (0, express_validator_1.body)('videoQuota').custom(users_2.isUserVideoQuotaValid).withMessage('Should have a valid user quota'),
    (0, express_validator_1.body)('videoQuotaDaily').custom(users_2.isUserVideoQuotaDailyValid).withMessage('Should have a valid daily user quota'),
    (0, express_validator_1.body)('role')
        .customSanitizer(misc_1.toIntOrNull)
        .custom(users_2.isUserRoleValid).withMessage('Should have a valid role'),
    (0, express_validator_1.body)('adminFlags').optional().custom(users_2.isUserAdminFlagsValid).withMessage('Should have a valid admin flags'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersAdd parameters', { parameters: (0, lodash_1.omit)(req.body, 'password') });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserNameOrEmailDoesNotAlreadyExist(req.body.username, req.body.email, res)))
            return;
        const authUser = res.locals.oauth.token.User;
        if (authUser.role !== users_1.UserRole.ADMINISTRATOR && req.body.role !== users_1.UserRole.USER) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'You can only create users (and not administrators or moderators)'
            });
        }
        if (req.body.channelName) {
            if (req.body.channelName === req.body.username) {
                return res.fail({ message: 'Channel name cannot be the same as user username.' });
            }
            const existing = yield actor_1.ActorModel.loadLocalByName(req.body.channelName);
            if (existing) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                    message: `Channel with name ${req.body.channelName} already exists.`
                });
            }
        }
        return next();
    })
];
exports.usersAddValidator = usersAddValidator;
const usersRegisterValidator = [
    (0, express_validator_1.body)('username').custom(users_2.isUserUsernameValid).withMessage('Should have a valid username'),
    (0, express_validator_1.body)('password').custom(users_2.isUserPasswordValid).withMessage('Should have a valid password'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Should have a valid email'),
    (0, express_validator_1.body)('displayName')
        .optional()
        .custom(users_2.isUserDisplayNameValid).withMessage('Should have a valid display name'),
    (0, express_validator_1.body)('channel.name')
        .optional()
        .custom(video_channels_1.isVideoChannelUsernameValid).withMessage('Should have a valid channel name'),
    (0, express_validator_1.body)('channel.displayName')
        .optional()
        .custom(video_channels_1.isVideoChannelDisplayNameValid).withMessage('Should have a valid display name'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersRegister parameters', { parameters: (0, lodash_1.omit)(req.body, 'password') });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserNameOrEmailDoesNotAlreadyExist(req.body.username, req.body.email, res)))
            return;
        const body = req.body;
        if (body.channel) {
            if (!body.channel.name || !body.channel.displayName) {
                return res.fail({ message: 'Channel is optional but if you specify it, channel.name and channel.displayName are required.' });
            }
            if (body.channel.name === body.username) {
                return res.fail({ message: 'Channel name cannot be the same as user username.' });
            }
            const existing = yield actor_1.ActorModel.loadLocalByName(body.channel.name);
            if (existing) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                    message: `Channel with name ${body.channel.name} already exists.`
                });
            }
        }
        return next();
    })
];
exports.usersRegisterValidator = usersRegisterValidator;
const usersRemoveValidator = [
    (0, express_validator_1.param)('id').isInt().not().isEmpty().withMessage('Should have a valid id'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersRemove parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserIdExist(req.params.id, res)))
            return;
        const user = res.locals.user;
        if (user.username === 'root') {
            return res.fail({ message: 'Cannot remove the root user' });
        }
        return next();
    })
];
exports.usersRemoveValidator = usersRemoveValidator;
const usersBlockingValidator = [
    (0, express_validator_1.param)('id').isInt().not().isEmpty().withMessage('Should have a valid id'),
    (0, express_validator_1.body)('reason').optional().custom(users_2.isUserBlockedReasonValid).withMessage('Should have a valid blocking reason'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersBlocking parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserIdExist(req.params.id, res)))
            return;
        const user = res.locals.user;
        if (user.username === 'root') {
            return res.fail({ message: 'Cannot block the root user' });
        }
        return next();
    })
];
exports.usersBlockingValidator = usersBlockingValidator;
const deleteMeValidator = [
    (req, res, next) => {
        const user = res.locals.oauth.token.User;
        if (user.username === 'root') {
            return res.fail({ message: 'You cannot delete your root account.' });
        }
        return next();
    }
];
exports.deleteMeValidator = deleteMeValidator;
const usersUpdateValidator = [
    (0, express_validator_1.param)('id').isInt().not().isEmpty().withMessage('Should have a valid id'),
    (0, express_validator_1.body)('password').optional().custom(users_2.isUserPasswordValid).withMessage('Should have a valid password'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Should have a valid email attribute'),
    (0, express_validator_1.body)('emailVerified').optional().isBoolean().withMessage('Should have a valid email verified attribute'),
    (0, express_validator_1.body)('videoQuota').optional().custom(users_2.isUserVideoQuotaValid).withMessage('Should have a valid user quota'),
    (0, express_validator_1.body)('videoQuotaDaily').optional().custom(users_2.isUserVideoQuotaDailyValid).withMessage('Should have a valid daily user quota'),
    (0, express_validator_1.body)('pluginAuth').optional(),
    (0, express_validator_1.body)('role')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(users_2.isUserRoleValid).withMessage('Should have a valid role'),
    (0, express_validator_1.body)('adminFlags').optional().custom(users_2.isUserAdminFlagsValid).withMessage('Should have a valid admin flags'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersUpdate parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserIdExist(req.params.id, res)))
            return;
        const user = res.locals.user;
        if (user.username === 'root' && req.body.role !== undefined && user.role !== req.body.role) {
            return res.fail({ message: 'Cannot change root role.' });
        }
        return next();
    })
];
exports.usersUpdateValidator = usersUpdateValidator;
const usersUpdateMeValidator = [
    (0, express_validator_1.body)('displayName')
        .optional()
        .custom(users_2.isUserDisplayNameValid).withMessage('Should have a valid display name'),
    (0, express_validator_1.body)('description')
        .optional()
        .custom(users_2.isUserDescriptionValid).withMessage('Should have a valid description'),
    (0, express_validator_1.body)('currentPassword')
        .optional()
        .custom(users_2.isUserPasswordValid).withMessage('Should have a valid current password'),
    (0, express_validator_1.body)('password')
        .optional()
        .custom(users_2.isUserPasswordValid).withMessage('Should have a valid password'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail().withMessage('Should have a valid email attribute'),
    (0, express_validator_1.body)('nsfwPolicy')
        .optional()
        .custom(users_2.isUserNSFWPolicyValid).withMessage('Should have a valid display Not Safe For Work policy'),
    (0, express_validator_1.body)('autoPlayVideo')
        .optional()
        .custom(users_2.isUserAutoPlayVideoValid).withMessage('Should have a valid automatically plays video attribute'),
    (0, express_validator_1.body)('videoLanguages')
        .optional()
        .custom(users_2.isUserVideoLanguages).withMessage('Should have a valid video languages attribute'),
    (0, express_validator_1.body)('videosHistoryEnabled')
        .optional()
        .custom(users_2.isUserVideosHistoryEnabledValid).withMessage('Should have a valid videos history enabled attribute'),
    (0, express_validator_1.body)('theme')
        .optional()
        .custom(v => (0, plugins_1.isThemeNameValid)(v) && (0, theme_utils_1.isThemeRegistered)(v)).withMessage('Should have a valid theme'),
    (0, express_validator_1.body)('noInstanceConfigWarningModal')
        .optional()
        .custom(v => (0, users_2.isUserNoModal)(v)).withMessage('Should have a valid noInstanceConfigWarningModal boolean'),
    (0, express_validator_1.body)('noWelcomeModal')
        .optional()
        .custom(v => (0, users_2.isUserNoModal)(v)).withMessage('Should have a valid noWelcomeModal boolean'),
    (0, express_validator_1.body)('noAccountSetupWarningModal')
        .optional()
        .custom(v => (0, users_2.isUserNoModal)(v)).withMessage('Should have a valid noAccountSetupWarningModal boolean'),
    (0, express_validator_1.body)('autoPlayNextVideo')
        .optional()
        .custom(v => (0, users_2.isUserAutoPlayNextVideoValid)(v)).withMessage('Should have a valid autoPlayNextVideo boolean'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersUpdateMe parameters', { parameters: (0, lodash_1.omit)(req.body, 'password') });
        const user = res.locals.oauth.token.User;
        if (req.body.password || req.body.email) {
            if (user.pluginAuth !== null) {
                return res.fail({ message: 'You cannot update your email or password that is associated with an external auth system.' });
            }
            if (!req.body.currentPassword) {
                return res.fail({ message: 'currentPassword parameter is missing.' });
            }
            if ((yield user.isPasswordMatch(req.body.currentPassword)) !== true) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.UNAUTHORIZED_401,
                    message: 'currentPassword is invalid.'
                });
            }
        }
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    })
];
exports.usersUpdateMeValidator = usersUpdateMeValidator;
const usersGetValidator = [
    (0, express_validator_1.param)('id').isInt().not().isEmpty().withMessage('Should have a valid id'),
    (0, express_validator_1.query)('withStats').optional().isBoolean().withMessage('Should have a valid stats flag'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersGet parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserIdExist(req.params.id, res, req.query.withStats)))
            return;
        return next();
    })
];
exports.usersGetValidator = usersGetValidator;
const usersVideoRatingValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersVideoRating parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res, 'id')))
            return;
        return next();
    })
];
exports.usersVideoRatingValidator = usersVideoRatingValidator;
const ensureUserRegistrationAllowed = [
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const allowedParams = {
            body: req.body,
            ip: req.ip
        };
        const allowedResult = yield hooks_1.Hooks.wrapPromiseFun(signup_1.isSignupAllowed, allowedParams, 'filter:api.user.signup.allowed.result');
        if (allowedResult.allowed === false) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: allowedResult.errorMessage || 'User registration is not enabled or user limit is reached.'
            });
        }
        return next();
    })
];
exports.ensureUserRegistrationAllowed = ensureUserRegistrationAllowed;
const ensureUserRegistrationAllowedForIP = [
    (req, res, next) => {
        const allowed = (0, signup_1.isSignupAllowedForCurrentIP)(req.ip);
        if (allowed === false) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'You are not on a network authorized for registration.'
            });
        }
        return next();
    }
];
exports.ensureUserRegistrationAllowedForIP = ensureUserRegistrationAllowedForIP;
const usersAskResetPasswordValidator = [
    (0, express_validator_1.body)('email').isEmail().not().isEmpty().withMessage('Should have a valid email'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersAskResetPassword parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const exists = yield checkUserEmailExist(req.body.email, res, false);
        if (!exists) {
            logger_1.logger.debug('User with email %s does not exist (asking reset password).', req.body.email);
            return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
        }
        return next();
    })
];
exports.usersAskResetPasswordValidator = usersAskResetPasswordValidator;
const usersResetPasswordValidator = [
    (0, express_validator_1.param)('id').isInt().not().isEmpty().withMessage('Should have a valid id'),
    (0, express_validator_1.body)('verificationString').not().isEmpty().withMessage('Should have a valid verification string'),
    (0, express_validator_1.body)('password').custom(users_2.isUserPasswordValid).withMessage('Should have a valid password'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersResetPassword parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserIdExist(req.params.id, res)))
            return;
        const user = res.locals.user;
        const redisVerificationString = yield redis_1.Redis.Instance.getResetPasswordLink(user.id);
        if (redisVerificationString !== req.body.verificationString) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Invalid verification string.'
            });
        }
        return next();
    })
];
exports.usersResetPasswordValidator = usersResetPasswordValidator;
const usersAskSendVerifyEmailValidator = [
    (0, express_validator_1.body)('email').isEmail().not().isEmpty().withMessage('Should have a valid email'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking askUsersSendVerifyEmail parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const exists = yield checkUserEmailExist(req.body.email, res, false);
        if (!exists) {
            logger_1.logger.debug('User with email %s does not exist (asking verify email).', req.body.email);
            return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
        }
        return next();
    })
];
exports.usersAskSendVerifyEmailValidator = usersAskSendVerifyEmailValidator;
const usersVerifyEmailValidator = [
    (0, express_validator_1.param)('id')
        .isInt().not().isEmpty().withMessage('Should have a valid id'),
    (0, express_validator_1.body)('verificationString')
        .not().isEmpty().withMessage('Should have a valid verification string'),
    (0, express_validator_1.body)('isPendingEmail')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking usersVerifyEmail parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield checkUserIdExist(req.params.id, res)))
            return;
        const user = res.locals.user;
        const redisVerificationString = yield redis_1.Redis.Instance.getVerifyEmailLink(user.id);
        if (redisVerificationString !== req.body.verificationString) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Invalid verification string.'
            });
        }
        return next();
    })
];
exports.usersVerifyEmailValidator = usersVerifyEmailValidator;
const userAutocompleteValidator = [
    (0, express_validator_1.param)('search').isString().not().isEmpty().withMessage('Should have a search parameter')
];
exports.userAutocompleteValidator = userAutocompleteValidator;
const ensureAuthUserOwnsAccountValidator = [
    (req, res, next) => {
        const user = res.locals.oauth.token.User;
        if (res.locals.account.id !== user.Account.id) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Only owner can access ratings list.'
            });
        }
        return next();
    }
];
exports.ensureAuthUserOwnsAccountValidator = ensureAuthUserOwnsAccountValidator;
const ensureCanManageUser = [
    (req, res, next) => {
        const authUser = res.locals.oauth.token.User;
        const onUser = res.locals.user;
        if (authUser.role === users_1.UserRole.ADMINISTRATOR)
            return next();
        if (authUser.role === users_1.UserRole.MODERATOR && onUser.role === users_1.UserRole.USER)
            return next();
        return res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'A moderator can only manager users.'
        });
    }
];
exports.ensureCanManageUser = ensureCanManageUser;
function checkUserIdExist(idArg, res, withStats = false) {
    const id = parseInt(idArg + '', 10);
    return checkUserExist(() => user_1.UserModel.loadByIdWithChannels(id, withStats), res);
}
function checkUserEmailExist(email, res, abortResponse = true) {
    return checkUserExist(() => user_1.UserModel.loadByEmail(email), res, abortResponse);
}
function checkUserNameOrEmailDoesNotAlreadyExist(username, email, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = yield user_1.UserModel.loadByUsernameOrEmail(username, email);
        if (user) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'User with this username or email already exists.'
            });
            return false;
        }
        const actor = yield actor_1.ActorModel.loadLocalByName(username);
        if (actor) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'Another actor (account/channel) with this name on this instance already exists or has already existed.'
            });
            return false;
        }
        return true;
    });
}
function checkUserExist(finder, res, abortResponse = true) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const user = yield finder();
        if (!user) {
            if (abortResponse === true) {
                res.fail({
                    status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'User not found'
                });
            }
            return false;
        }
        res.locals.user = user;
        return true;
    });
}
