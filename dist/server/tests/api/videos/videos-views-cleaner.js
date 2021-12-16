"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("../../../../shared/extra-utils");
const expect = chai.expect;
describe('Test video views cleaner', function () {
    let servers;
    let videoIdServer1;
    let videoIdServer2;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            videoIdServer1 = (yield servers[0].videos.quickUpload({ name: 'video server 1' })).uuid;
            videoIdServer2 = (yield servers[1].videos.quickUpload({ name: 'video server 2' })).uuid;
            yield extra_utils_1.waitJobs(servers);
            yield servers[0].videos.view({ id: videoIdServer1 });
            yield servers[1].videos.view({ id: videoIdServer1 });
            yield servers[0].videos.view({ id: videoIdServer2 });
            yield servers[1].videos.view({ id: videoIdServer2 });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should not clean old video views', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            yield extra_utils_1.killallServers([servers[0]]);
            yield servers[0].run({ views: { videos: { remote: { max_age: '10 days' } } } });
            yield extra_utils_1.wait(6000);
            {
                for (const server of servers) {
                    const total = yield server.sql.countVideoViewsOf(videoIdServer1);
                    expect(total).to.equal(2, 'Server ' + server.serverNumber + ' does not have the correct amount of views');
                }
            }
            {
                for (const server of servers) {
                    const total = yield server.sql.countVideoViewsOf(videoIdServer2);
                    expect(total).to.equal(2, 'Server ' + server.serverNumber + ' does not have the correct amount of views');
                }
            }
        });
    });
    it('Should clean old video views', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            yield extra_utils_1.killallServers([servers[0]]);
            yield servers[0].run({ views: { videos: { remote: { max_age: '5 seconds' } } } });
            yield extra_utils_1.wait(6000);
            {
                for (const server of servers) {
                    const total = yield server.sql.countVideoViewsOf(videoIdServer1);
                    expect(total).to.equal(2);
                }
            }
            {
                const totalServer1 = yield servers[0].sql.countVideoViewsOf(videoIdServer2);
                expect(totalServer1).to.equal(0);
                const totalServer2 = yield servers[1].sql.countVideoViewsOf(videoIdServer2);
                expect(totalServer2).to.equal(2);
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
