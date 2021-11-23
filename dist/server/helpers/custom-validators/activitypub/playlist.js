"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlaylistElementObjectValid = exports.isPlaylistObjectValid = void 0;
const tslib_1 = require("tslib");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const misc_1 = require("../misc");
const video_playlists_1 = require("../video-playlists");
const misc_2 = require("./misc");
function isPlaylistObjectValid(object) {
    return (0, misc_1.exists)(object) &&
        object.type === 'Playlist' &&
        validator_1.default.isInt(object.totalItems + '') &&
        (0, video_playlists_1.isVideoPlaylistNameValid)(object.name) &&
        (0, misc_1.isUUIDValid)(object.uuid) &&
        (0, misc_1.isDateValid)(object.published) &&
        (0, misc_1.isDateValid)(object.updated);
}
exports.isPlaylistObjectValid = isPlaylistObjectValid;
function isPlaylistElementObjectValid(object) {
    return (0, misc_1.exists)(object) &&
        object.type === 'PlaylistElement' &&
        validator_1.default.isInt(object.position + '') &&
        (0, misc_2.isActivityPubUrlValid)(object.url);
}
exports.isPlaylistElementObjectValid = isPlaylistElementObjectValid;
