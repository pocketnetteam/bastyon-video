"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const core_utils_1 = require("@shared/core-utils");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test upload quota', function () {
    let server;
    let rootId;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield extra_utils_1.setDefaultVideoChannel([server]);
            const user = yield server.users.getMyInfo();
            rootId = user.id;
            yield server.users.update({ userId: rootId, videoQuota: 42 });
            command = server.videos;
        });
    });
    describe('When having a video quota', function () {
        it('Should fail with a registered user having too many videos with legacy upload', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const user = { username: 'registered' + core_utils_1.randomInt(1, 1500), password: 'password' };
                yield server.users.register(user);
                const userToken = yield server.login.getAccessToken(user);
                const attributes = { fixture: 'video_short2.webm' };
                for (let i = 0; i < 5; i++) {
                    yield command.upload({ token: userToken, attributes });
                }
                yield command.upload({ token: userToken, attributes, expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'legacy' });
            });
        });
        it('Should fail with a registered user having too many videos with resumable upload', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const user = { username: 'registered' + core_utils_1.randomInt(1, 1500), password: 'password' };
                yield server.users.register(user);
                const userToken = yield server.login.getAccessToken(user);
                const attributes = { fixture: 'video_short2.webm' };
                for (let i = 0; i < 5; i++) {
                    yield command.upload({ token: userToken, attributes });
                }
                yield command.upload({ token: userToken, attributes, expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'resumable' });
            });
        });
        it('Should fail to import with HTTP/Torrent/magnet', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(120000);
                const baseAttributes = {
                    channelId: server.store.channel.id,
                    privacy: 1
                };
                yield server.imports.importVideo({ attributes: Object.assign(Object.assign({}, baseAttributes), { targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo }) });
                yield server.imports.importVideo({ attributes: Object.assign(Object.assign({}, baseAttributes), { magnetUri: extra_utils_1.FIXTURE_URLS.magnet }) });
                yield server.imports.importVideo({ attributes: Object.assign(Object.assign({}, baseAttributes), { torrentfile: 'video-720p.torrent' }) });
                yield extra_utils_1.waitJobs([server]);
                const { total, data: videoImports } = yield server.imports.getMyVideoImports();
                chai_1.expect(total).to.equal(3);
                chai_1.expect(videoImports).to.have.lengthOf(3);
                for (const videoImport of videoImports) {
                    chai_1.expect(videoImport.state.id).to.equal(3);
                    chai_1.expect(videoImport.error).not.to.be.undefined;
                    chai_1.expect(videoImport.error).to.contain('user video quota is exceeded');
                }
            });
        });
    });
    describe('When having a daily video quota', function () {
        it('Should fail with a user having too many videos daily', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.update({ userId: rootId, videoQuotaDaily: 42 });
                yield command.upload({ expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'legacy' });
                yield command.upload({ expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'resumable' });
            });
        });
    });
    describe('When having an absolute and daily video quota', function () {
        it('Should fail if exceeding total quota', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.update({
                    userId: rootId,
                    videoQuota: 42,
                    videoQuotaDaily: 1024 * 1024 * 1024
                });
                yield command.upload({ expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'legacy' });
                yield command.upload({ expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'resumable' });
            });
        });
        it('Should fail if exceeding daily quota', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.update({
                    userId: rootId,
                    videoQuota: 1024 * 1024 * 1024,
                    videoQuotaDaily: 42
                });
                yield command.upload({ expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'legacy' });
                yield command.upload({ expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413, mode: 'resumable' });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
