"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaxBitrate = exports.getAverageBitrate = void 0;
const averageBitPerPixel = {
    [0]: 0,
    [144]: 0.20,
    [240]: 0.17,
    [360]: 0.15,
    [480]: 0.12,
    [720]: 0.11,
    [1080]: 0.10,
    [1440]: 0.09,
    [2160]: 0.08
};
const maxBitPerPixel = {
    [0]: 0,
    [144]: 0.33,
    [240]: 0.29,
    [360]: 0.26,
    [480]: 0.22,
    [720]: 0.19,
    [1080]: 0.17,
    [1440]: 0.16,
    [2160]: 0.14
};
function getAverageBitrate(options) {
    const targetBitrate = calculateBitrate(Object.assign(Object.assign({}, options), { bitPerPixel: averageBitPerPixel }));
    if (!targetBitrate)
        return 192 * 1000;
    return targetBitrate;
}
exports.getAverageBitrate = getAverageBitrate;
function getMaxBitrate(options) {
    const targetBitrate = calculateBitrate(Object.assign(Object.assign({}, options), { bitPerPixel: maxBitPerPixel }));
    if (!targetBitrate)
        return 256 * 1000;
    return targetBitrate;
}
exports.getMaxBitrate = getMaxBitrate;
function calculateBitrate(options) {
    const { bitPerPixel, resolution, ratio, fps } = options;
    const resolutionsOrder = [
        2160,
        1440,
        1080,
        720,
        480,
        360,
        240,
        0
    ];
    for (const toTestResolution of resolutionsOrder) {
        if (toTestResolution <= resolution) {
            return Math.floor(resolution * resolution * ratio * fps * bitPerPixel[toTestResolution]);
        }
    }
    throw new Error('Unknown resolution ' + resolution);
}
