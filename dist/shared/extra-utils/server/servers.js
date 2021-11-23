"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killallServers = exports.cleanupTests = exports.createMultipleServers = exports.createSingleServer = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const miscs_1 = require("../miscs");
const server_1 = require("./server");
function createSingleServer(serverNumber, configOverride, options = {}) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const server = new server_1.PeerTubeServer({ serverNumber });
        yield server.flushAndRun(configOverride, options);
        return server;
    });
}
exports.createSingleServer = createSingleServer;
function createMultipleServers(totalServers, configOverride, options = {}) {
    const serverPromises = [];
    for (let i = 1; i <= totalServers; i++) {
        serverPromises.push(createSingleServer(i, configOverride, options));
    }
    return Promise.all(serverPromises);
}
exports.createMultipleServers = createMultipleServers;
function killallServers(servers) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        return Promise.all(servers.map(s => s.kill()));
    });
}
exports.killallServers = killallServers;
function cleanupTests(servers) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield killallServers(servers);
        if ((0, miscs_1.isGithubCI)()) {
            yield (0, fs_extra_1.ensureDir)('artifacts');
        }
        let p = [];
        for (const server of servers) {
            p = p.concat(server.servers.cleanupTests());
        }
        return Promise.all(p);
    });
}
exports.cleanupTests = cleanupTests;
