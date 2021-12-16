"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doVideosInPlaylistExistValidator = exports.commonVideoPlaylistFiltersValidator = exports.videoPlaylistElementAPGetValidator = exports.videoPlaylistsReorderVideosValidator = exports.videoPlaylistsUpdateOrRemoveVideoValidator = exports.videoPlaylistsAddVideoValidator = exports.videoPlaylistsSearchValidator = exports.videoPlaylistsGetValidator = exports.videoPlaylistsDeleteValidator = exports.videoPlaylistsUpdateValidator = exports.videoPlaylistsAddValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const video_playlists_1 = require("../../../helpers/custom-validators/video-playlists");
const videos_1 = require("../../../helpers/custom-validators/videos");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const constants_1 = require("../../../initializers/constants");
const video_playlist_element_1 = require("../../../models/video/video-playlist-element");
const auth_1 = require("../../auth");
const shared_1 = require("../shared");
const videoPlaylistsAddValidator = getCommonPlaylistEditAttributes().concat([
    express_validator_1.body('displayName')
        .custom(video_playlists_1.isVideoPlaylistNameValid).withMessage('Should have a valid display name'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistsAddValidator parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return express_utils_1.cleanUpReqFiles(req);
        const body = req.body;
        if (body.videoChannelId && !(yield shared_1.doesVideoChannelIdExist(body.videoChannelId, res)))
            return express_utils_1.cleanUpReqFiles(req);
        if (!body.videoChannelId &&
            (body.privacy === 1 || body.privacy === 2)) {
            express_utils_1.cleanUpReqFiles(req);
            return res.fail({ message: 'Cannot set "public" or "unlisted" a playlist that is not assigned to a channel.' });
        }
        return next();
    })
]);
exports.videoPlaylistsAddValidator = videoPlaylistsAddValidator;
const videoPlaylistsUpdateValidator = getCommonPlaylistEditAttributes().concat([
    shared_1.isValidPlaylistIdParam('playlistId'),
    express_validator_1.body('displayName')
        .optional()
        .custom(video_playlists_1.isVideoPlaylistNameValid).withMessage('Should have a valid display name'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistsUpdateValidator parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return express_utils_1.cleanUpReqFiles(req);
        if (!(yield shared_1.doesVideoPlaylistExist(req.params.playlistId, res, 'all')))
            return express_utils_1.cleanUpReqFiles(req);
        const videoPlaylist = getPlaylist(res);
        if (!checkUserCanManageVideoPlaylist(res.locals.oauth.token.User, videoPlaylist, 15, res)) {
            return express_utils_1.cleanUpReqFiles(req);
        }
        const body = req.body;
        const newPrivacy = body.privacy || videoPlaylist.privacy;
        if (newPrivacy === 1 &&
            ((!videoPlaylist.videoChannelId && !body.videoChannelId) ||
                body.videoChannelId === null)) {
            express_utils_1.cleanUpReqFiles(req);
            return res.fail({ message: 'Cannot set "public" a playlist that is not assigned to a channel.' });
        }
        if (videoPlaylist.type === 2) {
            express_utils_1.cleanUpReqFiles(req);
            return res.fail({ message: 'Cannot update a watch later playlist.' });
        }
        if (body.videoChannelId && !(yield shared_1.doesVideoChannelIdExist(body.videoChannelId, res)))
            return express_utils_1.cleanUpReqFiles(req);
        return next();
    })
]);
exports.videoPlaylistsUpdateValidator = videoPlaylistsUpdateValidator;
const videoPlaylistsDeleteValidator = [
    shared_1.isValidPlaylistIdParam('playlistId'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistsDeleteValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoPlaylistExist(req.params.playlistId, res)))
            return;
        const videoPlaylist = getPlaylist(res);
        if (videoPlaylist.type === 2) {
            return res.fail({ message: 'Cannot delete a watch later playlist.' });
        }
        if (!checkUserCanManageVideoPlaylist(res.locals.oauth.token.User, videoPlaylist, 15, res)) {
            return;
        }
        return next();
    })
];
exports.videoPlaylistsDeleteValidator = videoPlaylistsDeleteValidator;
const videoPlaylistsGetValidator = (fetchType) => {
    return [
        shared_1.isValidPlaylistIdParam('playlistId'),
        (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            logger_1.logger.debug('Checking videoPlaylistsGetValidator parameters', { parameters: req.params });
            if (shared_1.areValidationErrors(req, res))
                return;
            if (!(yield shared_1.doesVideoPlaylistExist(req.params.playlistId, res, fetchType)))
                return;
            const videoPlaylist = res.locals.videoPlaylistFull || res.locals.videoPlaylistSummary;
            if (videoPlaylist.privacy === 2) {
                if (misc_1.isUUIDValid(req.params.playlistId))
                    return next();
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'Playlist not found'
                });
            }
            if (videoPlaylist.privacy === 3) {
                yield auth_1.authenticatePromiseIfNeeded(req, res);
                const user = res.locals.oauth ? res.locals.oauth.token.User : null;
                if (!user ||
                    (videoPlaylist.OwnerAccount.id !== user.Account.id && !user.hasRight(18))) {
                    return res.fail({
                        status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                        message: 'Cannot get this private video playlist.'
                    });
                }
                return next();
            }
            return next();
        })
    ];
};
exports.videoPlaylistsGetValidator = videoPlaylistsGetValidator;
const videoPlaylistsSearchValidator = [
    express_validator_1.query('search').optional().not().isEmpty().withMessage('Should have a valid search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking videoPlaylists search query', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.videoPlaylistsSearchValidator = videoPlaylistsSearchValidator;
const videoPlaylistsAddVideoValidator = [
    shared_1.isValidPlaylistIdParam('playlistId'),
    express_validator_1.body('videoId')
        .customSanitizer(misc_1.toCompleteUUID)
        .custom(misc_1.isIdOrUUIDValid).withMessage('Should have a valid video id/uuid'),
    express_validator_1.body('startTimestamp')
        .optional()
        .custom(video_playlists_1.isVideoPlaylistTimestampValid).withMessage('Should have a valid start timestamp'),
    express_validator_1.body('stopTimestamp')
        .optional()
        .custom(video_playlists_1.isVideoPlaylistTimestampValid).withMessage('Should have a valid stop timestamp'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistsAddVideoValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoPlaylistExist(req.params.playlistId, res, 'all')))
            return;
        if (!(yield shared_1.doesVideoExist(req.body.videoId, res, 'only-video')))
            return;
        const videoPlaylist = getPlaylist(res);
        if (!checkUserCanManageVideoPlaylist(res.locals.oauth.token.User, videoPlaylist, 18, res)) {
            return;
        }
        return next();
    })
];
exports.videoPlaylistsAddVideoValidator = videoPlaylistsAddVideoValidator;
const videoPlaylistsUpdateOrRemoveVideoValidator = [
    shared_1.isValidPlaylistIdParam('playlistId'),
    express_validator_1.param('playlistElementId')
        .customSanitizer(misc_1.toCompleteUUID)
        .custom(misc_1.isIdValid).withMessage('Should have an element id/uuid'),
    express_validator_1.body('startTimestamp')
        .optional()
        .custom(video_playlists_1.isVideoPlaylistTimestampValid).withMessage('Should have a valid start timestamp'),
    express_validator_1.body('stopTimestamp')
        .optional()
        .custom(video_playlists_1.isVideoPlaylistTimestampValid).withMessage('Should have a valid stop timestamp'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistsRemoveVideoValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoPlaylistExist(req.params.playlistId, res, 'all')))
            return;
        const videoPlaylist = getPlaylist(res);
        const videoPlaylistElement = yield video_playlist_element_1.VideoPlaylistElementModel.loadById(req.params.playlistElementId);
        if (!videoPlaylistElement) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video playlist element not found'
            });
            return;
        }
        res.locals.videoPlaylistElement = videoPlaylistElement;
        if (!checkUserCanManageVideoPlaylist(res.locals.oauth.token.User, videoPlaylist, 18, res))
            return;
        return next();
    })
];
exports.videoPlaylistsUpdateOrRemoveVideoValidator = videoPlaylistsUpdateOrRemoveVideoValidator;
const videoPlaylistElementAPGetValidator = [
    shared_1.isValidPlaylistIdParam('playlistId'),
    express_validator_1.param('playlistElementId')
        .custom(misc_1.isIdValid).withMessage('Should have an playlist element id'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistElementAPGetValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        const playlistElementId = parseInt(req.params.playlistElementId + '', 10);
        const playlistId = req.params.playlistId;
        const videoPlaylistElement = yield video_playlist_element_1.VideoPlaylistElementModel.loadByPlaylistAndElementIdForAP(playlistId, playlistElementId);
        if (!videoPlaylistElement) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video playlist element not found'
            });
            return;
        }
        if (videoPlaylistElement.VideoPlaylist.privacy === 3) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Cannot get this private video playlist.'
            });
        }
        res.locals.videoPlaylistElementAP = videoPlaylistElement;
        return next();
    })
];
exports.videoPlaylistElementAPGetValidator = videoPlaylistElementAPGetValidator;
const videoPlaylistsReorderVideosValidator = [
    shared_1.isValidPlaylistIdParam('playlistId'),
    express_validator_1.body('startPosition')
        .isInt({ min: 1 }).withMessage('Should have a valid start position'),
    express_validator_1.body('insertAfterPosition')
        .isInt({ min: 0 }).withMessage('Should have a valid insert after position'),
    express_validator_1.body('reorderLength')
        .optional()
        .isInt({ min: 1 }).withMessage('Should have a valid range length'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoPlaylistsReorderVideosValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoPlaylistExist(req.params.playlistId, res, 'all')))
            return;
        const videoPlaylist = getPlaylist(res);
        if (!checkUserCanManageVideoPlaylist(res.locals.oauth.token.User, videoPlaylist, 18, res))
            return;
        const nextPosition = yield video_playlist_element_1.VideoPlaylistElementModel.getNextPositionOf(videoPlaylist.id);
        const startPosition = req.body.startPosition;
        const insertAfterPosition = req.body.insertAfterPosition;
        const reorderLength = req.body.reorderLength;
        if (startPosition >= nextPosition || insertAfterPosition >= nextPosition) {
            res.fail({ message: `Start position or insert after position exceed the playlist limits (max: ${nextPosition - 1})` });
            return;
        }
        if (reorderLength && reorderLength + startPosition > nextPosition) {
            res.fail({ message: `Reorder length with this start position exceeds the playlist limits (max: ${nextPosition - startPosition})` });
            return;
        }
        return next();
    })
];
exports.videoPlaylistsReorderVideosValidator = videoPlaylistsReorderVideosValidator;
const commonVideoPlaylistFiltersValidator = [
    express_validator_1.query('playlistType')
        .optional()
        .custom(video_playlists_1.isVideoPlaylistTypeValid).withMessage('Should have a valid playlist type'),
    (req, res, next) => {
        logger_1.logger.debug('Checking commonVideoPlaylistFiltersValidator parameters', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.commonVideoPlaylistFiltersValidator = commonVideoPlaylistFiltersValidator;
const doVideosInPlaylistExistValidator = [
    express_validator_1.query('videoIds')
        .customSanitizer(misc_1.toIntArray)
        .custom(v => misc_1.isArrayOf(v, misc_1.isIdValid)).withMessage('Should have a valid video ids array'),
    (req, res, next) => {
        logger_1.logger.debug('Checking areVideosInPlaylistExistValidator parameters', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.doVideosInPlaylistExistValidator = doVideosInPlaylistExistValidator;
function getCommonPlaylistEditAttributes() {
    return [
        express_validator_1.body('thumbnailfile')
            .custom((value, { req }) => videos_1.isVideoImage(req.files, 'thumbnailfile'))
            .withMessage('This thumbnail file is not supported or too large. Please, make sure it is of the following type: ' +
            constants_1.CONSTRAINTS_FIELDS.VIDEO_PLAYLISTS.IMAGE.EXTNAME.join(', ')),
        express_validator_1.body('description')
            .optional()
            .customSanitizer(misc_1.toValueOrNull)
            .custom(video_playlists_1.isVideoPlaylistDescriptionValid).withMessage('Should have a valid description'),
        express_validator_1.body('privacy')
            .optional()
            .customSanitizer(misc_1.toIntOrNull)
            .custom(video_playlists_1.isVideoPlaylistPrivacyValid).withMessage('Should have correct playlist privacy'),
        express_validator_1.body('videoChannelId')
            .optional()
            .customSanitizer(misc_1.toIntOrNull)
    ];
}
function checkUserCanManageVideoPlaylist(user, videoPlaylist, right, res) {
    if (videoPlaylist.isOwned() === false) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot manage video playlist of another server.'
        });
        return false;
    }
    if (user.hasRight(right) === false && videoPlaylist.ownerAccountId !== user.Account.id) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot manage video playlist of another user'
        });
        return false;
    }
    return true;
}
function getPlaylist(res) {
    return res.locals.videoPlaylistFull || res.locals.videoPlaylistSummary;
}
