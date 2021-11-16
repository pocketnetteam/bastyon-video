"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoChannelStatsValidator = exports.localVideoChannelValidator = exports.videoChannelsListValidator = exports.videoChannelsNameWithHostValidator = exports.videoChannelsRemoveValidator = exports.videoChannelsUpdateValidator = exports.videoChannelsAddValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const constants_1 = require("@server/initializers/constants");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const video_channels_1 = require("../../../helpers/custom-validators/video-channels");
const logger_1 = require("../../../helpers/logger");
const actor_1 = require("../../../models/actor/actor");
const video_channel_1 = require("../../../models/video/video-channel");
const shared_1 = require("../shared");
const videoChannelsAddValidator = [
    express_validator_1.body('name').custom(video_channels_1.isVideoChannelUsernameValid).withMessage('Should have a valid channel name'),
    express_validator_1.body('displayName').custom(video_channels_1.isVideoChannelDisplayNameValid).withMessage('Should have a valid display name'),
    express_validator_1.body('description').optional().custom(video_channels_1.isVideoChannelDescriptionValid).withMessage('Should have a valid description'),
    express_validator_1.body('support').optional().custom(video_channels_1.isVideoChannelSupportValid).withMessage('Should have a valid support text'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoChannelsAdd parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return;
        const actor = yield actor_1.ActorModel.loadLocalByName(req.body.name);
        if (actor) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'Another actor (account/channel) with this name on this instance already exists or has already existed.'
            });
            return false;
        }
        const count = yield video_channel_1.VideoChannelModel.countByAccount(res.locals.oauth.token.User.Account.id);
        if (count >= constants_1.VIDEO_CHANNELS.MAX_PER_USER) {
            res.fail({ message: `You cannot create more than ${constants_1.VIDEO_CHANNELS.MAX_PER_USER} channels` });
            return false;
        }
        return next();
    })
];
exports.videoChannelsAddValidator = videoChannelsAddValidator;
const videoChannelsUpdateValidator = [
    express_validator_1.param('nameWithHost').exists().withMessage('Should have an video channel name with host'),
    express_validator_1.body('displayName')
        .optional()
        .custom(video_channels_1.isVideoChannelDisplayNameValid).withMessage('Should have a valid display name'),
    express_validator_1.body('description')
        .optional()
        .custom(video_channels_1.isVideoChannelDescriptionValid).withMessage('Should have a valid description'),
    express_validator_1.body('support')
        .optional()
        .custom(video_channels_1.isVideoChannelSupportValid).withMessage('Should have a valid support text'),
    express_validator_1.body('bulkVideosSupportUpdate')
        .optional()
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid bulkVideosSupportUpdate boolean field'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoChannelsUpdate parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoChannelNameWithHostExist(req.params.nameWithHost, res)))
            return;
        if (res.locals.videoChannel.Actor.isOwned() === false) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Cannot update video channel of another server'
            });
        }
        if (res.locals.videoChannel.Account.userId !== res.locals.oauth.token.User.id) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Cannot update video channel of another user'
            });
        }
        return next();
    })
];
exports.videoChannelsUpdateValidator = videoChannelsUpdateValidator;
const videoChannelsRemoveValidator = [
    express_validator_1.param('nameWithHost').exists().withMessage('Should have an video channel name with host'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoChannelsRemove parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoChannelNameWithHostExist(req.params.nameWithHost, res)))
            return;
        if (!checkUserCanDeleteVideoChannel(res.locals.oauth.token.User, res.locals.videoChannel, res))
            return;
        if (!(yield checkVideoChannelIsNotTheLastOne(res)))
            return;
        return next();
    })
];
exports.videoChannelsRemoveValidator = videoChannelsRemoveValidator;
const videoChannelsNameWithHostValidator = [
    express_validator_1.param('nameWithHost').exists().withMessage('Should have an video channel name with host'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoChannelsNameWithHostValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoChannelNameWithHostExist(req.params.nameWithHost, res)))
            return;
        return next();
    })
];
exports.videoChannelsNameWithHostValidator = videoChannelsNameWithHostValidator;
const localVideoChannelValidator = [
    express_validator_1.param('name').custom(video_channels_1.isVideoChannelDisplayNameValid).withMessage('Should have a valid video channel name'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking localVideoChannelValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesLocalVideoChannelNameExist(req.params.name, res)))
            return;
        return next();
    })
];
exports.localVideoChannelValidator = localVideoChannelValidator;
const videoChannelStatsValidator = [
    express_validator_1.query('withStats')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid stats flag'),
    (req, res, next) => {
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.videoChannelStatsValidator = videoChannelStatsValidator;
const videoChannelsListValidator = [
    express_validator_1.query('search').optional().not().isEmpty().withMessage('Should have a valid search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking video channels search query', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.videoChannelsListValidator = videoChannelsListValidator;
function checkUserCanDeleteVideoChannel(user, videoChannel, res) {
    if (videoChannel.Actor.isOwned() === false) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot remove video channel of another server.'
        });
        return false;
    }
    if (user.hasRight(14) === false && videoChannel.Account.userId !== user.id) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot remove video channel of another user'
        });
        return false;
    }
    return true;
}
function checkVideoChannelIsNotTheLastOne(res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const count = yield video_channel_1.VideoChannelModel.countByAccount(res.locals.oauth.token.User.Account.id);
        if (count <= 1) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'Cannot remove the last channel of this user'
            });
            return false;
        }
        return true;
    });
}
