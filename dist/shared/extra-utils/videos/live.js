"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLiveCleanupAfterSave = exports.waitUntilLiveSavedOnAllServers = exports.waitUntilLivePublishedOnAllServers = exports.stopFfmpeg = exports.testFfmpegStreamError = exports.waitFfmpegUntilError = exports.sendRTMPStream = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fluent_ffmpeg_1 = tslib_1.__importDefault(require("fluent-ffmpeg"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const miscs_1 = require("../miscs");
function sendRTMPStream(options) {
    const { rtmpBaseUrl, streamKey, fixtureName = 'video_short.mp4', copyCodecs = false } = options;
    const fixture = miscs_1.buildAbsoluteFixturePath(fixtureName);
    const command = fluent_ffmpeg_1.default(fixture);
    command.inputOption('-stream_loop -1');
    command.inputOption('-re');
    if (copyCodecs) {
        command.outputOption('-c copy');
    }
    else {
        command.outputOption('-c:v libx264');
        command.outputOption('-g 50');
        command.outputOption('-keyint_min 2');
        command.outputOption('-r 60');
    }
    command.outputOption('-f flv');
    const rtmpUrl = rtmpBaseUrl + '/' + streamKey;
    command.output(rtmpUrl);
    command.on('error', err => {
        var _a;
        if ((_a = err === null || err === void 0 ? void 0 : err.message) === null || _a === void 0 ? void 0 : _a.includes('Exiting normally'))
            return;
        if (process.env.DEBUG)
            console.error(err);
    });
    if (process.env.DEBUG) {
        command.on('stderr', data => console.log(data));
    }
    command.run();
    return command;
}
exports.sendRTMPStream = sendRTMPStream;
function waitFfmpegUntilError(command, successAfterMS = 10000) {
    return new Promise((res, rej) => {
        command.on('error', err => {
            return rej(err);
        });
        setTimeout(() => {
            res();
        }, successAfterMS);
    });
}
exports.waitFfmpegUntilError = waitFfmpegUntilError;
function testFfmpegStreamError(command, shouldHaveError) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let error;
        try {
            yield waitFfmpegUntilError(command, 35000);
        }
        catch (err) {
            error = err;
        }
        yield stopFfmpeg(command);
        if (shouldHaveError && !error)
            throw new Error('Ffmpeg did not have an error');
        if (!shouldHaveError && error)
            throw error;
    });
}
exports.testFfmpegStreamError = testFfmpegStreamError;
function stopFfmpeg(command) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        command.kill('SIGINT');
        yield miscs_1.wait(500);
    });
}
exports.stopFfmpeg = stopFfmpeg;
function waitUntilLivePublishedOnAllServers(servers, videoId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const server of servers) {
            yield server.live.waitUntilPublished({ videoId });
        }
    });
}
exports.waitUntilLivePublishedOnAllServers = waitUntilLivePublishedOnAllServers;
function waitUntilLiveSavedOnAllServers(servers, videoId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const server of servers) {
            yield server.live.waitUntilSaved({ videoId });
        }
    });
}
exports.waitUntilLiveSavedOnAllServers = waitUntilLiveSavedOnAllServers;
function checkLiveCleanupAfterSave(server, videoUUID, resolutions = []) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const basePath = server.servers.buildDirectory('streaming-playlists');
        const hlsPath = path_1.join(basePath, 'hls', videoUUID);
        if (resolutions.length === 0) {
            const result = yield fs_extra_1.pathExists(hlsPath);
            chai_1.expect(result).to.be.false;
            return;
        }
        const files = yield fs_extra_1.readdir(hlsPath);
        chai_1.expect(files).to.have.lengthOf(resolutions.length * 2 + 2);
        for (const resolution of resolutions) {
            const fragmentedFile = files.find(f => f.endsWith(`-${resolution}-fragmented.mp4`));
            chai_1.expect(fragmentedFile).to.exist;
            const playlistFile = files.find(f => f.endsWith(`${resolution}.m3u8`));
            chai_1.expect(playlistFile).to.exist;
        }
        const masterPlaylistFile = files.find(f => f.endsWith('-master.m3u8'));
        chai_1.expect(masterPlaylistFile).to.exist;
        const shaFile = files.find(f => f.endsWith('-segments-sha256.json'));
        chai_1.expect(shaFile).to.exist;
    });
}
exports.checkLiveCleanupAfterSave = checkLiveCleanupAfterSave;
