"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildx264VODCommand = exports.resetSupportedEncoders = exports.getFFmpegVersion = exports.runCommand = exports.transcode = exports.generateImageFromVideoFile = exports.processGIF = exports.convertWebPToJPG = exports.buildStreamSuffix = exports.getLiveMuxingCommand = exports.getLiveTranscodingCommand = void 0;
const tslib_1 = require("tslib");
const fluent_ffmpeg_1 = (0, tslib_1.__importStar)(require("fluent-ffmpeg"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const constants_1 = require("@server/initializers/constants");
const core_utils_1 = require("@shared/core-utils");
const config_1 = require("../initializers/config");
const core_utils_2 = require("./core-utils");
const ffprobe_utils_1 = require("./ffprobe-utils");
const image_utils_1 = require("./image-utils");
const logger_1 = require("./logger");
let supportedEncoders;
function checkFFmpegEncoders(peertubeAvailableEncoders) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (supportedEncoders !== undefined) {
            return supportedEncoders;
        }
        const getAvailableEncodersPromise = (0, core_utils_2.promisify0)(fluent_ffmpeg_1.getAvailableEncoders);
        const availableFFmpegEncoders = yield getAvailableEncodersPromise();
        const searchEncoders = new Set();
        for (const type of ['live', 'vod']) {
            for (const streamType of ['audio', 'video']) {
                for (const encoder of peertubeAvailableEncoders.encodersToTry[type][streamType]) {
                    searchEncoders.add(encoder);
                }
            }
        }
        supportedEncoders = new Map();
        for (const searchEncoder of searchEncoders) {
            supportedEncoders.set(searchEncoder, availableFFmpegEncoders[searchEncoder] !== undefined);
        }
        logger_1.logger.info('Built supported ffmpeg encoders.', { supportedEncoders, searchEncoders });
        return supportedEncoders;
    });
}
function resetSupportedEncoders() {
    supportedEncoders = undefined;
}
exports.resetSupportedEncoders = resetSupportedEncoders;
function convertWebPToJPG(path, destination) {
    const command = (0, fluent_ffmpeg_1.default)(path, { niceness: constants_1.FFMPEG_NICE.THUMBNAIL })
        .output(destination);
    return runCommand({ command, silent: true });
}
exports.convertWebPToJPG = convertWebPToJPG;
function processGIF(path, destination, newSize) {
    const command = (0, fluent_ffmpeg_1.default)(path, { niceness: constants_1.FFMPEG_NICE.THUMBNAIL })
        .fps(20)
        .size(`${newSize.width}x${newSize.height}`)
        .output(destination);
    return runCommand({ command });
}
exports.processGIF = processGIF;
function generateImageFromVideoFile(fromPath, folder, imageName, size) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const pendingImageName = 'pending-' + imageName;
        const options = {
            filename: pendingImageName,
            count: 1,
            folder
        };
        const pendingImagePath = (0, path_1.join)(folder, pendingImageName);
        try {
            yield new Promise((res, rej) => {
                (0, fluent_ffmpeg_1.default)(fromPath, { niceness: constants_1.FFMPEG_NICE.THUMBNAIL })
                    .on('error', rej)
                    .on('end', () => res(imageName))
                    .thumbnail(options);
            });
            const destination = (0, path_1.join)(folder, imageName);
            yield (0, image_utils_1.processImage)(pendingImagePath, destination, size);
        }
        catch (err) {
            logger_1.logger.error('Cannot generate image from video %s.', fromPath, { err });
            try {
                yield (0, fs_extra_1.remove)(pendingImagePath);
            }
            catch (err) {
                logger_1.logger.debug('Cannot remove pending image path after generation error.', { err });
            }
        }
    });
}
exports.generateImageFromVideoFile = generateImageFromVideoFile;
const builders = {
    'quick-transcode': buildQuickTranscodeCommand,
    'hls': buildHLSVODCommand,
    'hls-from-ts': buildHLSVODFromTSCommand,
    'merge-audio': buildAudioMergeCommand,
    'only-audio': buildOnlyAudioCommand,
    'video': buildx264VODCommand
};
function transcode(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.debug('Will run transcode.', { options });
        let command = getFFmpeg(options.inputPath, 'vod')
            .output(options.outputPath);
        command = yield builders[options.type](command, options);
        yield runCommand({ command, job: options.job });
        yield fixHLSPlaylistIfNeeded(options);
    });
}
exports.transcode = transcode;
function getLiveTranscodingCommand(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { rtmpUrl, outPath, resolutions, fps, bitrate, availableEncoders, profile, masterPlaylistName, ratio } = options;
        const input = rtmpUrl;
        const command = getFFmpeg(input, 'live');
        const varStreamMap = [];
        const complexFilter = [
            {
                inputs: '[v:0]',
                filter: 'split',
                options: resolutions.length,
                outputs: resolutions.map(r => `vtemp${r}`)
            }
        ];
        command.outputOption('-sc_threshold 0');
        addDefaultEncoderGlobalParams({ command });
        for (let i = 0; i < resolutions.length; i++) {
            const resolution = resolutions[i];
            const resolutionFPS = (0, ffprobe_utils_1.computeFPS)(fps, resolution);
            const baseEncoderBuilderParams = {
                input,
                availableEncoders,
                profile,
                inputBitrate: bitrate,
                inputRatio: ratio,
                resolution,
                fps: resolutionFPS,
                streamNum: i,
                videoType: 'live'
            };
            {
                const streamType = 'video';
                const builderResult = yield getEncoderBuilderResult(Object.assign(Object.assign({}, baseEncoderBuilderParams), { streamType }));
                if (!builderResult) {
                    throw new Error('No available live video encoder found');
                }
                command.outputOption(`-map [vout${resolution}]`);
                addDefaultEncoderParams({ command, encoder: builderResult.encoder, fps: resolutionFPS, streamNum: i });
                logger_1.logger.debug('Apply ffmpeg live video params from %s using %s profile.', builderResult.encoder, profile, builderResult);
                command.outputOption(`${buildStreamSuffix('-c:v', i)} ${builderResult.encoder}`);
                applyEncoderOptions(command, builderResult.result);
                complexFilter.push({
                    inputs: `vtemp${resolution}`,
                    filter: getScaleFilter(builderResult.result),
                    options: `w=-2:h=${resolution}`,
                    outputs: `vout${resolution}`
                });
            }
            {
                const streamType = 'audio';
                const builderResult = yield getEncoderBuilderResult(Object.assign(Object.assign({}, baseEncoderBuilderParams), { streamType }));
                if (!builderResult) {
                    throw new Error('No available live audio encoder found');
                }
                command.outputOption('-map a:0');
                addDefaultEncoderParams({ command, encoder: builderResult.encoder, fps: resolutionFPS, streamNum: i });
                logger_1.logger.debug('Apply ffmpeg live audio params from %s using %s profile.', builderResult.encoder, profile, builderResult);
                command.outputOption(`${buildStreamSuffix('-c:a', i)} ${builderResult.encoder}`);
                applyEncoderOptions(command, builderResult.result);
            }
            varStreamMap.push(`v:${i},a:${i}`);
        }
        command.complexFilter(complexFilter);
        addDefaultLiveHLSParams(command, outPath, masterPlaylistName);
        command.outputOption('-var_stream_map', varStreamMap.join(' '));
        return command;
    });
}
exports.getLiveTranscodingCommand = getLiveTranscodingCommand;
function getLiveMuxingCommand(rtmpUrl, outPath, masterPlaylistName) {
    const command = getFFmpeg(rtmpUrl, 'live');
    command.outputOption('-c:v copy');
    command.outputOption('-c:a copy');
    command.outputOption('-map 0:a?');
    command.outputOption('-map 0:v?');
    addDefaultLiveHLSParams(command, outPath, masterPlaylistName);
    return command;
}
exports.getLiveMuxingCommand = getLiveMuxingCommand;
function buildStreamSuffix(base, streamNum) {
    if (streamNum !== undefined) {
        return `${base}:${streamNum}`;
    }
    return base;
}
exports.buildStreamSuffix = buildStreamSuffix;
function addDefaultEncoderGlobalParams(options) {
    const { command } = options;
    command.outputOption('-max_muxing_queue_size 1024')
        .outputOption('-map_metadata -1')
        .outputOption('-b_strategy 1')
        .outputOption('-bf 16')
        .outputOption('-pix_fmt yuv420p');
}
function addDefaultEncoderParams(options) {
    const { command, encoder, fps, streamNum } = options;
    if (encoder === 'libx264') {
        command.outputOption(buildStreamSuffix('-level:v', streamNum) + ' 3.1');
        if (fps) {
            command.outputOption(buildStreamSuffix('-g:v', streamNum) + ' ' + (fps * 2));
        }
    }
}
function addDefaultLiveHLSParams(command, outPath, masterPlaylistName) {
    command.outputOption('-hls_time ' + constants_1.VIDEO_LIVE.SEGMENT_TIME_SECONDS);
    command.outputOption('-hls_list_size ' + constants_1.VIDEO_LIVE.SEGMENTS_LIST_SIZE);
    command.outputOption('-hls_flags delete_segments+independent_segments');
    command.outputOption('-strftime 1');
    command.outputOption(`-hls_segment_filename ${(0, path_1.join)(outPath, '%v-%Y%m%d-%s.ts')}`);
    command.outputOption('-master_pl_name master.m3u8');
    command.outputOption('-hls_flags delete_segments');
    command.outputOption(`-f hls`);
    command.output((0, path_1.join)(outPath, '%v.m3u8'));
}
function buildx264VODCommand(command, options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(options.inputPath);
        fps = (0, ffprobe_utils_1.computeFPS)(fps, options.resolution);
        let scaleFilterValue;
        if (options.resolution !== undefined) {
            scaleFilterValue = options.isPortraitMode === true
                ? `w=${options.resolution}:h=-2`
                : `w=-2:h=${options.resolution}`;
        }
        command = yield presetVideo({ command, input: options.inputPath, transcodeOptions: options, fps, scaleFilterValue });
        return command;
    });
}
exports.buildx264VODCommand = buildx264VODCommand;
function buildAudioMergeCommand(command, options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        command = command.loop(undefined);
        const scaleFilterValue = getScaleCleanerValue();
        command = yield presetVideo({ command, input: options.audioPath, transcodeOptions: options, scaleFilterValue });
        command.outputOption('-preset:v veryfast');
        command = command.input(options.audioPath)
            .outputOption('-tune stillimage')
            .outputOption('-shortest');
        return command;
    });
}
function buildOnlyAudioCommand(command, _options) {
    command = presetOnlyAudio(command);
    return command;
}
function buildQuickTranscodeCommand(command) {
    command = presetCopy(command);
    command = command.outputOption('-map_metadata -1')
        .outputOption('-movflags faststart');
    return command;
}
function addCommonHLSVODCommandOptions(command, outputPath) {
    return command.outputOption('-hls_time 4')
        .outputOption('-hls_list_size 0')
        .outputOption('-hls_playlist_type vod')
        .outputOption('-hls_segment_filename ' + outputPath)
        .outputOption('-hls_segment_type fmp4')
        .outputOption('-f hls')
        .outputOption('-hls_flags single_file');
}
function buildHLSVODCommand(command, options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoPath = getHLSVideoPath(options);
        if (options.copyCodecs)
            command = presetCopy(command);
        else if (options.resolution === 0)
            command = presetOnlyAudio(command);
        else
            command = yield buildx264VODCommand(command, options);
        addCommonHLSVODCommandOptions(command, videoPath);
        return command;
    });
}
function buildHLSVODFromTSCommand(command, options) {
    const videoPath = getHLSVideoPath(options);
    command.outputOption('-c copy');
    if (options.isAAC) {
        command.outputOption('-bsf:a aac_adtstoasc');
    }
    addCommonHLSVODCommandOptions(command, videoPath);
    return command;
}
function fixHLSPlaylistIfNeeded(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (options.type !== 'hls' && options.type !== 'hls-from-ts')
            return;
        const fileContent = yield (0, fs_extra_1.readFile)(options.outputPath);
        const videoFileName = options.hlsPlaylist.videoFilename;
        const videoFilePath = getHLSVideoPath(options);
        const newContent = fileContent.toString()
            .replace(`#EXT-X-MAP:URI="${videoFilePath}",`, `#EXT-X-MAP:URI="${videoFileName}",`);
        yield (0, fs_extra_1.writeFile)(options.outputPath, newContent);
    });
}
function getHLSVideoPath(options) {
    return `${(0, path_1.dirname)(options.outputPath)}/${options.hlsPlaylist.videoFilename}`;
}
function getEncoderBuilderResult(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { availableEncoders, profile, streamType, videoType } = options;
        const encodersToTry = availableEncoders.encodersToTry[videoType][streamType];
        const encoders = availableEncoders.available[videoType];
        for (const encoder of encodersToTry) {
            if (!(yield checkFFmpegEncoders(availableEncoders)).get(encoder)) {
                logger_1.logger.debug('Encoder %s not available in ffmpeg, skipping.', encoder);
                continue;
            }
            if (!encoders[encoder]) {
                logger_1.logger.debug('Encoder %s not available in peertube encoders, skipping.', encoder);
                continue;
            }
            const builderProfiles = encoders[encoder];
            let builder = builderProfiles[profile];
            if (!builder) {
                logger_1.logger.debug('Profile %s for encoder %s not available. Fallback to default.', profile, encoder);
                builder = builderProfiles.default;
                if (!builder) {
                    logger_1.logger.debug('Default profile for encoder %s not available. Try next available encoder.', encoder);
                    continue;
                }
            }
            const result = yield builder((0, core_utils_1.pick)(options, ['input', 'resolution', 'inputBitrate', 'fps', 'inputRatio', 'streamNum']));
            return {
                result,
                encoder: result.copy === true
                    ? 'copy'
                    : encoder
            };
        }
        return null;
    });
}
function presetVideo(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { command, input, transcodeOptions, fps, scaleFilterValue } = options;
        let localCommand = command
            .format('mp4')
            .outputOption('-movflags faststart');
        addDefaultEncoderGlobalParams({ command });
        const probe = yield (0, ffprobe_utils_1.ffprobePromise)(input);
        const parsedAudio = yield (0, ffprobe_utils_1.getAudioStream)(input, probe);
        const bitrate = yield (0, ffprobe_utils_1.getVideoFileBitrate)(input, probe);
        const { ratio } = yield (0, ffprobe_utils_1.getVideoFileResolution)(input, probe);
        let streamsToProcess = ['audio', 'video'];
        if (!parsedAudio.audioStream) {
            localCommand = localCommand.noAudio();
            streamsToProcess = ['video'];
        }
        for (const streamType of streamsToProcess) {
            const { profile, resolution, availableEncoders } = transcodeOptions;
            const builderResult = yield getEncoderBuilderResult({
                streamType,
                input,
                resolution,
                availableEncoders,
                profile,
                fps,
                inputBitrate: bitrate,
                inputRatio: ratio,
                videoType: 'vod'
            });
            if (!builderResult) {
                throw new Error('No available encoder found for stream ' + streamType);
            }
            logger_1.logger.debug('Apply ffmpeg params from %s for %s stream of input %s using %s profile.', builderResult.encoder, streamType, input, profile, builderResult);
            if (streamType === 'video') {
                localCommand.videoCodec(builderResult.encoder);
                if (scaleFilterValue) {
                    localCommand.outputOption(`-vf ${getScaleFilter(builderResult.result)}=${scaleFilterValue}`);
                }
            }
            else if (streamType === 'audio') {
                localCommand.audioCodec(builderResult.encoder);
            }
            applyEncoderOptions(localCommand, builderResult.result);
            addDefaultEncoderParams({ command: localCommand, encoder: builderResult.encoder, fps });
        }
        return localCommand;
    });
}
function presetCopy(command) {
    return command
        .format('mp4')
        .videoCodec('copy')
        .audioCodec('copy');
}
function presetOnlyAudio(command) {
    return command
        .format('mp4')
        .audioCodec('copy')
        .noVideo();
}
function applyEncoderOptions(command, options) {
    var _a, _b;
    return command
        .inputOptions((_a = options.inputOptions) !== null && _a !== void 0 ? _a : [])
        .outputOptions((_b = options.outputOptions) !== null && _b !== void 0 ? _b : []);
}
function getScaleFilter(options) {
    if (options.scaleFilter)
        return options.scaleFilter.name;
    return 'scale';
}
function getFFmpeg(input, type) {
    const command = (0, fluent_ffmpeg_1.default)(input, {
        niceness: type === 'live' ? constants_1.FFMPEG_NICE.LIVE : constants_1.FFMPEG_NICE.VOD,
        cwd: config_1.CONFIG.STORAGE.TMP_DIR
    });
    const threads = type === 'live'
        ? config_1.CONFIG.LIVE.TRANSCODING.THREADS
        : config_1.CONFIG.TRANSCODING.THREADS;
    if (threads > 0) {
        command.outputOption('-threads ' + threads);
    }
    return command;
}
function getFFmpegVersion() {
    return new Promise((res, rej) => {
        (0, fluent_ffmpeg_1.default)()._getFfmpegPath((err, ffmpegPath) => {
            if (err)
                return rej(err);
            if (!ffmpegPath)
                return rej(new Error('Could not find ffmpeg path'));
            return (0, core_utils_2.execPromise)(`${ffmpegPath} -version`)
                .then(stdout => {
                const parsed = stdout.match(/ffmpeg version .?(\d+\.\d+(\.\d+)?)/);
                if (!parsed || !parsed[1])
                    return rej(new Error(`Could not find ffmpeg version in ${stdout}`));
                let version = parsed[1];
                if (version.match(/^\d+\.\d+$/)) {
                    version += '.0';
                }
                return res(version);
            })
                .catch(err => rej(err));
        });
    });
}
exports.getFFmpegVersion = getFFmpegVersion;
function runCommand(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { command, silent = false, job } = options;
        return new Promise((res, rej) => {
            let shellCommand;
            command.on('start', cmdline => { shellCommand = cmdline; });
            command.on('error', (err, stdout, stderr) => {
                if (silent !== true)
                    logger_1.logger.error('Error in ffmpeg.', { stdout, stderr });
                rej(err);
            });
            command.on('end', (stdout, stderr) => {
                logger_1.logger.debug('FFmpeg command ended.', { stdout, stderr, shellCommand });
                res();
            });
            if (job) {
                command.on('progress', progress => {
                    if (!progress.percent)
                        return;
                    job.progress(Math.round(progress.percent))
                        .catch(err => logger_1.logger.warn('Cannot set ffmpeg job progress.', { err }));
                });
            }
            command.run();
        });
    });
}
exports.runCommand = runCommand;
function getScaleCleanerValue() {
    return 'trunc(iw/2)*2:trunc(ih/2)*2';
}
