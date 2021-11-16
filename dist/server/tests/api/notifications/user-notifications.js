"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const uuid_1 = require("@server/helpers/uuid");
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test user notifications', function () {
    let servers = [];
    let userAccessToken;
    let userNotifications = [];
    let adminNotifications = [];
    let adminNotificationsServer2 = [];
    let emails = [];
    let channelId;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const res = yield extra_utils_1.prepareNotificationsTest(3);
            emails = res.emails;
            userAccessToken = res.userAccessToken;
            servers = res.servers;
            userNotifications = res.userNotifications;
            adminNotifications = res.adminNotifications;
            adminNotificationsServer2 = res.adminNotificationsServer2;
            channelId = res.channelId;
        });
    });
    describe('New video from my subscription notification', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: userNotifications,
                token: userAccessToken
            };
        });
        it('Should not send notifications if the user does not follow the video publisher', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                yield extra_utils_1.uploadRandomVideoOnServers(servers, 1);
                const notification = yield servers[0].notifications.getLastest({ token: userAccessToken });
                expect(notification).to.be.undefined;
                expect(emails).to.have.lengthOf(0);
                expect(userNotifications).to.have.lengthOf(0);
            });
        });
        it('Should send a new video notification if the user follows the local video publisher', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                yield servers[0].subscriptions.add({ token: userAccessToken, targetUri: 'root_channel@localhost:' + servers[0].port });
                yield extra_utils_1.waitJobs(servers);
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 1);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a new video notification from a remote account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(150000);
                yield servers[0].subscriptions.add({ token: userAccessToken, targetUri: 'root_channel@localhost:' + servers[1].port });
                yield extra_utils_1.waitJobs(servers);
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a new video notification on a scheduled publication', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const updateAt = new Date(new Date().getTime() + 2000);
                const data = {
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 1, data);
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a new video notification on a remote scheduled publication', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(100000);
                const updateAt = new Date(new Date().getTime() + 2000);
                const data = {
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, data);
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should not send a notification before the video is published', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const updateAt = new Date(new Date().getTime() + 1000000);
                const data = {
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 1, data);
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should send a new video notification when a video becomes public', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const data = { privacy: 3 };
                const { name, uuid, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 1, data);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
                yield servers[0].videos.update({ id: uuid, attributes: { privacy: 1 } });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a new video notification when a remote video becomes public', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const data = { privacy: 3 };
                const { name, uuid, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, data);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
                yield servers[1].videos.update({ id: uuid, attributes: { privacy: 1 } });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should not send a new video notification when a video becomes unlisted', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const data = { privacy: 3 };
                const { name, uuid, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 1, data);
                yield servers[0].videos.update({ id: uuid, attributes: { privacy: 2 } });
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should not send a new video notification when a remote video becomes unlisted', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const data = { privacy: 3 };
                const { name, uuid, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, data);
                yield servers[1].videos.update({ id: uuid, attributes: { privacy: 2 } });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should send a new video notification after a video import', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(100000);
                const name = 'video import ' + uuid_1.buildUUID();
                const attributes = {
                    name,
                    channelId,
                    privacy: 1,
                    targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo
                };
                const { video } = yield servers[0].imports.importVideo({ attributes });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewVideoFromSubscription(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID: video.shortUUID, checkType: 'presence' }));
            });
        });
    });
    describe('My video is published', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[1],
                emails,
                socketNotifications: adminNotificationsServer2,
                token: servers[1].accessToken
            };
        });
        it('Should not send a notification if transcoding is not enabled', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 1);
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkVideoIsPublished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should not send a notification if the wait transcoding is false', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, { waitTranscoding: false });
                yield extra_utils_1.waitJobs(servers);
                const notification = yield servers[0].notifications.getLastest({ token: userAccessToken });
                if (notification) {
                    expect(notification.type).to.not.equal(6);
                }
            });
        });
        it('Should send a notification even if the video is not transcoded in other resolutions', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, { waitTranscoding: true, fixture: 'video_short_240p.mp4' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkVideoIsPublished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a notification with a transcoded video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, { waitTranscoding: true });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkVideoIsPublished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a notification when an imported video is transcoded', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const name = 'video import ' + uuid_1.buildUUID();
                const attributes = {
                    name,
                    channelId,
                    privacy: 1,
                    targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo,
                    waitTranscoding: true
                };
                const { video } = yield servers[1].imports.importVideo({ attributes });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkVideoIsPublished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID: video.shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a notification when the scheduled update has been proceeded', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(70000);
                const updateAt = new Date(new Date().getTime() + 2000);
                const data = {
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, data);
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkVideoIsPublished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should not send a notification before the video is published', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                const updateAt = new Date(new Date().getTime() + 1000000);
                const data = {
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { name, shortUUID } = yield extra_utils_1.uploadRandomVideoOnServers(servers, 2, data);
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkVideoIsPublished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
    });
    describe('My video is imported', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: adminNotifications,
                token: servers[0].accessToken
            };
        });
        it('Should send a notification when the video import failed', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(70000);
                const name = 'video import ' + uuid_1.buildUUID();
                const attributes = {
                    name,
                    channelId,
                    privacy: 3,
                    targetUrl: extra_utils_1.FIXTURE_URLS.badVideo
                };
                const { video: { shortUUID } } = yield servers[0].imports.importVideo({ attributes });
                yield extra_utils_1.waitJobs(servers);
                const url = extra_utils_1.FIXTURE_URLS.badVideo;
                yield extra_utils_1.checkMyVideoImportIsFinished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, url, success: false, checkType: 'presence' }));
            });
        });
        it('Should send a notification when the video import succeeded', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(70000);
                const name = 'video import ' + uuid_1.buildUUID();
                const attributes = {
                    name,
                    channelId,
                    privacy: 3,
                    targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo
                };
                const { video: { shortUUID } } = yield servers[0].imports.importVideo({ attributes });
                yield extra_utils_1.waitJobs(servers);
                const url = extra_utils_1.FIXTURE_URLS.goodVideo;
                yield extra_utils_1.checkMyVideoImportIsFinished(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, url, success: true, checkType: 'presence' }));
            });
        });
    });
    describe('New actor follow', function () {
        let baseParams;
        const myChannelName = 'super channel name';
        const myUserName = 'super user name';
        before(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: userNotifications,
                token: userAccessToken
            };
            yield servers[0].users.updateMe({ displayName: 'super root name' });
            yield servers[0].users.updateMe({
                token: userAccessToken,
                displayName: myUserName
            });
            yield servers[1].users.updateMe({ displayName: 'super root 2 name' });
            yield servers[0].channels.update({
                token: userAccessToken,
                channelName: 'user_1_channel',
                attributes: { displayName: myChannelName }
            });
        }));
        it('Should notify when a local channel is following one of our channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                yield servers[0].subscriptions.add({ targetUri: 'user_1_channel@localhost:' + servers[0].port });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewActorFollow(Object.assign(Object.assign({}, baseParams), { followType: 'channel', followerName: 'root', followerDisplayName: 'super root name', followingDisplayName: myChannelName, checkType: 'presence' }));
                yield servers[0].subscriptions.remove({ uri: 'user_1_channel@localhost:' + servers[0].port });
            });
        });
        it('Should notify when a remote channel is following one of our channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                yield servers[1].subscriptions.add({ targetUri: 'user_1_channel@localhost:' + servers[0].port });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewActorFollow(Object.assign(Object.assign({}, baseParams), { followType: 'channel', followerName: 'root', followerDisplayName: 'super root 2 name', followingDisplayName: myChannelName, checkType: 'presence' }));
                yield servers[1].subscriptions.remove({ uri: 'user_1_channel@localhost:' + servers[0].port });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
