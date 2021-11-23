"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoLiveGetValidator = exports.videoLiveUpdateValidator = exports.videoLiveAddValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const constants_1 = require("@server/initializers/constants");
const moderation_1 = require("@server/lib/moderation");
const hooks_1 = require("@server/lib/plugins/hooks");
const video_1 = require("@server/models/video/video");
const video_live_1 = require("@server/models/video/video-live");
const models_1 = require("@shared/models");
const misc_1 = require("../../../helpers/custom-validators/misc");
const videos_1 = require("../../../helpers/custom-validators/videos");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const config_1 = require("../../../initializers/config");
const shared_1 = require("../shared");
const videos_2 = require("./videos");
const videoLiveGetValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoLiveGetValidator parameters', { parameters: req.params, user: res.locals.oauth.token.User.username });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res, 'all')))
            return;
        const user = res.locals.oauth.token.User;
        if (!(0, shared_1.checkUserCanManageVideo)(user, res.locals.videoAll, 19, res, false))
            return;
        const videoLive = yield video_live_1.VideoLiveModel.loadByVideoId(res.locals.videoAll.id);
        if (!videoLive) {
            return res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Live video not found'
            });
        }
        res.locals.videoLive = videoLive;
        return next();
    })
];
exports.videoLiveGetValidator = videoLiveGetValidator;
const videoLiveAddValidator = (0, videos_2.getCommonVideoEditAttributes)().concat([
    (0, express_validator_1.body)('channelId')
        .customSanitizer(misc_1.toIntOrNull)
        .custom(misc_1.isIdValid).withMessage('Should have correct video channel id'),
    (0, express_validator_1.body)('name')
        .custom(videos_1.isVideoNameValid).withMessage(`Should have a video name between ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.min} and ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.max} characters long`),
    (0, express_validator_1.body)('saveReplay')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid saveReplay attribute'),
    (0, express_validator_1.body)('permanentLive')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid permanentLive attribute'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoLiveAddValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return (0, express_utils_1.cleanUpReqFiles)(req);
        if (config_1.CONFIG.LIVE.ENABLED !== true) {
            (0, express_utils_1.cleanUpReqFiles)(req);
            return res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Live is not enabled on this instance',
                type: "live_not_enabled"
            });
        }
        if (config_1.CONFIG.LIVE.ALLOW_REPLAY !== true && req.body.saveReplay === true) {
            (0, express_utils_1.cleanUpReqFiles)(req);
            return res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Saving live replay is not enabled on this instance',
                type: "live_not_allowing_replay"
            });
        }
        if (req.body.permanentLive && req.body.saveReplay) {
            (0, express_utils_1.cleanUpReqFiles)(req);
            return res.fail({ message: 'Cannot set this live as permanent while saving its replay' });
        }
        const user = res.locals.oauth.token.User;
        if (!(yield (0, shared_1.doesVideoChannelOfAccountExist)(req.body.channelId, user, res)))
            return (0, express_utils_1.cleanUpReqFiles)(req);
        if (config_1.CONFIG.LIVE.MAX_INSTANCE_LIVES !== -1) {
            const totalInstanceLives = yield video_1.VideoModel.countLocalLives();
            if (totalInstanceLives >= config_1.CONFIG.LIVE.MAX_INSTANCE_LIVES) {
                (0, express_utils_1.cleanUpReqFiles)(req);
                return res.fail({
                    status: models_1.HttpStatusCode.FORBIDDEN_403,
                    message: 'Cannot create this live because the max instance lives limit is reached.',
                    type: "max_instance_lives_limit_reached"
                });
            }
        }
        if (config_1.CONFIG.LIVE.MAX_USER_LIVES !== -1) {
            const totalUserLives = yield video_1.VideoModel.countLivesOfAccount(user.Account.id);
            if (totalUserLives >= config_1.CONFIG.LIVE.MAX_USER_LIVES) {
                (0, express_utils_1.cleanUpReqFiles)(req);
                return res.fail({
                    status: models_1.HttpStatusCode.FORBIDDEN_403,
                    message: 'Cannot create this live because the max user lives limit is reached.',
                    type: "max_user_lives_limit_reached"
                });
            }
        }
        if (!(yield isLiveVideoAccepted(req, res)))
            return (0, express_utils_1.cleanUpReqFiles)(req);
        return next();
    })
]);
exports.videoLiveAddValidator = videoLiveAddValidator;
const videoLiveUpdateValidator = [
    (0, express_validator_1.body)('saveReplay')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid saveReplay attribute'),
    (req, res, next) => {
        logger_1.logger.debug('Checking videoLiveUpdateValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (req.body.permanentLive && req.body.saveReplay) {
            return res.fail({ message: 'Cannot set this live as permanent while saving its replay' });
        }
        if (config_1.CONFIG.LIVE.ALLOW_REPLAY !== true && req.body.saveReplay === true) {
            return res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Saving live replay is not allowed instance'
            });
        }
        if (res.locals.videoAll.state !== 4) {
            return res.fail({ message: 'Cannot update a live that has already started' });
        }
        const user = res.locals.oauth.token.User;
        if (!(0, shared_1.checkUserCanManageVideo)(user, res.locals.videoAll, 19, res))
            return;
        return next();
    }
];
exports.videoLiveUpdateValidator = videoLiveUpdateValidator;
function isLiveVideoAccepted(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const acceptParameters = {
            liveVideoBody: req.body,
            user: res.locals.oauth.token.User
        };
        const acceptedResult = yield hooks_1.Hooks.wrapFun(moderation_1.isLocalLiveVideoAccepted, acceptParameters, 'filter:api.live-video.create.accept.result');
        if (!acceptedResult || acceptedResult.accepted !== true) {
            logger_1.logger.info('Refused local live video.', { acceptedResult, acceptParameters });
            res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: acceptedResult.errorMessage || 'Refused local live video'
            });
            return false;
        }
        return true;
    });
}
