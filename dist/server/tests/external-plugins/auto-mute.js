"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Official plugin auto-mute', function () {
    const autoMuteListPath = '/plugins/auto-mute/router/api/v1/mute-list';
    let servers;
    let blocklistServer;
    let port;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            for (const server of servers) {
                yield server.plugins.install({ npmName: 'peertube-plugin-auto-mute' });
            }
            blocklistServer = new extra_utils_1.MockBlocklist();
            port = yield blocklistServer.initialize();
            yield servers[0].videos.quickUpload({ name: 'video server 1' });
            yield servers[1].videos.quickUpload({ name: 'video server 2' });
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should update plugin settings', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].plugins.updateSettings({
                npmName: 'peertube-plugin-auto-mute',
                settings: {
                    'blocklist-urls': `http://localhost:${port}/blocklist`,
                    'check-seconds-interval': 1
                }
            });
        });
    });
    it('Should add a server blocklist', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            blocklistServer.replace({
                data: [
                    {
                        value: 'localhost:' + servers[1].port
                    }
                ]
            });
            yield (0, extra_utils_1.wait)(2000);
            const { total } = yield servers[0].videos.list();
            (0, chai_1.expect)(total).to.equal(1);
        });
    });
    it('Should remove a server blocklist', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            blocklistServer.replace({
                data: [
                    {
                        value: 'localhost:' + servers[1].port,
                        action: 'remove'
                    }
                ]
            });
            yield (0, extra_utils_1.wait)(2000);
            const { total } = yield servers[0].videos.list();
            (0, chai_1.expect)(total).to.equal(2);
        });
    });
    it('Should add an account blocklist', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            blocklistServer.replace({
                data: [
                    {
                        value: 'root@localhost:' + servers[1].port
                    }
                ]
            });
            yield (0, extra_utils_1.wait)(2000);
            const { total } = yield servers[0].videos.list();
            (0, chai_1.expect)(total).to.equal(1);
        });
    });
    it('Should remove an account blocklist', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            blocklistServer.replace({
                data: [
                    {
                        value: 'root@localhost:' + servers[1].port,
                        action: 'remove'
                    }
                ]
            });
            yield (0, extra_utils_1.wait)(2000);
            const { total } = yield servers[0].videos.list();
            (0, chai_1.expect)(total).to.equal(2);
        });
    });
    it('Should auto mute an account, manually unmute it and do not remute it automatically', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(20000);
            const account = 'root@localhost:' + servers[1].port;
            blocklistServer.replace({
                data: [
                    {
                        value: account,
                        updatedAt: new Date().toISOString()
                    }
                ]
            });
            yield (0, extra_utils_1.wait)(2000);
            {
                const { total } = yield servers[0].videos.list();
                (0, chai_1.expect)(total).to.equal(1);
            }
            yield servers[0].blocklist.removeFromServerBlocklist({ account });
            {
                const { total } = yield servers[0].videos.list();
                (0, chai_1.expect)(total).to.equal(2);
            }
            yield (0, extra_utils_1.killallServers)([servers[0]]);
            yield servers[0].run();
            yield (0, extra_utils_1.wait)(2000);
            {
                const { total } = yield servers[0].videos.list();
                (0, chai_1.expect)(total).to.equal(2);
            }
        });
    });
    it('Should not expose the auto mute list', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.makeGetRequest)({
                url: servers[0].url,
                path: '/plugins/auto-mute/router/api/v1/mute-list',
                expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
            });
        });
    });
    it('Should enable auto mute list', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].plugins.updateSettings({
                npmName: 'peertube-plugin-auto-mute',
                settings: {
                    'blocklist-urls': '',
                    'check-seconds-interval': 1,
                    'expose-mute-list': true
                }
            });
            yield (0, extra_utils_1.makeGetRequest)({
                url: servers[0].url,
                path: '/plugins/auto-mute/router/api/v1/mute-list',
                expectedStatus: models_1.HttpStatusCode.OK_200
            });
        });
    });
    it('Should mute an account on server 1, and server 2 auto mutes it', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield servers[1].plugins.updateSettings({
                npmName: 'peertube-plugin-auto-mute',
                settings: {
                    'blocklist-urls': 'http://localhost:' + servers[0].port + autoMuteListPath,
                    'check-seconds-interval': 1,
                    'expose-mute-list': false
                }
            });
            yield servers[0].blocklist.addToServerBlocklist({ account: 'root@localhost:' + servers[1].port });
            yield servers[0].blocklist.addToMyBlocklist({ server: 'localhost:' + servers[1].port });
            const res = yield (0, extra_utils_1.makeGetRequest)({
                url: servers[0].url,
                path: '/plugins/auto-mute/router/api/v1/mute-list',
                expectedStatus: models_1.HttpStatusCode.OK_200
            });
            const data = res.body.data;
            (0, chai_1.expect)(data).to.have.lengthOf(1);
            (0, chai_1.expect)(data[0].updatedAt).to.exist;
            (0, chai_1.expect)(data[0].value).to.equal('root@localhost:' + servers[1].port);
            yield (0, extra_utils_1.wait)(2000);
            for (const server of servers) {
                const { total } = yield server.videos.list();
                (0, chai_1.expect)(total).to.equal(1);
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield blocklistServer.terminate();
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
