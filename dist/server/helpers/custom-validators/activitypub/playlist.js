"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlaylistElementObjectValid = exports.isPlaylistObjectValid = void 0;
const tslib_1 = require("tslib");
const validator_1 = tslib_1.__importDefault(require("validator"));
const misc_1 = require("../misc");
const video_playlists_1 = require("../video-playlists");
const misc_2 = require("./misc");
function isPlaylistObjectValid(object) {
    return misc_1.exists(object) &&
        object.type === 'Playlist' &&
        validator_1.default.isInt(object.totalItems + '') &&
        video_playlists_1.isVideoPlaylistNameValid(object.name) &&
        misc_1.isUUIDValid(object.uuid) &&
        misc_1.isDateValid(object.published) &&
        misc_1.isDateValid(object.updated);
}
exports.isPlaylistObjectValid = isPlaylistObjectValid;
function isPlaylistElementObjectValid(object) {
    return misc_1.exists(object) &&
        object.type === 'PlaylistElement' &&
        validator_1.default.isInt(object.position + '') &&
        misc_2.isActivityPubUrlValid(object.url);
}
exports.isPlaylistElementObjectValid = isPlaylistElementObjectValid;
