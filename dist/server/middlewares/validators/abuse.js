"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbuseValidator = exports.abuseListForUserValidator = exports.deleteAbuseMessageValidator = exports.abuseUpdateValidator = exports.checkAbuseValidForMessagesValidator = exports.addAbuseMessageValidator = exports.abuseGetValidator = exports.abuseReportValidator = exports.abuseListForAdminsValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const abuses_1 = require("@server/helpers/custom-validators/abuses");
const misc_1 = require("@server/helpers/custom-validators/misc");
const logger_1 = require("@server/helpers/logger");
const abuse_message_1 = require("@server/models/abuse/abuse-message");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const shared_1 = require("./shared");
const abuseReportValidator = [
    (0, express_validator_1.body)('account.id')
        .optional()
        .custom(misc_1.isIdValid)
        .withMessage('Should have a valid accountId'),
    (0, express_validator_1.body)('video.id')
        .optional()
        .customSanitizer(misc_1.toCompleteUUID)
        .custom(misc_1.isIdOrUUIDValid)
        .withMessage('Should have a valid videoId'),
    (0, express_validator_1.body)('video.startAt')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(abuses_1.isAbuseTimestampValid)
        .withMessage('Should have valid starting time value'),
    (0, express_validator_1.body)('video.endAt')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(abuses_1.isAbuseTimestampValid)
        .withMessage('Should have valid ending time value')
        .bail()
        .custom(abuses_1.isAbuseTimestampCoherent)
        .withMessage('Should have a startAt timestamp beginning before endAt'),
    (0, express_validator_1.body)('comment.id')
        .optional()
        .custom(misc_1.isIdValid)
        .withMessage('Should have a valid commentId'),
    (0, express_validator_1.body)('reason')
        .custom(abuses_1.isAbuseReasonValid)
        .withMessage('Should have a valid reason'),
    (0, express_validator_1.body)('predefinedReasons')
        .optional()
        .custom(abuses_1.areAbusePredefinedReasonsValid)
        .withMessage('Should have a valid list of predefined reasons'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        logger_1.logger.debug('Checking abuseReport parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const body = req.body;
        if (((_a = body.video) === null || _a === void 0 ? void 0 : _a.id) && !(yield (0, shared_1.doesVideoExist)(body.video.id, res)))
            return;
        if (((_b = body.account) === null || _b === void 0 ? void 0 : _b.id) && !(yield (0, shared_1.doesAccountIdExist)(body.account.id, res)))
            return;
        if (((_c = body.comment) === null || _c === void 0 ? void 0 : _c.id) && !(yield (0, shared_1.doesCommentIdExist)(body.comment.id, res)))
            return;
        if (!((_d = body.video) === null || _d === void 0 ? void 0 : _d.id) && !((_e = body.account) === null || _e === void 0 ? void 0 : _e.id) && !((_f = body.comment) === null || _f === void 0 ? void 0 : _f.id)) {
            res.fail({ message: 'video id or account id or comment id is required.' });
            return;
        }
        return next();
    })
];
exports.abuseReportValidator = abuseReportValidator;
const abuseGetValidator = [
    (0, express_validator_1.param)('id').custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid id'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking abuseGetValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesAbuseExist)(req.params.id, res)))
            return;
        return next();
    })
];
exports.abuseGetValidator = abuseGetValidator;
const abuseUpdateValidator = [
    (0, express_validator_1.param)('id').custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid id'),
    (0, express_validator_1.body)('state')
        .optional()
        .custom(abuses_1.isAbuseStateValid).withMessage('Should have a valid abuse state'),
    (0, express_validator_1.body)('moderationComment')
        .optional()
        .custom(abuses_1.isAbuseModerationCommentValid).withMessage('Should have a valid moderation comment'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking abuseUpdateValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesAbuseExist)(req.params.id, res)))
            return;
        return next();
    })
];
exports.abuseUpdateValidator = abuseUpdateValidator;
const abuseListForAdminsValidator = [
    (0, express_validator_1.query)('id')
        .optional()
        .custom(misc_1.isIdValid).withMessage('Should have a valid id'),
    (0, express_validator_1.query)('filter')
        .optional()
        .custom(abuses_1.isAbuseFilterValid)
        .withMessage('Should have a valid filter'),
    (0, express_validator_1.query)('predefinedReason')
        .optional()
        .custom(abuses_1.isAbusePredefinedReasonValid)
        .withMessage('Should have a valid predefinedReason'),
    (0, express_validator_1.query)('search')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid search'),
    (0, express_validator_1.query)('state')
        .optional()
        .custom(abuses_1.isAbuseStateValid).withMessage('Should have a valid abuse state'),
    (0, express_validator_1.query)('videoIs')
        .optional()
        .custom(abuses_1.isAbuseVideoIsValid).withMessage('Should have a valid "video is" attribute'),
    (0, express_validator_1.query)('searchReporter')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid reporter search'),
    (0, express_validator_1.query)('searchReportee')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid reportee search'),
    (0, express_validator_1.query)('searchVideo')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid video search'),
    (0, express_validator_1.query)('searchVideoChannel')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid video channel search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking abuseListForAdminsValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.abuseListForAdminsValidator = abuseListForAdminsValidator;
const abuseListForUserValidator = [
    (0, express_validator_1.query)('id')
        .optional()
        .custom(misc_1.isIdValid).withMessage('Should have a valid id'),
    (0, express_validator_1.query)('search')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid search'),
    (0, express_validator_1.query)('state')
        .optional()
        .custom(abuses_1.isAbuseStateValid).withMessage('Should have a valid abuse state'),
    (req, res, next) => {
        logger_1.logger.debug('Checking abuseListForUserValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.abuseListForUserValidator = abuseListForUserValidator;
const getAbuseValidator = [
    (0, express_validator_1.param)('id').custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid id'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking getAbuseValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesAbuseExist)(req.params.id, res)))
            return;
        const user = res.locals.oauth.token.user;
        const abuse = res.locals.abuse;
        if (user.hasRight(6) !== true && abuse.reporterAccountId !== user.Account.id) {
            const message = `User ${user.username} does not have right to get abuse ${abuse.id}`;
            logger_1.logger.warn(message);
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message
            });
        }
        return next();
    })
];
exports.getAbuseValidator = getAbuseValidator;
const checkAbuseValidForMessagesValidator = [
    (req, res, next) => {
        logger_1.logger.debug('Checking checkAbuseValidForMessagesValidator parameters', { parameters: req.body });
        const abuse = res.locals.abuse;
        if (abuse.ReporterAccount.isOwned() === false) {
            return res.fail({ message: 'This abuse was created by a user of your instance.' });
        }
        return next();
    }
];
exports.checkAbuseValidForMessagesValidator = checkAbuseValidForMessagesValidator;
const addAbuseMessageValidator = [
    (0, express_validator_1.body)('message').custom(abuses_1.isAbuseMessageValid).not().isEmpty().withMessage('Should have a valid abuse message'),
    (req, res, next) => {
        logger_1.logger.debug('Checking addAbuseMessageValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.addAbuseMessageValidator = addAbuseMessageValidator;
const deleteAbuseMessageValidator = [
    (0, express_validator_1.param)('messageId').custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid message id'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking deleteAbuseMessageValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const user = res.locals.oauth.token.user;
        const abuse = res.locals.abuse;
        const messageId = parseInt(req.params.messageId + '', 10);
        const abuseMessage = yield abuse_message_1.AbuseMessageModel.loadByIdAndAbuseId(messageId, abuse.id);
        if (!abuseMessage) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Abuse message not found'
            });
        }
        if (user.hasRight(6) !== true && abuseMessage.accountId !== user.Account.id) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Cannot delete this abuse message'
            });
        }
        res.locals.abuseMessage = abuseMessage;
        return next();
    })
];
exports.deleteAbuseMessageValidator = deleteAbuseMessageValidator;
