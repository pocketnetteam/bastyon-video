"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test AP refresher', function () {
    let servers = [];
    let videoUUID1;
    let videoUUID2;
    let videoUUID3;
    let playlistUUID1;
    let playlistUUID2;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2, { transcoding: { enabled: false } });
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            {
                videoUUID1 = (yield servers[1].videos.quickUpload({ name: 'video1' })).uuid;
                videoUUID2 = (yield servers[1].videos.quickUpload({ name: 'video2' })).uuid;
                videoUUID3 = (yield servers[1].videos.quickUpload({ name: 'video3' })).uuid;
            }
            {
                const token1 = yield servers[1].users.generateUserAndToken('user1');
                yield servers[1].videos.upload({ token: token1, attributes: { name: 'video4' } });
                const token2 = yield servers[1].users.generateUserAndToken('user2');
                yield servers[1].videos.upload({ token: token2, attributes: { name: 'video5' } });
            }
            {
                const attributes = { displayName: 'playlist1', privacy: 1, videoChannelId: servers[1].store.channel.id };
                const created = yield servers[1].playlists.create({ attributes });
                playlistUUID1 = created.uuid;
            }
            {
                const attributes = { displayName: 'playlist2', privacy: 1, videoChannelId: servers[1].store.channel.id };
                const created = yield servers[1].playlists.create({ attributes });
                playlistUUID2 = created.uuid;
            }
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('Videos refresher', function () {
        it('Should remove a deleted remote video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield (0, extra_utils_1.wait)(10000);
                yield servers[1].sql.setVideoField(videoUUID1, 'uuid', '304afe4f-39f9-4d49-8ed7-ac57b86b174f');
                yield servers[0].videos.get({ id: videoUUID1 });
                yield servers[0].videos.get({ id: videoUUID2 });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].videos.get({ id: videoUUID1, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield servers[0].videos.get({ id: videoUUID2 });
            });
        });
        it('Should not update a remote video if the remote instance is down', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(70000);
                yield (0, extra_utils_1.killallServers)([servers[1]]);
                yield servers[1].sql.setVideoField(videoUUID3, 'uuid', '304afe4f-39f9-4d49-8ed7-ac57b86b174e');
                yield (0, extra_utils_1.wait)(10000);
                yield servers[0].videos.get({ id: videoUUID3 });
                yield (0, extra_utils_1.waitJobs)([servers[0]]);
                yield servers[1].run();
                yield servers[0].videos.get({ id: videoUUID3 });
            });
        });
    });
    describe('Actors refresher', function () {
        it('Should remove a deleted actor', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                const command = servers[0].accounts;
                yield (0, extra_utils_1.wait)(10000);
                const to = 'http://localhost:' + servers[1].port + '/accounts/user2';
                yield servers[1].sql.setActorField(to, 'preferredUsername', 'toto');
                yield command.get({ accountName: 'user1@localhost:' + servers[1].port });
                yield command.get({ accountName: 'user2@localhost:' + servers[1].port });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield command.get({ accountName: 'user1@localhost:' + servers[1].port, expectedStatus: models_1.HttpStatusCode.OK_200 });
                yield command.get({ accountName: 'user2@localhost:' + servers[1].port, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
    });
    describe('Playlist refresher', function () {
        it('Should remove a deleted playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield (0, extra_utils_1.wait)(10000);
                yield servers[1].sql.setPlaylistField(playlistUUID2, 'uuid', '304afe4f-39f9-4d49-8ed7-ac57b86b178e');
                yield servers[0].playlists.get({ playlistId: playlistUUID1 });
                yield servers[0].playlists.get({ playlistId: playlistUUID2 });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].playlists.get({ playlistId: playlistUUID1, expectedStatus: models_1.HttpStatusCode.OK_200 });
                yield servers[0].playlists.get({ playlistId: playlistUUID2, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
