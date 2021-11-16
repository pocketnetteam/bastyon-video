"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test video change ownership - nominal', function () {
    let servers = [];
    const firstUser = 'first';
    const secondUser = 'second';
    let firstUserToken = '';
    let firstUserChannelId;
    let secondUserToken = '';
    let secondUserChannelId;
    let lastRequestId;
    let liveId;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.setDefaultVideoChannel(servers);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    transcoding: {
                        enabled: false
                    },
                    live: {
                        enabled: true
                    }
                }
            });
            firstUserToken = yield servers[0].users.generateUserAndToken(firstUser);
            secondUserToken = yield servers[0].users.generateUserAndToken(secondUser);
            {
                const { videoChannels } = yield servers[0].users.getMyInfo({ token: firstUserToken });
                firstUserChannelId = videoChannels[0].id;
            }
            {
                const { videoChannels } = yield servers[0].users.getMyInfo({ token: secondUserToken });
                secondUserChannelId = videoChannels[0].id;
            }
            {
                const attributes = {
                    name: 'my super name',
                    description: 'my super description'
                };
                const { id } = yield servers[0].videos.upload({ token: firstUserToken, attributes });
                servers[0].store.videoCreated = yield servers[0].videos.get({ id });
            }
            {
                const attributes = { name: 'live', channelId: firstUserChannelId, privacy: 1 };
                const video = yield servers[0].live.create({ token: firstUserToken, fields: attributes });
                liveId = video.id;
            }
            command = servers[0].changeOwnership;
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
        });
    });
    it('Should not have video change ownership', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield command.list({ token: firstUserToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(0);
            }
            {
                const body = yield command.list({ token: secondUserToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(0);
            }
        });
    });
    it('Should send a request to change ownership of a video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield command.create({ token: firstUserToken, videoId: servers[0].store.videoCreated.id, username: secondUser });
        });
    });
    it('Should only return a request to change ownership for the second user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield command.list({ token: firstUserToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(0);
            }
            {
                const body = yield command.list({ token: secondUserToken });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(1);
                lastRequestId = body.data[0].id;
            }
        });
    });
    it('Should accept the same change ownership request without crashing', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield command.create({ token: firstUserToken, videoId: servers[0].store.videoCreated.id, username: secondUser });
        });
    });
    it('Should not create multiple change ownership requests while one is waiting', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const body = yield command.list({ token: secondUserToken });
            expect(body.total).to.equal(1);
            expect(body.data).to.be.an('array');
            expect(body.data.length).to.equal(1);
        });
    });
    it('Should not be possible to refuse the change of ownership from first user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield command.refuse({ token: firstUserToken, ownershipId: lastRequestId, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
        });
    });
    it('Should be possible to refuse the change of ownership from second user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield command.refuse({ token: secondUserToken, ownershipId: lastRequestId });
        });
    });
    it('Should send a new request to change ownership of a video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield command.create({ token: firstUserToken, videoId: servers[0].store.videoCreated.id, username: secondUser });
        });
    });
    it('Should return two requests to change ownership for the second user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield command.list({ token: firstUserToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(0);
            }
            {
                const body = yield command.list({ token: secondUserToken });
                expect(body.total).to.equal(2);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(2);
                lastRequestId = body.data[0].id;
            }
        });
    });
    it('Should not be possible to accept the change of ownership from first user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield command.accept({
                token: firstUserToken,
                ownershipId: lastRequestId,
                channelId: secondUserChannelId,
                expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
            });
        });
    });
    it('Should be possible to accept the change of ownership from second user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield command.accept({ token: secondUserToken, ownershipId: lastRequestId, channelId: secondUserChannelId });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should have the channel of the video updated', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: servers[0].store.videoCreated.uuid });
                expect(video.name).to.equal('my super name');
                expect(video.channel.displayName).to.equal('Main second channel');
                expect(video.channel.name).to.equal('second_channel');
            }
        });
    });
    it('Should send a request to change ownership of a live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield command.create({ token: firstUserToken, videoId: liveId, username: secondUser });
            const body = yield command.list({ token: secondUserToken });
            expect(body.total).to.equal(3);
            expect(body.data.length).to.equal(3);
            lastRequestId = body.data[0].id;
        });
    });
    it('Should accept a live ownership change', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield command.accept({ token: secondUserToken, ownershipId: lastRequestId, channelId: secondUserChannelId });
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const video = yield server.videos.get({ id: servers[0].store.videoCreated.uuid });
                expect(video.name).to.equal('my super name');
                expect(video.channel.displayName).to.equal('Main second channel');
                expect(video.channel.name).to.equal('second_channel');
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
describe('Test video change ownership - quota too small', function () {
    let server;
    const firstUser = 'first';
    const secondUser = 'second';
    let firstUserToken = '';
    let secondUserToken = '';
    let lastRequestId;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield server.users.create({ username: secondUser, videoQuota: 10 });
            firstUserToken = yield server.users.generateUserAndToken(firstUser);
            secondUserToken = yield server.login.getAccessToken(secondUser);
            const attributes = {
                name: 'my super name',
                description: 'my super description'
            };
            yield server.videos.upload({ token: firstUserToken, attributes });
            yield extra_utils_1.waitJobs(server);
            const { data } = yield server.videos.list();
            expect(data.length).to.equal(1);
            server.store.videoCreated = data.find(video => video.name === 'my super name');
        });
    });
    it('Should send a request to change ownership of a video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield server.changeOwnership.create({ token: firstUserToken, videoId: server.store.videoCreated.id, username: secondUser });
        });
    });
    it('Should only return a request to change ownership for the second user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield server.changeOwnership.list({ token: firstUserToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(0);
            }
            {
                const body = yield server.changeOwnership.list({ token: secondUserToken });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(1);
                lastRequestId = body.data[0].id;
            }
        });
    });
    it('Should not be possible to accept the change of ownership from second user because of exceeded quota', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const { videoChannels } = yield server.users.getMyInfo({ token: secondUserToken });
            const channelId = videoChannels[0].id;
            yield server.changeOwnership.accept({
                token: secondUserToken,
                ownershipId: lastRequestId,
                channelId,
                expectedStatus: models_1.HttpStatusCode.PAYLOAD_TOO_LARGE_413
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
