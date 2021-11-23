"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const uuid_1 = require("@server/helpers/uuid");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
function countFiles(server, directory) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const files = yield (0, fs_extra_1.readdir)(server.servers.buildDirectory(directory));
        return files.length;
    });
}
function assertNotExists(server, directory, substring) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const files = yield (0, fs_extra_1.readdir)(server.servers.buildDirectory(directory));
        for (const f of files) {
            expect(f).to.not.contain(substring);
        }
    });
}
function assertCountAreOkay(servers, videoServer2UUID) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        for (const server of servers) {
            const videosCount = yield countFiles(server, 'videos');
            expect(videosCount).to.equal(8);
            const torrentsCount = yield countFiles(server, 'torrents');
            expect(torrentsCount).to.equal(16);
            const previewsCount = yield countFiles(server, 'previews');
            expect(previewsCount).to.equal(2);
            const thumbnailsCount = yield countFiles(server, 'thumbnails');
            expect(thumbnailsCount).to.equal(6);
            const avatarsCount = yield countFiles(server, 'avatars');
            expect(avatarsCount).to.equal(2);
        }
    });
}
describe('Test prune storage scripts', function () {
    let servers;
    const badNames = {};
    let videoServer2UUID;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2, { transcoding: { enabled: true } });
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            for (const server of servers) {
                yield server.videos.upload({ attributes: { name: 'video 1' } });
                const { uuid } = yield server.videos.upload({ attributes: { name: 'video 2' } });
                if (server.serverNumber === 2)
                    videoServer2UUID = uuid;
                yield server.users.updateMyAvatar({ fixture: 'avatar.png' });
                yield server.playlists.create({
                    attributes: {
                        displayName: 'playlist',
                        privacy: 1,
                        videoChannelId: server.store.channel.id,
                        thumbnailfile: 'thumbnail.jpg'
                    }
                });
            }
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            {
                const account = yield servers[0].accounts.get({ accountName: 'root@localhost:' + servers[1].port });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[0].url,
                    path: account.avatar.path,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            }
            {
                const account = yield servers[1].accounts.get({ accountName: 'root@localhost:' + servers[0].port });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[1].url,
                    path: account.avatar.path,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            }
            yield (0, extra_utils_1.wait)(1000);
            yield (0, extra_utils_1.waitJobs)(servers);
            yield (0, extra_utils_1.killallServers)(servers);
            yield (0, extra_utils_1.wait)(1000);
        });
    });
    it('Should have the files on the disk', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield assertCountAreOkay(servers, videoServer2UUID);
        });
    });
    it('Should create some dirty files', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (let i = 0; i < 2; i++) {
                {
                    const base = servers[0].servers.buildDirectory('videos');
                    const n1 = (0, uuid_1.buildUUID)() + '.mp4';
                    const n2 = (0, uuid_1.buildUUID)() + '.webm';
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n1));
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n2));
                    badNames['videos'] = [n1, n2];
                }
                {
                    const base = servers[0].servers.buildDirectory('torrents');
                    const n1 = (0, uuid_1.buildUUID)() + '-240.torrent';
                    const n2 = (0, uuid_1.buildUUID)() + '-480.torrent';
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n1));
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n2));
                    badNames['torrents'] = [n1, n2];
                }
                {
                    const base = servers[0].servers.buildDirectory('thumbnails');
                    const n1 = (0, uuid_1.buildUUID)() + '.jpg';
                    const n2 = (0, uuid_1.buildUUID)() + '.jpg';
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n1));
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n2));
                    badNames['thumbnails'] = [n1, n2];
                }
                {
                    const base = servers[0].servers.buildDirectory('previews');
                    const n1 = (0, uuid_1.buildUUID)() + '.jpg';
                    const n2 = (0, uuid_1.buildUUID)() + '.jpg';
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n1));
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n2));
                    badNames['previews'] = [n1, n2];
                }
                {
                    const base = servers[0].servers.buildDirectory('avatars');
                    const n1 = (0, uuid_1.buildUUID)() + '.png';
                    const n2 = (0, uuid_1.buildUUID)() + '.jpg';
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n1));
                    yield (0, fs_extra_1.createFile)((0, path_1.join)(base, n2));
                    badNames['avatars'] = [n1, n2];
                }
            }
        });
    });
    it('Should run prune storage', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const env = servers[0].cli.getEnv();
            yield extra_utils_1.CLICommand.exec(`echo y | ${env} npm run prune-storage`);
        });
    });
    it('Should have removed files', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield assertCountAreOkay(servers, videoServer2UUID);
            for (const directory of Object.keys(badNames)) {
                for (const name of badNames[directory]) {
                    yield assertNotExists(servers[0], directory, name);
                }
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
