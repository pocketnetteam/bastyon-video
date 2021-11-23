"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersCommand = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const models_1 = require("@shared/models");
const miscs_1 = require("../miscs");
const shared_1 = require("../shared");
class ServersCommand extends shared_1.AbstractCommand {
    static flushTests(internalServerNumber) {
        return new Promise((res, rej) => {
            const suffix = ` -- ${internalServerNumber}`;
            return (0, child_process_1.exec)('npm run clean:server:test' + suffix, (err, _stdout, stderr) => {
                if (err || stderr)
                    return rej(err || new Error(stderr));
                return res();
            });
        });
    }
    ping(options = {}) {
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path: '/api/v1/ping', implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    cleanupTests() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const p = [];
            if ((0, miscs_1.isGithubCI)()) {
                yield (0, fs_extra_1.ensureDir)('artifacts');
                const origin = this.buildDirectory('logs/peertube.log');
                const destname = `peertube-${this.server.internalServerNumber}.log`;
                console.log('Saving logs %s.', destname);
                yield (0, fs_extra_1.copy)(origin, (0, path_1.join)('artifacts', destname));
            }
            if (this.server.parallel) {
                p.push(ServersCommand.flushTests(this.server.internalServerNumber));
            }
            if (this.server.customConfigFile) {
                p.push((0, fs_extra_1.remove)(this.server.customConfigFile));
            }
            return p;
        });
    }
    waitUntilLog(str, count = 1, strictCount = true) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const logfile = this.buildDirectory('logs/peertube.log');
            while (true) {
                const buf = yield (0, fs_extra_1.readFile)(logfile);
                const matches = buf.toString().match(new RegExp(str, 'g'));
                if (matches && matches.length === count)
                    return;
                if (matches && strictCount === false && matches.length >= count)
                    return;
                yield (0, miscs_1.wait)(1000);
            }
        });
    }
    buildDirectory(directory) {
        return (0, path_1.join)((0, core_utils_1.root)(), 'test' + this.server.internalServerNumber, directory);
    }
    buildWebTorrentFilePath(fileUrl) {
        return this.buildDirectory((0, path_1.join)('videos', (0, path_1.basename)(fileUrl)));
    }
    buildFragmentedFilePath(videoUUID, fileUrl) {
        return this.buildDirectory((0, path_1.join)('streaming-playlists', 'hls', videoUUID, (0, path_1.basename)(fileUrl)));
    }
    getLogContent() {
        return (0, fs_extra_1.readFile)(this.buildDirectory('logs/peertube.log'));
    }
    getServerFileSize(subPath) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const path = this.server.servers.buildDirectory(subPath);
            return (0, miscs_1.getFileSize)(path);
        });
    }
}
exports.ServersCommand = ServersCommand;
