"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test channels search', function () {
    let server;
    let remoteServer;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const servers = yield Promise.all([
                extra_utils_1.createSingleServer(1),
                extra_utils_1.createSingleServer(2, { transcoding: { enabled: false } })
            ]);
            server = servers[0];
            remoteServer = servers[1];
            yield extra_utils_1.setAccessTokensToServers([server, remoteServer]);
            {
                yield server.users.create({ username: 'user1' });
                const channel = {
                    name: 'squall_channel',
                    displayName: 'Squall channel'
                };
                yield server.channels.create({ attributes: channel });
            }
            {
                yield remoteServer.users.create({ username: 'user1' });
                const channel = {
                    name: 'zell_channel',
                    displayName: 'Zell channel'
                };
                const { id } = yield remoteServer.channels.create({ attributes: channel });
                yield remoteServer.videos.upload({ attributes: { channelId: id } });
            }
            yield extra_utils_1.doubleFollow(server, remoteServer);
            command = server.search;
        });
    });
    it('Should make a simple search and not have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.searchChannels({ search: 'abc' });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should make a search and have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const search = {
                    search: 'Squall',
                    start: 0,
                    count: 1
                };
                const body = yield command.advancedChannelSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const channel = body.data[0];
                expect(channel.name).to.equal('squall_channel');
                expect(channel.displayName).to.equal('Squall channel');
            }
            {
                const search = {
                    search: 'Squall',
                    start: 1,
                    count: 1
                };
                const body = yield command.advancedChannelSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should filter by host', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const search = { search: 'channel', host: remoteServer.host };
                const body = yield command.advancedChannelSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].displayName).to.equal('Zell channel');
            }
            {
                const search = { search: 'Sq', host: server.host };
                const body = yield command.advancedChannelSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].displayName).to.equal('Squall channel');
            }
            {
                const search = { search: 'Squall', host: 'example.com' };
                const body = yield command.advancedChannelSearch({ search });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should filter by names', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield command.advancedChannelSearch({ search: { handles: ['squall_channel', 'zell_channel'] } });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].displayName).to.equal('Squall channel');
            }
            {
                const body = yield command.advancedChannelSearch({ search: { handles: ['squall_channel@' + server.host] } });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].displayName).to.equal('Squall channel');
            }
            {
                const body = yield command.advancedChannelSearch({ search: { handles: ['chocobozzz_channel'] } });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const body = yield command.advancedChannelSearch({ search: { handles: ['squall_channel', 'zell_channel@' + remoteServer.host] } });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                expect(body.data[0].displayName).to.equal('Squall channel');
                expect(body.data[1].displayName).to.equal('Zell channel');
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server, remoteServer]);
        });
    });
});
