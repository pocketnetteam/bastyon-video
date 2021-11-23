"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosAcceptChangeOwnershipValidator = exports.videosTerminateChangeOwnershipValidator = exports.videosChangeOwnershipValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const misc_1 = require("@server/helpers/custom-validators/misc");
const video_ownership_1 = require("@server/helpers/custom-validators/video-ownership");
const logger_1 = require("@server/helpers/logger");
const user_1 = require("@server/lib/user");
const account_1 = require("@server/models/account/account");
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
const videosChangeOwnershipValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking changeOwnership parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res)))
            return;
        if (!(0, shared_1.checkUserCanManageVideo)(res.locals.oauth.token.User, res.locals.videoAll, 22, res))
            return;
        const nextOwner = yield account_1.AccountModel.loadLocalByName(req.body.username);
        if (!nextOwner) {
            res.fail({ message: 'Changing video ownership to a remote account is not supported yet' });
            return;
        }
        res.locals.nextOwner = nextOwner;
        return next();
    })
];
exports.videosChangeOwnershipValidator = videosChangeOwnershipValidator;
const videosTerminateChangeOwnershipValidator = [
    (0, express_validator_1.param)('id')
        .custom(misc_1.isIdValid).withMessage('Should have a valid id'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking changeOwnership parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesChangeVideoOwnershipExist)(req.params.id, res)))
            return;
        if (!(0, video_ownership_1.checkUserCanTerminateOwnershipChange)(res.locals.oauth.token.User, res.locals.videoChangeOwnership, res))
            return;
        const videoChangeOwnership = res.locals.videoChangeOwnership;
        if (videoChangeOwnership.status !== "WAITING") {
            res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Ownership already accepted or refused'
            });
            return;
        }
        return next();
    })
];
exports.videosTerminateChangeOwnershipValidator = videosTerminateChangeOwnershipValidator;
const videosAcceptChangeOwnershipValidator = [
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const body = req.body;
        if (!(yield (0, shared_1.doesVideoChannelOfAccountExist)(body.channelId, res.locals.oauth.token.User, res)))
            return;
        const videoChangeOwnership = res.locals.videoChangeOwnership;
        const video = videoChangeOwnership.Video;
        if (!(yield checkCanAccept(video, res)))
            return;
        return next();
    })
];
exports.videosAcceptChangeOwnershipValidator = videosAcceptChangeOwnershipValidator;
function checkCanAccept(video, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (video.isLive) {
            if (video.state !== 4) {
                res.fail({
                    status: models_1.HttpStatusCode.BAD_REQUEST_400,
                    message: 'You can accept an ownership change of a published live.'
                });
                return false;
            }
            return true;
        }
        const user = res.locals.oauth.token.User;
        if (!(yield (0, user_1.isAbleToUploadVideo)(user.id, video.getMaxQualityFile().size))) {
            res.fail({
                status: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413,
                message: 'The user video quota is exceeded with this video.',
                type: "quota_reached"
            });
            return false;
        }
        return true;
    });
}
