"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test ActivityPub video channels search', function () {
    let servers;
    let userServer2Token;
    let videoServer2UUID;
    let channelIdServer2;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            {
                yield servers[0].users.create({ username: 'user1_server1', password: 'password' });
                const channel = {
                    name: 'channel1_server1',
                    displayName: 'Channel 1 server 1'
                };
                yield servers[0].channels.create({ attributes: channel });
            }
            {
                const user = { username: 'user1_server2', password: 'password' };
                yield servers[1].users.create({ username: user.username, password: user.password });
                userServer2Token = yield servers[1].login.getAccessToken(user);
                const channel = {
                    name: 'channel1_server2',
                    displayName: 'Channel 1 server 2'
                };
                const created = yield servers[1].channels.create({ token: userServer2Token, attributes: channel });
                channelIdServer2 = created.id;
                const attributes = { name: 'video 1 server 2', channelId: channelIdServer2 };
                const { uuid } = yield servers[1].videos.upload({ token: userServer2Token, attributes });
                videoServer2UUID = uuid;
            }
            yield extra_utils_1.waitJobs(servers);
            command = servers[0].search;
        });
    });
    it('Should not find a remote video channel', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            {
                const search = 'http://localhost:' + servers[1].port + '/video-channels/channel1_server3';
                const body = yield command.searchChannels({ search, token: servers[0].accessToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const search = 'http://localhost:' + servers[1].port + '/video-channels/channel1_server2';
                const body = yield command.searchChannels({ search });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should search a local video channel', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searches = [
                'http://localhost:' + servers[0].port + '/video-channels/channel1_server1',
                'channel1_server1@localhost:' + servers[0].port
            ];
            for (const search of searches) {
                const body = yield command.searchChannels({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('channel1_server1');
                expect(body.data[0].displayName).to.equal('Channel 1 server 1');
            }
        });
    });
    it('Should search a local video channel with an alternative URL', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = 'http://localhost:' + servers[0].port + '/c/channel1_server1';
            for (const token of [undefined, servers[0].accessToken]) {
                const body = yield command.searchChannels({ search, token });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('channel1_server1');
                expect(body.data[0].displayName).to.equal('Channel 1 server 1');
            }
        });
    });
    it('Should search a remote video channel with URL or handle', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searches = [
                'http://localhost:' + servers[1].port + '/video-channels/channel1_server2',
                'http://localhost:' + servers[1].port + '/c/channel1_server2',
                'http://localhost:' + servers[1].port + '/c/channel1_server2/videos',
                'channel1_server2@localhost:' + servers[1].port
            ];
            for (const search of searches) {
                const body = yield command.searchChannels({ search, token: servers[0].accessToken });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('channel1_server2');
                expect(body.data[0].displayName).to.equal('Channel 1 server 2');
            }
        });
    });
    it('Should not list this remote video channel', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield servers[0].channels.list();
            expect(body.total).to.equal(3);
            expect(body.data).to.have.lengthOf(3);
            expect(body.data[0].name).to.equal('channel1_server1');
            expect(body.data[1].name).to.equal('user1_server1_channel');
            expect(body.data[2].name).to.equal('root_channel');
        });
    });
    it('Should list video channel videos of server 2 without token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield extra_utils_1.waitJobs(servers);
            const { total, data } = yield servers[0].videos.listByChannel({
                token: null,
                handle: 'channel1_server2@localhost:' + servers[1].port
            });
            expect(total).to.equal(0);
            expect(data).to.have.lengthOf(0);
        });
    });
    it('Should list video channel videos of server 2 with token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.listByChannel({
                handle: 'channel1_server2@localhost:' + servers[1].port
            });
            expect(total).to.equal(1);
            expect(data[0].name).to.equal('video 1 server 2');
        });
    });
    it('Should update video channel of server 2, and refresh it on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[1].channels.update({
                token: userServer2Token,
                channelName: 'channel1_server2',
                attributes: { displayName: 'channel updated' }
            });
            yield servers[1].users.updateMe({ token: userServer2Token, displayName: 'user updated' });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/video-channels/channel1_server2';
            const body = yield command.searchChannels({ search, token: servers[0].accessToken });
            expect(body.total).to.equal(1);
            expect(body.data).to.have.lengthOf(1);
            const videoChannel = body.data[0];
            expect(videoChannel.displayName).to.equal('channel updated');
        });
    });
    it('Should update and add a video on server 2, and update it on server 1 after a search', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[1].videos.update({ token: userServer2Token, id: videoServer2UUID, attributes: { name: 'video 1 updated' } });
            yield servers[1].videos.upload({ token: userServer2Token, attributes: { name: 'video 2 server 2', channelId: channelIdServer2 } });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/video-channels/channel1_server2';
            yield command.searchChannels({ search, token: servers[0].accessToken });
            yield extra_utils_1.waitJobs(servers);
            const handle = 'channel1_server2@localhost:' + servers[1].port;
            const { total, data } = yield servers[0].videos.listByChannel({ handle, sort: '-createdAt' });
            expect(total).to.equal(2);
            expect(data[0].name).to.equal('video 2 server 2');
            expect(data[1].name).to.equal('video 1 updated');
        });
    });
    it('Should delete video channel of server 2, and delete it on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[1].channels.delete({ token: userServer2Token, channelName: 'channel1_server2' });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/video-channels/channel1_server2';
            const body = yield command.searchChannels({ search, token: servers[0].accessToken });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
