"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function in10Seconds() {
    const now = new Date();
    now.setSeconds(now.getSeconds() + 10);
    return now;
}
describe('Test video update scheduler', function () {
    let servers = [];
    let video2UUID;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
        });
    });
    it('Should upload a video and schedule an update in 10 seconds', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const attributes = {
                name: 'video 1',
                privacy: 3,
                scheduleUpdate: {
                    updateAt: in10Seconds().toISOString(),
                    privacy: 1
                }
            };
            yield servers[0].videos.upload({ attributes });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should not list the video (in privacy mode)', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                const { total } = yield server.videos.list();
                expect(total).to.equal(0);
            }
        });
    });
    it('Should have my scheduled video in my account videos', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.listMyVideos();
            expect(total).to.equal(1);
            const videoFromList = data[0];
            const videoFromGet = yield servers[0].videos.getWithToken({ id: videoFromList.uuid });
            for (const video of [videoFromList, videoFromGet]) {
                expect(video.name).to.equal('video 1');
                expect(video.privacy.id).to.equal(3);
                expect(new Date(video.scheduledUpdate.updateAt)).to.be.above(new Date());
                expect(video.scheduledUpdate.privacy).to.equal(1);
            }
        });
    });
    it('Should wait some seconds and have the video in public privacy', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            yield extra_utils_1.wait(15000);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(1);
                expect(data[0].name).to.equal('video 1');
            }
        });
    });
    it('Should upload a video without scheduling an update', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const attributes = {
                name: 'video 2',
                privacy: 3
            };
            const { uuid } = yield servers[0].videos.upload({ attributes });
            video2UUID = uuid;
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should update a video by scheduling an update', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const attributes = {
                name: 'video 2 updated',
                scheduleUpdate: {
                    updateAt: in10Seconds().toISOString(),
                    privacy: 1
                }
            };
            yield servers[0].videos.update({ id: video2UUID, attributes });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should not display the updated video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                const { total } = yield server.videos.list();
                expect(total).to.equal(1);
            }
        });
    });
    it('Should have my scheduled updated video in my account videos', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.listMyVideos();
            expect(total).to.equal(2);
            const video = data.find(v => v.uuid === video2UUID);
            expect(video).not.to.be.undefined;
            expect(video.name).to.equal('video 2 updated');
            expect(video.privacy.id).to.equal(3);
            expect(new Date(video.scheduledUpdate.updateAt)).to.be.above(new Date());
            expect(video.scheduledUpdate.privacy).to.equal(1);
        });
    });
    it('Should wait some seconds and have the updated video in public privacy', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield extra_utils_1.wait(15000);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(2);
                const video = data.find(v => v.uuid === video2UUID);
                expect(video).not.to.be.undefined;
                expect(video.name).to.equal('video 2 updated');
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
