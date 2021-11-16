"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoTranscodingProfilesManager = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const core_utils_1 = require("@shared/core-utils");
const ffmpeg_utils_1 = require("../../helpers/ffmpeg-utils");
const ffprobe_utils_1 = require("../../helpers/ffprobe-utils");
const defaultX264VODOptionsBuilder = (options) => {
    const { fps, inputRatio, inputBitrate } = options;
    if (!fps)
        return { outputOptions: [] };
    const targetBitrate = capBitrate(inputBitrate, core_utils_1.getAverageBitrate(Object.assign(Object.assign({}, options), { fps, ratio: inputRatio })));
    return {
        outputOptions: [
            `-preset veryfast`,
            `-r ${fps}`,
            `-maxrate ${targetBitrate}`,
            `-bufsize ${targetBitrate * 2}`
        ]
    };
};
const defaultX264LiveOptionsBuilder = (options) => {
    const { streamNum, fps, inputBitrate, inputRatio } = options;
    const targetBitrate = capBitrate(inputBitrate, core_utils_1.getAverageBitrate(Object.assign(Object.assign({}, options), { fps, ratio: inputRatio })));
    return {
        outputOptions: [
            `-preset ultrafast`,
            `${ffmpeg_utils_1.buildStreamSuffix('-r:v', streamNum)} ${fps}`,
            `${ffmpeg_utils_1.buildStreamSuffix('-b:v', streamNum)} ${targetBitrate}`,
            `-maxrate ${targetBitrate}`,
            `-bufsize ${targetBitrate * 2}`,
            `-tune fastdecode`
        ]
    };
};
const defaultAACOptionsBuilder = ({ input, streamNum }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const probe = yield ffprobe_utils_1.ffprobePromise(input);
    if (yield ffprobe_utils_1.canDoQuickAudioTranscode(input, probe)) {
        logger_1.logger.debug('Copy audio stream %s by AAC encoder.', input);
        return { copy: true, outputOptions: [] };
    }
    const parsedAudio = yield ffprobe_utils_1.getAudioStream(input, probe);
    const audioCodecName = parsedAudio.audioStream['codec_name'];
    const bitrate = ffprobe_utils_1.getMaxAudioBitrate(audioCodecName, parsedAudio.bitrate);
    logger_1.logger.debug('Calculating audio bitrate of %s by AAC encoder.', input, { bitrate: parsedAudio.bitrate, audioCodecName });
    if (bitrate !== undefined && bitrate !== -1) {
        return { outputOptions: [ffmpeg_utils_1.buildStreamSuffix('-b:a', streamNum), bitrate + 'k'] };
    }
    return { outputOptions: [] };
});
const defaultLibFDKAACVODOptionsBuilder = ({ streamNum }) => {
    return { outputOptions: [ffmpeg_utils_1.buildStreamSuffix('-q:a', streamNum), '5'] };
};
class VideoTranscodingProfilesManager {
    constructor() {
        this.encodersPriorities = {
            vod: this.buildDefaultEncodersPriorities(),
            live: this.buildDefaultEncodersPriorities()
        };
        this.availableEncoders = {
            vod: {
                libx264: {
                    default: defaultX264VODOptionsBuilder
                },
                aac: {
                    default: defaultAACOptionsBuilder
                },
                libfdk_aac: {
                    default: defaultLibFDKAACVODOptionsBuilder
                }
            },
            live: {
                libx264: {
                    default: defaultX264LiveOptionsBuilder
                },
                aac: {
                    default: defaultAACOptionsBuilder
                }
            }
        };
        this.availableProfiles = {
            vod: [],
            live: []
        };
        this.buildAvailableProfiles();
    }
    getAvailableEncoders() {
        return {
            available: this.availableEncoders,
            encodersToTry: {
                vod: {
                    video: this.getEncodersByPriority('vod', 'video'),
                    audio: this.getEncodersByPriority('vod', 'audio')
                },
                live: {
                    video: this.getEncodersByPriority('live', 'video'),
                    audio: this.getEncodersByPriority('live', 'audio')
                }
            }
        };
    }
    getAvailableProfiles(type) {
        return this.availableProfiles[type];
    }
    addProfile(options) {
        const { type, encoder, profile, builder } = options;
        const encoders = this.availableEncoders[type];
        if (!encoders[encoder])
            encoders[encoder] = {};
        encoders[encoder][profile] = builder;
        this.buildAvailableProfiles();
    }
    removeProfile(options) {
        const { type, encoder, profile } = options;
        delete this.availableEncoders[type][encoder][profile];
        this.buildAvailableProfiles();
    }
    addEncoderPriority(type, streamType, encoder, priority) {
        this.encodersPriorities[type][streamType].push({ name: encoder, priority });
        ffmpeg_utils_1.resetSupportedEncoders();
    }
    removeEncoderPriority(type, streamType, encoder, priority) {
        this.encodersPriorities[type][streamType] = this.encodersPriorities[type][streamType]
            .filter(o => o.name !== encoder && o.priority !== priority);
        ffmpeg_utils_1.resetSupportedEncoders();
    }
    getEncodersByPriority(type, streamType) {
        return this.encodersPriorities[type][streamType]
            .sort((e1, e2) => {
            if (e1.priority > e2.priority)
                return -1;
            else if (e1.priority === e2.priority)
                return 0;
            return 1;
        })
            .map(e => e.name);
    }
    buildAvailableProfiles() {
        for (const type of ['vod', 'live']) {
            const result = new Set();
            const encoders = this.availableEncoders[type];
            for (const encoderName of Object.keys(encoders)) {
                for (const profile of Object.keys(encoders[encoderName])) {
                    result.add(profile);
                }
            }
            this.availableProfiles[type] = Array.from(result);
        }
        logger_1.logger.debug('Available transcoding profiles built.', { availableProfiles: this.availableProfiles });
    }
    buildDefaultEncodersPriorities() {
        return {
            video: [
                { name: 'libx264', priority: 100 }
            ],
            audio: [
                { name: 'libfdk_aac', priority: 200 },
                { name: 'aac', priority: 100 }
            ]
        };
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.VideoTranscodingProfilesManager = VideoTranscodingProfilesManager;
function capBitrate(inputBitrate, targetBitrate) {
    if (!inputBitrate)
        return targetBitrate;
    const inputBitrateWithMargin = inputBitrate + (inputBitrate * 0.3);
    return Math.min(targetBitrate, inputBitrateWithMargin);
}
