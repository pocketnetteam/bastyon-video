"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test ActivityPub videos search', function () {
    let servers;
    let videoServer1UUID;
    let videoServer2UUID;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video 1 on server 1' } });
                videoServer1UUID = uuid;
            }
            {
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video 1 on server 2' } });
                videoServer2UUID = uuid;
            }
            yield extra_utils_1.waitJobs(servers);
            command = servers[0].search;
        });
    });
    it('Should not find a remote video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const search = 'http://localhost:' + servers[1].port + '/videos/watch/43';
                const body = yield command.searchVideos({ search, token: servers[0].accessToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const search = 'http://localhost:' + servers[1].port + '/videos/watch/' + videoServer2UUID;
                const body = yield command.searchVideos({ search });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should search a local video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = 'http://localhost:' + servers[0].port + '/videos/watch/' + videoServer1UUID;
            const body = yield command.searchVideos({ search });
            expect(body.total).to.equal(1);
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(1);
            expect(body.data[0].name).to.equal('video 1 on server 1');
        });
    });
    it('Should search a local video with an alternative URL', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = 'http://localhost:' + servers[0].port + '/w/' + videoServer1UUID;
            const body1 = yield command.searchVideos({ search });
            const body2 = yield command.searchVideos({ search, token: servers[0].accessToken });
            for (const body of [body1, body2]) {
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('video 1 on server 1');
            }
        });
    });
    it('Should search a remote video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searches = [
                'http://localhost:' + servers[1].port + '/w/' + videoServer2UUID,
                'http://localhost:' + servers[1].port + '/videos/watch/' + videoServer2UUID
            ];
            for (const search of searches) {
                const body = yield command.searchVideos({ search, token: servers[0].accessToken });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('video 1 on server 2');
            }
        });
    });
    it('Should not list this remote video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.list();
            expect(total).to.equal(1);
            expect(data).to.have.lengthOf(1);
            expect(data[0].name).to.equal('video 1 on server 1');
        });
    });
    it('Should update video of server 2, and refresh it on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const channelAttributes = {
                name: 'super_channel',
                displayName: 'super channel'
            };
            const created = yield servers[1].channels.create({ attributes: channelAttributes });
            const videoChannelId = created.id;
            const attributes = {
                name: 'updated',
                tag: ['tag1', 'tag2'],
                privacy: 2,
                channelId: videoChannelId
            };
            yield servers[1].videos.update({ id: videoServer2UUID, attributes });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/videos/watch/' + videoServer2UUID;
            yield command.searchVideos({ search, token: servers[0].accessToken });
            yield extra_utils_1.wait(5000);
            const body = yield command.searchVideos({ search, token: servers[0].accessToken });
            expect(body.total).to.equal(1);
            expect(body.data).to.have.lengthOf(1);
            const video = body.data[0];
            expect(video.name).to.equal('updated');
            expect(video.channel.name).to.equal('super_channel');
            expect(video.privacy.id).to.equal(2);
        });
    });
    it('Should delete video of server 2, and delete it on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield servers[1].videos.remove({ id: videoServer2UUID });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/videos/watch/' + videoServer2UUID;
            yield command.searchVideos({ search, token: servers[0].accessToken });
            yield extra_utils_1.wait(5000);
            const body = yield command.searchVideos({ search, token: servers[0].accessToken });
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
