"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoLiveEnding = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const constants_1 = require("@server/initializers/constants");
const live_1 = require("@server/lib/live");
const paths_1 = require("@server/lib/paths");
const thumbnail_1 = require("@server/lib/thumbnail");
const video_transcoding_1 = require("@server/lib/transcoding/video-transcoding");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const video_state_1 = require("@server/lib/video-state");
const video_1 = require("@server/models/video/video");
const video_file_1 = require("@server/models/video/video-file");
const video_live_1 = require("@server/models/video/video-live");
const video_streaming_playlist_1 = require("@server/models/video/video-streaming-playlist");
const logger_1 = require("../../../helpers/logger");
function processVideoLiveEnding(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        function logError() {
            logger_1.logger.warn('Video live %d does not exist anymore. Cannot process live ending.', payload.videoId);
        }
        const video = yield video_1.VideoModel.load(payload.videoId);
        const live = yield video_live_1.VideoLiveModel.loadByVideoId(payload.videoId);
        if (!video || !live) {
            logError();
            return;
        }
        const streamingPlaylist = yield video_streaming_playlist_1.VideoStreamingPlaylistModel.loadHLSPlaylistByVideo(video.id);
        if (!streamingPlaylist) {
            logError();
            return;
        }
        live_1.LiveSegmentShaStore.Instance.cleanupShaSegments(video.uuid);
        if (live.saveReplay !== true) {
            return (0, live_1.cleanupLive)(video, streamingPlaylist);
        }
        return saveLive(video, live, streamingPlaylist);
    });
}
exports.processVideoLiveEnding = processVideoLiveEnding;
function saveLive(video, live, streamingPlaylist) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const replayDirectory = video_path_manager_1.VideoPathManager.Instance.getFSHLSOutputPath(video, constants_1.VIDEO_LIVE.REPLAY_DIRECTORY);
        const rootFiles = yield (0, fs_extra_1.readdir)((0, paths_1.getLiveDirectory)(video));
        const playlistFiles = rootFiles.filter(file => {
            return file.endsWith('.m3u8') && file !== streamingPlaylist.playlistFilename;
        });
        yield cleanupTMPLiveFiles((0, paths_1.getLiveDirectory)(video));
        yield live.destroy();
        video.isLive = false;
        video.views = 0;
        video.state = 2;
        yield video.save();
        const videoWithFiles = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(video.id);
        const hlsPlaylist = videoWithFiles.getHLSPlaylist();
        yield video_file_1.VideoFileModel.removeHLSFilesOfVideoId(hlsPlaylist.id);
        hlsPlaylist.VideoFiles = [];
        hlsPlaylist.playlistFilename = (0, paths_1.generateHLSMasterPlaylistFilename)();
        hlsPlaylist.segmentsSha256Filename = (0, paths_1.generateHlsSha256SegmentsFilename)();
        yield hlsPlaylist.save();
        let durationDone = false;
        for (const playlistFile of playlistFiles) {
            const concatenatedTsFile = (0, live_1.buildConcatenatedName)(playlistFile);
            const concatenatedTsFilePath = (0, path_1.join)(replayDirectory, concatenatedTsFile);
            const probe = yield (0, ffprobe_utils_1.ffprobePromise)(concatenatedTsFilePath);
            const { audioStream } = yield (0, ffprobe_utils_1.getAudioStream)(concatenatedTsFilePath, probe);
            const { resolution, isPortraitMode } = yield (0, ffprobe_utils_1.getVideoFileResolution)(concatenatedTsFilePath, probe);
            const { resolutionPlaylistPath: outputPath } = yield (0, video_transcoding_1.generateHlsPlaylistResolutionFromTS)({
                video: videoWithFiles,
                concatenatedTsFilePath,
                resolution,
                isPortraitMode,
                isAAC: (audioStream === null || audioStream === void 0 ? void 0 : audioStream.codec_name) === 'aac'
            });
            if (!durationDone) {
                videoWithFiles.duration = yield (0, ffprobe_utils_1.getDurationFromVideoFile)(outputPath);
                yield videoWithFiles.save();
                durationDone = true;
            }
        }
        yield (0, fs_extra_1.remove)(replayDirectory);
        if (videoWithFiles.getMiniature().automaticallyGenerated === true) {
            yield (0, thumbnail_1.generateVideoMiniature)({
                video: videoWithFiles,
                videoFile: videoWithFiles.getMaxQualityFile(),
                type: 1
            });
        }
        if (videoWithFiles.getPreview().automaticallyGenerated === true) {
            yield (0, thumbnail_1.generateVideoMiniature)({
                video: videoWithFiles,
                videoFile: videoWithFiles.getMaxQualityFile(),
                type: 2
            });
        }
        yield (0, video_state_1.moveToNextState)(videoWithFiles, false);
    });
}
function cleanupTMPLiveFiles(hlsDirectory) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!(yield (0, fs_extra_1.pathExists)(hlsDirectory)))
            return;
        const files = yield (0, fs_extra_1.readdir)(hlsDirectory);
        for (const filename of files) {
            if (filename.endsWith('.ts') ||
                filename.endsWith('.m3u8') ||
                filename.endsWith('.mpd') ||
                filename.endsWith('.m4s') ||
                filename.endsWith('.tmp')) {
                const p = (0, path_1.join)(hlsDirectory, filename);
                (0, fs_extra_1.remove)(p)
                    .catch(err => logger_1.logger.error('Cannot remove %s.', p, { err }));
            }
        }
    });
}
