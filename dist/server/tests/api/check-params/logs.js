"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test logs API validators', function () {
    const path = '/api/v1/server/logs';
    let server;
    let userAccessToken = '';
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
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
    describe('When getting logs', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with a missing startDate query', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a bad startDate query', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: { startDate: 'toto' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a bad endDate query', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: { startDate: new Date().toISOString(), endDate: 'toto' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a bad level parameter', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: { startDate: new Date().toISOString(), level: 'toto' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: { startDate: new Date().toISOString() },
                    expectedStatus: models_1.HttpStatusCode.OK_200
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
