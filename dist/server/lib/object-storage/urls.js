"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHLSPublicFileUrl = exports.replaceByBaseUrl = exports.getWebTorrentPublicFileUrl = exports.getPrivateUrl = void 0;
const config_1 = require("@server/initializers/config");
const shared_1 = require("./shared");
function getPrivateUrl(config, keyWithoutPrefix) {
    return getBaseUrl(config) + shared_1.buildKey(keyWithoutPrefix, config);
}
exports.getPrivateUrl = getPrivateUrl;
function getWebTorrentPublicFileUrl(fileUrl) {
    const baseUrl = config_1.CONFIG.OBJECT_STORAGE.VIDEOS.BASE_URL;
    if (!baseUrl)
        return fileUrl;
    return replaceByBaseUrl(fileUrl, baseUrl);
}
exports.getWebTorrentPublicFileUrl = getWebTorrentPublicFileUrl;
function getHLSPublicFileUrl(fileUrl) {
    const baseUrl = config_1.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS.BASE_URL;
    if (!baseUrl)
        return fileUrl;
    return replaceByBaseUrl(fileUrl, baseUrl);
}
exports.getHLSPublicFileUrl = getHLSPublicFileUrl;
function getBaseUrl(bucketInfo, baseUrl) {
    if (baseUrl)
        return baseUrl;
    return `${shared_1.getEndpointParsed().protocol}//${bucketInfo.BUCKET_NAME}.${shared_1.getEndpointParsed().host}/`;
}
const regex = new RegExp('https?://[^/]+');
function replaceByBaseUrl(fileUrl, baseUrl) {
    return fileUrl.replace(regex, baseUrl);
}
exports.replaceByBaseUrl = replaceByBaseUrl;
