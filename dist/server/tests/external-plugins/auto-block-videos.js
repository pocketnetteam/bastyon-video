"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
function check(server, videoUUID, exists = true) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { data } = yield server.videos.list();
        const video = data.find(v => v.uuid === videoUUID);
        if (exists)
            chai_1.expect(video).to.not.be.undefined;
        else
            chai_1.expect(video).to.be.undefined;
    });
}
describe('Official plugin auto-block videos', function () {
    let servers;
    let blocklistServer;
    let server1Videos = [];
    let server2Videos = [];
    let port;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            for (const server of servers) {
                yield server.plugins.install({ npmName: 'peertube-plugin-auto-block-videos' });
            }
            blocklistServer = new extra_utils_1.MockBlocklist();
            port = yield blocklistServer.initialize();
            yield servers[0].videos.quickUpload({ name: 'video server 1' });
            yield servers[1].videos.quickUpload({ name: 'video server 2' });
            yield servers[1].videos.quickUpload({ name: 'video 2 server 2' });
            yield servers[1].videos.quickUpload({ name: 'video 3 server 2' });
            {
                const { data } = yield servers[0].videos.list();
                server1Videos = data.map(v => Object.assign(v, { url: servers[0].url + '/videos/watch/' + v.uuid }));
            }
            {
                const { data } = yield servers[1].videos.list();
                server2Videos = data.map(v => Object.assign(v, { url: servers[1].url + '/videos/watch/' + v.uuid }));
            }
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
        });
    });
    it('Should update plugin settings', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield servers[0].plugins.updateSettings({
                npmName: 'peertube-plugin-auto-block-videos',
                settings: {
                    'blocklist-urls': `http://localhost:${port}/blocklist`,
                    'check-seconds-interval': 1
                }
            });
        });
    });
    it('Should auto block a video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield check(servers[0], server2Videos[0].uuid, true);
            blocklistServer.replace({
                data: [
                    {
                        value: server2Videos[0].url
                    }
                ]
            });
            yield extra_utils_1.wait(2000);
            yield check(servers[0], server2Videos[0].uuid, false);
        });
    });
    it('Should have video in blacklists', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield servers[0].blacklist.list();
            const videoBlacklists = body.data;
            chai_1.expect(videoBlacklists).to.have.lengthOf(1);
            chai_1.expect(videoBlacklists[0].reason).to.contains('Automatically blocked from auto block plugin');
            chai_1.expect(videoBlacklists[0].video.name).to.equal(server2Videos[0].name);
        });
    });
    it('Should not block a local video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield check(servers[0], server1Videos[0].uuid, true);
            blocklistServer.replace({
                data: [
                    {
                        value: server1Videos[0].url
                    }
                ]
            });
            yield extra_utils_1.wait(2000);
            yield check(servers[0], server1Videos[0].uuid, true);
        });
    });
    it('Should remove a video block', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield check(servers[0], server2Videos[0].uuid, false);
            blocklistServer.replace({
                data: [
                    {
                        value: server2Videos[0].url,
                        action: 'remove'
                    }
                ]
            });
            yield extra_utils_1.wait(2000);
            yield check(servers[0], server2Videos[0].uuid, true);
        });
    });
    it('Should auto block a video, manually unblock it and do not reblock it automatically', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            const video = server2Videos[1];
            yield check(servers[0], video.uuid, true);
            blocklistServer.replace({
                data: [
                    {
                        value: video.url,
                        updatedAt: new Date().toISOString()
                    }
                ]
            });
            yield extra_utils_1.wait(2000);
            yield check(servers[0], video.uuid, false);
            yield servers[0].blacklist.remove({ videoId: video.uuid });
            yield check(servers[0], video.uuid, true);
            yield extra_utils_1.killallServers([servers[0]]);
            yield servers[0].run();
            yield extra_utils_1.wait(2000);
            yield check(servers[0], video.uuid, true);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield blocklistServer.terminate();
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
