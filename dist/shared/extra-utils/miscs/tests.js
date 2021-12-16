"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = exports.wait = exports.areObjectStorageTestsDisabled = exports.buildRequestStub = exports.getFileSize = exports.buildAbsoluteFixturePath = exports.areHttpImportTestsDisabled = exports.isGithubCI = exports.parallelTests = exports.FIXTURE_URLS = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const FIXTURE_URLS = {
    peertube_long: 'https://peertube2.cpy.re/videos/watch/122d093a-1ede-43bd-bd34-59d2931ffc5e',
    peertube_short: 'https://peertube2.cpy.re/w/3fbif9S3WmtTP8gGsC5HBd',
    youtube: 'https://www.youtube.com/watch?v=msX3jv1XdvM',
    youtubeHDR: 'https://www.youtube.com/watch?v=qR5vOXbZsI4',
    magnet: 'magnet:?xs=https%3A%2F%2Fpeertube2.cpy.re%2Fstatic%2Ftorrents%2Fb209ca00-c8bb-4b2b-b421-1ede169f3dbc-720.torrent&xt=urn:btih:0f498834733e8057ed5c6f2ee2b4efd8d84a76ee&dn=super+peertube2+video&tr=wss%3A%2F%2Fpeertube2.cpy.re%3A443%2Ftracker%2Fsocket&tr=https%3A%2F%2Fpeertube2.cpy.re%2Ftracker%2Fannounce&ws=https%3A%2F%2Fpeertube2.cpy.re%2Fstatic%2Fwebseed%2Fb209ca00-c8bb-4b2b-b421-1ede169f3dbc-720.mp4',
    badVideo: 'https://download.cpy.re/peertube/bad_video.mp4',
    goodVideo: 'https://download.cpy.re/peertube/good_video.mp4',
    goodVideo720: 'https://download.cpy.re/peertube/good_video_720.mp4',
    file4K: 'https://download.cpy.re/peertube/4k_file.txt'
};
exports.FIXTURE_URLS = FIXTURE_URLS;
function parallelTests() {
    return process.env.MOCHA_PARALLEL === 'true';
}
exports.parallelTests = parallelTests;
function isGithubCI() {
    return !!process.env.GITHUB_WORKSPACE;
}
exports.isGithubCI = isGithubCI;
function areHttpImportTestsDisabled() {
    const disabled = process.env.DISABLE_HTTP_IMPORT_TESTS === 'true';
    if (disabled)
        console.log('DISABLE_HTTP_IMPORT_TESTS env set to "true" so import tests are disabled');
    return disabled;
}
exports.areHttpImportTestsDisabled = areHttpImportTestsDisabled;
function areObjectStorageTestsDisabled() {
    const disabled = process.env.ENABLE_OBJECT_STORAGE_TESTS !== 'true';
    if (disabled)
        console.log('ENABLE_OBJECT_STORAGE_TESTS env is not set to "true" so object storage tests are disabled');
    return disabled;
}
exports.areObjectStorageTestsDisabled = areObjectStorageTestsDisabled;
function buildAbsoluteFixturePath(path, customCIPath = false) {
    if (path_1.isAbsolute(path))
        return path;
    if (customCIPath && process.env.GITHUB_WORKSPACE) {
        return path_1.join(process.env.GITHUB_WORKSPACE, 'fixtures', path);
    }
    return path_1.join(root(), 'server', 'tests', 'fixtures', path);
}
exports.buildAbsoluteFixturePath = buildAbsoluteFixturePath;
function root() {
    let root = path_1.join(__dirname, '..', '..', '..');
    if (path_1.basename(root) === 'dist')
        root = path_1.resolve(root, '..');
    return root;
}
exports.root = root;
function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
exports.wait = wait;
function getFileSize(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const stats = yield fs_extra_1.stat(path);
        return stats.size;
    });
}
exports.getFileSize = getFileSize;
function buildRequestStub() {
    return {};
}
exports.buildRequestStub = buildRequestStub;
