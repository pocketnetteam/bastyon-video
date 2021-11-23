"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test server redundancy API validators', function () {
    let servers;
    let userAccessToken = null;
    let videoIdLocal;
    let videoRemote;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(80000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            const user = {
                username: 'user1',
                password: 'password'
            };
            yield servers[0].users.create({ username: user.username, password: user.password });
            userAccessToken = yield servers[0].login.getAccessToken(user);
            videoIdLocal = (yield servers[0].videos.quickUpload({ name: 'video' })).id;
            const remoteUUID = (yield servers[1].videos.quickUpload({ name: 'video' })).uuid;
            yield (0, extra_utils_1.waitJobs)(servers);
            videoRemote = yield servers[0].videos.get({ id: remoteUUID });
        });
    });
    describe('When listing redundancies', function () {
        const path = '/api/v1/server/redundancy/videos';
        let url;
        let token;
        before(function () {
            url = servers[0].url;
            token = servers[0].accessToken;
        });
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url, path, token: 'fake_token', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url, path, token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(url, path, servers[0].accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(url, path, servers[0].accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(url, path, servers[0].accessToken);
            });
        });
        it('Should fail with a bad target', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url, path, token, query: { target: 'bad target' } });
            });
        });
        it('Should fail without target', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url, path, token });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url, path, token, query: { target: 'my-videos' }, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When manually adding a redundancy', function () {
        const path = '/api/v1/server/redundancy/videos';
        let url;
        let token;
        before(function () {
            url = servers[0].url;
            token = servers[0].accessToken;
        });
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url, path, token: 'fake_token', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url, path, token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail without a video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url, path, token });
            });
        });
        it('Should fail with an incorrect video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url, path, token, fields: { videoId: 'peertube' } });
            });
        });
        it('Should fail with a not found video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url, path, token, fields: { videoId: 6565 }, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a local a video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({ url, path, token, fields: { videoId: videoIdLocal } });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url,
                    path,
                    token,
                    fields: { videoId: videoRemote.shortUUID },
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
        it('Should fail if the video is already duplicated', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url,
                    path,
                    token,
                    fields: { videoId: videoRemote.uuid },
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
    });
    describe('When manually removing a redundancy', function () {
        const path = '/api/v1/server/redundancy/videos/';
        let url;
        let token;
        before(function () {
            url = servers[0].url;
            token = servers[0].accessToken;
        });
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({ url, path: path + '1', token: 'fake_token', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({ url, path: path + '1', token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with an incorrect video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({ url, path: path + 'toto', token });
            });
        });
        it('Should fail with a not found video redundancy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({ url, path: path + '454545', token, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
    });
    describe('When updating server redundancy', function () {
        const path = '/api/v1/server/redundancy';
        it('Should fail with an invalid token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path: path + '/localhost:' + servers[1].port,
                    fields: { redundancyAllowed: true },
                    token: 'fake_token',
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path: path + '/localhost:' + servers[1].port,
                    fields: { redundancyAllowed: true },
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail if we do not follow this server', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path: path + '/example.com',
                    fields: { redundancyAllowed: true },
                    token: servers[0].accessToken,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail without de redundancyAllowed param', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path: path + '/localhost:' + servers[1].port,
                    fields: { blabla: true },
                    token: servers[0].accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path: path + '/localhost:' + servers[1].port,
                    fields: { redundancyAllowed: true },
                    token: servers[0].accessToken,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
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
