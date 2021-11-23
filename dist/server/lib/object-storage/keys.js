"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWebTorrentObjectStorageKey = exports.generateHLSObjectBaseStorageKey = exports.generateHLSObjectStorageKey = void 0;
const path_1 = require("path");
function generateHLSObjectStorageKey(playlist, video, filename) {
    return (0, path_1.join)(generateHLSObjectBaseStorageKey(playlist, video), filename);
}
exports.generateHLSObjectStorageKey = generateHLSObjectStorageKey;
function generateHLSObjectBaseStorageKey(playlist, video) {
    return (0, path_1.join)(playlist.getStringType(), video.uuid);
}
exports.generateHLSObjectBaseStorageKey = generateHLSObjectBaseStorageKey;
function generateWebTorrentObjectStorageKey(filename) {
    return filename;
}
exports.generateWebTorrentObjectStorageKey = generateWebTorrentObjectStorageKey;
