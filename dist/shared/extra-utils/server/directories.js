"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDirectoryIsEmpty = exports.checkTmpIsEmpty = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
function checkTmpIsEmpty(server) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield checkDirectoryIsEmpty(server, 'tmp', ['plugins-global.css', 'hls', 'resumable-uploads']);
        if (yield fs_extra_1.pathExists(path_1.join('test' + server.internalServerNumber, 'tmp', 'hls'))) {
            yield checkDirectoryIsEmpty(server, 'tmp/hls');
        }
    });
}
exports.checkTmpIsEmpty = checkTmpIsEmpty;
function checkDirectoryIsEmpty(server, directory, exceptions = []) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const testDirectory = 'test' + server.internalServerNumber;
        const directoryPath = path_1.join(core_utils_1.root(), testDirectory, directory);
        const directoryExists = yield fs_extra_1.pathExists(directoryPath);
        chai_1.expect(directoryExists).to.be.true;
        const files = yield fs_extra_1.readdir(directoryPath);
        const filtered = files.filter(f => exceptions.includes(f) === false);
        chai_1.expect(filtered).to.have.lengthOf(0);
    });
}
exports.checkDirectoryIsEmpty = checkDirectoryIsEmpty;
