"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oembedValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const path_1 = require("path");
const model_loaders_1 = require("@server/lib/model-loaders");
const video_playlist_1 = require("@server/models/video/video-playlist");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const core_utils_1 = require("../../helpers/core-utils");
const misc_1 = require("../../helpers/custom-validators/misc");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const shared_1 = require("./shared");
const playlistPaths = [
    path_1.join('videos', 'watch', 'playlist'),
    path_1.join('w', 'p')
];
const videoPaths = [
    path_1.join('videos', 'watch'),
    'w'
];
function buildUrls(paths) {
    return paths.map(p => constants_1.WEBSERVER.SCHEME + '://' + path_1.join(constants_1.WEBSERVER.HOST, p) + '/');
}
const startPlaylistURLs = buildUrls(playlistPaths);
const startVideoURLs = buildUrls(videoPaths);
const watchRegex = /([^/]+)$/;
const isURLOptions = {
    require_host: true,
    require_tld: true
};
if (core_utils_1.isTestInstance()) {
    isURLOptions.require_tld = false;
}
const oembedValidator = [
    express_validator_1.query('url').isURL(isURLOptions).withMessage('Should have a valid url'),
    express_validator_1.query('maxwidth').optional().isInt().withMessage('Should have a valid max width'),
    express_validator_1.query('maxheight').optional().isInt().withMessage('Should have a valid max height'),
    express_validator_1.query('format').optional().isIn(['xml', 'json']).withMessage('Should have a valid format'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking oembed parameters', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (req.query.format !== undefined && req.query.format !== 'json') {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_IMPLEMENTED_501,
                message: 'Requested format is not implemented on server.',
                data: {
                    format: req.query.format
                }
            });
        }
        const url = req.query.url;
        let urlPath;
        try {
            urlPath = new URL(url).pathname;
        }
        catch (err) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.BAD_REQUEST_400,
                message: err.message,
                data: {
                    url
                }
            });
        }
        const isPlaylist = startPlaylistURLs.some(u => url.startsWith(u));
        const isVideo = isPlaylist ? false : startVideoURLs.some(u => url.startsWith(u));
        const startIsOk = isVideo || isPlaylist;
        const matches = watchRegex.exec(urlPath);
        if (startIsOk === false || matches === null) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.BAD_REQUEST_400,
                message: 'Invalid url.',
                data: {
                    url
                }
            });
        }
        const elementId = misc_1.toCompleteUUID(matches[1]);
        if (misc_1.isIdOrUUIDValid(elementId) === false) {
            return res.fail({ message: 'Invalid video or playlist id.' });
        }
        if (isVideo) {
            const video = yield model_loaders_1.loadVideo(elementId, 'all');
            if (!video) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'Video not found'
                });
            }
            if (video.privacy !== 1) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                    message: 'Video is not public'
                });
            }
            res.locals.videoAll = video;
            return next();
        }
        const videoPlaylist = yield video_playlist_1.VideoPlaylistModel.loadWithAccountAndChannelSummary(elementId, undefined);
        if (!videoPlaylist) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video playlist not found'
            });
        }
        if (videoPlaylist.privacy !== 1) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Playlist is not public'
            });
        }
        res.locals.videoPlaylistSummary = videoPlaylist;
        return next();
    })
];
exports.oembedValidator = oembedValidator;
