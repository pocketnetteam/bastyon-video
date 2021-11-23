"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStreamingPlaylistsInfohashesIfNeeded = exports.downloadPlaylistSegments = exports.buildSha256Segment = exports.updateSha256VODSegments = exports.updateMasterHLSPlaylist = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const path_1 = require("path");
const core_utils_1 = require("../helpers/core-utils");
const ffprobe_utils_1 = require("../helpers/ffprobe-utils");
const logger_1 = require("../helpers/logger");
const requests_1 = require("../helpers/requests");
const utils_1 = require("../helpers/utils");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const database_1 = require("../initializers/database");
const video_file_1 = require("../models/video/video-file");
const video_streaming_playlist_1 = require("../models/video/video-streaming-playlist");
const paths_1 = require("./paths");
const video_path_manager_1 = require("./video-path-manager");
function updateStreamingPlaylistsInfohashesIfNeeded() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const playlistsToUpdate = yield video_streaming_playlist_1.VideoStreamingPlaylistModel.listByIncorrectPeerVersion();
        for (const playlist of playlistsToUpdate) {
            yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const videoFiles = yield video_file_1.VideoFileModel.listByStreamingPlaylist(playlist.id, t);
                playlist.assignP2PMediaLoaderInfoHashes(playlist.Video, videoFiles);
                playlist.p2pMediaLoaderPeerVersion = constants_1.P2P_MEDIA_LOADER_PEER_VERSION;
                yield playlist.save({ transaction: t });
            }));
        }
    });
}
exports.updateStreamingPlaylistsInfohashesIfNeeded = updateStreamingPlaylistsInfohashesIfNeeded;
function updateMasterHLSPlaylist(video, playlist) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const masterPlaylists = ['#EXTM3U', '#EXT-X-VERSION:3'];
        for (const file of playlist.VideoFiles) {
            const playlistFilename = (0, paths_1.getHlsResolutionPlaylistFilename)(file.filename);
            yield video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(playlist, file, (videoFilePath) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const size = yield (0, ffprobe_utils_1.getVideoStreamSize)(videoFilePath);
                const bandwidth = 'BANDWIDTH=' + video.getBandwidthBits(file);
                const resolution = `RESOLUTION=${size.width}x${size.height}`;
                let line = `#EXT-X-STREAM-INF:${bandwidth},${resolution}`;
                if (file.fps)
                    line += ',FRAME-RATE=' + file.fps;
                const codecs = yield Promise.all([
                    (0, ffprobe_utils_1.getVideoStreamCodec)(videoFilePath),
                    (0, ffprobe_utils_1.getAudioStreamCodec)(videoFilePath)
                ]);
                line += `,CODECS="${codecs.filter(c => !!c).join(',')}"`;
                masterPlaylists.push(line);
                masterPlaylists.push(playlistFilename);
            }));
        }
        yield video_path_manager_1.VideoPathManager.Instance.makeAvailablePlaylistFile(playlist, playlist.playlistFilename, masterPlaylistPath => {
            return (0, fs_extra_1.writeFile)(masterPlaylistPath, masterPlaylists.join('\n') + '\n');
        });
    });
}
exports.updateMasterHLSPlaylist = updateMasterHLSPlaylist;
function updateSha256VODSegments(video, playlist) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const json = {};
        for (const file of playlist.VideoFiles) {
            const rangeHashes = {};
            yield video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(playlist, file, videoPath => {
                return video_path_manager_1.VideoPathManager.Instance.makeAvailableResolutionPlaylistFile(playlist, file, (resolutionPlaylistPath) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const playlistContent = yield (0, fs_extra_1.readFile)(resolutionPlaylistPath);
                    const ranges = getRangesFromPlaylist(playlistContent.toString());
                    const fd = yield (0, fs_extra_1.open)(videoPath, 'r');
                    for (const range of ranges) {
                        const buf = Buffer.alloc(range.length);
                        yield (0, fs_extra_1.read)(fd, buf, 0, range.length, range.offset);
                        rangeHashes[`${range.offset}-${range.offset + range.length - 1}`] = (0, core_utils_1.sha256)(buf);
                    }
                    yield (0, fs_extra_1.close)(fd);
                    const videoFilename = file.filename;
                    json[videoFilename] = rangeHashes;
                }));
            });
        }
        const outputPath = video_path_manager_1.VideoPathManager.Instance.getFSHLSOutputPath(video, playlist.segmentsSha256Filename);
        yield (0, fs_extra_1.outputJSON)(outputPath, json);
    });
}
exports.updateSha256VODSegments = updateSha256VODSegments;
function buildSha256Segment(segmentPath) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const buf = yield (0, fs_extra_1.readFile)(segmentPath);
        return (0, core_utils_1.sha256)(buf);
    });
}
exports.buildSha256Segment = buildSha256Segment;
function downloadPlaylistSegments(playlistUrl, destinationDir, timeout, bodyKBLimit) {
    let timer;
    let remainingBodyKBLimit = bodyKBLimit;
    logger_1.logger.info('Importing HLS playlist %s', playlistUrl);
    return new Promise((res, rej) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const tmpDirectory = (0, path_1.join)(config_1.CONFIG.STORAGE.TMP_DIR, yield (0, utils_1.generateRandomString)(10));
        yield (0, fs_extra_1.ensureDir)(tmpDirectory);
        timer = setTimeout(() => {
            deleteTmpDirectory(tmpDirectory);
            return rej(new Error('HLS download timeout.'));
        }, timeout);
        try {
            const subPlaylistUrls = yield fetchUniqUrls(playlistUrl);
            const subRequests = subPlaylistUrls.map(u => fetchUniqUrls(u));
            const fileUrls = (0, lodash_1.uniq)((0, lodash_1.flatten)(yield Promise.all(subRequests)));
            logger_1.logger.debug('Will download %d HLS files.', fileUrls.length, { fileUrls });
            for (const fileUrl of fileUrls) {
                const destPath = (0, path_1.join)(tmpDirectory, (0, path_1.basename)(fileUrl));
                yield (0, requests_1.doRequestAndSaveToFile)(fileUrl, destPath, { bodyKBLimit: remainingBodyKBLimit });
                const { size } = yield (0, fs_extra_1.stat)(destPath);
                remainingBodyKBLimit -= (size / 1000);
                logger_1.logger.debug('Downloaded HLS playlist file %s with %d kB remained limit.', fileUrl, Math.floor(remainingBodyKBLimit));
            }
            clearTimeout(timer);
            yield (0, fs_extra_1.move)(tmpDirectory, destinationDir, { overwrite: true });
            return res();
        }
        catch (err) {
            deleteTmpDirectory(tmpDirectory);
            return rej(err);
        }
    }));
    function deleteTmpDirectory(directory) {
        (0, fs_extra_1.remove)(directory)
            .catch(err => logger_1.logger.error('Cannot delete path on HLS download error.', { err }));
    }
    function fetchUniqUrls(playlistUrl) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { body } = yield (0, requests_1.doRequest)(playlistUrl);
            if (!body)
                return [];
            const urls = body.split('\n')
                .filter(line => line.endsWith('.m3u8') || line.endsWith('.mp4'))
                .map(url => {
                if (url.startsWith('http://') || url.startsWith('https://'))
                    return url;
                return `${(0, path_1.dirname)(playlistUrl)}/${url}`;
            });
            return (0, lodash_1.uniq)(urls);
        });
    }
}
exports.downloadPlaylistSegments = downloadPlaylistSegments;
function getRangesFromPlaylist(playlistContent) {
    const ranges = [];
    const lines = playlistContent.split('\n');
    const regex = /^#EXT-X-BYTERANGE:(\d+)@(\d+)$/;
    for (const line of lines) {
        const captured = regex.exec(line);
        if (captured) {
            ranges.push({ length: parseInt(captured[1], 10), offset: parseInt(captured[2], 10) });
        }
    }
    return ranges;
}
