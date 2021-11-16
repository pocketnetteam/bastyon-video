"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Official plugin auth-ldap', function () {
    let server;
    let accessToken;
    let userId;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield server.plugins.install({ npmName: 'peertube-plugin-auth-ldap' });
        });
    });
    it('Should not login with without LDAP settings', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.login.login({ user: { username: 'fry', password: 'fry' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should not login with bad LDAP settings', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.updateSettings({
                npmName: 'peertube-plugin-auth-ldap',
                settings: {
                    'bind-credentials': 'GoodNewsEveryone',
                    'bind-dn': 'cn=admin,dc=planetexpress,dc=com',
                    'insecure-tls': false,
                    'mail-property': 'mail',
                    'search-base': 'ou=people,dc=planetexpress,dc=com',
                    'search-filter': '(|(mail={{username}})(uid={{username}}))',
                    'url': 'ldap://localhost:390',
                    'username-property': 'uid'
                }
            });
            yield server.login.login({ user: { username: 'fry', password: 'fry' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should not login with good LDAP settings but wrong username/password', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.updateSettings({
                npmName: 'peertube-plugin-auth-ldap',
                settings: {
                    'bind-credentials': 'GoodNewsEveryone',
                    'bind-dn': 'cn=admin,dc=planetexpress,dc=com',
                    'insecure-tls': false,
                    'mail-property': 'mail',
                    'search-base': 'ou=people,dc=planetexpress,dc=com',
                    'search-filter': '(|(mail={{username}})(uid={{username}}))',
                    'url': 'ldap://localhost:10389',
                    'username-property': 'uid'
                }
            });
            yield server.login.login({ user: { username: 'fry', password: 'bad password' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            yield server.login.login({ user: { username: 'fryr', password: 'fry' }, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should login with the appropriate username/password', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            accessToken = yield server.login.getAccessToken({ username: 'fry', password: 'fry' });
        });
    });
    it('Should login with the appropriate email/password', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            accessToken = yield server.login.getAccessToken({ username: 'fry@planetexpress.com', password: 'fry' });
        });
    });
    it('Should login get my profile', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield server.users.getMyInfo({ token: accessToken });
            chai_1.expect(body.username).to.equal('fry');
            chai_1.expect(body.email).to.equal('fry@planetexpress.com');
            userId = body.id;
        });
    });
    it('Should upload a video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.videos.upload({ token: accessToken, attributes: { name: 'my super video' } });
        });
    });
    it('Should not be able to login if the user is banned', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.banUser({ userId });
            yield server.login.login({
                user: { username: 'fry@planetexpress.com', password: 'fry' },
                expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
            });
        });
    });
    it('Should be able to login if the user is unbanned', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.unbanUser({ userId });
            yield server.login.login({ user: { username: 'fry@planetexpress.com', password: 'fry' } });
        });
    });
    it('Should not login if the plugin is uninstalled', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.uninstall({ npmName: 'peertube-plugin-auth-ldap' });
            yield server.login.login({
                user: { username: 'fry@planetexpress.com', password: 'fry' },
                expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
