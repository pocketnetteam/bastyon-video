"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test notifications API', function () {
    let server;
    let userNotifications = [];
    let userToken;
    let emails = [];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            const res = yield (0, extra_utils_1.prepareNotificationsTest)(1);
            emails = res.emails;
            userToken = res.userAccessToken;
            userNotifications = res.userNotifications;
            server = res.servers[0];
            yield server.subscriptions.add({ token: userToken, targetUri: 'root_channel@localhost:' + server.port });
            for (let i = 0; i < 10; i++) {
                yield server.videos.randomUpload({ wait: false });
            }
            yield (0, extra_utils_1.waitJobs)([server]);
        });
    });
    describe('Mark as read', function () {
        it('Should mark as read some notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield server.notifications.list({ token: userToken, start: 2, count: 3 });
                const ids = data.map(n => n.id);
                yield server.notifications.markAsRead({ token: userToken, ids });
            });
        });
        it('Should have the notifications marked as read', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield server.notifications.list({ token: userToken, start: 0, count: 10 });
                expect(data[0].read).to.be.false;
                expect(data[1].read).to.be.false;
                expect(data[2].read).to.be.true;
                expect(data[3].read).to.be.true;
                expect(data[4].read).to.be.true;
                expect(data[5].read).to.be.false;
            });
        });
        it('Should only list read notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield server.notifications.list({ token: userToken, start: 0, count: 10, unread: false });
                for (const notification of data) {
                    expect(notification.read).to.be.true;
                }
            });
        });
        it('Should only list unread notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield server.notifications.list({ token: userToken, start: 0, count: 10, unread: true });
                for (const notification of data) {
                    expect(notification.read).to.be.false;
                }
            });
        });
        it('Should mark as read all notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.notifications.markAsReadAll({ token: userToken });
                const body = yield server.notifications.list({ token: userToken, start: 0, count: 10, unread: true });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            });
        });
    });
    describe('Notification settings', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: server,
                emails,
                socketNotifications: userNotifications,
                token: userToken
            };
        });
        it('Should not have notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.notifications.updateMySettings({
                    token: userToken,
                    settings: Object.assign(Object.assign({}, (0, extra_utils_1.getAllNotificationsSettings)()), { newVideoFromSubscription: 0 })
                });
                {
                    const info = yield server.users.getMyInfo({ token: userToken });
                    expect(info.notificationSettings.newVideoFromSubscription).to.equal(0);
                }
                const { name, shortUUID } = yield server.videos.randomUpload();
                const check = { web: true, mail: true };
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, baseParams), { check, videoName: name, shortUUID, checkType: 'absence' }));
            });
        });
        it('Should only have web notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.notifications.updateMySettings({
                    token: userToken,
                    settings: Object.assign(Object.assign({}, (0, extra_utils_1.getAllNotificationsSettings)()), { newVideoFromSubscription: 1 })
                });
                {
                    const info = yield server.users.getMyInfo({ token: userToken });
                    expect(info.notificationSettings.newVideoFromSubscription).to.equal(1);
                }
                const { name, shortUUID } = yield server.videos.randomUpload();
                {
                    const check = { mail: true, web: false };
                    yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, baseParams), { check, videoName: name, shortUUID, checkType: 'absence' }));
                }
                {
                    const check = { mail: false, web: true };
                    yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, baseParams), { check, videoName: name, shortUUID, checkType: 'presence' }));
                }
            });
        });
        it('Should only have mail notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.notifications.updateMySettings({
                    token: userToken,
                    settings: Object.assign(Object.assign({}, (0, extra_utils_1.getAllNotificationsSettings)()), { newVideoFromSubscription: 2 })
                });
                {
                    const info = yield server.users.getMyInfo({ token: userToken });
                    expect(info.notificationSettings.newVideoFromSubscription).to.equal(2);
                }
                const { name, shortUUID } = yield server.videos.randomUpload();
                {
                    const check = { mail: false, web: true };
                    yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, baseParams), { check, videoName: name, shortUUID, checkType: 'absence' }));
                }
                {
                    const check = { mail: true, web: false };
                    yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, baseParams), { check, videoName: name, shortUUID, checkType: 'presence' }));
                }
            });
        });
        it('Should have email and web notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.notifications.updateMySettings({
                    token: userToken,
                    settings: Object.assign(Object.assign({}, (0, extra_utils_1.getAllNotificationsSettings)()), { newVideoFromSubscription: 1 | 2 })
                });
                {
                    const info = yield server.users.getMyInfo({ token: userToken });
                    expect(info.notificationSettings.newVideoFromSubscription).to.equal(1 | 2);
                }
                const { name, shortUUID } = yield server.videos.randomUpload();
                yield (0, extra_utils_1.checkNewVideoFromSubscription)(Object.assign(Object.assign({}, baseParams), { videoName: name, shortUUID, checkType: 'presence' }));
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
