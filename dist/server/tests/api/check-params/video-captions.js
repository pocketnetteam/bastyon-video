"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test video captions API validator', function () {
    const path = '/api/v1/videos/';
    let server;
    let userAccessToken;
    let video;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            video = yield server.videos.upload();
            {
                const user = {
                    username: 'user1',
                    password: 'my super password'
                };
                yield server.users.create({ username: user.username, password: user.password });
                userAccessToken = yield server.login.getAccessToken(user);
            }
        });
    });
    describe('When adding video caption', function () {
        const fields = {};
        const attaches = {
            captionfile: (0, extra_utils_1.buildAbsoluteFixturePath)('subtitle-good1.vtt')
        };
        it('Should fail without a valid uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df563d0b06/captions/fr',
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail with an unknown id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df5630b06/captions/fr',
                    token: server.accessToken,
                    fields,
                    attaches,
                    expectedStatus: 404
                });
            });
        });
        it('Should fail with a missing language in path', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.uuid + '/captions';
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: captionPath,
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail with an unknown language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.uuid + '/captions/15';
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: captionPath,
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail without access token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.uuid + '/captions/fr';
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: captionPath,
                    fields,
                    attaches,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a bad access token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.uuid + '/captions/fr';
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: captionPath,
                    token: 'blabla',
                    fields,
                    attaches,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should succeed with a valid captionfile extension and octet-stream mime type', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.captions.add({
                    language: 'zh',
                    videoId: video.uuid,
                    fixture: 'subtitle-good.srt',
                    mimeType: 'application/octet-stream'
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.uuid + '/captions/fr';
                yield (0, extra_utils_1.makeUploadRequest)({
                    method: 'PUT',
                    url: server.url,
                    path: captionPath,
                    token: server.accessToken,
                    fields,
                    attaches,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When listing video captions', function () {
        it('Should fail without a valid uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: path + '4da6fde3-88f7-4d16-b119-108df563d0b06/captions' });
            });
        });
        it('Should fail with an unknown id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df5630b06/captions',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: path + video.shortUUID + '/captions', expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When deleting video caption', function () {
        it('Should fail without a valid uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df563d0b06/captions/fr',
                    token: server.accessToken
                });
            });
        });
        it('Should fail with an unknown id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df5630b06/captions/fr',
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with an invalid language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df5630b06/captions/16',
                    token: server.accessToken
                });
            });
        });
        it('Should fail with a missing language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.shortUUID + '/captions';
                yield (0, extra_utils_1.makeDeleteRequest)({ url: server.url, path: captionPath, token: server.accessToken });
            });
        });
        it('Should fail with an unknown language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.shortUUID + '/captions/15';
                yield (0, extra_utils_1.makeDeleteRequest)({ url: server.url, path: captionPath, token: server.accessToken });
            });
        });
        it('Should fail without access token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.shortUUID + '/captions/fr';
                yield (0, extra_utils_1.makeDeleteRequest)({ url: server.url, path: captionPath, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a bad access token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.shortUUID + '/captions/fr';
                yield (0, extra_utils_1.makeDeleteRequest)({ url: server.url, path: captionPath, token: 'coucou', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.shortUUID + '/captions/fr';
                yield (0, extra_utils_1.makeDeleteRequest)({
                    url: server.url,
                    path: captionPath,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const captionPath = path + video.shortUUID + '/captions/fr';
                yield (0, extra_utils_1.makeDeleteRequest)({
                    url: server.url,
                    path: captionPath,
                    token: server.accessToken,
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
