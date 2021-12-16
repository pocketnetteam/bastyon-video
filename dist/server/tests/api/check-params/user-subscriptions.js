"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test user subscriptions API validators', function () {
    const path = '/api/v1/users/me/subscriptions';
    let server;
    let userAccessToken = '';
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            const user = {
                username: 'user1',
                password: 'my super password'
            };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
        });
    });
    describe('When listing my subscriptions', function () {
        it('Should fail with a bad start pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadStartPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadCountPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadSortPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When listing my subscriptions videos', function () {
        const path = '/api/v1/users/me/subscriptions/videos';
        it('Should fail with a bad start pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadStartPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadCountPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadSortPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When adding a subscription', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    fields: { uri: 'user1_channel@localhost:' + server.port },
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with bad URIs', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: { uri: 'root' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: { uri: 'root@' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: { uri: 'root@hello@' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: { uri: 'user1_channel@localhost:' + server.port },
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
                yield extra_utils_1.waitJobs([server]);
            });
        });
    });
    describe('When getting a subscription', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + '/user1_channel@localhost:' + server.port,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with bad URIs', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + '/root',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + '/root@',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + '/root@hello@',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with an unknown subscription', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + '/root1@localhost:' + server.port,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + '/user1_channel@localhost:' + server.port,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When checking if subscriptions exist', function () {
        const existPath = path + '/exist';
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: existPath,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with bad URIs', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: existPath,
                    query: { uris: 'toto' },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: existPath,
                    query: { 'uris[]': 1 },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: existPath,
                    query: { 'uris[]': 'coucou@localhost:' + server.port },
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When removing a subscription', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: path + '/user1_channel@localhost:' + server.port,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with bad URIs', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: path + '/root',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: path + '/root@',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: path + '/root@hello@',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with an unknown subscription', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: path + '/root1@localhost:' + server.port,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: path + '/user1_channel@localhost:' + server.port,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
