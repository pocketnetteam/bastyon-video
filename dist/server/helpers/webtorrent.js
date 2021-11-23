"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadWebTorrentVideo = exports.generateMagnetUri = exports.createTorrentAndSetInfoHash = exports.updateTorrentUrls = exports.createTorrentPromise = void 0;
const tslib_1 = require("tslib");
const bencode_1 = require("bencode");
const create_torrent_1 = (0, tslib_1.__importDefault)(require("create-torrent"));
const fs_extra_1 = require("fs-extra");
const magnet_uri_1 = (0, tslib_1.__importDefault)(require("magnet-uri"));
const parse_torrent_1 = (0, tslib_1.__importDefault)(require("parse-torrent"));
const path_1 = require("path");
const stream_1 = require("stream");
const webtorrent_1 = (0, tslib_1.__importDefault)(require("webtorrent"));
const misc_1 = require("@server/helpers/custom-validators/misc");
const constants_1 = require("@server/initializers/constants");
const paths_1 = require("@server/lib/paths");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const config_1 = require("../initializers/config");
const core_utils_1 = require("./core-utils");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
const video_1 = require("./video");
const createTorrentPromise = (0, core_utils_1.promisify2)(create_torrent_1.default);
exports.createTorrentPromise = createTorrentPromise;
function downloadWebTorrentVideo(target, timeout) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const id = target.uri || target.torrentName;
        let timer;
        const path = (0, utils_1.generateVideoImportTmpPath)(id);
        logger_1.logger.info('Importing torrent video %s', id);
        const directoryPath = (0, path_1.join)(config_1.CONFIG.STORAGE.TMP_DIR, 'webtorrent');
        yield (0, fs_extra_1.ensureDir)(directoryPath);
        return new Promise((res, rej) => {
            const webtorrent = new webtorrent_1.default();
            let file;
            const torrentId = target.uri || (0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, target.torrentName);
            const options = { path: directoryPath };
            const torrent = webtorrent.add(torrentId, options, torrent => {
                if (torrent.files.length !== 1) {
                    if (timer)
                        clearTimeout(timer);
                    for (const file of torrent.files) {
                        deleteDownloadedFile({ directoryPath, filepath: file.path });
                    }
                    return safeWebtorrentDestroy(webtorrent, torrentId, undefined, target.torrentName)
                        .then(() => rej(new Error('Cannot import torrent ' + torrentId + ': there are multiple files in it')));
                }
                logger_1.logger.debug('Got torrent from webtorrent %s.', id, { infoHash: torrent.infoHash });
                file = torrent.files[0];
                const writeStream = (0, fs_extra_1.createWriteStream)(path);
                writeStream.on('finish', () => {
                    if (timer)
                        clearTimeout(timer);
                    safeWebtorrentDestroy(webtorrent, torrentId, { directoryPath, filepath: file.path }, target.torrentName)
                        .then(() => res(path))
                        .catch(err => logger_1.logger.error('Cannot destroy webtorrent.', { err }));
                });
                (0, stream_1.pipeline)(file.createReadStream(), writeStream, err => {
                    if (err)
                        rej(err);
                });
            });
            torrent.on('error', err => rej(err));
            timer = setTimeout(() => {
                const err = new Error('Webtorrent download timeout.');
                safeWebtorrentDestroy(webtorrent, torrentId, file ? { directoryPath, filepath: file.path } : undefined, target.torrentName)
                    .then(() => rej(err))
                    .catch(destroyErr => {
                    logger_1.logger.error('Cannot destroy webtorrent.', { err: destroyErr });
                    rej(err);
                });
            }, timeout);
        });
    });
}
exports.downloadWebTorrentVideo = downloadWebTorrentVideo;
function createTorrentAndSetInfoHash(videoOrPlaylist, videoFile) {
    const video = (0, video_1.extractVideo)(videoOrPlaylist);
    const options = {
        name: `${video.name} ${videoFile.resolution}p${videoFile.extname}`,
        createdBy: 'PeerTube',
        announceList: buildAnnounceList(),
        urlList: buildUrlList(video, videoFile)
    };
    return video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(videoOrPlaylist, videoFile, (videoPath) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const torrentContent = yield createTorrentPromise(videoPath, options);
        const torrentFilename = (0, paths_1.generateTorrentFileName)(videoOrPlaylist, videoFile.resolution);
        const torrentPath = (0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, torrentFilename);
        logger_1.logger.info('Creating torrent %s.', torrentPath);
        yield (0, fs_extra_1.writeFile)(torrentPath, torrentContent);
        if (videoFile.hasTorrent()) {
            yield (0, fs_extra_1.remove)((0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, videoFile.torrentFilename));
        }
        const parsedTorrent = (0, parse_torrent_1.default)(torrentContent);
        videoFile.infoHash = parsedTorrent.infoHash;
        videoFile.torrentFilename = torrentFilename;
    }));
}
exports.createTorrentAndSetInfoHash = createTorrentAndSetInfoHash;
function updateTorrentUrls(videoOrPlaylist, videoFile) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const video = (0, video_1.extractVideo)(videoOrPlaylist);
        const oldTorrentPath = (0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, videoFile.torrentFilename);
        const torrentContent = yield (0, fs_extra_1.readFile)(oldTorrentPath);
        const decoded = (0, bencode_1.decode)(torrentContent);
        decoded['announce-list'] = buildAnnounceList();
        decoded.announce = decoded['announce-list'][0][0];
        decoded['url-list'] = buildUrlList(video, videoFile);
        const newTorrentFilename = (0, paths_1.generateTorrentFileName)(videoOrPlaylist, videoFile.resolution);
        const newTorrentPath = (0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, newTorrentFilename);
        logger_1.logger.info('Updating torrent URLs %s -> %s.', oldTorrentPath, newTorrentPath);
        yield (0, fs_extra_1.writeFile)(newTorrentPath, (0, bencode_1.encode)(decoded));
        yield (0, fs_extra_1.remove)((0, path_1.join)(config_1.CONFIG.STORAGE.TORRENTS_DIR, videoFile.torrentFilename));
        videoFile.torrentFilename = newTorrentFilename;
    });
}
exports.updateTorrentUrls = updateTorrentUrls;
function generateMagnetUri(video, videoFile, trackerUrls) {
    const xs = videoFile.getTorrentUrl();
    const announce = trackerUrls;
    let urlList = [videoFile.getFileUrl(video)];
    const redundancies = videoFile.RedundancyVideos;
    if ((0, misc_1.isArray)(redundancies))
        urlList = urlList.concat(redundancies.map(r => r.fileUrl));
    const magnetHash = {
        xs,
        announce,
        urlList,
        infoHash: videoFile.infoHash,
        name: video.name
    };
    return magnet_uri_1.default.encode(magnetHash);
}
exports.generateMagnetUri = generateMagnetUri;
function safeWebtorrentDestroy(webtorrent, torrentId, downloadedFile, torrentName) {
    return new Promise(res => {
        webtorrent.destroy(err => {
            if (torrentName) {
                logger_1.logger.debug('Removing %s torrent after webtorrent download.', torrentId);
                (0, fs_extra_1.remove)(torrentId)
                    .catch(err => logger_1.logger.error('Cannot remove torrent %s in webtorrent download.', torrentId, { err }));
            }
            if (downloadedFile)
                deleteDownloadedFile(downloadedFile);
            if (err)
                logger_1.logger.warn('Cannot destroy webtorrent in timeout.', { err });
            return res();
        });
    });
}
function deleteDownloadedFile(downloadedFile) {
    let pathToDelete = (0, path_1.dirname)(downloadedFile.filepath);
    if (pathToDelete === '.')
        pathToDelete = downloadedFile.filepath;
    const toRemovePath = (0, path_1.join)(downloadedFile.directoryPath, pathToDelete);
    logger_1.logger.debug('Removing %s after webtorrent download.', toRemovePath);
    (0, fs_extra_1.remove)(toRemovePath)
        .catch(err => logger_1.logger.error('Cannot remove torrent file %s in webtorrent download.', toRemovePath, { err }));
}
function buildAnnounceList() {
    return [
        [constants_1.WEBSERVER.WS + '://' + constants_1.WEBSERVER.HOSTNAME + ':' + constants_1.WEBSERVER.PORT + '/tracker/socket'],
        [constants_1.WEBSERVER.URL + '/tracker/announce']
    ];
}
function buildUrlList(video, videoFile) {
    return [videoFile.getFileUrl(video)];
}
