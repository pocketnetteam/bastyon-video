"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
function postCommand(server, command, bodyArg) {
    const body = { command };
    if (bodyArg)
        Object.assign(body, bodyArg);
    return (0, extra_utils_1.makePostBodyRequest)({
        url: server.url,
        path: '/plugins/test-four/router/commander',
        fields: body,
        expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
    });
}
describe('Test plugin helpers', function () {
    let servers;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            yield servers[0].plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-four') });
        });
    });
    describe('Logger', function () {
        it('Should have logged things', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].servers.waitUntilLog('localhost:' + servers[0].port + ' peertube-plugin-test-four', 1, false);
                yield servers[0].servers.waitUntilLog('Hello world from plugin four', 1);
            });
        });
    });
    describe('Database', function () {
        it('Should have made a query', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].servers.waitUntilLog(`root email is admin${servers[0].internalServerNumber}@example.com`);
            });
        });
    });
    describe('Config', function () {
        it('Should have the correct webserver url', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].servers.waitUntilLog(`server url is http://localhost:${servers[0].port}`);
            });
        });
        it('Should have the correct config', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[0].url,
                    path: '/plugins/test-four/router/server-config',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                (0, chai_1.expect)(res.body.serverConfig).to.exist;
                (0, chai_1.expect)(res.body.serverConfig.instance.name).to.equal('PeerTube');
            });
        });
    });
    describe('Server', function () {
        it('Should get the server actor', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].servers.waitUntilLog('server actor name is peertube');
            });
        });
    });
    describe('Plugin', function () {
        it('Should get the base static route', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[0].url,
                    path: '/plugins/test-four/router/static-route',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                (0, chai_1.expect)(res.body.staticRoute).to.equal('/plugins/test-four/0.0.1/static/');
            });
        });
        it('Should get the base static route', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const baseRouter = '/plugins/test-four/0.0.1/router/';
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[0].url,
                    path: baseRouter + 'router-route',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                (0, chai_1.expect)(res.body.routerRoute).to.equal(baseRouter);
            });
        });
    });
    describe('User', function () {
        it('Should not get a user if not authenticated', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[0].url,
                    path: '/plugins/test-four/router/user',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should get a user if authenticated', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: servers[0].url,
                    token: servers[0].accessToken,
                    path: '/plugins/test-four/router/user',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                (0, chai_1.expect)(res.body.username).to.equal('root');
                (0, chai_1.expect)(res.body.displayName).to.equal('root');
                (0, chai_1.expect)(res.body.isAdmin).to.be.true;
                (0, chai_1.expect)(res.body.isModerator).to.be.false;
                (0, chai_1.expect)(res.body.isUser).to.be.false;
            });
        });
    });
    describe('Moderation', function () {
        let videoUUIDServer1;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                {
                    const res = yield servers[0].videos.quickUpload({ name: 'video server 1' });
                    videoUUIDServer1 = res.uuid;
                }
                {
                    yield servers[1].videos.quickUpload({ name: 'video server 2' });
                }
                yield (0, extra_utils_1.waitJobs)(servers);
                const { data } = yield servers[0].videos.list();
                (0, chai_1.expect)(data).to.have.lengthOf(2);
            });
        });
        it('Should mute server 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield postCommand(servers[0], 'blockServer', { hostToBlock: `localhost:${servers[1].port}` });
                const { data } = yield servers[0].videos.list();
                (0, chai_1.expect)(data).to.have.lengthOf(1);
                (0, chai_1.expect)(data[0].name).to.equal('video server 1');
            });
        });
        it('Should unmute server 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield postCommand(servers[0], 'unblockServer', { hostToUnblock: `localhost:${servers[1].port}` });
                const { data } = yield servers[0].videos.list();
                (0, chai_1.expect)(data).to.have.lengthOf(2);
            });
        });
        it('Should mute account of server 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield postCommand(servers[0], 'blockAccount', { handleToBlock: `root@localhost:${servers[1].port}` });
                const { data } = yield servers[0].videos.list();
                (0, chai_1.expect)(data).to.have.lengthOf(1);
                (0, chai_1.expect)(data[0].name).to.equal('video server 1');
            });
        });
        it('Should unmute account of server 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield postCommand(servers[0], 'unblockAccount', { handleToUnblock: `root@localhost:${servers[1].port}` });
                const { data } = yield servers[0].videos.list();
                (0, chai_1.expect)(data).to.have.lengthOf(2);
            });
        });
        it('Should blacklist video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield postCommand(servers[0], 'blacklist', { videoUUID: videoUUIDServer1, unfederate: true });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    (0, chai_1.expect)(data).to.have.lengthOf(1);
                    (0, chai_1.expect)(data[0].name).to.equal('video server 2');
                }
            });
        });
        it('Should unblacklist video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield postCommand(servers[0], 'unblacklist', { videoUUID: videoUUIDServer1 });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    (0, chai_1.expect)(data).to.have.lengthOf(2);
                }
            });
        });
    });
    describe('Videos', function () {
        let videoUUID;
        before(() => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const res = yield servers[0].videos.quickUpload({ name: 'video1' });
            videoUUID = res.uuid;
        }));
        it('Should remove a video after a view', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(40000);
                const video = yield servers[0].videos.get({ id: videoUUID });
                yield servers[0].videos.view({ id: videoUUID });
                yield servers[0].servers.waitUntilLog('Video deleted by plugin four.');
                try {
                    yield servers[0].videos.get({ id: videoUUID });
                    throw new Error('Video exists');
                }
                catch (err) {
                    if (err.message.includes('exists'))
                        throw err;
                }
                yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server: servers[0], video });
            });
        });
        it('Should have fetched the video by URL', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].servers.waitUntilLog(`video from DB uuid is ${videoUUID}`);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
