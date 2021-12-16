"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoWatchingValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const logger_1 = require("../../../helpers/logger");
const shared_1 = require("../shared");
const videoWatchingValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    express_validator_1.body('currentTime')
        .customSanitizer(misc_1.toIntOrNull)
        .isInt().withMessage('Should have correct current time'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoWatching parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res, 'id')))
            return;
        const user = res.locals.oauth.token.User;
        if (user.videosHistoryEnabled === false) {
            logger_1.logger.warn('Cannot set videos to watch by user %d: videos history is disabled.', user.id);
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'Video history is disabled'
            });
        }
        return next();
    })
];
exports.videoWatchingValidator = videoWatchingValidator;
