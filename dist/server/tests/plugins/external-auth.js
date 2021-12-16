"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
function loginExternal(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield options.server.plugins.getExternalAuth({
            npmName: options.npmName,
            npmVersion: '0.0.1',
            authName: options.authName,
            query: options.query,
            expectedStatus: options.expectedStatus || models_1.HttpStatusCode.FOUND_302
        });
        if (res.status !== models_1.HttpStatusCode.FOUND_302)
            return;
        const location = res.header.location;
        const { externalAuthToken } = extra_utils_1.decodeQueryString(location);
        const resLogin = yield options.server.login.loginUsingExternalToken({
            username: options.username,
            externalAuthToken: externalAuthToken,
            expectedStatus: options.expectedStatusStep2
        });
        return resLogin.body;
    });
}
describe('Test external auth plugins', function () {
    let server;
    let cyanAccessToken;
    let cyanRefreshToken;
    let kefkaAccessToken;
    let kefkaRefreshToken;
    let externalAuthToken;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            for (const suffix of ['one', 'two', 'three']) {
                yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-external-auth-' + suffix) });
            }
        });
    });
    it('Should display the correct configuration', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const auths = config.plugin.registeredExternalAuths;
            chai_1.expect(auths).to.have.lengthOf(8);
            const auth2 = auths.find((a) => a.authName === 'external-auth-2');
            chai_1.expect(auth2).to.exist;
            chai_1.expect(auth2.authDisplayName).to.equal('External Auth 2');
            chai_1.expect(auth2.npmName).to.equal('peertube-plugin-test-external-auth-one');
        });
    });
    it('Should redirect for a Cyan login', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield server.plugins.getExternalAuth({
                npmName: 'test-external-auth-one',
                npmVersion: '0.0.1',
                authName: 'external-auth-1',
                query: {
                    username: 'cyan'
                },
                expectedStatus: models_1.HttpStatusCode.FOUND_302
            });
            const location = res.header.location;
            chai_1.expect(location.startsWith('/login?')).to.be.true;
            const searchParams = extra_utils_1.decodeQueryString(location);
            chai_1.expect(searchParams.externalAuthToken).to.exist;
            chai_1.expect(searchParams.username).to.equal('cyan');
            externalAuthToken = searchParams.externalAuthToken;
        });
    });
    it('Should reject auto external login with a missing or invalid token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const command = server.login;
            yield command.loginUsingExternalToken({ username: 'cyan', externalAuthToken: '', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield command.loginUsingExternalToken({ username: 'cyan', externalAuthToken: 'blabla', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should reject auto external login with a missing or invalid username', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const command = server.login;
            yield command.loginUsingExternalToken({ username: '', externalAuthToken, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield command.loginUsingExternalToken({ username: '', externalAuthToken, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should reject auto external login with an expired token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield extra_utils_1.wait(5000);
            yield server.login.loginUsingExternalToken({
                username: 'cyan',
                externalAuthToken,
                expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
            });
            yield server.servers.waitUntilLog('expired external auth token', 2);
        });
    });
    it('Should auto login Cyan, create the user and use the token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const res = yield loginExternal({
                    server,
                    npmName: 'test-external-auth-one',
                    authName: 'external-auth-1',
                    query: {
                        username: 'cyan'
                    },
                    username: 'cyan'
                });
                cyanAccessToken = res.access_token;
                cyanRefreshToken = res.refresh_token;
            }
            {
                const body = yield server.users.getMyInfo({ token: cyanAccessToken });
                chai_1.expect(body.username).to.equal('cyan');
                chai_1.expect(body.account.displayName).to.equal('cyan');
                chai_1.expect(body.email).to.equal('cyan@example.com');
                chai_1.expect(body.role).to.equal(models_1.UserRole.USER);
            }
        });
    });
    it('Should auto login Kefka, create the user and use the token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const res = yield loginExternal({
                    server,
                    npmName: 'test-external-auth-one',
                    authName: 'external-auth-2',
                    username: 'kefka'
                });
                kefkaAccessToken = res.access_token;
                kefkaRefreshToken = res.refresh_token;
            }
            {
                const body = yield server.users.getMyInfo({ token: kefkaAccessToken });
                chai_1.expect(body.username).to.equal('kefka');
                chai_1.expect(body.account.displayName).to.equal('Kefka Palazzo');
                chai_1.expect(body.email).to.equal('kefka@example.com');
                chai_1.expect(body.role).to.equal(models_1.UserRole.ADMINISTRATOR);
            }
        });
    });
    it('Should refresh Cyan token, but not Kefka token', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const resRefresh = yield server.login.refreshToken({ refreshToken: cyanRefreshToken });
                cyanAccessToken = resRefresh.body.access_token;
                cyanRefreshToken = resRefresh.body.refresh_token;
                const body = yield server.users.getMyInfo({ token: cyanAccessToken });
                chai_1.expect(body.username).to.equal('cyan');
            }
            {
                yield server.login.refreshToken({ refreshToken: kefkaRefreshToken, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            }
        });
    });
    it('Should update Cyan profile', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.updateMe({
                token: cyanAccessToken,
                displayName: 'Cyan Garamonde',
                description: 'Retainer to the king of Doma'
            });
            const body = yield server.users.getMyInfo({ token: cyanAccessToken });
            chai_1.expect(body.account.displayName).to.equal('Cyan Garamonde');
            chai_1.expect(body.account.description).to.equal('Retainer to the king of Doma');
        });
    });
    it('Should logout Cyan', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.login.logout({ token: cyanAccessToken });
        });
    });
    it('Should have logged out Cyan', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.servers.waitUntilLog('On logout cyan');
            yield server.users.getMyInfo({ token: cyanAccessToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
        });
    });
    it('Should login Cyan and keep the old existing profile', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const res = yield loginExternal({
                    server,
                    npmName: 'test-external-auth-one',
                    authName: 'external-auth-1',
                    query: {
                        username: 'cyan'
                    },
                    username: 'cyan'
                });
                cyanAccessToken = res.access_token;
            }
            const body = yield server.users.getMyInfo({ token: cyanAccessToken });
            chai_1.expect(body.username).to.equal('cyan');
            chai_1.expect(body.account.displayName).to.equal('Cyan Garamonde');
            chai_1.expect(body.account.description).to.equal('Retainer to the king of Doma');
            chai_1.expect(body.role).to.equal(models_1.UserRole.USER);
        });
    });
    it('Should not update an external auth email', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.updateMe({
                token: cyanAccessToken,
                email: 'toto@example.com',
                currentPassword: 'toto',
                expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
            });
        });
    });
    it('Should reject token of Kefka by the plugin hook', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield extra_utils_1.wait(5000);
            yield server.users.getMyInfo({ token: kefkaAccessToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
        });
    });
    it('Should unregister external-auth-2 and do not login existing Kefka', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.updateSettings({
                npmName: 'peertube-plugin-test-external-auth-one',
                settings: { disableKefka: true }
            });
            yield server.login.login({ user: { username: 'kefka', password: 'fake' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield loginExternal({
                server,
                npmName: 'test-external-auth-one',
                authName: 'external-auth-2',
                query: {
                    username: 'kefka'
                },
                username: 'kefka',
                expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
            });
        });
    });
    it('Should have disabled this auth', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const auths = config.plugin.registeredExternalAuths;
            chai_1.expect(auths).to.have.lengthOf(7);
            const auth1 = auths.find(a => a.authName === 'external-auth-2');
            chai_1.expect(auth1).to.not.exist;
        });
    });
    it('Should uninstall the plugin one and do not login Cyan', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-external-auth-one' });
            yield loginExternal({
                server,
                npmName: 'test-external-auth-one',
                authName: 'external-auth-1',
                query: {
                    username: 'cyan'
                },
                username: 'cyan',
                expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
            });
            yield server.login.login({ user: { username: 'cyan', password: null }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.login.login({ user: { username: 'cyan', password: '' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.login.login({ user: { username: 'cyan', password: 'fake' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should not login kefka with another plugin', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield loginExternal({
                server,
                npmName: 'test-external-auth-two',
                authName: 'external-auth-4',
                username: 'kefka2',
                expectedStatusStep2: models_1.HttpStatusCode.BAD_REQUEST_400
            });
            yield loginExternal({
                server,
                npmName: 'test-external-auth-two',
                authName: 'external-auth-4',
                username: 'kefka',
                expectedStatusStep2: models_1.HttpStatusCode.BAD_REQUEST_400
            });
        });
    });
    it('Should not login an existing user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.create({ username: 'existing_user', password: 'super_password' });
            yield loginExternal({
                server,
                npmName: 'test-external-auth-two',
                authName: 'external-auth-6',
                username: 'existing_user',
                expectedStatusStep2: models_1.HttpStatusCode.BAD_REQUEST_400
            });
        });
    });
    it('Should display the correct configuration', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const auths = config.plugin.registeredExternalAuths;
            chai_1.expect(auths).to.have.lengthOf(6);
            const auth2 = auths.find((a) => a.authName === 'external-auth-2');
            chai_1.expect(auth2).to.not.exist;
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
    it('Should forward the redirectUrl if the plugin returns one', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resLogin = yield loginExternal({
                server,
                npmName: 'test-external-auth-three',
                authName: 'external-auth-7',
                username: 'cid'
            });
            const { redirectUrl } = yield server.login.logout({ token: resLogin.access_token });
            chai_1.expect(redirectUrl).to.equal('https://example.com/redirectUrl');
        });
    });
    it('Should call the plugin\'s onLogout method with the request', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resLogin = yield loginExternal({
                server,
                npmName: 'test-external-auth-three',
                authName: 'external-auth-8',
                username: 'cid'
            });
            const { redirectUrl } = yield server.login.logout({ token: resLogin.access_token });
            chai_1.expect(redirectUrl).to.equal('https://example.com/redirectUrl?access_token=' + resLogin.access_token);
        });
    });
});
