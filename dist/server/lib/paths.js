"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHlsResolutionPlaylistFilename = exports.generateHlsSha256SegmentsFilename = exports.generateHLSMasterPlaylistFilename = exports.getHLSRedundancyDirectory = exports.getLiveDirectory = exports.getHLSDirectory = exports.getFSTorrentFilePath = exports.generateTorrentFileName = exports.generateWebTorrentVideoFilename = exports.generateHLSVideoFilename = void 0;
const path_1 = require("path");
const uuid_1 = require("@server/helpers/uuid");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const models_1 = require("@server/types/models");
const core_utils_1 = require("@shared/core-utils");
function generateWebTorrentVideoFilename(resolution, extname) {
    return (0, uuid_1.buildUUID)() + '-' + resolution + extname;
}
exports.generateWebTorrentVideoFilename = generateWebTorrentVideoFilename;
function generateHLSVideoFilename(resolution) {
    return `${(0, uuid_1.buildUUID)()}-${resolution}-fragmented.mp4`;
}
exports.generateHLSVideoFilename = generateHLSVideoFilename;
function getLiveDirectory(video) {
    return getHLSDirectory(video);
}
exports.getLiveDirectory = getLiveDirectory;
function getHLSDirectory(video) {
    return (0, path_1.join)(constants_1.HLS_STREAMING_PLAYLIST_DIRECTORY, video.uuid);
}
exports.getHLSDirectory = getHLSDirectory;
function getHLSRedundancyDirectory(video) {
    return (0, path_1.join)(constants_1.HLS_REDUNDANCY_DIRECTORY, video.uuid);
}
exports.getHLSRedundancyDirectory = getHLSRedundancyDirectory;
function getHlsResolutionPlaylistFilename(videoFilename) {
    return (0, core_utils_1.removeFragmentedMP4Ext)(videoFilename) + '.m3u8';
}
exports.getHlsResolutionPlaylistFilename = getHlsResolutionPlaylistFilename;
function generateHLSMasterPlaylistFilename(isLive = false) {
    if (isLive)
        return 'master.m3u8';
    return (0, uuid_1.buildUUID)() + '-master.m3u8';
}
exports.generateHLSMasterPlaylistFilename = generateHLSMasterPlaylistFilename;
function generateHlsSha256SegmentsFilename(isLive = false) {
    if (isLive)
        return 'segments-sha256.json';
    return (0, uuid_1.buildUUID)() + '-segments-sha256.json';
}
exports.generateHlsSha256SegmentsFilename = generateHlsSha256SegmentsFilename;
function generateTorrentFileName(videoOrPlaylist, resolution) {
    const extension = '.torrent';
    const uuid = (0, uuid_1.buildUUID)();
    if ((0, models_1.isStreamingPlaylist)(videoOrPlaylist)) {
        return `${uuid}-${resolution}-${videoOrPlaylist.getStringType()}${extension}`;
    }
    return uuid + '-' + resolution + extension;
}
exports.generateTorrentFileName = generateTorrentFileName;
function getFSTorrentFilePath(videoFile) {
    return (0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, videoFile.torrentFilename);
}
exports.getFSTorrentFilePath = getFSTorrentFilePath;
