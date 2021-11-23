"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = exports.generateImageFilename = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const jimp_1 = require("jimp");
const core_utils_1 = require("./core-utils");
const ffmpeg_utils_1 = require("./ffmpeg-utils");
const logger_1 = require("./logger");
const uuid_1 = require("./uuid");
function generateImageFilename(extension = '.jpg') {
    return (0, uuid_1.buildUUID)() + extension;
}
exports.generateImageFilename = generateImageFilename;
function processImage(path, destination, newSize, keepOriginal = false) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const extension = (0, core_utils_1.getLowercaseExtension)(path);
        if (path === destination) {
            throw new Error('Jimp/FFmpeg needs an input path different that the output path.');
        }
        logger_1.logger.debug('Processing image %s to %s.', path, destination);
        if (extension === '.gif') {
            yield (0, ffmpeg_utils_1.processGIF)(path, destination, newSize);
        }
        else {
            yield jimpProcessor(path, destination, newSize, extension);
        }
        if (keepOriginal !== true)
            yield (0, fs_extra_1.remove)(path);
    });
}
exports.processImage = processImage;
function jimpProcessor(path, destination, newSize, inputExt) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let jimpInstance;
        const inputBuffer = yield (0, fs_extra_1.readFile)(path);
        try {
            jimpInstance = yield (0, jimp_1.read)(inputBuffer);
        }
        catch (err) {
            logger_1.logger.debug('Cannot read %s with jimp. Try to convert the image using ffmpeg first.', path, { err });
            const newName = path + '.jpg';
            yield (0, ffmpeg_utils_1.convertWebPToJPG)(path, newName);
            yield (0, fs_extra_1.rename)(newName, path);
            jimpInstance = yield (0, jimp_1.read)(path);
        }
        yield (0, fs_extra_1.remove)(destination);
        const outputExt = (0, core_utils_1.getLowercaseExtension)(destination);
        if (skipProcessing({ jimpInstance, newSize, imageBytes: inputBuffer.byteLength, inputExt, outputExt })) {
            return (0, fs_extra_1.copy)(path, destination);
        }
        yield jimpInstance
            .quality(95)
            .writeAsync(destination);
    });
}
function skipProcessing(options) {
    const { jimpInstance, newSize, imageBytes, inputExt, outputExt } = options;
    const { width, height } = newSize;
    if (jimpInstance.getWidth() > width || jimpInstance.getHeight() > height)
        return false;
    if (inputExt !== outputExt)
        return false;
    const kB = 1000;
    if (height >= 1000)
        return imageBytes <= 200 * kB;
    if (height >= 500)
        return imageBytes <= 100 * kB;
    return imageBytes <= 15 * kB;
}
