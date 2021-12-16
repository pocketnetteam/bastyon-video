"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosShareValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const logger_1 = require("../../../helpers/logger");
const video_share_1 = require("../../../models/video/video-share");
const shared_1 = require("../shared");
const videosShareValidator = [
    shared_1.isValidVideoIdParam('id'),
    express_validator_1.param('actorId')
        .custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid actor id'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoShare parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.id, res)))
            return;
        const video = res.locals.videoAll;
        const share = yield video_share_1.VideoShareModel.load(req.params.actorId, video.id);
        if (!share) {
            return res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404)
                .end();
        }
        res.locals.videoShare = share;
        return next();
    })
];
exports.videosShareValidator = videosShareValidator;
