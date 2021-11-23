"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test custom pages validators', function () {
    const path = '/api/v1/custom-pages/homepage/instance';
    let server;
    let userAccessToken;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const user = { username: 'user1', password: 'password' };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
        });
    });
    describe('When updating instance homepage', function () {
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    fields: { content: 'super content' },
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    fields: { content: 'super content' },
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: { content: 'super content' },
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When getting instance homapage', function () {
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
