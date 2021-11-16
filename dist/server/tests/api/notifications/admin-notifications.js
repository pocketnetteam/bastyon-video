"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test admin notifications', function () {
    let server;
    let userNotifications = [];
    let adminNotifications = [];
    let emails = [];
    let baseParams;
    let joinPeerTubeServer;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            joinPeerTubeServer = new extra_utils_1.MockJoinPeerTubeVersions();
            const port = yield joinPeerTubeServer.initialize();
            const config = {
                peertube: {
                    check_latest_version: {
                        enabled: true,
                        url: `http://localhost:${port}/versions.json`
                    }
                },
                plugins: {
                    index: {
                        enabled: true,
                        check_latest_versions_interval: '5 seconds'
                    }
                }
            };
            const res = yield extra_utils_1.prepareNotificationsTest(1, config);
            emails = res.emails;
            server = res.servers[0];
            userNotifications = res.userNotifications;
            adminNotifications = res.adminNotifications;
            baseParams = {
                server: server,
                emails,
                socketNotifications: adminNotifications,
                token: server.accessToken
            };
            yield server.plugins.install({ npmName: 'peertube-plugin-hello-world' });
            yield server.plugins.install({ npmName: 'peertube-theme-background-red' });
        });
    });
    describe('Latest PeerTube version notification', function () {
        it('Should not send a notification to admins if there is not a new version', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                joinPeerTubeServer.setLatestVersion('1.4.2');
                yield extra_utils_1.wait(3000);
                yield extra_utils_1.checkNewPeerTubeVersion(Object.assign(Object.assign({}, baseParams), { latestVersion: '1.4.2', checkType: 'absence' }));
            });
        });
        it('Should send a notification to admins on new plugin version', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                joinPeerTubeServer.setLatestVersion('15.4.2');
                yield extra_utils_1.wait(3000);
                yield extra_utils_1.checkNewPeerTubeVersion(Object.assign(Object.assign({}, baseParams), { latestVersion: '15.4.2', checkType: 'presence' }));
            });
        });
        it('Should not send the same notification to admins', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.wait(3000);
                chai_1.expect(adminNotifications.filter(n => n.type === 18)).to.have.lengthOf(1);
            });
        });
        it('Should not have sent a notification to users', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                chai_1.expect(userNotifications.filter(n => n.type === 18)).to.have.lengthOf(0);
            });
        });
        it('Should send a new notification after a new release', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                joinPeerTubeServer.setLatestVersion('15.4.3');
                yield extra_utils_1.wait(3000);
                yield extra_utils_1.checkNewPeerTubeVersion(Object.assign(Object.assign({}, baseParams), { latestVersion: '15.4.3', checkType: 'presence' }));
                chai_1.expect(adminNotifications.filter(n => n.type === 18)).to.have.lengthOf(2);
            });
        });
    });
    describe('Latest plugin version notification', function () {
        it('Should not send a notification to admins if there is no new plugin version', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkNewPluginVersion(Object.assign(Object.assign({}, baseParams), { pluginType: models_1.PluginType.PLUGIN, pluginName: 'hello-world', checkType: 'absence' }));
            });
        });
        it('Should send a notification to admins on new plugin version', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield server.sql.setPluginVersion('hello-world', '0.0.1');
                yield server.sql.setPluginLatestVersion('hello-world', '0.0.1');
                yield extra_utils_1.wait(6000);
                yield extra_utils_1.checkNewPluginVersion(Object.assign(Object.assign({}, baseParams), { pluginType: models_1.PluginType.PLUGIN, pluginName: 'hello-world', checkType: 'presence' }));
            });
        });
        it('Should not send the same notification to admins', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.wait(6000);
                chai_1.expect(adminNotifications.filter(n => n.type === 17)).to.have.lengthOf(1);
            });
        });
        it('Should not have sent a notification to users', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                chai_1.expect(userNotifications.filter(n => n.type === 17)).to.have.lengthOf(0);
            });
        });
        it('Should send a new notification after a new plugin release', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield server.sql.setPluginVersion('hello-world', '0.0.1');
                yield server.sql.setPluginLatestVersion('hello-world', '0.0.1');
                yield extra_utils_1.wait(6000);
                chai_1.expect(adminNotifications.filter(n => n.type === 18)).to.have.lengthOf(2);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
