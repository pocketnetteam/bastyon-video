"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoFileImport = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const core_utils_1 = require("@server/helpers/core-utils");
const webtorrent_1 = require("@server/helpers/webtorrent");
const config_1 = require("@server/initializers/config");
const videos_1 = require("@server/lib/activitypub/videos");
const paths_1 = require("@server/lib/paths");
const video_1 = require("@server/lib/video");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const user_1 = require("@server/models/user/user");
const ffprobe_utils_1 = require("../../../helpers/ffprobe-utils");
const logger_1 = require("../../../helpers/logger");
const video_2 = require("../../../models/video/video");
const video_file_1 = require("../../../models/video/video-file");
const video_transcoding_1 = require("./video-transcoding");
function processVideoFileImport(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        logger_1.logger.info('Processing video file import in job %d.', job.id);
        const video = yield video_2.VideoModel.loadAndPopulateAccountAndServerAndTags(payload.videoUUID);
        if (!video) {
            logger_1.logger.info('Do not process job %d, video does not exist.', job.id);
            return undefined;
        }
        const data = yield (0, ffprobe_utils_1.getVideoFileResolution)(payload.filePath);
        yield updateVideoFile(video, payload.filePath);
        const user = yield user_1.UserModel.loadByChannelActorId(video.VideoChannel.actorId);
        yield (0, video_transcoding_1.createHlsJobIfEnabled)(user, {
            videoUUID: video.uuid,
            resolution: data.resolution,
            isPortraitMode: data.isPortraitMode,
            copyCodecs: true,
            isMaxQuality: false
        });
        if (config_1.CONFIG.OBJECT_STORAGE.ENABLED) {
            yield (0, video_1.addMoveToObjectStorageJob)(video);
        }
        else {
            yield (0, videos_1.federateVideoIfNeeded)(video, false);
        }
        return video;
    });
}
exports.processVideoFileImport = processVideoFileImport;
function updateVideoFile(video, inputFilePath) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { resolution } = yield (0, ffprobe_utils_1.getVideoFileResolution)(inputFilePath);
        const { size } = yield (0, fs_extra_1.stat)(inputFilePath);
        const fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(inputFilePath);
        const fileExt = (0, core_utils_1.getLowercaseExtension)(inputFilePath);
        const currentVideoFile = video.VideoFiles.find(videoFile => videoFile.resolution === resolution);
        if (currentVideoFile) {
            yield video.removeFileAndTorrent(currentVideoFile);
            video.VideoFiles = video.VideoFiles.filter(f => f !== currentVideoFile);
            yield currentVideoFile.destroy();
        }
        const newVideoFile = new video_file_1.VideoFileModel({
            resolution,
            extname: fileExt,
            filename: (0, paths_1.generateWebTorrentVideoFilename)(resolution, fileExt),
            storage: 0,
            size,
            fps,
            videoId: video.id
        });
        const outputPath = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(video, newVideoFile);
        yield (0, fs_extra_1.copy)(inputFilePath, outputPath);
        video.VideoFiles.push(newVideoFile);
        yield (0, webtorrent_1.createTorrentAndSetInfoHash)(video, newVideoFile);
        yield newVideoFile.save();
    });
}
