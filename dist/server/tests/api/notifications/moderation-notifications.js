"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const uuid_1 = require("@server/helpers/uuid");
const extra_utils_1 = require("@shared/extra-utils");
describe('Test moderation notifications', function () {
    let servers = [];
    let userAccessToken;
    let userNotifications = [];
    let adminNotifications = [];
    let adminNotificationsServer2 = [];
    let emails = [];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            const res = yield (0, extra_utils_1.prepareNotificationsTest)(3);
            emails = res.emails;
            userAccessToken = res.userAccessToken;
            servers = res.servers;
            userNotifications = res.userNotifications;
            adminNotifications = res.adminNotifications;
            adminNotificationsServer2 = res.adminNotificationsServer2;
        });
    });
    describe('Abuse for moderators notification', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: adminNotifications,
                token: servers[0].accessToken
            };
        });
        it('Should send a notification to moderators on local video abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const name = 'video for abuse ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                yield servers[0].abuses.report({ videoId: video.id, reason: 'super reason' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewVideoAbuseForModerators)(Object.assign(Object.assign({}, baseParams), { shortUUID: video.shortUUID, videoName: name, checkType: 'presence' }));
            });
        });
        it('Should send a notification to moderators on remote video abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const name = 'video for abuse ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                yield (0, extra_utils_1.waitJobs)(servers);
                const videoId = yield servers[1].videos.getId({ uuid: video.uuid });
                yield servers[1].abuses.report({ videoId, reason: 'super reason' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewVideoAbuseForModerators)(Object.assign(Object.assign({}, baseParams), { shortUUID: video.shortUUID, videoName: name, checkType: 'presence' }));
            });
        });
        it('Should send a notification to moderators on local comment abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const name = 'video for abuse ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                const comment = yield servers[0].comments.createThread({
                    token: userAccessToken,
                    videoId: video.id,
                    text: 'comment abuse ' + (0, uuid_1.buildUUID)()
                });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].abuses.report({ commentId: comment.id, reason: 'super reason' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewCommentAbuseForModerators)(Object.assign(Object.assign({}, baseParams), { shortUUID: video.shortUUID, videoName: name, checkType: 'presence' }));
            });
        });
        it('Should send a notification to moderators on remote comment abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const name = 'video for abuse ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                yield servers[0].comments.createThread({
                    token: userAccessToken,
                    videoId: video.id,
                    text: 'comment abuse ' + (0, uuid_1.buildUUID)()
                });
                yield (0, extra_utils_1.waitJobs)(servers);
                const { data } = yield servers[1].comments.listThreads({ videoId: video.uuid });
                const commentId = data[0].id;
                yield servers[1].abuses.report({ commentId, reason: 'super reason' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewCommentAbuseForModerators)(Object.assign(Object.assign({}, baseParams), { shortUUID: video.shortUUID, videoName: name, checkType: 'presence' }));
            });
        });
        it('Should send a notification to moderators on local account abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const username = 'user' + new Date().getTime();
                const { account } = yield servers[0].users.create({ username, password: 'donald' });
                const accountId = account.id;
                yield servers[0].abuses.report({ accountId, reason: 'super reason' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewAccountAbuseForModerators)(Object.assign(Object.assign({}, baseParams), { displayName: username, checkType: 'presence' }));
            });
        });
        it('Should send a notification to moderators on remote account abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const username = 'user' + new Date().getTime();
                const tmpToken = yield servers[0].users.generateUserAndToken(username);
                yield servers[0].videos.upload({ token: tmpToken, attributes: { name: 'super video' } });
                yield (0, extra_utils_1.waitJobs)(servers);
                const account = yield servers[1].accounts.get({ accountName: username + '@' + servers[0].host });
                yield servers[1].abuses.report({ accountId: account.id, reason: 'super reason' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewAccountAbuseForModerators)(Object.assign(Object.assign({}, baseParams), { displayName: username, checkType: 'presence' }));
            });
        });
    });
    describe('Abuse state change notification', function () {
        let baseParams;
        let abuseId;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                baseParams = {
                    server: servers[0],
                    emails,
                    socketNotifications: userNotifications,
                    token: userAccessToken
                };
                const name = 'abuse ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                const body = yield servers[0].abuses.report({ token: userAccessToken, videoId: video.id, reason: 'super reason' });
                abuseId = body.abuse.id;
            });
        });
        it('Should send a notification to reporter if the abuse has been accepted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].abuses.update({ abuseId, body: { state: 3 } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkAbuseStateChange)(Object.assign(Object.assign({}, baseParams), { abuseId, state: 3, checkType: 'presence' }));
            });
        });
        it('Should send a notification to reporter if the abuse has been rejected', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].abuses.update({ abuseId, body: { state: 2 } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkAbuseStateChange)(Object.assign(Object.assign({}, baseParams), { abuseId, state: 2, checkType: 'presence' }));
            });
        });
    });
    describe('New abuse message notification', function () {
        let baseParamsUser;
        let baseParamsAdmin;
        let abuseId;
        let abuseId2;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                baseParamsUser = {
                    server: servers[0],
                    emails,
                    socketNotifications: userNotifications,
                    token: userAccessToken
                };
                baseParamsAdmin = {
                    server: servers[0],
                    emails,
                    socketNotifications: adminNotifications,
                    token: servers[0].accessToken
                };
                const name = 'abuse ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                {
                    const body = yield servers[0].abuses.report({ token: userAccessToken, videoId: video.id, reason: 'super reason' });
                    abuseId = body.abuse.id;
                }
                {
                    const body = yield servers[0].abuses.report({ token: userAccessToken, videoId: video.id, reason: 'super reason 2' });
                    abuseId2 = body.abuse.id;
                }
            });
        });
        it('Should send a notification to reporter on new message', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const message = 'my super message to users';
                yield servers[0].abuses.addMessage({ abuseId, message });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewAbuseMessage)(Object.assign(Object.assign({}, baseParamsUser), { abuseId, message, toEmail: 'user_1@example.com', checkType: 'presence' }));
            });
        });
        it('Should not send a notification to the admin if sent by the admin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const message = 'my super message that should not be sent to the admin';
                yield servers[0].abuses.addMessage({ abuseId, message });
                yield (0, extra_utils_1.waitJobs)(servers);
                const toEmail = 'admin' + servers[0].internalServerNumber + '@example.com';
                yield (0, extra_utils_1.checkNewAbuseMessage)(Object.assign(Object.assign({}, baseParamsAdmin), { abuseId, message, toEmail, checkType: 'absence' }));
            });
        });
        it('Should send a notification to moderators', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const message = 'my super message to moderators';
                yield servers[0].abuses.addMessage({ token: userAccessToken, abuseId: abuseId2, message });
                yield (0, extra_utils_1.waitJobs)(servers);
                const toEmail = 'admin' + servers[0].internalServerNumber + '@example.com';
                yield (0, extra_utils_1.checkNewAbuseMessage)(Object.assign(Object.assign({}, baseParamsAdmin), { abuseId: abuseId2, message, toEmail, checkType: 'presence' }));
            });
        });
        it('Should not send a notification to reporter if sent by the reporter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const message = 'my super message that should not be sent to reporter';
                yield servers[0].abuses.addMessage({ token: userAccessToken, abuseId: abuseId2, message });
                yield (0, extra_utils_1.waitJobs)(servers);
                const toEmail = 'user_1@example.com';
                yield (0, extra_utils_1.checkNewAbuseMessage)(Object.assign(Object.assign({}, baseParamsUser), { abuseId: abuseId2, message, toEmail, checkType: 'absence' }));
            });
        });
    });
    describe('Video blacklist on my video', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: userNotifications,
                token: userAccessToken
            };
        });
        it('Should send a notification to video owner on blacklist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const name = 'video for abuse ' + (0, uuid_1.buildUUID)();
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                yield servers[0].blacklist.add({ videoId: uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewBlacklistOnMyVideo)(Object.assign(Object.assign({}, baseParams), { shortUUID, videoName: name, blacklistType: 'blacklist' }));
            });
        });
        it('Should send a notification to video owner on unblacklist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const name = 'video for abuse ' + (0, uuid_1.buildUUID)();
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name } });
                yield servers[0].blacklist.add({ videoId: uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].blacklist.remove({ videoId: uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(500);
                yield (0, extra_utils_1.checkNewBlacklistOnMyVideo)(Object.assign(Object.assign({}, baseParams), { shortUUID, videoName: name, blacklistType: 'unblacklist' }));
            });
        });
    });
    describe('New registration', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: adminNotifications,
                token: servers[0].accessToken
            };
        });
        it('Should send a notification only to moderators when a user registers on the instance', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].users.register({ username: 'user_45' });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkUserRegistered)(Object.assign(Object.assign({}, baseParams), { username: 'user_45', checkType: 'presence' }));
                const userOverride = { socketNotifications: userNotifications, token: userAccessToken, check: { web: true, mail: false } };
                yield (0, extra_utils_1.checkUserRegistered)(Object.assign(Object.assign(Object.assign({}, baseParams), userOverride), { username: 'user_45', checkType: 'absence' }));
            });
        });
    });
    describe('New instance follows', function () {
        const instanceIndexServer = new extra_utils_1.MockInstancesIndex();
        let config;
        let baseParams;
        before(() => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: adminNotifications,
                token: servers[0].accessToken
            };
            const port = yield instanceIndexServer.initialize();
            instanceIndexServer.addInstance(servers[1].host);
            config = {
                followings: {
                    instance: {
                        autoFollowIndex: {
                            indexUrl: `http://localhost:${port}/api/v1/instances/hosts`,
                            enabled: true
                        }
                    }
                }
            };
        }));
        it('Should send a notification only to admin when there is a new instance follower', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield servers[2].follows.follow({ hosts: [servers[0].url] });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewInstanceFollower)(Object.assign(Object.assign({}, baseParams), { followerHost: 'localhost:' + servers[2].port, checkType: 'presence' }));
                const userOverride = { socketNotifications: userNotifications, token: userAccessToken, check: { web: true, mail: false } };
                yield (0, extra_utils_1.checkNewInstanceFollower)(Object.assign(Object.assign(Object.assign({}, baseParams), userOverride), { followerHost: 'localhost:' + servers[2].port, checkType: 'absence' }));
            });
        });
        it('Should send a notification on auto follow back', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(40000);
                yield servers[2].follows.unfollow({ target: servers[0] });
                yield (0, extra_utils_1.waitJobs)(servers);
                const config = {
                    followings: {
                        instance: {
                            autoFollowBack: { enabled: true }
                        }
                    }
                };
                yield servers[0].config.updateCustomSubConfig({ newConfig: config });
                yield servers[2].follows.follow({ hosts: [servers[0].url] });
                yield (0, extra_utils_1.waitJobs)(servers);
                const followerHost = servers[0].host;
                const followingHost = servers[2].host;
                yield (0, extra_utils_1.checkAutoInstanceFollowing)(Object.assign(Object.assign({}, baseParams), { followerHost, followingHost, checkType: 'presence' }));
                const userOverride = { socketNotifications: userNotifications, token: userAccessToken, check: { web: true, mail: false } };
                yield (0, extra_utils_1.checkAutoInstanceFollowing)(Object.assign(Object.assign(Object.assign({}, baseParams), userOverride), { followerHost, followingHost, checkType: 'absence' }));
                config.followings.instance.autoFollowBack.enabled = false;
                yield servers[0].config.updateCustomSubConfig({ newConfig: config });
                yield servers[0].follows.unfollow({ target: servers[2] });
                yield servers[2].follows.unfollow({ target: servers[0] });
            });
        });
        it('Should send a notification on auto instances index follow', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].follows.unfollow({ target: servers[1] });
                yield servers[0].config.updateCustomSubConfig({ newConfig: config });
                yield (0, extra_utils_1.wait)(5000);
                yield (0, extra_utils_1.waitJobs)(servers);
                const followerHost = servers[0].host;
                const followingHost = servers[1].host;
                yield (0, extra_utils_1.checkAutoInstanceFollowing)(Object.assign(Object.assign({}, baseParams), { followerHost, followingHost, checkType: 'presence' }));
                config.followings.instance.autoFollowIndex.enabled = false;
                yield servers[0].config.updateCustomSubConfig({ newConfig: config });
                yield servers[0].follows.unfollow({ target: servers[1] });
            });
        });
    });
    describe('Video-related notifications when video auto-blacklist is enabled', function () {
        let userBaseParams;
        let adminBaseParamsServer1;
        let adminBaseParamsServer2;
        let uuid;
        let shortUUID;
        let videoName;
        let currentCustomConfig;
        before(() => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            adminBaseParamsServer1 = {
                server: servers[0],
                emails,
                socketNotifications: adminNotifications,
                token: servers[0].accessToken
            };
            adminBaseParamsServer2 = {
                server: servers[1],
                emails,
                socketNotifications: adminNotificationsServer2,
                token: servers[1].accessToken
            };
            userBaseParams = {
                server: servers[0],
                emails,
                socketNotifications: userNotifications,
                token: userAccessToken
            };
            currentCustomConfig = yield servers[0].config.getCustomConfig();
            const autoBlacklistTestsCustomConfig = Object.assign(Object.assign({}, currentCustomConfig), { autoBlacklist: {
                    videos: {
                        ofUsers: {
                            enabled: true
                        }
                    }
                } });
            autoBlacklistTestsCustomConfig.transcoding.enabled = true;
            yield servers[0].config.updateCustomConfig({ newCustomConfig: autoBlacklistTestsCustomConfig });
            yield servers[0].subscriptions.add({ targetUri: 'user_1_channel@localhost:' + servers[0].port });
            yield servers[1].subscriptions.add({ targetUri: 'user_1_channel@localhost:' + servers[0].port });
        }));
        it('Should send notification to moderators on new video with auto-blacklist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(40000);
                videoName = 'video with auto-blacklist ' + (0, uuid_1.buildUUID)();
                const video = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name: videoName } });
                shortUUID = video.shortUUID;
                uuid = video.uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkVideoAutoBlacklistForModerators)(Object.assign(Object.assign({}, adminBaseParamsServer1), { shortUUID, videoName, checkType: 'presence' }));
            });
        });
        it('Should not send video publish notification if auto-blacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkVideoIsPublished)(Object.assign(Object.assign({}, userBaseParams), { videoName, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should not send a local user subscription notification if auto-blacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer1), { videoName, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should not send a remote user subscription notification if auto-blacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer2), { videoName, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should send video published and unblacklist after video unblacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(40000);
                yield servers[0].blacklist.remove({ videoId: uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should send a local user subscription notification after removed from blacklist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer1), { videoName, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send a remote user subscription notification after removed from blacklist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer2), { videoName, shortUUID, checkType: 'presence' }));
            });
        });
        it('Should send unblacklist but not published/subscription notes after unblacklisted if scheduled update pending', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(40000);
                const updateAt = new Date(new Date().getTime() + 1000000);
                const name = 'video with auto-blacklist and future schedule ' + (0, uuid_1.buildUUID)();
                const attributes = {
                    name,
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { shortUUID, uuid } = yield servers[0].videos.upload({ token: userAccessToken, attributes });
                yield servers[0].blacklist.remove({ videoId: uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkNewBlacklistOnMyVideo)(Object.assign(Object.assign({}, userBaseParams), { shortUUID, videoName: name, blacklistType: 'unblacklist' }));
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer1), { videoName: name, shortUUID, checkType: 'absence' }));
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer2), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should not send publish/subscription notifications after scheduled update if video still auto-blacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(40000);
                const updateAt = new Date(new Date().getTime() + 2000);
                const name = 'video with schedule done and still auto-blacklisted ' + (0, uuid_1.buildUUID)();
                const attributes = {
                    name,
                    privacy: 3,
                    scheduleUpdate: {
                        updateAt: updateAt.toISOString(),
                        privacy: 1
                    }
                };
                const { shortUUID } = yield servers[0].videos.upload({ token: userAccessToken, attributes });
                yield (0, extra_utils_1.wait)(6000);
                yield (0, extra_utils_1.checkVideoIsPublished)(Object.assign(Object.assign({}, userBaseParams), { videoName: name, shortUUID, checkType: 'absence' }));
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer1), { videoName: name, shortUUID, checkType: 'absence' }));
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, adminBaseParamsServer2), { videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should not send a notification to moderators on new video without auto-blacklist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                const name = 'video without auto-blacklist ' + (0, uuid_1.buildUUID)();
                const { shortUUID } = yield servers[0].videos.upload({ attributes: { name } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkVideoAutoBlacklistForModerators)(Object.assign(Object.assign({}, adminBaseParamsServer1), { shortUUID, videoName: name, checkType: 'absence' }));
            });
        });
        after(() => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].config.updateCustomConfig({ newCustomConfig: currentCustomConfig });
            yield servers[0].subscriptions.remove({ uri: 'user_1_channel@localhost:' + servers[0].port });
            yield servers[1].subscriptions.remove({ uri: 'user_1_channel@localhost:' + servers[0].port });
        }));
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
