"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCacheFileObjectValid = void 0;
const misc_1 = require("./misc");
const videos_1 = require("./videos");
const misc_2 = require("../misc");
function isCacheFileObjectValid(object) {
    return (0, misc_2.exists)(object) &&
        object.type === 'CacheFile' &&
        (object.expires === null || (0, misc_2.isDateValid)(object.expires)) &&
        (0, misc_1.isActivityPubUrlValid)(object.object) &&
        ((0, videos_1.isRemoteVideoUrlValid)(object.url) || isPlaylistRedundancyUrlValid(object.url));
}
exports.isCacheFileObjectValid = isCacheFileObjectValid;
function isPlaylistRedundancyUrlValid(url) {
    return url.type === 'Link' &&
        (url.mediaType || url.mimeType) === 'application/x-mpegURL' &&
        (0, misc_1.isActivityPubUrlValid)(url.href);
}
