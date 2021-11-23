"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActorFilesWereRemoved = exports.expectChannelsFollows = exports.expectAccountFollows = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
function expectChannelsFollows(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { server } = options;
        const { data } = yield server.channels.list();
        return expectActorFollow(Object.assign(Object.assign({}, options), { data }));
    });
}
exports.expectChannelsFollows = expectChannelsFollows;
function expectAccountFollows(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { server } = options;
        const { data } = yield server.accounts.list();
        return expectActorFollow(Object.assign(Object.assign({}, options), { data }));
    });
}
exports.expectAccountFollows = expectAccountFollows;
function checkActorFilesWereRemoved(filename, serverNumber) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const testDirectory = 'test' + serverNumber;
        for (const directory of ['avatars']) {
            const directoryPath = (0, path_1.join)((0, core_utils_1.root)(), testDirectory, directory);
            const directoryExists = yield (0, fs_extra_1.pathExists)(directoryPath);
            (0, chai_1.expect)(directoryExists).to.be.true;
            const files = yield (0, fs_extra_1.readdir)(directoryPath);
            for (const file of files) {
                (0, chai_1.expect)(file).to.not.contain(filename);
            }
        }
    });
}
exports.checkActorFilesWereRemoved = checkActorFilesWereRemoved;
function expectActorFollow(options) {
    const { server, data, handle, followers, following } = options;
    const actor = data.find(a => a.name + '@' + a.host === handle);
    const message = `${handle} on ${server.url}`;
    (0, chai_1.expect)(actor, message).to.exist;
    (0, chai_1.expect)(actor.followersCount).to.equal(followers, message);
    (0, chai_1.expect)(actor.followingCount).to.equal(following, message);
}
