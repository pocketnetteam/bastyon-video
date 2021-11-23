"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAudioVideofile = exports.transcodeNewWebTorrentResolution = exports.optimizeOriginalVideofile = exports.generateHlsPlaylistResolutionFromTS = exports.generateHlsPlaylistResolution = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const webtorrent_1 = require("@server/helpers/webtorrent");
const ffmpeg_utils_1 = require("../../helpers/ffmpeg-utils");
const ffprobe_utils_1 = require("../../helpers/ffprobe-utils");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const video_file_1 = require("../../models/video/video-file");
const video_streaming_playlist_1 = require("../../models/video/video-streaming-playlist");
const hls_1 = require("../hls");
const paths_1 = require("../paths");
const video_path_manager_1 = require("../video-path-manager");
const video_transcoding_profiles_1 = require("./video-transcoding-profiles");
function optimizeOriginalVideofile(video, inputVideoFile, job) {
    const transcodeDirectory = config_1.CONFIG.STORAGE.TMP_DIR;
    const newExtname = '.mp4';
    return video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(video, inputVideoFile, (videoInputPath) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoTranscodedPath = (0, path_1.join)(transcodeDirectory, video.id + '-transcoded' + newExtname);
        const transcodeType = (yield (0, ffprobe_utils_1.canDoQuickTranscode)(videoInputPath))
            ? 'quick-transcode'
            : 'video';
        const resolution = (0, core_utils_1.toEven)(inputVideoFile.resolution);
        const transcodeOptions = {
            type: transcodeType,
            inputPath: videoInputPath,
            outputPath: videoTranscodedPath,
            availableEncoders: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableEncoders(),
            profile: config_1.CONFIG.TRANSCODING.PROFILE,
            resolution,
            job
        };
        yield (0, ffmpeg_utils_1.transcode)(transcodeOptions);
        inputVideoFile.extname = newExtname;
        inputVideoFile.filename = (0, paths_1.generateWebTorrentVideoFilename)(resolution, newExtname);
        inputVideoFile.storage = 0;
        const videoOutputPath = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(video, inputVideoFile);
        const { videoFile } = yield onWebTorrentVideoFileTranscoding(video, inputVideoFile, videoTranscodedPath, videoOutputPath);
        yield (0, fs_extra_1.remove)(videoInputPath);
        return { transcodeType, videoFile };
    }));
}
exports.optimizeOriginalVideofile = optimizeOriginalVideofile;
function transcodeNewWebTorrentResolution(video, resolution, isPortrait, job) {
    const transcodeDirectory = config_1.CONFIG.STORAGE.TMP_DIR;
    const extname = '.mp4';
    return video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(video, video.getMaxQualityFile(), (videoInputPath) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const newVideoFile = new video_file_1.VideoFileModel({
            resolution,
            extname,
            filename: (0, paths_1.generateWebTorrentVideoFilename)(resolution, extname),
            size: 0,
            videoId: video.id
        });
        const videoOutputPath = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(video, newVideoFile);
        const videoTranscodedPath = (0, path_1.join)(transcodeDirectory, newVideoFile.filename);
        const transcodeOptions = resolution === 0
            ? {
                type: 'only-audio',
                inputPath: videoInputPath,
                outputPath: videoTranscodedPath,
                availableEncoders: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableEncoders(),
                profile: config_1.CONFIG.TRANSCODING.PROFILE,
                resolution,
                job
            }
            : {
                type: 'video',
                inputPath: videoInputPath,
                outputPath: videoTranscodedPath,
                availableEncoders: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableEncoders(),
                profile: config_1.CONFIG.TRANSCODING.PROFILE,
                resolution,
                isPortraitMode: isPortrait,
                job
            };
        yield (0, ffmpeg_utils_1.transcode)(transcodeOptions);
        return onWebTorrentVideoFileTranscoding(video, newVideoFile, videoTranscodedPath, videoOutputPath);
    }));
}
exports.transcodeNewWebTorrentResolution = transcodeNewWebTorrentResolution;
function mergeAudioVideofile(video, resolution, job) {
    const transcodeDirectory = config_1.CONFIG.STORAGE.TMP_DIR;
    const newExtname = '.mp4';
    const inputVideoFile = video.getMinQualityFile();
    return video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(video, inputVideoFile, (audioInputPath) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoTranscodedPath = (0, path_1.join)(transcodeDirectory, video.id + '-transcoded' + newExtname);
        const previewPath = video.getPreview().getPath();
        const tmpPreviewPath = (0, path_1.join)(config_1.CONFIG.STORAGE.TMP_DIR, (0, path_1.basename)(previewPath));
        yield (0, fs_extra_1.copyFile)(previewPath, tmpPreviewPath);
        const transcodeOptions = {
            type: 'merge-audio',
            inputPath: tmpPreviewPath,
            outputPath: videoTranscodedPath,
            availableEncoders: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableEncoders(),
            profile: config_1.CONFIG.TRANSCODING.PROFILE,
            audioPath: audioInputPath,
            resolution,
            job
        };
        try {
            yield (0, ffmpeg_utils_1.transcode)(transcodeOptions);
            yield (0, fs_extra_1.remove)(audioInputPath);
            yield (0, fs_extra_1.remove)(tmpPreviewPath);
        }
        catch (err) {
            yield (0, fs_extra_1.remove)(tmpPreviewPath);
            throw err;
        }
        inputVideoFile.extname = newExtname;
        inputVideoFile.filename = (0, paths_1.generateWebTorrentVideoFilename)(inputVideoFile.resolution, newExtname);
        const videoOutputPath = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(video, inputVideoFile);
        video.duration = yield (0, ffprobe_utils_1.getDurationFromVideoFile)(videoTranscodedPath);
        yield video.save();
        return onWebTorrentVideoFileTranscoding(video, inputVideoFile, videoTranscodedPath, videoOutputPath);
    }));
}
exports.mergeAudioVideofile = mergeAudioVideofile;
function generateHlsPlaylistResolutionFromTS(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        return generateHlsPlaylistCommon({
            video: options.video,
            resolution: options.resolution,
            isPortraitMode: options.isPortraitMode,
            inputPath: options.concatenatedTsFilePath,
            type: 'hls-from-ts',
            isAAC: options.isAAC
        });
    });
}
exports.generateHlsPlaylistResolutionFromTS = generateHlsPlaylistResolutionFromTS;
function generateHlsPlaylistResolution(options) {
    return generateHlsPlaylistCommon({
        video: options.video,
        resolution: options.resolution,
        copyCodecs: options.copyCodecs,
        isPortraitMode: options.isPortraitMode,
        inputPath: options.videoInputPath,
        type: 'hls',
        job: options.job
    });
}
exports.generateHlsPlaylistResolution = generateHlsPlaylistResolution;
function onWebTorrentVideoFileTranscoding(video, videoFile, transcodingPath, outputPath) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const stats = yield (0, fs_extra_1.stat)(transcodingPath);
        const fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(transcodingPath);
        const metadata = yield (0, ffprobe_utils_1.getMetadataFromFile)(transcodingPath);
        yield (0, fs_extra_1.move)(transcodingPath, outputPath, { overwrite: true });
        videoFile.size = stats.size;
        videoFile.fps = fps;
        videoFile.metadata = metadata;
        yield (0, webtorrent_1.createTorrentAndSetInfoHash)(video, videoFile);
        yield video_file_1.VideoFileModel.customUpsert(videoFile, 'video', undefined);
        video.VideoFiles = yield video.$get('VideoFiles');
        return { video, videoFile };
    });
}
function generateHlsPlaylistCommon(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { type, video, inputPath, resolution, copyCodecs, isPortraitMode, isAAC, job } = options;
        const transcodeDirectory = config_1.CONFIG.STORAGE.TMP_DIR;
        const videoTranscodedBasePath = (0, path_1.join)(transcodeDirectory, type);
        yield (0, fs_extra_1.ensureDir)(videoTranscodedBasePath);
        const videoFilename = (0, paths_1.generateHLSVideoFilename)(resolution);
        const resolutionPlaylistFilename = (0, paths_1.getHlsResolutionPlaylistFilename)(videoFilename);
        const resolutionPlaylistFileTranscodePath = (0, path_1.join)(videoTranscodedBasePath, resolutionPlaylistFilename);
        const transcodeOptions = {
            type,
            inputPath,
            outputPath: resolutionPlaylistFileTranscodePath,
            availableEncoders: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableEncoders(),
            profile: config_1.CONFIG.TRANSCODING.PROFILE,
            resolution,
            copyCodecs,
            isPortraitMode,
            isAAC,
            hlsPlaylist: {
                videoFilename
            },
            job
        };
        yield (0, ffmpeg_utils_1.transcode)(transcodeOptions);
        const playlist = yield video_streaming_playlist_1.VideoStreamingPlaylistModel.loadOrGenerate(video);
        if (!playlist.playlistFilename) {
            playlist.playlistFilename = (0, paths_1.generateHLSMasterPlaylistFilename)(video.isLive);
        }
        if (!playlist.segmentsSha256Filename) {
            playlist.segmentsSha256Filename = (0, paths_1.generateHlsSha256SegmentsFilename)(video.isLive);
        }
        playlist.p2pMediaLoaderInfohashes = [];
        playlist.p2pMediaLoaderPeerVersion = constants_1.P2P_MEDIA_LOADER_PEER_VERSION;
        playlist.type = 1;
        yield playlist.save();
        const extname = (0, path_1.extname)(videoFilename);
        const newVideoFile = new video_file_1.VideoFileModel({
            resolution,
            extname,
            size: 0,
            filename: videoFilename,
            fps: -1,
            videoStreamingPlaylistId: playlist.id
        });
        const videoFilePath = video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(playlist, newVideoFile);
        yield (0, fs_extra_1.ensureDir)(video_path_manager_1.VideoPathManager.Instance.getFSHLSOutputPath(video));
        const resolutionPlaylistPath = video_path_manager_1.VideoPathManager.Instance.getFSHLSOutputPath(video, resolutionPlaylistFilename);
        yield (0, fs_extra_1.move)(resolutionPlaylistFileTranscodePath, resolutionPlaylistPath, { overwrite: true });
        yield (0, fs_extra_1.move)((0, path_1.join)(videoTranscodedBasePath, videoFilename), videoFilePath, { overwrite: true });
        const stats = yield (0, fs_extra_1.stat)(videoFilePath);
        newVideoFile.size = stats.size;
        newVideoFile.fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(videoFilePath);
        newVideoFile.metadata = yield (0, ffprobe_utils_1.getMetadataFromFile)(videoFilePath);
        yield (0, webtorrent_1.createTorrentAndSetInfoHash)(playlist, newVideoFile);
        const savedVideoFile = yield video_file_1.VideoFileModel.customUpsert(newVideoFile, 'streaming-playlist', undefined);
        const playlistWithFiles = playlist;
        playlistWithFiles.VideoFiles = yield playlist.$get('VideoFiles');
        playlist.assignP2PMediaLoaderInfoHashes(video, playlistWithFiles.VideoFiles);
        yield playlist.save();
        video.setHLSPlaylist(playlist);
        yield (0, hls_1.updateMasterHLSPlaylist)(video, playlistWithFiles);
        yield (0, hls_1.updateSha256VODSegments)(video, playlistWithFiles);
        return { resolutionPlaylistPath, videoFile: savedVideoFile };
    });
}
