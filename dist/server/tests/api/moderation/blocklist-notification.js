"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function checkNotifications(server, token, expected) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { data } = yield server.notifications.list({ token, start: 0, count: 10, unread: true });
        expect(data).to.have.lengthOf(expected.length);
        for (const type of expected) {
            expect(data.find(n => n.type === type)).to.exist;
        }
    });
}
describe('Test blocklist', function () {
    let servers;
    let videoUUID;
    let userToken1;
    let userToken2;
    let remoteUserToken;
    function resetState() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                yield servers[1].subscriptions.remove({ token: remoteUserToken, uri: 'user1_channel@' + servers[0].host });
                yield servers[1].subscriptions.remove({ token: remoteUserToken, uri: 'user2_channel@' + servers[0].host });
            }
            catch (_a) { }
            yield (0, extra_utils_1.waitJobs)(servers);
            yield servers[0].notifications.markAsReadAll({ token: userToken1 });
            yield servers[0].notifications.markAsReadAll({ token: userToken2 });
            {
                const { uuid } = yield servers[0].videos.upload({ token: userToken1, attributes: { name: 'video' } });
                videoUUID = uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
            }
            {
                yield servers[1].comments.createThread({
                    token: remoteUserToken,
                    videoId: videoUUID,
                    text: '@user2@' + servers[0].host + ' hello'
                });
            }
            {
                yield servers[1].subscriptions.add({ token: remoteUserToken, targetUri: 'user1_channel@' + servers[0].host });
                yield servers[1].subscriptions.add({ token: remoteUserToken, targetUri: 'user2_channel@' + servers[0].host });
            }
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            {
                const user = { username: 'user1', password: 'password' };
                yield servers[0].users.create({
                    username: user.username,
                    password: user.password,
                    videoQuota: -1,
                    videoQuotaDaily: -1
                });
                userToken1 = yield servers[0].login.getAccessToken(user);
                yield servers[0].videos.upload({ token: userToken1, attributes: { name: 'video user 1' } });
            }
            {
                const user = { username: 'user2', password: 'password' };
                yield servers[0].users.create({ username: user.username, password: user.password });
                userToken2 = yield servers[0].login.getAccessToken(user);
            }
            {
                const user = { username: 'user3', password: 'password' };
                yield servers[1].users.create({ username: user.username, password: user.password });
                remoteUserToken = yield servers[1].login.getAccessToken(user);
            }
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('User blocks another user', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield resetState();
            });
        });
        it('Should have appropriate notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const notifs = [2, 10];
                yield checkNotifications(servers[0], userToken1, notifs);
            });
        });
        it('Should block an account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].blocklist.addToMyBlocklist({ token: userToken1, account: 'user3@' + servers[1].host });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should not have notifications from this account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield checkNotifications(servers[0], userToken1, []);
            });
        });
        it('Should have notifications of this account on user 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const notifs = [11, 10];
                yield checkNotifications(servers[0], userToken2, notifs);
                yield servers[0].blocklist.removeFromMyBlocklist({ token: userToken1, account: 'user3@' + servers[1].host });
            });
        });
    });
    describe('User blocks another server', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield resetState();
            });
        });
        it('Should have appropriate notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const notifs = [2, 10];
                yield checkNotifications(servers[0], userToken1, notifs);
            });
        });
        it('Should block an account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].blocklist.addToMyBlocklist({ token: userToken1, server: servers[1].host });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should not have notifications from this account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield checkNotifications(servers[0], userToken1, []);
            });
        });
        it('Should have notifications of this account on user 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const notifs = [11, 10];
                yield checkNotifications(servers[0], userToken2, notifs);
                yield servers[0].blocklist.removeFromMyBlocklist({ token: userToken1, server: servers[1].host });
            });
        });
    });
    describe('Server blocks a user', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield resetState();
            });
        });
        it('Should have appropriate notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const notifs = [2, 10];
                    yield checkNotifications(servers[0], userToken1, notifs);
                }
                {
                    const notifs = [11, 10];
                    yield checkNotifications(servers[0], userToken2, notifs);
                }
            });
        });
        it('Should block an account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].blocklist.addToServerBlocklist({ account: 'user3@' + servers[1].host });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should not have notifications from this account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield checkNotifications(servers[0], userToken1, []);
                yield checkNotifications(servers[0], userToken2, []);
                yield servers[0].blocklist.removeFromServerBlocklist({ account: 'user3@' + servers[1].host });
            });
        });
    });
    describe('Server blocks a server', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield resetState();
            });
        });
        it('Should have appropriate notifications', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const notifs = [2, 10];
                    yield checkNotifications(servers[0], userToken1, notifs);
                }
                {
                    const notifs = [11, 10];
                    yield checkNotifications(servers[0], userToken2, notifs);
                }
            });
        });
        it('Should block an account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].blocklist.addToServerBlocklist({ server: servers[1].host });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should not have notifications from this account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield checkNotifications(servers[0], userToken1, []);
                yield checkNotifications(servers[0], userToken2, []);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
