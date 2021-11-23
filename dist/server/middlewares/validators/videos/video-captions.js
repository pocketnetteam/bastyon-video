"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideoCaptionValidator = exports.listVideoCaptionsValidator = exports.addVideoCaptionValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const video_captions_1 = require("../../../helpers/custom-validators/video-captions");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const constants_1 = require("../../../initializers/constants");
const shared_1 = require("../shared");
const addVideoCaptionValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (0, express_validator_1.param)('captionLanguage')
        .custom(video_captions_1.isVideoCaptionLanguageValid).not().isEmpty().withMessage('Should have a valid caption language'),
    (0, express_validator_1.body)('captionfile')
        .custom((_, { req }) => (0, video_captions_1.isVideoCaptionFile)(req.files, 'captionfile'))
        .withMessage('This caption file is not supported or too large. ' +
        `Please, make sure it is under ${constants_1.CONSTRAINTS_FIELDS.VIDEO_CAPTIONS.CAPTION_FILE.FILE_SIZE.max} bytes ` +
        'and one of the following mimetypes: ' +
        Object.keys(constants_1.MIMETYPES.VIDEO_CAPTIONS.MIMETYPE_EXT).map(key => `${key} (${constants_1.MIMETYPES.VIDEO_CAPTIONS.MIMETYPE_EXT[key]})`).join(', ')),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking addVideoCaption parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return (0, express_utils_1.cleanUpReqFiles)(req);
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res)))
            return (0, express_utils_1.cleanUpReqFiles)(req);
        const user = res.locals.oauth.token.User;
        if (!(0, shared_1.checkUserCanManageVideo)(user, res.locals.videoAll, 17, res))
            return (0, express_utils_1.cleanUpReqFiles)(req);
        return next();
    })
];
exports.addVideoCaptionValidator = addVideoCaptionValidator;
const deleteVideoCaptionValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (0, express_validator_1.param)('captionLanguage')
        .custom(video_captions_1.isVideoCaptionLanguageValid).not().isEmpty().withMessage('Should have a valid caption language'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking deleteVideoCaption parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res)))
            return;
        if (!(yield (0, shared_1.doesVideoCaptionExist)(res.locals.videoAll, req.params.captionLanguage, res)))
            return;
        const user = res.locals.oauth.token.User;
        if (!(0, shared_1.checkUserCanManageVideo)(user, res.locals.videoAll, 17, res))
            return;
        return next();
    })
];
exports.deleteVideoCaptionValidator = deleteVideoCaptionValidator;
const listVideoCaptionsValidator = [
    (0, shared_1.isValidVideoIdParam)('videoId'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking listVideoCaptions parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesVideoExist)(req.params.videoId, res, 'id')))
            return;
        return next();
    })
];
exports.listVideoCaptionsValidator = listVideoCaptionsValidator;
