"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPlaylistFilesWereRemoved = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const miscs_1 = require("../miscs");
function checkPlaylistFilesWereRemoved(playlistUUID, internalServerNumber, directories = ['thumbnails']) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const testDirectory = 'test' + internalServerNumber;
        for (const directory of directories) {
            const directoryPath = (0, path_1.join)((0, miscs_1.root)(), testDirectory, directory);
            const files = yield (0, fs_extra_1.readdir)(directoryPath);
            for (const file of files) {
                (0, chai_1.expect)(file).to.not.contain(playlistUUID);
            }
        }
    });
}
exports.checkPlaylistFilesWereRemoved = checkPlaylistFilesWereRemoved;
