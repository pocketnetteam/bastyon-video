"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test server plugins API validators', function () {
    let server;
    let userAccessToken = null;
    const npmPlugin = 'peertube-plugin-hello-world';
    const pluginName = 'hello-world';
    let npmVersion;
    const themePlugin = 'peertube-theme-background-red';
    const themeName = 'background-red';
    let themeVersion;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const user = {
                username: 'user1',
                password: 'password'
            };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
            {
                const res = yield server.plugins.install({ npmName: npmPlugin });
                const plugin = res.body;
                npmVersion = plugin.version;
            }
            {
                const res = yield server.plugins.install({ npmName: themePlugin });
                const plugin = res.body;
                themeVersion = plugin.version;
            }
        });
    });
    describe('With static plugin routes', function () {
        it('Should fail with an unknown plugin name/plugin version', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const paths = [
                    '/plugins/' + pluginName + '/0.0.1/auth/fake-auth',
                    '/plugins/' + pluginName + '/0.0.1/static/images/chocobo.png',
                    '/plugins/' + pluginName + '/0.0.1/client-scripts/client/common-client-plugin.js',
                    '/themes/' + themeName + '/0.0.1/static/images/chocobo.png',
                    '/themes/' + themeName + '/0.0.1/client-scripts/client/video-watch-client-plugin.js',
                    '/themes/' + themeName + '/0.0.1/css/assets/style1.css'
                ];
                for (const p of paths) {
                    yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: p, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                }
            });
        });
        it('Should fail when requesting a plugin in the theme path', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: '/themes/' + pluginName + '/' + npmVersion + '/static/images/chocobo.png',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with invalid versions', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const paths = [
                    '/plugins/' + pluginName + '/0.0.1.1/auth/fake-auth',
                    '/plugins/' + pluginName + '/0.0.1.1/static/images/chocobo.png',
                    '/plugins/' + pluginName + '/0.1/client-scripts/client/common-client-plugin.js',
                    '/themes/' + themeName + '/1/static/images/chocobo.png',
                    '/themes/' + themeName + '/0.0.1000a/client-scripts/client/video-watch-client-plugin.js',
                    '/themes/' + themeName + '/0.a.1/css/assets/style1.css'
                ];
                for (const p of paths) {
                    yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: p, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                }
            });
        });
        it('Should fail with invalid paths', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const paths = [
                    '/plugins/' + pluginName + '/' + npmVersion + '/static/images/../chocobo.png',
                    '/plugins/' + pluginName + '/' + npmVersion + '/client-scripts/../client/common-client-plugin.js',
                    '/themes/' + themeName + '/' + themeVersion + '/static/../images/chocobo.png',
                    '/themes/' + themeName + '/' + themeVersion + '/client-scripts/client/video-watch-client-plugin.js/..',
                    '/themes/' + themeName + '/' + themeVersion + '/css/../assets/style1.css'
                ];
                for (const p of paths) {
                    yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: p, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                }
            });
        });
        it('Should fail with an unknown auth name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = '/plugins/' + pluginName + '/' + npmVersion + '/auth/bad-auth';
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with an unknown static file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const paths = [
                    '/plugins/' + pluginName + '/' + npmVersion + '/static/fake/chocobo.png',
                    '/plugins/' + pluginName + '/' + npmVersion + '/client-scripts/client/fake.js',
                    '/themes/' + themeName + '/' + themeVersion + '/static/fake/chocobo.png',
                    '/themes/' + themeName + '/' + themeVersion + '/client-scripts/client/fake.js'
                ];
                for (const p of paths) {
                    yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: p, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                }
            });
        });
        it('Should fail with an unknown CSS file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: '/themes/' + themeName + '/' + themeVersion + '/css/assets/fake.css',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const paths = [
                    '/plugins/' + pluginName + '/' + npmVersion + '/static/images/chocobo.png',
                    '/plugins/' + pluginName + '/' + npmVersion + '/client-scripts/client/common-client-plugin.js',
                    '/themes/' + themeName + '/' + themeVersion + '/static/images/chocobo.png',
                    '/themes/' + themeName + '/' + themeVersion + '/client-scripts/client/video-watch-client-plugin.js',
                    '/themes/' + themeName + '/' + themeVersion + '/css/assets/style1.css'
                ];
                for (const p of paths) {
                    yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: p, expectedStatus: models_1.HttpStatusCode.OK_200 });
                }
                const authPath = '/plugins/' + pluginName + '/' + npmVersion + '/auth/fake-auth';
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: authPath, expectedStatus: models_1.HttpStatusCode.FOUND_302 });
            });
        });
    });
    describe('When listing available plugins/themes', function () {
        const path = '/api/v1/plugins/available';
        const baseQuery = {
            search: 'super search',
            pluginType: models_1.PluginType.PLUGIN,
            currentPeerTubeEngine: '1.2.3'
        };
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: 'fake_token',
                    query: baseQuery,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    query: baseQuery,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an invalid plugin type', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const query = Object.assign(Object.assign({}, baseQuery), { pluginType: 5 });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query
                });
            });
        });
        it('Should fail with an invalid current peertube engine', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const query = Object.assign(Object.assign({}, baseQuery), { currentPeerTubeEngine: '1.0' });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: baseQuery,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When listing local plugins/themes', function () {
        const path = '/api/v1/plugins';
        const baseQuery = {
            pluginType: models_1.PluginType.THEME
        };
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: 'fake_token',
                    query: baseQuery,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    query: baseQuery,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an invalid plugin type', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const query = Object.assign(Object.assign({}, baseQuery), { pluginType: 5 });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: baseQuery,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When getting a plugin or the registered settings or public settings', function () {
        const path = '/api/v1/plugins/';
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of [npmPlugin, `${npmPlugin}/registered-settings`]) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: path + suffix,
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                }
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of [npmPlugin, `${npmPlugin}/registered-settings`]) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: path + suffix,
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                }
            });
        });
        it('Should fail with an invalid npm name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of ['toto', 'toto/registered-settings', 'toto/public-settings']) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: path + suffix,
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                }
                for (const suffix of ['peertube-plugin-TOTO', 'peertube-plugin-TOTO/registered-settings', 'peertube-plugin-TOTO/public-settings']) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: path + suffix,
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                }
            });
        });
        it('Should fail with an unknown plugin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of ['peertube-plugin-toto', 'peertube-plugin-toto/registered-settings', 'peertube-plugin-toto/public-settings']) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: path + suffix,
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                    });
                }
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of [npmPlugin, `${npmPlugin}/registered-settings`, `${npmPlugin}/public-settings`]) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: path + suffix,
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.OK_200
                    });
                }
            });
        });
    });
    describe('When updating plugin settings', function () {
        const path = '/api/v1/plugins/';
        const settings = { setting1: 'value1' };
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + npmPlugin + '/settings',
                    fields: { settings },
                    token: 'fake_token',
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + npmPlugin + '/settings',
                    fields: { settings },
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with an invalid npm name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + 'toto/settings',
                    fields: { settings },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + 'peertube-plugin-TOTO/settings',
                    fields: { settings },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with an unknown plugin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + 'peertube-plugin-toto/settings',
                    fields: { settings },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + npmPlugin + '/settings',
                    fields: { settings },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When installing/updating/uninstalling a plugin', function () {
        const path = '/api/v1/plugins/';
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of ['install', 'update', 'uninstall']) {
                    yield (0, extra_utils_1.makePostBodyRequest)({
                        url: server.url,
                        path: path + suffix,
                        fields: { npmName: npmPlugin },
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                }
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of ['install', 'update', 'uninstall']) {
                    yield (0, extra_utils_1.makePostBodyRequest)({
                        url: server.url,
                        path: path + suffix,
                        fields: { npmName: npmPlugin },
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                }
            });
        });
        it('Should fail with an invalid npm name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const suffix of ['install', 'update', 'uninstall']) {
                    yield (0, extra_utils_1.makePostBodyRequest)({
                        url: server.url,
                        path: path + suffix,
                        fields: { npmName: 'toto' },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                }
                for (const suffix of ['install', 'update', 'uninstall']) {
                    yield (0, extra_utils_1.makePostBodyRequest)({
                        url: server.url,
                        path: path + suffix,
                        fields: { npmName: 'peertube-plugin-TOTO' },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                }
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const it = [
                    { suffix: 'install', status: models_1.HttpStatusCode.OK_200 },
                    { suffix: 'update', status: models_1.HttpStatusCode.OK_200 },
                    { suffix: 'uninstall', status: models_1.HttpStatusCode.NO_CONTENT_204 }
                ];
                for (const obj of it) {
                    yield (0, extra_utils_1.makePostBodyRequest)({
                        url: server.url,
                        path: path + obj.suffix,
                        fields: { npmName: npmPlugin },
                        token: server.accessToken,
                        expectedStatus: obj.status
                    });
                }
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
