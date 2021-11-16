"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test videos history', function () {
    let server = null;
    let video1UUID;
    let video2UUID;
    let video3UUID;
    let video3WatchedDate;
    let userAccessToken;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            command = server.history;
            {
                const { uuid } = yield server.videos.upload({ attributes: { name: 'video 1' } });
                video1UUID = uuid;
            }
            {
                const { uuid } = yield server.videos.upload({ attributes: { name: 'video 2' } });
                video2UUID = uuid;
            }
            {
                const { uuid } = yield server.videos.upload({ attributes: { name: 'video 3' } });
                video3UUID = uuid;
            }
            const user = {
                username: 'user_1',
                password: 'super password'
            };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
        });
    });
    it('Should get videos, without watching history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield server.videos.listWithToken();
            for (const video of data) {
                const videoDetails = yield server.videos.getWithToken({ id: video.id });
                expect(video.userHistory).to.be.undefined;
                expect(videoDetails.userHistory).to.be.undefined;
            }
        });
    });
    it('Should watch the first and second video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.wathVideo({ videoId: video2UUID, currentTime: 8 });
            yield command.wathVideo({ videoId: video1UUID, currentTime: 3 });
        });
    });
    it('Should return the correct history when listing, searching and getting videos', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const videosOfVideos = [];
            {
                const { data } = yield server.videos.listWithToken();
                videosOfVideos.push(data);
            }
            {
                const body = yield server.search.searchVideos({ token: server.accessToken, search: 'video' });
                videosOfVideos.push(body.data);
            }
            for (const videos of videosOfVideos) {
                const video1 = videos.find(v => v.uuid === video1UUID);
                const video2 = videos.find(v => v.uuid === video2UUID);
                const video3 = videos.find(v => v.uuid === video3UUID);
                expect(video1.userHistory).to.not.be.undefined;
                expect(video1.userHistory.currentTime).to.equal(3);
                expect(video2.userHistory).to.not.be.undefined;
                expect(video2.userHistory.currentTime).to.equal(8);
                expect(video3.userHistory).to.be.undefined;
            }
            {
                const videoDetails = yield server.videos.getWithToken({ id: video1UUID });
                expect(videoDetails.userHistory).to.not.be.undefined;
                expect(videoDetails.userHistory.currentTime).to.equal(3);
            }
            {
                const videoDetails = yield server.videos.getWithToken({ id: video2UUID });
                expect(videoDetails.userHistory).to.not.be.undefined;
                expect(videoDetails.userHistory.currentTime).to.equal(8);
            }
            {
                const videoDetails = yield server.videos.getWithToken({ id: video3UUID });
                expect(videoDetails.userHistory).to.be.undefined;
            }
        });
    });
    it('Should have these videos when listing my history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            video3WatchedDate = new Date();
            yield command.wathVideo({ videoId: video3UUID, currentTime: 2 });
            const body = yield command.list();
            expect(body.total).to.equal(3);
            const videos = body.data;
            expect(videos[0].name).to.equal('video 3');
            expect(videos[1].name).to.equal('video 1');
            expect(videos[2].name).to.equal('video 2');
        });
    });
    it('Should not have videos history on another user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.list({ token: userAccessToken });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should be able to search through videos in my history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.list({ search: '2' });
            expect(body.total).to.equal(1);
            const videos = body.data;
            expect(videos[0].name).to.equal('video 2');
        });
    });
    it('Should clear my history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.remove({ beforeDate: video3WatchedDate.toISOString() });
        });
    });
    it('Should have my history cleared', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.list();
            expect(body.total).to.equal(1);
            const videos = body.data;
            expect(videos[0].name).to.equal('video 3');
        });
    });
    it('Should disable videos history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.updateMe({
                videosHistoryEnabled: false
            });
            yield command.wathVideo({ videoId: video2UUID, currentTime: 8, expectedStatus: models_1.HttpStatusCode.CONFLICT_409 });
        });
    });
    it('Should re-enable videos history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.updateMe({
                videosHistoryEnabled: true
            });
            yield command.wathVideo({ videoId: video1UUID, currentTime: 8 });
            const body = yield command.list();
            expect(body.total).to.equal(2);
            const videos = body.data;
            expect(videos[0].name).to.equal('video 1');
            expect(videos[1].name).to.equal('video 3');
        });
    });
    it('Should not clean old history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            yield extra_utils_1.killallServers([server]);
            yield server.run({ history: { videos: { max_age: '10 days' } } });
            yield extra_utils_1.wait(6000);
            const body = yield command.list();
            expect(body.total).to.equal(2);
        });
    });
    it('Should clean old history', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            yield extra_utils_1.killallServers([server]);
            yield server.run({ history: { videos: { max_age: '5 seconds' } } });
            yield extra_utils_1.wait(6000);
            const body = yield command.list();
            expect(body.total).to.equal(0);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
