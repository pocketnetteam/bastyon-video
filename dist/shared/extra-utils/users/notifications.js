"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNewPluginVersion = exports.checkNewPeerTubeVersion = exports.checkNewAccountAbuseForModerators = exports.checkNewCommentAbuseForModerators = exports.prepareNotificationsTest = exports.checkNewInstanceFollower = exports.checkAbuseStateChange = exports.checkNewAbuseMessage = exports.checkVideoAutoBlacklistForModerators = exports.checkNewVideoAbuseForModerators = exports.checkCommentMention = exports.checkNewBlacklistOnMyVideo = exports.checkNewCommentOnMyVideo = exports.checkNewActorFollow = exports.checkNewVideoFromSubscription = exports.checkVideoIsPublished = exports.checkAutoInstanceFollowing = exports.checkUserRegistered = exports.checkMyVideoImportIsFinished = exports.getAllNotificationsSettings = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const util_1 = require("util");
const mock_email_1 = require("../mock-servers/mock-email");
const follows_1 = require("../server/follows");
const servers_1 = require("../server/servers");
const login_1 = require("./login");
function getAllNotificationsSettings() {
    return {
        newVideoFromSubscription: 1 | 2,
        newCommentOnMyVideo: 1 | 2,
        abuseAsModerator: 1 | 2,
        videoAutoBlacklistAsModerator: 1 | 2,
        blacklistOnMyVideo: 1 | 2,
        myVideoImportFinished: 1 | 2,
        myVideoPublished: 1 | 2,
        commentMention: 1 | 2,
        newFollow: 1 | 2,
        newUserRegistration: 1 | 2,
        newInstanceFollower: 1 | 2,
        abuseNewMessage: 1 | 2,
        abuseStateChange: 1 | 2,
        autoInstanceFollowing: 1 | 2,
        newPeerTubeVersion: 1 | 2,
        newPluginVersion: 1 | 2
    };
}
exports.getAllNotificationsSettings = getAllNotificationsSettings;
function checkNewVideoFromSubscription(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { videoName, shortUUID } = options;
        const notificationType = 1;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkVideo(notification.video, videoName, shortUUID);
                checkActor(notification.video.channel);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.type !== 1 || n.video.name !== videoName;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.indexOf(shortUUID) !== -1 && text.indexOf('Your subscription') !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewVideoFromSubscription = checkNewVideoFromSubscription;
function checkVideoIsPublished(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { videoName, shortUUID } = options;
        const notificationType = 6;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkVideo(notification.video, videoName, shortUUID);
                checkActor(notification.video.channel);
            }
            else {
                chai_1.expect(notification.video).to.satisfy(v => v === undefined || v.name !== videoName);
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(shortUUID) && text.includes('Your video');
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkVideoIsPublished = checkVideoIsPublished;
function checkMyVideoImportIsFinished(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { videoName, shortUUID, url, success } = options;
        const notificationType = success ? 7 : 8;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.videoImport.targetUrl).to.equal(url);
                if (success)
                    checkVideo(notification.videoImport.video, videoName, shortUUID);
            }
            else {
                chai_1.expect(notification.videoImport).to.satisfy(i => i === undefined || i.targetUrl !== url);
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            const toFind = success ? ' finished' : ' error';
            return text.includes(url) && text.includes(toFind);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkMyVideoImportIsFinished = checkMyVideoImportIsFinished;
function checkUserRegistered(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { username } = options;
        const notificationType = 9;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkActor(notification.account);
                chai_1.expect(notification.account.name).to.equal(username);
            }
            else {
                chai_1.expect(notification).to.satisfy(n => n.type !== notificationType || n.account.name !== username);
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(' registered.') && text.includes(username);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkUserRegistered = checkUserRegistered;
function checkNewActorFollow(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { followType, followerName, followerDisplayName, followingDisplayName } = options;
        const notificationType = 10;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkActor(notification.actorFollow.follower);
                chai_1.expect(notification.actorFollow.follower.displayName).to.equal(followerDisplayName);
                chai_1.expect(notification.actorFollow.follower.name).to.equal(followerName);
                chai_1.expect(notification.actorFollow.follower.host).to.not.be.undefined;
                const following = notification.actorFollow.following;
                chai_1.expect(following.displayName).to.equal(followingDisplayName);
                chai_1.expect(following.type).to.equal(followType);
            }
            else {
                chai_1.expect(notification).to.satisfy(n => {
                    return n.type !== notificationType ||
                        (n.actorFollow.follower.name !== followerName && n.actorFollow.following !== followingDisplayName);
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(followType) && text.includes(followingDisplayName) && text.includes(followerDisplayName);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewActorFollow = checkNewActorFollow;
function checkNewInstanceFollower(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { followerHost } = options;
        const notificationType = 13;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkActor(notification.actorFollow.follower);
                chai_1.expect(notification.actorFollow.follower.name).to.equal('peertube');
                chai_1.expect(notification.actorFollow.follower.host).to.equal(followerHost);
                chai_1.expect(notification.actorFollow.following.name).to.equal('peertube');
            }
            else {
                chai_1.expect(notification).to.satisfy(n => {
                    return n.type !== notificationType || n.actorFollow.follower.host !== followerHost;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes('instance has a new follower') && text.includes(followerHost);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewInstanceFollower = checkNewInstanceFollower;
function checkAutoInstanceFollowing(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { followerHost, followingHost } = options;
        const notificationType = 14;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                const following = notification.actorFollow.following;
                checkActor(following);
                chai_1.expect(following.name).to.equal('peertube');
                chai_1.expect(following.host).to.equal(followingHost);
                chai_1.expect(notification.actorFollow.follower.name).to.equal('peertube');
                chai_1.expect(notification.actorFollow.follower.host).to.equal(followerHost);
            }
            else {
                chai_1.expect(notification).to.satisfy(n => {
                    return n.type !== notificationType || n.actorFollow.following.host !== followingHost;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(' automatically followed a new instance') && text.includes(followingHost);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkAutoInstanceFollowing = checkAutoInstanceFollowing;
function checkCommentMention(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { shortUUID, commentId, threadId, byAccountDisplayName } = options;
        const notificationType = 11;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkComment(notification.comment, commentId, threadId);
                checkActor(notification.comment.account);
                chai_1.expect(notification.comment.account.displayName).to.equal(byAccountDisplayName);
                checkVideo(notification.comment.video, undefined, shortUUID);
            }
            else {
                chai_1.expect(notification).to.satisfy(n => n.type !== notificationType || n.comment.id !== commentId);
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(' mentioned ') && text.includes(shortUUID) && text.includes(byAccountDisplayName);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkCommentMention = checkCommentMention;
let lastEmailCount = 0;
function checkNewCommentOnMyVideo(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { server, shortUUID, commentId, threadId, checkType, emails } = options;
        const notificationType = 2;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                checkComment(notification.comment, commentId, threadId);
                checkActor(notification.comment.account);
                checkVideo(notification.comment.video, undefined, shortUUID);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.comment === undefined || n.comment.id !== commentId;
                });
            }
        }
        const commentUrl = `http://localhost:${server.port}/w/${shortUUID};threadId=${threadId}`;
        function emailNotificationFinder(email) {
            return email['text'].indexOf(commentUrl) !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
        if (checkType === 'presence') {
            chai_1.expect(emails).to.have.length.above(lastEmailCount);
            lastEmailCount = emails.length;
        }
    });
}
exports.checkNewCommentOnMyVideo = checkNewCommentOnMyVideo;
function checkNewVideoAbuseForModerators(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { shortUUID, videoName } = options;
        const notificationType = 3;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.abuse.id).to.be.a('number');
                checkVideo(notification.abuse.video, videoName, shortUUID);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.abuse === undefined || n.abuse.video.shortUUID !== shortUUID;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.indexOf(shortUUID) !== -1 && text.indexOf('abuse') !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewVideoAbuseForModerators = checkNewVideoAbuseForModerators;
function checkNewAbuseMessage(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { abuseId, message, toEmail } = options;
        const notificationType = 16;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.abuse.id).to.equal(abuseId);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.type !== notificationType || n.abuse === undefined || n.abuse.id !== abuseId;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            const to = email['to'].filter(t => t.address === toEmail);
            return text.indexOf(message) !== -1 && to.length !== 0;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewAbuseMessage = checkNewAbuseMessage;
function checkAbuseStateChange(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { abuseId, state } = options;
        const notificationType = 15;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.abuse.id).to.equal(abuseId);
                chai_1.expect(notification.abuse.state).to.equal(state);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.abuse === undefined || n.abuse.id !== abuseId;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            const contains = state === 3
                ? ' accepted'
                : ' rejected';
            return text.indexOf(contains) !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkAbuseStateChange = checkAbuseStateChange;
function checkNewCommentAbuseForModerators(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { shortUUID, videoName } = options;
        const notificationType = 3;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.abuse.id).to.be.a('number');
                checkVideo(notification.abuse.comment.video, videoName, shortUUID);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.abuse === undefined || n.abuse.comment.video.shortUUID !== shortUUID;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.indexOf(shortUUID) !== -1 && text.indexOf('abuse') !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewCommentAbuseForModerators = checkNewCommentAbuseForModerators;
function checkNewAccountAbuseForModerators(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { displayName } = options;
        const notificationType = 3;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.abuse.id).to.be.a('number');
                chai_1.expect(notification.abuse.account.displayName).to.equal(displayName);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.abuse === undefined || n.abuse.account.displayName !== displayName;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.indexOf(displayName) !== -1 && text.indexOf('abuse') !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewAccountAbuseForModerators = checkNewAccountAbuseForModerators;
function checkVideoAutoBlacklistForModerators(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { shortUUID, videoName } = options;
        const notificationType = 12;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.videoBlacklist.video.id).to.be.a('number');
                checkVideo(notification.videoBlacklist.video, videoName, shortUUID);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.video === undefined || n.video.shortUUID !== shortUUID;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.indexOf(shortUUID) !== -1 && email['text'].indexOf('video-auto-blacklist/list') !== -1;
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkVideoAutoBlacklistForModerators = checkVideoAutoBlacklistForModerators;
function checkNewBlacklistOnMyVideo(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { videoName, shortUUID, blacklistType } = options;
        const notificationType = blacklistType === 'blacklist'
            ? 4
            : 5;
        function notificationChecker(notification) {
            chai_1.expect(notification).to.not.be.undefined;
            chai_1.expect(notification.type).to.equal(notificationType);
            const video = blacklistType === 'blacklist' ? notification.videoBlacklist.video : notification.video;
            checkVideo(video, videoName, shortUUID);
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            const blacklistText = blacklistType === 'blacklist'
                ? 'blacklisted'
                : 'unblacklisted';
            return text.includes(shortUUID) && text.includes(blacklistText);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder, checkType: 'presence' }));
    });
}
exports.checkNewBlacklistOnMyVideo = checkNewBlacklistOnMyVideo;
function checkNewPeerTubeVersion(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { latestVersion } = options;
        const notificationType = 18;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.peertube).to.exist;
                chai_1.expect(notification.peertube.latestVersion).to.equal(latestVersion);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.peertube === undefined || n.peertube.latestVersion !== latestVersion;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(latestVersion);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewPeerTubeVersion = checkNewPeerTubeVersion;
function checkNewPluginVersion(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { pluginName, pluginType } = options;
        const notificationType = 17;
        function notificationChecker(notification, checkType) {
            if (checkType === 'presence') {
                chai_1.expect(notification).to.not.be.undefined;
                chai_1.expect(notification.type).to.equal(notificationType);
                chai_1.expect(notification.plugin.name).to.equal(pluginName);
                chai_1.expect(notification.plugin.type).to.equal(pluginType);
            }
            else {
                chai_1.expect(notification).to.satisfy((n) => {
                    return n === undefined || n.plugin === undefined || n.plugin.name !== pluginName;
                });
            }
        }
        function emailNotificationFinder(email) {
            const text = email['text'];
            return text.includes(pluginName);
        }
        yield checkNotification(Object.assign(Object.assign({}, options), { notificationChecker, emailNotificationFinder }));
    });
}
exports.checkNewPluginVersion = checkNewPluginVersion;
function prepareNotificationsTest(serversCount = 3, overrideConfigArg = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const userNotifications = [];
        const adminNotifications = [];
        const adminNotificationsServer2 = [];
        const emails = [];
        const port = yield mock_email_1.MockSmtpServer.Instance.collectEmails(emails);
        const overrideConfig = {
            smtp: {
                hostname: 'localhost',
                port
            },
            signup: {
                limit: 20
            }
        };
        const servers = yield servers_1.createMultipleServers(serversCount, Object.assign(overrideConfig, overrideConfigArg));
        yield login_1.setAccessTokensToServers(servers);
        if (serversCount > 1) {
            yield follows_1.doubleFollow(servers[0], servers[1]);
        }
        const user = { username: 'user_1', password: 'super password' };
        yield servers[0].users.create(Object.assign(Object.assign({}, user), { videoQuota: 10 * 1000 * 1000 }));
        const userAccessToken = yield servers[0].login.getAccessToken(user);
        yield servers[0].notifications.updateMySettings({ token: userAccessToken, settings: getAllNotificationsSettings() });
        yield servers[0].notifications.updateMySettings({ settings: getAllNotificationsSettings() });
        if (serversCount > 1) {
            yield servers[1].notifications.updateMySettings({ settings: getAllNotificationsSettings() });
        }
        {
            const socket = servers[0].socketIO.getUserNotificationSocket({ token: userAccessToken });
            socket.on('new-notification', n => userNotifications.push(n));
        }
        {
            const socket = servers[0].socketIO.getUserNotificationSocket();
            socket.on('new-notification', n => adminNotifications.push(n));
        }
        if (serversCount > 1) {
            const socket = servers[1].socketIO.getUserNotificationSocket();
            socket.on('new-notification', n => adminNotificationsServer2.push(n));
        }
        const { videoChannels } = yield servers[0].users.getMyInfo();
        const channelId = videoChannels[0].id;
        return {
            userNotifications,
            adminNotifications,
            adminNotificationsServer2,
            userAccessToken,
            emails,
            servers,
            channelId
        };
    });
}
exports.prepareNotificationsTest = prepareNotificationsTest;
function checkNotification(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { server, token, checkType, notificationChecker, emailNotificationFinder, socketNotifications, emails } = options;
        const check = options.check || { web: true, mail: true };
        if (check.web) {
            const notification = yield server.notifications.getLastest({ token: token });
            if (notification || checkType !== 'absence') {
                notificationChecker(notification, checkType);
            }
            const socketNotification = socketNotifications.find(n => {
                try {
                    notificationChecker(n, 'presence');
                    return true;
                }
                catch (_a) {
                    return false;
                }
            });
            if (checkType === 'presence') {
                const obj = util_1.inspect(socketNotifications, { depth: 5 });
                chai_1.expect(socketNotification, 'The socket notification is absent when it should be present. ' + obj).to.not.be.undefined;
            }
            else {
                const obj = util_1.inspect(socketNotification, { depth: 5 });
                chai_1.expect(socketNotification, 'The socket notification is present when it should not be present. ' + obj).to.be.undefined;
            }
        }
        if (check.mail) {
            const email = emails
                .slice()
                .reverse()
                .find(e => emailNotificationFinder(e));
            if (checkType === 'presence') {
                const texts = emails.map(e => e.text);
                chai_1.expect(email, 'The email is absent when is should be present. ' + util_1.inspect(texts)).to.not.be.undefined;
            }
            else {
                chai_1.expect(email, 'The email is present when is should not be present. ' + util_1.inspect(email)).to.be.undefined;
            }
        }
    });
}
function checkVideo(video, videoName, shortUUID) {
    if (videoName) {
        chai_1.expect(video.name).to.be.a('string');
        chai_1.expect(video.name).to.not.be.empty;
        chai_1.expect(video.name).to.equal(videoName);
    }
    if (shortUUID) {
        chai_1.expect(video.shortUUID).to.be.a('string');
        chai_1.expect(video.shortUUID).to.not.be.empty;
        chai_1.expect(video.shortUUID).to.equal(shortUUID);
    }
    chai_1.expect(video.id).to.be.a('number');
}
function checkActor(actor) {
    chai_1.expect(actor.displayName).to.be.a('string');
    chai_1.expect(actor.displayName).to.not.be.empty;
    chai_1.expect(actor.host).to.not.be.undefined;
}
function checkComment(comment, commentId, threadId) {
    chai_1.expect(comment.id).to.equal(commentId);
    chai_1.expect(comment.threadId).to.equal(threadId);
}
