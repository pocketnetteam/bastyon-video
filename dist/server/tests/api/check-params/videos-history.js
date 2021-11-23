"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test videos history API validator', function () {
    const myHistoryPath = '/api/v1/users/me/history/videos';
    const myHistoryRemove = myHistoryPath + '/remove';
    let watchingPath;
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const { uuid } = yield server.videos.upload();
            watchingPath = '/api/v1/videos/' + uuid + '/watching';
        });
    });
    describe('When notifying a user is watching a video', function () {
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { currentTime: 5 };
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: watchingPath, fields, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with an incorrect video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { currentTime: 5 };
                const path = '/api/v1/videos/blabla/watching';
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    fields,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with an unknown video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { currentTime: 5 };
                const path = '/api/v1/videos/d91fff41-c24d-4508-8e13-3bd5902c3b02/watching';
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    fields,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with a bad current time', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { currentTime: 'hello' };
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: watchingPath,
                    fields,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { currentTime: 5 };
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: watchingPath,
                    fields,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When listing user videos history', function () {
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, myHistoryPath, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, myHistoryPath, server.accessToken);
            });
        });
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: myHistoryPath, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, token: server.accessToken, path: myHistoryPath, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When removing user videos history', function () {
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: myHistoryPath + '/remove', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a bad beforeDate parameter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = { beforeDate: '15' };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path: myHistoryRemove,
                    fields: body,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with a valid beforeDate param', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = { beforeDate: new Date().toISOString() };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path: myHistoryRemove,
                    fields: body,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
        it('Should succeed without body', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path: myHistoryRemove,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
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
