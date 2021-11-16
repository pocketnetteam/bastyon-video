"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivaciesForFederation = exports.isPrivacyForFederation = exports.isStateForFederation = exports.getExtFromMimetype = exports.extractVideo = exports.getVideoWithAttributes = void 0;
const config_1 = require("@server/initializers/config");
const models_1 = require("@server/types/models");
function getVideoWithAttributes(res) {
    return res.locals.videoAPI || res.locals.videoAll || res.locals.onlyVideo;
}
exports.getVideoWithAttributes = getVideoWithAttributes;
function extractVideo(videoOrPlaylist) {
    return models_1.isStreamingPlaylist(videoOrPlaylist)
        ? videoOrPlaylist.Video
        : videoOrPlaylist;
}
exports.extractVideo = extractVideo;
function isPrivacyForFederation(privacy) {
    const castedPrivacy = parseInt(privacy + '', 10);
    return castedPrivacy === 1 ||
        (config_1.CONFIG.FEDERATION.VIDEOS.FEDERATE_UNLISTED === true && castedPrivacy === 2);
}
exports.isPrivacyForFederation = isPrivacyForFederation;
function isStateForFederation(state) {
    const castedState = parseInt(state + '', 10);
    return castedState === 1 || castedState === 4 || castedState === 5;
}
exports.isStateForFederation = isStateForFederation;
function getPrivaciesForFederation() {
    return (config_1.CONFIG.FEDERATION.VIDEOS.FEDERATE_UNLISTED === true)
        ? [{ privacy: 1 }, { privacy: 2 }]
        : [{ privacy: 1 }];
}
exports.getPrivaciesForFederation = getPrivaciesForFederation;
function getExtFromMimetype(mimeTypes, mimeType) {
    const value = mimeTypes[mimeType];
    if (Array.isArray(value))
        return value[0];
    return value;
}
exports.getExtFromMimetype = getExtFromMimetype;
