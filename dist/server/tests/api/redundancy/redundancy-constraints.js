"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
describe('Test redundancy constraints', function () {
    let remoteServer;
    let localServer;
    let servers;
    const remoteServerConfig = {
        redundancy: {
            videos: {
                check_interval: '1 second',
                strategies: [
                    {
                        strategy: 'recently-added',
                        min_lifetime: '1 hour',
                        size: '100MB',
                        min_views: 0
                    }
                ]
            }
        }
    };
    function uploadWrapper(videoName) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { id } = yield localServer.videos.upload({ attributes: { name: 'to transcode', privacy: 3 } });
            yield (0, extra_utils_1.waitJobs)([localServer]);
            yield localServer.videos.update({ id, attributes: { name: videoName, privacy: 1 } });
        });
    }
    function getTotalRedundanciesLocalServer() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield localServer.redundancy.listVideos({ target: 'my-videos' });
            return body.total;
        });
    }
    function getTotalRedundanciesRemoteServer() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield remoteServer.redundancy.listVideos({ target: 'remote-videos' });
            return body.total;
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            {
                remoteServer = yield (0, extra_utils_1.createSingleServer)(1, remoteServerConfig);
            }
            {
                const config = {
                    remote_redundancy: {
                        videos: {
                            accept_from: 'nobody'
                        }
                    }
                };
                localServer = yield (0, extra_utils_1.createSingleServer)(2, config);
            }
            servers = [remoteServer, localServer];
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield localServer.videos.upload({ attributes: { name: 'video 1 server 2' } });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield remoteServer.follows.follow({ hosts: [localServer.url] });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield remoteServer.redundancy.updateRedundancy({ host: localServer.host, redundancyAllowed: true });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should have redundancy on server 1 but not on server 2 with a nobody filter', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield (0, extra_utils_1.waitJobs)(servers);
            yield remoteServer.servers.waitUntilLog('Duplicated ', 5);
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const total = yield getTotalRedundanciesRemoteServer();
                (0, chai_1.expect)(total).to.equal(1);
            }
            {
                const total = yield getTotalRedundanciesLocalServer();
                (0, chai_1.expect)(total).to.equal(0);
            }
        });
    });
    it('Should have redundancy on server 1 and on server 2 with an anybody filter', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            const config = {
                remote_redundancy: {
                    videos: {
                        accept_from: 'anybody'
                    }
                }
            };
            yield (0, extra_utils_1.killallServers)([localServer]);
            yield localServer.run(config);
            yield uploadWrapper('video 2 server 2');
            yield remoteServer.servers.waitUntilLog('Duplicated ', 10);
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const total = yield getTotalRedundanciesRemoteServer();
                (0, chai_1.expect)(total).to.equal(2);
            }
            {
                const total = yield getTotalRedundanciesLocalServer();
                (0, chai_1.expect)(total).to.equal(1);
            }
        });
    });
    it('Should have redundancy on server 1 but not on server 2 with a followings filter', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            const config = {
                remote_redundancy: {
                    videos: {
                        accept_from: 'followings'
                    }
                }
            };
            yield (0, extra_utils_1.killallServers)([localServer]);
            yield localServer.run(config);
            yield uploadWrapper('video 3 server 2');
            yield remoteServer.servers.waitUntilLog('Duplicated ', 15);
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const total = yield getTotalRedundanciesRemoteServer();
                (0, chai_1.expect)(total).to.equal(3);
            }
            {
                const total = yield getTotalRedundanciesLocalServer();
                (0, chai_1.expect)(total).to.equal(1);
            }
        });
    });
    it('Should have redundancy on server 1 and on server 2 with followings filter now server 2 follows server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield localServer.follows.follow({ hosts: [remoteServer.url] });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield uploadWrapper('video 4 server 2');
            yield remoteServer.servers.waitUntilLog('Duplicated ', 20);
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const total = yield getTotalRedundanciesRemoteServer();
                (0, chai_1.expect)(total).to.equal(4);
            }
            {
                const total = yield getTotalRedundanciesLocalServer();
                (0, chai_1.expect)(total).to.equal(2);
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
