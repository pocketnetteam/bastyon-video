"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadRouter = void 0;
const tslib_1 = require("tslib");
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const logger_1 = require("@server/helpers/logger");
const videos_torrent_cache_1 = require("@server/lib/files-cache/videos-torrent-cache");
const hooks_1 = require("@server/lib/plugins/hooks");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const models_1 = require("@shared/models");
const constants_1 = require("../initializers/constants");
const middlewares_1 = require("../middlewares");
const downloadRouter = express_1.default.Router();
exports.downloadRouter = downloadRouter;
downloadRouter.use(cors_1.default());
downloadRouter.use(constants_1.STATIC_DOWNLOAD_PATHS.TORRENTS + ':filename', middlewares_1.asyncMiddleware(downloadTorrent));
downloadRouter.use(constants_1.STATIC_DOWNLOAD_PATHS.VIDEOS + ':id-:resolution([0-9]+).:extension', middlewares_1.asyncMiddleware(middlewares_1.videosDownloadValidator), middlewares_1.asyncMiddleware(downloadVideoFile));
downloadRouter.use(constants_1.STATIC_DOWNLOAD_PATHS.HLS_VIDEOS + ':id-:resolution([0-9]+)-fragmented.:extension', middlewares_1.asyncMiddleware(middlewares_1.videosDownloadValidator), middlewares_1.asyncMiddleware(downloadHLSVideoFile));
function downloadTorrent(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield videos_torrent_cache_1.VideosTorrentCache.Instance.getFilePath(req.params.filename);
        if (!result) {
            return res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Torrent file not found'
            });
        }
        const allowParameters = { torrentPath: result.path, downloadName: result.downloadName };
        const allowedResult = yield hooks_1.Hooks.wrapFun(isTorrentDownloadAllowed, allowParameters, 'filter:api.download.torrent.allowed.result');
        if (!checkAllowResult(res, allowParameters, allowedResult))
            return;
        return res.download(result.path, result.downloadName);
    });
}
function downloadVideoFile(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const video = res.locals.videoAll;
        const videoFile = getVideoFile(req, video.VideoFiles);
        if (!videoFile) {
            return res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video file not found'
            });
        }
        const allowParameters = { video, videoFile };
        const allowedResult = yield hooks_1.Hooks.wrapFun(isVideoDownloadAllowed, allowParameters, 'filter:api.download.video.allowed.result');
        if (!checkAllowResult(res, allowParameters, allowedResult))
            return;
        if (videoFile.storage === 1) {
            return res.redirect(videoFile.getObjectStorageUrl());
        }
        yield video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(video, videoFile, path => {
            const filename = `${video.name}-${videoFile.resolution}p${videoFile.extname}`;
            return res.download(path, filename);
        });
    });
}
function downloadHLSVideoFile(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const video = res.locals.videoAll;
        const streamingPlaylist = getHLSPlaylist(video);
        if (!streamingPlaylist)
            return res.status(models_1.HttpStatusCode.NOT_FOUND_404).end;
        const videoFile = getVideoFile(req, streamingPlaylist.VideoFiles);
        if (!videoFile) {
            return res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video file not found'
            });
        }
        const allowParameters = { video, streamingPlaylist, videoFile };
        const allowedResult = yield hooks_1.Hooks.wrapFun(isVideoDownloadAllowed, allowParameters, 'filter:api.download.video.allowed.result');
        if (!checkAllowResult(res, allowParameters, allowedResult))
            return;
        if (videoFile.storage === 1) {
            return res.redirect(videoFile.getObjectStorageUrl());
        }
        yield video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(streamingPlaylist, videoFile, path => {
            const filename = `${video.name}-${videoFile.resolution}p-${streamingPlaylist.getStringType()}${videoFile.extname}`;
            return res.download(path, filename);
        });
    });
}
function getVideoFile(req, files) {
    const resolution = parseInt(req.params.resolution, 10);
    return files.find(f => f.resolution === resolution);
}
function getHLSPlaylist(video) {
    const playlist = video.VideoStreamingPlaylists.find(p => p.type === 1);
    if (!playlist)
        return undefined;
    return Object.assign(playlist, { Video: video });
}
function isTorrentDownloadAllowed(_object) {
    return { allowed: true };
}
function isVideoDownloadAllowed(_object) {
    return { allowed: true };
}
function checkAllowResult(res, allowParameters, result) {
    if (!result || result.allowed !== true) {
        logger_1.logger.info('Download is not allowed.', { result, allowParameters });
        res.fail({
            status: models_1.HttpStatusCode.FORBIDDEN_403,
            message: (result === null || result === void 0 ? void 0 : result.errorMessage) || 'Refused download'
        });
        return false;
    }
    return true;
}
