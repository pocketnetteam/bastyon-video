"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHLSRedundancyUrl = exports.generateWebTorrentRedundancyUrl = exports.getLocalVideoFileMetadataUrl = void 0;
const constants_1 = require("@server/initializers/constants");
function generateHLSRedundancyUrl(video, playlist) {
    return constants_1.WEBSERVER.URL + constants_1.STATIC_PATHS.REDUNDANCY + playlist.getStringType() + '/' + video.uuid;
}
exports.generateHLSRedundancyUrl = generateHLSRedundancyUrl;
function generateWebTorrentRedundancyUrl(file) {
    return constants_1.WEBSERVER.URL + constants_1.STATIC_PATHS.REDUNDANCY + file.filename;
}
exports.generateWebTorrentRedundancyUrl = generateWebTorrentRedundancyUrl;
function getLocalVideoFileMetadataUrl(video, videoFile) {
    const path = '/api/v1/videos/';
    return constants_1.WEBSERVER.URL + path + video.uuid + '/metadata/' + videoFile.id;
}
exports.getLocalVideoFileMetadataUrl = getLocalVideoFileMetadataUrl;
