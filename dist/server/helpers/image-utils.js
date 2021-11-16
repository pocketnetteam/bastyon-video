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
    return uuid_1.buildUUID() + extension;
}
exports.generateImageFilename = generateImageFilename;
function processImage(path, destination, newSize, keepOriginal = false) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const extension = core_utils_1.getLowercaseExtension(path);
        if (path === destination) {
            throw new Error('Jimp/FFmpeg needs an input path different that the output path.');
        }
        logger_1.logger.debug('Processing image %s to %s.', path, destination);
        if (extension === '.gif') {
            yield ffmpeg_utils_1.processGIF(path, destination, newSize);
        }
        else {
            yield jimpProcessor(path, destination, newSize, extension);
        }
        if (keepOriginal !== true)
            yield fs_extra_1.remove(path);
    });
}
exports.processImage = processImage;
function jimpProcessor(path, destination, newSize, inputExt) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let jimpInstance;
        const inputBuffer = yield fs_extra_1.readFile(path);
        try {
            jimpInstance = yield jimp_1.read(inputBuffer);
        }
        catch (err) {
            logger_1.logger.debug('Cannot read %s with jimp. Try to convert the image using ffmpeg first.', path, { err });
            const newName = path + '.jpg';
            yield ffmpeg_utils_1.convertWebPToJPG(path, newName);
            yield fs_extra_1.rename(newName, path);
            jimpInstance = yield jimp_1.read(path);
        }
        yield fs_extra_1.remove(destination);
        const outputExt = core_utils_1.getLowercaseExtension(destination);
        if (skipProcessing({ jimpInstance, newSize, imageBytes: inputBuffer.byteLength, inputExt, outputExt })) {
            return fs_extra_1.copy(path, destination);
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
