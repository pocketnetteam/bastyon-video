"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoWithFramerate = exports.generateHighBitrateVideo = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fluent_ffmpeg_1 = tslib_1.__importDefault(require("fluent-ffmpeg"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const core_utils_1 = require("@shared/core-utils");
const tests_1 = require("./tests");
function ensureHasTooBigBitrate(fixturePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const bitrate = yield ffprobe_utils_1.getVideoFileBitrate(fixturePath);
        const dataResolution = yield ffprobe_utils_1.getVideoFileResolution(fixturePath);
        const fps = yield ffprobe_utils_1.getVideoFileFPS(fixturePath);
        const maxBitrate = core_utils_1.getMaxBitrate(Object.assign(Object.assign({}, dataResolution), { fps }));
        chai_1.expect(bitrate).to.be.above(maxBitrate);
    });
}
function generateHighBitrateVideo() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tempFixturePath = tests_1.buildAbsoluteFixturePath('video_high_bitrate_1080p.mp4', true);
        yield fs_extra_1.ensureDir(path_1.dirname(tempFixturePath));
        const exists = yield fs_extra_1.pathExists(tempFixturePath);
        if (!exists) {
            console.log('Generating high bitrate video.');
            return new Promise((res, rej) => {
                fluent_ffmpeg_1.default()
                    .outputOptions(['-f rawvideo', '-video_size 1920x1080', '-i /dev/urandom'])
                    .outputOptions(['-ac 2', '-f s16le', '-i /dev/urandom', '-t 10'])
                    .outputOptions(['-maxrate 10M', '-bufsize 10M'])
                    .output(tempFixturePath)
                    .on('error', rej)
                    .on('end', () => res(tempFixturePath))
                    .run();
            });
        }
        yield ensureHasTooBigBitrate(tempFixturePath);
        return tempFixturePath;
    });
}
exports.generateHighBitrateVideo = generateHighBitrateVideo;
function generateVideoWithFramerate(fps = 60) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tempFixturePath = tests_1.buildAbsoluteFixturePath(`video_${fps}fps.mp4`, true);
        yield fs_extra_1.ensureDir(path_1.dirname(tempFixturePath));
        const exists = yield fs_extra_1.pathExists(tempFixturePath);
        if (!exists) {
            console.log('Generating video with framerate %d.', fps);
            return new Promise((res, rej) => {
                fluent_ffmpeg_1.default()
                    .outputOptions(['-f rawvideo', '-video_size 1280x720', '-i /dev/urandom'])
                    .outputOptions(['-ac 2', '-f s16le', '-i /dev/urandom', '-t 10'])
                    .outputOptions([`-r ${fps}`])
                    .output(tempFixturePath)
                    .on('error', rej)
                    .on('end', () => res(tempFixturePath))
                    .run();
            });
        }
        return tempFixturePath;
    });
}
exports.generateVideoWithFramerate = generateVideoWithFramerate;
