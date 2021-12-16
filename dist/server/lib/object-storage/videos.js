"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHLSFileAvailable = exports.makeWebTorrentFileAvailable = exports.removeWebTorrentObjectStorage = exports.removeHLSObjectStorage = exports.storeHLSFile = exports.storeWebTorrentFile = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const paths_1 = require("../paths");
const keys_1 = require("./keys");
const shared_1 = require("./shared");
function storeHLSFile(playlist, video, filename) {
    const baseHlsDirectory = paths_1.getHLSDirectory(video);
    return shared_1.storeObject({
        inputPath: path_1.join(baseHlsDirectory, filename),
        objectStorageKey: keys_1.generateHLSObjectStorageKey(playlist, video, filename),
        bucketInfo: config_1.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS
    });
}
exports.storeHLSFile = storeHLSFile;
function storeWebTorrentFile(filename) {
    return shared_1.storeObject({
        inputPath: path_1.join(config_1.CONFIG.STORAGE.VIDEOS_DIR, filename),
        objectStorageKey: keys_1.generateWebTorrentObjectStorageKey(filename),
        bucketInfo: config_1.CONFIG.OBJECT_STORAGE.VIDEOS
    });
}
exports.storeWebTorrentFile = storeWebTorrentFile;
function removeHLSObjectStorage(playlist, video) {
    return shared_1.removePrefix(keys_1.generateHLSObjectBaseStorageKey(playlist, video), config_1.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS);
}
exports.removeHLSObjectStorage = removeHLSObjectStorage;
function removeWebTorrentObjectStorage(videoFile) {
    return shared_1.removeObject(keys_1.generateWebTorrentObjectStorageKey(videoFile.filename), config_1.CONFIG.OBJECT_STORAGE.VIDEOS);
}
exports.removeWebTorrentObjectStorage = removeWebTorrentObjectStorage;
function makeHLSFileAvailable(playlist, video, filename, destination) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const key = keys_1.generateHLSObjectStorageKey(playlist, video, filename);
        logger_1.logger.info('Fetching HLS file %s from object storage to %s.', key, destination, shared_1.lTags());
        yield shared_1.makeAvailable({
            key,
            destination,
            bucketInfo: config_1.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS
        });
        return destination;
    });
}
exports.makeHLSFileAvailable = makeHLSFileAvailable;
function makeWebTorrentFileAvailable(filename, destination) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const key = keys_1.generateWebTorrentObjectStorageKey(filename);
        logger_1.logger.info('Fetching WebTorrent file %s from object storage to %s.', key, destination, shared_1.lTags());
        yield shared_1.makeAvailable({
            key,
            destination,
            bucketInfo: config_1.CONFIG.OBJECT_STORAGE.VIDEOS
        });
        return destination;
    });
}
exports.makeWebTorrentFileAvailable = makeWebTorrentFileAvailable;
