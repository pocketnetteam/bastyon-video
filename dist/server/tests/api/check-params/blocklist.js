"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test blocklist API validators', function () {
    let servers;
    let server;
    let userAccessToken;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            server = servers[0];
            const user = { username: 'user1', password: 'password' };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('When managing user blocklist', function () {
        describe('When managing user accounts blocklist', function () {
            const path = '/api/v1/users/me/blocklist/accounts';
            describe('When listing blocked accounts', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeGetRequest)({
                            url: server.url,
                            path,
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
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
            });
            describe('When blocking an account', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            path,
                            fields: { accountName: 'user1' },
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with an unknown account', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { accountName: 'user2' },
                            expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                        });
                    });
                });
                it('Should fail to block ourselves', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { accountName: 'root' },
                            expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { accountName: 'user1' },
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
            describe('When unblocking an account', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user1',
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with an unknown account block', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user2',
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user1',
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
        });
        describe('When managing user servers blocklist', function () {
            const path = '/api/v1/users/me/blocklist/servers';
            describe('When listing blocked servers', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeGetRequest)({
                            url: server.url,
                            path,
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
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
            });
            describe('When blocking a server', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            path,
                            fields: { host: 'localhost:9002' },
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should succeed with an unknown server', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { host: 'localhost:9003' },
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
                it('Should fail with our own server', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { host: 'localhost:' + server.port },
                            expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { host: 'localhost:' + servers[1].port },
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
            describe('When unblocking a server', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:' + servers[1].port,
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with an unknown server block', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:9004',
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:' + servers[1].port,
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
        });
    });
    describe('When managing server blocklist', function () {
        describe('When managing server accounts blocklist', function () {
            const path = '/api/v1/server/blocklist/accounts';
            describe('When listing blocked accounts', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeGetRequest)({
                            url: server.url,
                            path,
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with a user without the appropriate rights', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeGetRequest)({
                            url: server.url,
                            token: userAccessToken,
                            path,
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
            });
            describe('When blocking an account', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            path,
                            fields: { accountName: 'user1' },
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with a user without the appropriate rights', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: userAccessToken,
                            path,
                            fields: { accountName: 'user1' },
                            expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                        });
                    });
                });
                it('Should fail with an unknown account', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { accountName: 'user2' },
                            expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                        });
                    });
                });
                it('Should fail to block ourselves', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { accountName: 'root' },
                            expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { accountName: 'user1' },
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
            describe('When unblocking an account', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user1',
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with a user without the appropriate rights', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user1',
                            token: userAccessToken,
                            expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                        });
                    });
                });
                it('Should fail with an unknown account block', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user2',
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/user1',
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
        });
        describe('When managing server servers blocklist', function () {
            const path = '/api/v1/server/blocklist/servers';
            describe('When listing blocked servers', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeGetRequest)({
                            url: server.url,
                            path,
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with a user without the appropriate rights', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeGetRequest)({
                            url: server.url,
                            token: userAccessToken,
                            path,
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
            });
            describe('When blocking a server', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            path,
                            fields: { host: 'localhost:' + servers[1].port },
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with a user without the appropriate rights', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: userAccessToken,
                            path,
                            fields: { host: 'localhost:' + servers[1].port },
                            expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                        });
                    });
                });
                it('Should succeed with an unknown server', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { host: 'localhost:9003' },
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
                it('Should fail with our own server', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { host: 'localhost:' + server.port },
                            expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makePostBodyRequest)({
                            url: server.url,
                            token: server.accessToken,
                            path,
                            fields: { host: 'localhost:' + servers[1].port },
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
            describe('When unblocking a server', function () {
                it('Should fail with an unauthenticated user', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:' + servers[1].port,
                            expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                        });
                    });
                });
                it('Should fail with a user without the appropriate rights', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:' + servers[1].port,
                            token: userAccessToken,
                            expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                        });
                    });
                });
                it('Should fail with an unknown server block', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:9004',
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                        });
                    });
                });
                it('Should succeed with the correct params', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield (0, extra_utils_1.makeDeleteRequest)({
                            url: server.url,
                            path: path + '/localhost:' + servers[1].port,
                            token: server.accessToken,
                            expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                        });
                    });
                });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
