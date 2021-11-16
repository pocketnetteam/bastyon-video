"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMoveToObjectStorage = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const logger_1 = require("@server/helpers/logger");
const webtorrent_1 = require("@server/helpers/webtorrent");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const object_storage_1 = require("@server/lib/object-storage");
const paths_1 = require("@server/lib/paths");
const video_state_1 = require("@server/lib/video-state");
const video_1 = require("@server/models/video/video");
const video_job_info_1 = require("@server/models/video/video-job-info");
function processMoveToObjectStorage(job) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const payload = job.data;
        logger_1.logger.info('Moving video %s in job %d.', payload.videoUUID, job.id);
        const video = yield video_1.VideoModel.loadWithFiles(payload.videoUUID);
        if (!video) {
            logger_1.logger.info('Can\'t process job %d, video does not exist.', job.id);
            return undefined;
        }
        if (video.VideoFiles) {
            yield moveWebTorrentFiles(video);
        }
        if (video.VideoStreamingPlaylists) {
            yield moveHLSFiles(video);
        }
        const pendingMove = yield video_job_info_1.VideoJobInfoModel.decrease(video.uuid, 'pendingMove');
        if (pendingMove === 0) {
            logger_1.logger.info('Running cleanup after moving files to object storage (video %s in job %d)', video.uuid, job.id);
            yield doAfterLastJob(video, payload.isNewVideo);
        }
        return payload.videoUUID;
    });
}
exports.processMoveToObjectStorage = processMoveToObjectStorage;
function moveWebTorrentFiles(video) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const file of video.VideoFiles) {
            if (file.storage !== 0)
                continue;
            const fileUrl = yield object_storage_1.storeWebTorrentFile(file.filename);
            const oldPath = path_1.join(config_1.CONFIG.STORAGE.VIDEOS_DIR, file.filename);
            yield onFileMoved({ videoOrPlaylist: video, file, fileUrl, oldPath });
        }
    });
}
function moveHLSFiles(video) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const playlist of video.VideoStreamingPlaylists) {
            for (const file of playlist.VideoFiles) {
                if (file.storage !== 0)
                    continue;
                const playlistFilename = paths_1.getHlsResolutionPlaylistFilename(file.filename);
                yield object_storage_1.storeHLSFile(playlist, video, playlistFilename);
                const fileUrl = yield object_storage_1.storeHLSFile(playlist, video, file.filename);
                const oldPath = path_1.join(paths_1.getHLSDirectory(video), file.filename);
                yield onFileMoved({ videoOrPlaylist: Object.assign(playlist, { Video: video }), file, fileUrl, oldPath });
            }
        }
    });
}
function doAfterLastJob(video, isNewVideo) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const playlist of video.VideoStreamingPlaylists) {
            if (playlist.storage === 1)
                continue;
            playlist.playlistUrl = yield object_storage_1.storeHLSFile(playlist, video, playlist.playlistFilename);
            playlist.segmentsSha256Url = yield object_storage_1.storeHLSFile(playlist, video, playlist.segmentsSha256Filename);
            playlist.storage = 1;
            playlist.assignP2PMediaLoaderInfoHashes(video, playlist.VideoFiles);
            playlist.p2pMediaLoaderPeerVersion = constants_1.P2P_MEDIA_LOADER_PEER_VERSION;
            yield playlist.save();
        }
        if (video.VideoStreamingPlaylists) {
            yield fs_extra_1.remove(paths_1.getHLSDirectory(video));
        }
        yield video_state_1.moveToNextState(video, isNewVideo);
    });
}
function onFileMoved(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { videoOrPlaylist, file, fileUrl, oldPath } = options;
        file.fileUrl = fileUrl;
        file.storage = 1;
        yield webtorrent_1.updateTorrentUrls(videoOrPlaylist, file);
        yield file.save();
        logger_1.logger.debug('Removing %s because it\'s now on object storage', oldPath);
        yield fs_extra_1.remove(oldPath);
    });
}
