"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVideoAccepted = exports.videosOverviewValidator = exports.commonVideosFiltersValidator = exports.getCommonVideoEditAttributes = exports.videosRemoveValidator = exports.videosCustomGetValidator = exports.checkVideoFollowConstraints = exports.videosDownloadValidator = exports.videoFileMetadataGetValidator = exports.videosGetValidator = exports.videosUpdateValidator = exports.videosAddResumableInitValidator = exports.videosAddResumableValidator = exports.videosAddLegacyValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const upload_1 = require("@server/helpers/upload");
const user_1 = require("@server/lib/user");
const application_1 = require("@server/models/application/application");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const search_1 = require("../../../helpers/custom-validators/search");
const videos_1 = require("../../../helpers/custom-validators/videos");
const express_utils_1 = require("../../../helpers/express-utils");
const ffprobe_utils_1 = require("../../../helpers/ffprobe-utils");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const video_1 = require("../../../helpers/video");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const moderation_1 = require("../../../lib/moderation");
const hooks_1 = require("../../../lib/plugins/hooks");
const video_2 = require("../../../models/video/video");
const auth_1 = require("../../auth");
const shared_1 = require("../shared");
const videosAddLegacyValidator = getCommonVideoEditAttributes().concat([
    express_validator_1.body('videofile')
        .custom((value, { req }) => misc_1.isFileFieldValid(req.files, 'videofile'))
        .withMessage('Should have a file'),
    express_validator_1.body('name')
        .trim()
        .custom(videos_1.isVideoNameValid).withMessage(`Should have a video name between ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.min} and ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.max} characters long`),
    express_validator_1.body('channelId')
        .customSanitizer(misc_1.toIntOrNull)
        .custom(misc_1.isIdValid).withMessage('Should have correct video channel id'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videosAdd parameters', { parameters: req.body, files: req.files });
        if (shared_1.areValidationErrors(req, res))
            return express_utils_1.cleanUpReqFiles(req);
        const videoFile = req.files['videofile'][0];
        const user = res.locals.oauth.token.User;
        if (!(yield commonVideoChecksPass({ req, res, user, videoFileSize: videoFile.size, files: req.files }))) {
            return express_utils_1.cleanUpReqFiles(req);
        }
        try {
            if (!videoFile.duration)
                yield addDurationToVideo(videoFile);
        }
        catch (err) {
            logger_1.logger.error('Invalid input file in videosAddLegacyValidator.', { err });
            res.fail({
                status: http_error_codes_1.HttpStatusCode.UNPROCESSABLE_ENTITY_422,
                message: 'Video file unreadable.'
            });
            return express_utils_1.cleanUpReqFiles(req);
        }
        if (!(yield isVideoAccepted(req, res, videoFile)))
            return express_utils_1.cleanUpReqFiles(req);
        return next();
    })
]);
exports.videosAddLegacyValidator = videosAddLegacyValidator;
const videosAddResumableValidator = [
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const user = res.locals.oauth.token.User;
        const body = req.body;
        const file = Object.assign(Object.assign({}, body), { duration: undefined, path: upload_1.getResumableUploadPath(body.id), filename: body.metadata.filename });
        const cleanup = () => utils_1.deleteFileAndCatch(file.path);
        if (!(yield shared_1.doesVideoChannelOfAccountExist(file.metadata.channelId, user, res)))
            return cleanup();
        try {
            if (!file.duration)
                yield addDurationToVideo(file);
        }
        catch (err) {
            logger_1.logger.error('Invalid input file in videosAddResumableValidator.', { err });
            res.fail({
                status: http_error_codes_1.HttpStatusCode.UNPROCESSABLE_ENTITY_422,
                message: 'Video file unreadable.'
            });
            return cleanup();
        }
        if (!(yield isVideoAccepted(req, res, file)))
            return cleanup();
        res.locals.videoFileResumable = file;
        return next();
    })
];
exports.videosAddResumableValidator = videosAddResumableValidator;
const videosAddResumableInitValidator = getCommonVideoEditAttributes().concat([
    express_validator_1.body('filename')
        .isString()
        .exists()
        .withMessage('Should have a valid filename'),
    express_validator_1.body('name')
        .trim()
        .custom(videos_1.isVideoNameValid).withMessage(`Should have a video name between ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.min} and ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.max} characters long`),
    express_validator_1.body('channelId')
        .customSanitizer(misc_1.toIntOrNull)
        .custom(misc_1.isIdValid).withMessage('Should have correct video channel id'),
    express_validator_1.header('x-upload-content-length')
        .isNumeric()
        .exists()
        .withMessage('Should specify the file length'),
    express_validator_1.header('x-upload-content-type')
        .isString()
        .exists()
        .withMessage('Should specify the file mimetype'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const videoFileMetadata = {
            mimetype: req.headers['x-upload-content-type'],
            size: +req.headers['x-upload-content-length'],
            originalname: req.body.name
        };
        const user = res.locals.oauth.token.User;
        const cleanup = () => express_utils_1.cleanUpReqFiles(req);
        logger_1.logger.debug('Checking videosAddResumableInitValidator parameters and headers', {
            parameters: req.body,
            headers: req.headers,
            files: req.files
        });
        if (shared_1.areValidationErrors(req, res))
            return cleanup();
        const files = { videofile: [videoFileMetadata] };
        if (!(yield commonVideoChecksPass({ req, res, user, videoFileSize: videoFileMetadata.size, files })))
            return cleanup();
        req.headers['content-type'] = 'application/json; charset=utf-8';
        if ((_a = req.files) === null || _a === void 0 ? void 0 : _a['previewfile'])
            req.body.previewfile = req.files['previewfile'];
        return next();
    })
]);
exports.videosAddResumableInitValidator = videosAddResumableInitValidator;
const videosUpdateValidator = getCommonVideoEditAttributes().concat([
    shared_1.isValidVideoIdParam('id'),
    express_validator_1.body('name')
        .optional()
        .trim()
        .custom(videos_1.isVideoNameValid).withMessage(`Should have a video name between ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.min} and ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.max} characters long`),
    express_validator_1.body('channelId')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(misc_1.isIdValid).withMessage('Should have correct video channel id'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videosUpdate parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return express_utils_1.cleanUpReqFiles(req);
        if (areErrorsInScheduleUpdate(req, res))
            return express_utils_1.cleanUpReqFiles(req);
        if (!(yield shared_1.doesVideoExist(req.params.id, res)))
            return express_utils_1.cleanUpReqFiles(req);
        const user = res.locals.oauth.token.User;
        if (!shared_1.checkUserCanManageVideo(user, res.locals.videoAll, 17, res))
            return express_utils_1.cleanUpReqFiles(req);
        if (req.body.channelId && !(yield shared_1.doesVideoChannelOfAccountExist(req.body.channelId, user, res)))
            return express_utils_1.cleanUpReqFiles(req);
        return next();
    })
]);
exports.videosUpdateValidator = videosUpdateValidator;
function checkVideoFollowConstraints(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const video = video_1.getVideoWithAttributes(res);
        if (video.isOwned() === true)
            return next();
        if (res.locals.oauth) {
            if (config_1.CONFIG.SEARCH.REMOTE_URI.USERS === true)
                return next();
        }
        if (config_1.CONFIG.SEARCH.REMOTE_URI.ANONYMOUS === true)
            return next();
        const serverActor = yield application_1.getServerActor();
        if ((yield video_2.VideoModel.checkVideoHasInstanceFollow(video.id, serverActor.id)) === true)
            return next();
        return res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot get this video regarding follow constraints',
            type: "does_not_respect_follow_constraints",
            data: {
                originUrl: video.url
            }
        });
    });
}
exports.checkVideoFollowConstraints = checkVideoFollowConstraints;
const videosCustomGetValidator = (fetchType, authenticateInQuery = false) => {
    return [
        shared_1.isValidVideoIdParam('id'),
        (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            logger_1.logger.debug('Checking videosGet parameters', { parameters: req.params });
            if (shared_1.areValidationErrors(req, res))
                return;
            if (!(yield shared_1.doesVideoExist(req.params.id, res, fetchType)))
                return;
            if (fetchType === 'only-immutable-attributes')
                return next();
            const video = video_1.getVideoWithAttributes(res);
            if (video.requiresAuth()) {
                yield auth_1.authenticatePromiseIfNeeded(req, res, authenticateInQuery);
                const user = res.locals.oauth ? res.locals.oauth.token.User : null;
                if (!user || !user.canGetVideo(video)) {
                    return res.fail({
                        status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                        message: 'Cannot get this private/internal or blocklisted video'
                    });
                }
                return next();
            }
            if (video.privacy === 1)
                return next();
            if (video.privacy === 2) {
                if (misc_1.isUUIDValid(req.params.id))
                    return next();
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'Video not found'
                });
            }
        })
    ];
};
exports.videosCustomGetValidator = videosCustomGetValidator;
const videosGetValidator = videosCustomGetValidator('all');
exports.videosGetValidator = videosGetValidator;
const videosDownloadValidator = videosCustomGetValidator('all', true);
exports.videosDownloadValidator = videosDownloadValidator;
const videoFileMetadataGetValidator = getCommonVideoEditAttributes().concat([
    shared_1.isValidVideoIdParam('id'),
    express_validator_1.param('videoFileId')
        .custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid videoFileId'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoFileMetadataGet parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoFileOfVideoExist(+req.params.videoFileId, req.params.id, res)))
            return;
        return next();
    })
]);
exports.videoFileMetadataGetValidator = videoFileMetadataGetValidator;
const videosRemoveValidator = [
    shared_1.isValidVideoIdParam('id'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videosRemove parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.id, res)))
            return;
        if (!shared_1.checkUserCanManageVideo(res.locals.oauth.token.User, res.locals.videoAll, 13, res))
            return;
        return next();
    })
];
exports.videosRemoveValidator = videosRemoveValidator;
const videosOverviewValidator = [
    express_validator_1.query('page')
        .optional()
        .isInt({ min: 1, max: constants_1.OVERVIEWS.VIDEOS.SAMPLES_COUNT })
        .withMessage('Should have a valid pagination'),
    (req, res, next) => {
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.videosOverviewValidator = videosOverviewValidator;
function getCommonVideoEditAttributes() {
    return [
        express_validator_1.body('thumbnailfile')
            .custom((value, { req }) => videos_1.isVideoImage(req.files, 'thumbnailfile')).withMessage('This thumbnail file is not supported or too large. Please, make sure it is of the following type: ' +
            constants_1.CONSTRAINTS_FIELDS.VIDEOS.IMAGE.EXTNAME.join(', ')),
        express_validator_1.body('previewfile')
            .custom((value, { req }) => videos_1.isVideoImage(req.files, 'previewfile')).withMessage('This preview file is not supported or too large. Please, make sure it is of the following type: ' +
            constants_1.CONSTRAINTS_FIELDS.VIDEOS.IMAGE.EXTNAME.join(', ')),
        express_validator_1.body('category')
            .optional()
            .customSanitizer(misc_1.toIntOrNull)
            .custom(videos_1.isVideoCategoryValid).withMessage('Should have a valid category'),
        express_validator_1.body('licence')
            .optional()
            .customSanitizer(misc_1.toIntOrNull)
            .custom(videos_1.isVideoLicenceValid).withMessage('Should have a valid licence'),
        express_validator_1.body('language')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(videos_1.isVideoLanguageValid).withMessage('Should have a valid language'),
        express_validator_1.body('nsfw')
            .optional()
            .customSanitizer(misc_1.toBooleanOrNull)
            .custom(misc_1.isBooleanValid).withMessage('Should have a valid NSFW attribute'),
        express_validator_1.body('waitTranscoding')
            .optional()
            .customSanitizer(misc_1.toBooleanOrNull)
            .custom(misc_1.isBooleanValid).withMessage('Should have a valid wait transcoding attribute'),
        express_validator_1.body('privacy')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(videos_1.isVideoPrivacyValid).withMessage('Should have correct video privacy'),
        express_validator_1.body('description')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(videos_1.isVideoDescriptionValid).withMessage('Should have a valid description'),
        express_validator_1.body('support')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(videos_1.isVideoSupportValid).withMessage('Should have a valid support text'),
        express_validator_1.body('tags')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(videos_1.isVideoTagsValid)
            .withMessage(`Should have an array of up to ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.TAGS.max} tags between ` +
            `${constants_1.CONSTRAINTS_FIELDS.VIDEOS.TAG.min} and ${constants_1.CONSTRAINTS_FIELDS.VIDEOS.TAG.max} characters each`),
        express_validator_1.body('commentsEnabled')
            .optional()
            .customSanitizer(misc_1.toBooleanOrNull)
            .custom(misc_1.isBooleanValid).withMessage('Should have comments enabled boolean'),
        express_validator_1.body('downloadEnabled')
            .optional()
            .customSanitizer(misc_1.toBooleanOrNull)
            .custom(misc_1.isBooleanValid).withMessage('Should have downloading enabled boolean'),
        express_validator_1.body('originallyPublishedAt')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(videos_1.isVideoOriginallyPublishedAtValid).withMessage('Should have a valid original publication date'),
        express_validator_1.body('scheduleUpdate')
            .optional()
            .customSanitizer(misc_1.toValueOrNull),
        express_validator_1.body('scheduleUpdate.updateAt')
            .optional()
            .custom(misc_1.isDateValid).withMessage('Should have a schedule update date that conforms to ISO 8601'),
        express_validator_1.body('scheduleUpdate.privacy')
            .optional()
            .customSanitizer(misc_1.toIntOrNull)
            .custom(videos_1.isScheduleVideoUpdatePrivacyValid).withMessage('Should have correct schedule update privacy')
    ];
}
exports.getCommonVideoEditAttributes = getCommonVideoEditAttributes;
const commonVideosFiltersValidator = [
    express_validator_1.query('categoryOneOf')
        .optional()
        .customSanitizer(misc_1.toArray)
        .custom(search_1.isNumberArray).withMessage('Should have a valid one of category array'),
    express_validator_1.query('licenceOneOf')
        .optional()
        .customSanitizer(misc_1.toArray)
        .custom(search_1.isNumberArray).withMessage('Should have a valid one of licence array'),
    express_validator_1.query('languageOneOf')
        .optional()
        .customSanitizer(misc_1.toArray)
        .custom(search_1.isStringArray).withMessage('Should have a valid one of language array'),
    express_validator_1.query('tagsOneOf')
        .optional()
        .customSanitizer(misc_1.toArray)
        .custom(search_1.isStringArray).withMessage('Should have a valid one of tags array'),
    express_validator_1.query('tagsAllOf')
        .optional()
        .customSanitizer(misc_1.toArray)
        .custom(search_1.isStringArray).withMessage('Should have a valid all of tags array'),
    express_validator_1.query('nsfw')
        .optional()
        .custom(search_1.isBooleanBothQueryValid).withMessage('Should have a valid NSFW attribute'),
    express_validator_1.query('isLive')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid live boolean'),
    express_validator_1.query('filter')
        .optional()
        .custom(videos_1.isVideoFilterValid).withMessage('Should have a valid filter attribute'),
    express_validator_1.query('skipCount')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid skip count boolean'),
    express_validator_1.query('search')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking commons video filters query', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        const user = res.locals.oauth ? res.locals.oauth.token.User : undefined;
        if ((req.query.filter === 'all-local' || req.query.filter === 'all') &&
            (!user || user.hasRight(20) === false)) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.UNAUTHORIZED_401,
                message: 'You are not allowed to see all local videos.'
            });
            return;
        }
        return next();
    }
];
exports.commonVideosFiltersValidator = commonVideosFiltersValidator;
function areErrorsInScheduleUpdate(req, res) {
    if (req.body.scheduleUpdate) {
        if (!req.body.scheduleUpdate.updateAt) {
            logger_1.logger.warn('Invalid parameters: scheduleUpdate.updateAt is mandatory.');
            res.fail({ message: 'Schedule update at is mandatory.' });
            return true;
        }
    }
    return false;
}
function commonVideoChecksPass(parameters) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { req, res, user, videoFileSize, files } = parameters;
        if (areErrorsInScheduleUpdate(req, res))
            return false;
        if (!(yield shared_1.doesVideoChannelOfAccountExist(req.body.channelId, user, res)))
            return false;
        if (!videos_1.isVideoFileMimeTypeValid(files)) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.UNSUPPORTED_MEDIA_TYPE_415,
                message: 'This file is not supported. Please, make sure it is of the following type: ' +
                    constants_1.CONSTRAINTS_FIELDS.VIDEOS.EXTNAME.join(', ')
            });
            return false;
        }
        if (!videos_1.isVideoFileSizeValid(videoFileSize.toString())) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413,
                message: 'This file is too large. It exceeds the maximum file size authorized.',
                type: "max_file_size_reached"
            });
            return false;
        }
        if ((yield user_1.isAbleToUploadVideo(user.id, videoFileSize)) === false) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413,
                message: 'The user video quota is exceeded with this video.',
                type: "quota_reached"
            });
            return false;
        }
        return true;
    });
}
function isVideoAccepted(req, res, videoFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const acceptParameters = {
            videoBody: req.body,
            videoFile,
            user: res.locals.oauth.token.User
        };
        const acceptedResult = yield hooks_1.Hooks.wrapFun(moderation_1.isLocalVideoAccepted, acceptParameters, 'filter:api.video.upload.accept.result');
        if (!acceptedResult || acceptedResult.accepted !== true) {
            logger_1.logger.info('Refused local video.', { acceptedResult, acceptParameters });
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: acceptedResult.errorMessage || 'Refused local video'
            });
            return false;
        }
        return true;
    });
}
exports.isVideoAccepted = isVideoAccepted;
function addDurationToVideo(videoFile) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const duration = yield ffprobe_utils_1.getDurationFromVideoFile(videoFile.path);
        if (isNaN(duration))
            throw new Error(`Couldn't get video duration`);
        videoFile.duration = duration;
    });
}
