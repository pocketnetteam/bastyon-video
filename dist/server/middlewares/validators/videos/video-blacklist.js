"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosBlacklistFiltersValidator = exports.videosBlacklistUpdateValidator = exports.videosBlacklistRemoveValidator = exports.videosBlacklistAddValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const video_blacklist_1 = require("../../../helpers/custom-validators/video-blacklist");
const logger_1 = require("../../../helpers/logger");
const shared_1 = require("../shared");
const videosBlacklistRemoveValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking blacklistRemove parameters.', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res)))
            return;
        if (!(yield (0, shared_1.doesVideoBlacklistExist)(res.locals.videoAll.id, res)))
            return;
        return next();
    })
];
exports.videosBlacklistRemoveValidator = videosBlacklistRemoveValidator;
const videosBlacklistAddValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (0, express_validator_1.body)('unfederate')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid unfederate boolean'),
    (0, express_validator_1.body)('reason')
        .optional()
        .custom(video_blacklist_1.isVideoBlacklistReasonValid).withMessage('Should have a valid reason'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videosBlacklistAdd parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res)))
            return;
        const video = res.locals.videoAll;
        if (req.body.unfederate === true && video.remote === true) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'You cannot unfederate a remote video.'
            });
        }
        return next();
    })
];
exports.videosBlacklistAddValidator = videosBlacklistAddValidator;
const videosBlacklistUpdateValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (0, express_validator_1.body)('reason')
        .optional()
        .custom(video_blacklist_1.isVideoBlacklistReasonValid).withMessage('Should have a valid reason'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videosBlacklistUpdate parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res)))
            return;
        if (!(yield (0, shared_1.doesVideoBlacklistExist)(res.locals.videoAll.id, res)))
            return;
        return next();
    })
];
exports.videosBlacklistUpdateValidator = videosBlacklistUpdateValidator;
const videosBlacklistFiltersValidator = [
    (0, express_validator_1.query)('type')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(video_blacklist_1.isVideoBlacklistTypeValid).withMessage('Should have a valid video blacklist type attribute'),
    (0, express_validator_1.query)('search')
        .optional()
        .not()
        .isEmpty().withMessage('Should have a valid search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking videos blacklist filters query', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.videosBlacklistFiltersValidator = videosBlacklistFiltersValidator;
