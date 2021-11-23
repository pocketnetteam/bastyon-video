"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDirectoryIsEmpty = exports.checkTmpIsEmpty = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
function checkTmpIsEmpty(server) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield checkDirectoryIsEmpty(server, 'tmp', ['plugins-global.css', 'hls', 'resumable-uploads']);
        if (yield (0, fs_extra_1.pathExists)((0, path_1.join)('test' + server.internalServerNumber, 'tmp', 'hls'))) {
            yield checkDirectoryIsEmpty(server, 'tmp/hls');
        }
    });
}
exports.checkTmpIsEmpty = checkTmpIsEmpty;
function checkDirectoryIsEmpty(server, directory, exceptions = []) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const testDirectory = 'test' + server.internalServerNumber;
        const directoryPath = (0, path_1.join)((0, core_utils_1.root)(), testDirectory, directory);
        const directoryExists = yield (0, fs_extra_1.pathExists)(directoryPath);
        (0, chai_1.expect)(directoryExists).to.be.true;
        const files = yield (0, fs_extra_1.readdir)(directoryPath);
        const filtered = files.filter(f => exceptions.includes(f) === false);
        (0, chai_1.expect)(filtered).to.have.lengthOf(0);
    });
}
exports.checkDirectoryIsEmpty = checkDirectoryIsEmpty;
