"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRemotePlaylistElement = exports.fetchRemoteVideoPlaylist = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const activitypub_1 = require("@server/helpers/activitypub");
const playlist_1 = require("@server/helpers/custom-validators/activitypub/playlist");
const logger_1 = require("@server/helpers/logger");
const requests_1 = require("@server/helpers/requests");
function fetchRemoteVideoPlaylist(playlistUrl) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const lTags = logger_1.loggerTagsFactory('ap', 'video-playlist', playlistUrl);
        logger_1.logger.info('Fetching remote playlist %s.', playlistUrl, lTags());
        const { body, statusCode } = yield requests_1.doJSONRequest(playlistUrl, { activityPub: true });
        if (playlist_1.isPlaylistObjectValid(body) === false || activitypub_1.checkUrlsSameHost(body.id, playlistUrl) !== true) {
            logger_1.logger.debug('Remote video playlist JSON is not valid.', Object.assign({ body }, lTags()));
            return { statusCode, playlistObject: undefined };
        }
        if (!lodash_1.isArray(body.to)) {
            logger_1.logger.debug('Remote video playlist JSON does not have a valid audience.', Object.assign({ body }, lTags()));
            return { statusCode, playlistObject: undefined };
        }
        return { statusCode, playlistObject: body };
    });
}
exports.fetchRemoteVideoPlaylist = fetchRemoteVideoPlaylist;
function fetchRemotePlaylistElement(elementUrl) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const lTags = logger_1.loggerTagsFactory('ap', 'video-playlist', 'element', elementUrl);
        logger_1.logger.debug('Fetching remote playlist element %s.', elementUrl, lTags());
        const { body, statusCode } = yield requests_1.doJSONRequest(elementUrl, { activityPub: true });
        if (!playlist_1.isPlaylistElementObjectValid(body))
            throw new Error(`Invalid body in fetch playlist element ${elementUrl}`);
        if (activitypub_1.checkUrlsSameHost(body.id, elementUrl) !== true) {
            throw new Error(`Playlist element url ${elementUrl} host is different from the AP object id ${body.id}`);
        }
        return { statusCode, elementObject: body };
    });
}
exports.fetchRemotePlaylistElement = fetchRemotePlaylistElement;
