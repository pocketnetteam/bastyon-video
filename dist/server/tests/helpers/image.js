"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const image_utils_1 = require("../../../server/helpers/image-utils");
const extra_utils_1 = require("../../../shared/extra-utils");
function checkBuffers(path1, path2, equals) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const [buf1, buf2] = yield Promise.all([
            (0, fs_extra_1.readFile)(path1),
            (0, fs_extra_1.readFile)(path2)
        ]);
        if (equals) {
            (0, chai_1.expect)(buf1.equals(buf2)).to.be.true;
        }
        else {
            (0, chai_1.expect)(buf1.equals(buf2)).to.be.false;
        }
    });
}
describe('Image helpers', function () {
    const imageDestDir = (0, path_1.join)((0, extra_utils_1.root)(), 'test-images');
    const imageDest = (0, path_1.join)(imageDestDir, 'test.jpg');
    const thumbnailSize = { width: 223, height: 122 };
    it('Should skip processing if the source image is okay', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const input = (0, extra_utils_1.buildAbsoluteFixturePath)('thumbnail.jpg');
            yield (0, image_utils_1.processImage)(input, imageDest, thumbnailSize, true);
            yield checkBuffers(input, imageDest, true);
        });
    });
    it('Should not skip processing if the source image does not have the appropriate extension', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const input = (0, extra_utils_1.buildAbsoluteFixturePath)('thumbnail.png');
            yield (0, image_utils_1.processImage)(input, imageDest, thumbnailSize, true);
            yield checkBuffers(input, imageDest, false);
        });
    });
    it('Should not skip processing if the source image does not have the appropriate size', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const input = (0, extra_utils_1.buildAbsoluteFixturePath)('preview.jpg');
            yield (0, image_utils_1.processImage)(input, imageDest, thumbnailSize, true);
            yield checkBuffers(input, imageDest, false);
        });
    });
    it('Should not skip processing if the source image does not have the appropriate size', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const input = (0, extra_utils_1.buildAbsoluteFixturePath)('thumbnail-big.jpg');
            yield (0, image_utils_1.processImage)(input, imageDest, thumbnailSize, true);
            yield checkBuffers(input, imageDest, false);
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, fs_extra_1.remove)(imageDest);
        });
    });
});
