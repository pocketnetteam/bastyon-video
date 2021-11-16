"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test bulk API validators', function () {
    let server;
    let userAccessToken;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            const user = { username: 'user1', password: 'password' };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
        });
    });
    describe('When removing comments of', function () {
        const path = '/api/v1/bulk/remove-comments-of';
        it('Should fail with an unauthenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    fields: { accountName: 'user1', scope: 'my-videos' },
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with an unknown account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    fields: { accountName: 'user2', scope: 'my-videos' },
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with an invalid scope', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    fields: { accountName: 'user1', scope: 'my-videoss' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail to delete comments of the instance without the appropriate rights', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    token: userAccessToken,
                    path,
                    fields: { accountName: 'user1', scope: 'instance' },
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    fields: { accountName: 'user1', scope: 'instance' },
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
