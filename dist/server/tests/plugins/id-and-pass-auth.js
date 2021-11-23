"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test id and pass auth plugins', function () {
    let server;
    let crashAccessToken;
    let crashRefreshToken;
    let lagunaAccessToken;
    let lagunaRefreshToken;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            for (const suffix of ['one', 'two', 'three']) {
                yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-id-pass-auth-' + suffix) });
            }
        });
    });
    it('Should display the correct configuration', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const auths = config.plugin.registeredIdAndPassAuths;
            (0, chai_1.expect)(auths).to.have.lengthOf(8);
            const crashAuth = auths.find(a => a.authName === 'crash-auth');
            (0, chai_1.expect)(crashAuth).to.exist;
            (0, chai_1.expect)(crashAuth.npmName).to.equal('peertube-plugin-test-id-pass-auth-one');
            (0, chai_1.expect)(crashAuth.weight).to.equal(50);
        });
    });
    it('Should not login', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.login.login({ user: { username: 'toto', password: 'password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should login Spyro, create the user and use the token', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const accessToken = yield server.login.getAccessToken({ username: 'spyro', password: 'spyro password' });
            const body = yield server.users.getMyInfo({ token: accessToken });
            (0, chai_1.expect)(body.username).to.equal('spyro');
            (0, chai_1.expect)(body.account.displayName).to.equal('Spyro the Dragon');
            (0, chai_1.expect)(body.role).to.equal(models_1.UserRole.USER);
        });
    });
    it('Should login Crash, create the user and use the token', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield server.login.login({ user: { username: 'crash', password: 'crash password' } });
                crashAccessToken = body.access_token;
                crashRefreshToken = body.refresh_token;
            }
            {
                const body = yield server.users.getMyInfo({ token: crashAccessToken });
                (0, chai_1.expect)(body.username).to.equal('crash');
                (0, chai_1.expect)(body.account.displayName).to.equal('Crash Bandicoot');
                (0, chai_1.expect)(body.role).to.equal(models_1.UserRole.MODERATOR);
            }
        });
    });
    it('Should login the first Laguna, create the user and use the token', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield server.login.login({ user: { username: 'laguna', password: 'laguna password' } });
                lagunaAccessToken = body.access_token;
                lagunaRefreshToken = body.refresh_token;
            }
            {
                const body = yield server.users.getMyInfo({ token: lagunaAccessToken });
                (0, chai_1.expect)(body.username).to.equal('laguna');
                (0, chai_1.expect)(body.account.displayName).to.equal('laguna');
                (0, chai_1.expect)(body.role).to.equal(models_1.UserRole.USER);
            }
        });
    });
    it('Should refresh crash token, but not laguna token', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const resRefresh = yield server.login.refreshToken({ refreshToken: crashRefreshToken });
                crashAccessToken = resRefresh.body.access_token;
                crashRefreshToken = resRefresh.body.refresh_token;
                const body = yield server.users.getMyInfo({ token: crashAccessToken });
                (0, chai_1.expect)(body.username).to.equal('crash');
            }
            {
                yield server.login.refreshToken({ refreshToken: lagunaRefreshToken, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            }
        });
    });
    it('Should update Crash profile', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.users.updateMe({
                token: crashAccessToken,
                displayName: 'Beautiful Crash',
                description: 'Mutant eastern barred bandicoot'
            });
            const body = yield server.users.getMyInfo({ token: crashAccessToken });
            (0, chai_1.expect)(body.account.displayName).to.equal('Beautiful Crash');
            (0, chai_1.expect)(body.account.description).to.equal('Mutant eastern barred bandicoot');
        });
    });
    it('Should logout Crash', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.login.logout({ token: crashAccessToken });
        });
    });
    it('Should have logged out Crash', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.servers.waitUntilLog('On logout for auth 1 - 2');
            yield server.users.getMyInfo({ token: crashAccessToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
        });
    });
    it('Should login Crash and keep the old existing profile', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            crashAccessToken = yield server.login.getAccessToken({ username: 'crash', password: 'crash password' });
            const body = yield server.users.getMyInfo({ token: crashAccessToken });
            (0, chai_1.expect)(body.username).to.equal('crash');
            (0, chai_1.expect)(body.account.displayName).to.equal('Beautiful Crash');
            (0, chai_1.expect)(body.account.description).to.equal('Mutant eastern barred bandicoot');
            (0, chai_1.expect)(body.role).to.equal(models_1.UserRole.MODERATOR);
        });
    });
    it('Should reject token of laguna by the plugin hook', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield (0, extra_utils_1.wait)(5000);
            yield server.users.getMyInfo({ token: lagunaAccessToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
        });
    });
    it('Should reject an invalid username, email, role or display name', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const command = server.login;
            yield command.login({ user: { username: 'ward', password: 'ward password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.servers.waitUntilLog('valid username');
            yield command.login({ user: { username: 'kiros', password: 'kiros password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.servers.waitUntilLog('valid display name');
            yield command.login({ user: { username: 'raine', password: 'raine password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.servers.waitUntilLog('valid role');
            yield command.login({ user: { username: 'ellone', password: 'elonne password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.servers.waitUntilLog('valid email');
        });
    });
    it('Should unregister spyro-auth and do not login existing Spyro', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.plugins.updateSettings({
                npmName: 'peertube-plugin-test-id-pass-auth-one',
                settings: { disableSpyro: true }
            });
            const command = server.login;
            yield command.login({ user: { username: 'spyro', password: 'spyro password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield command.login({ user: { username: 'spyro', password: 'fake' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should have disabled this auth', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const auths = config.plugin.registeredIdAndPassAuths;
            (0, chai_1.expect)(auths).to.have.lengthOf(7);
            const spyroAuth = auths.find(a => a.authName === 'spyro-auth');
            (0, chai_1.expect)(spyroAuth).to.not.exist;
        });
    });
    it('Should uninstall the plugin one and do not login existing Crash', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-id-pass-auth-one' });
            yield server.login.login({
                user: { username: 'crash', password: 'crash password' },
                expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
            });
        });
    });
    it('Should display the correct configuration', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const auths = config.plugin.registeredIdAndPassAuths;
            (0, chai_1.expect)(auths).to.have.lengthOf(6);
            const crashAuth = auths.find(a => a.authName === 'crash-auth');
            (0, chai_1.expect)(crashAuth).to.not.exist;
        });
    });
    it('Should display plugin auth information in users list', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield server.users.list();
            const root = data.find(u => u.username === 'root');
            const crash = data.find(u => u.username === 'crash');
            const laguna = data.find(u => u.username === 'laguna');
            (0, chai_1.expect)(root.pluginAuth).to.be.null;
            (0, chai_1.expect)(crash.pluginAuth).to.equal('peertube-plugin-test-id-pass-auth-one');
            (0, chai_1.expect)(laguna.pluginAuth).to.equal('peertube-plugin-test-id-pass-auth-two');
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
