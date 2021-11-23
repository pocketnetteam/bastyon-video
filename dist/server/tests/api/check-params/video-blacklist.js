"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test video blacklist API validators', function () {
    let servers;
    let notBlacklistedVideoId;
    let remoteVideoUUID;
    let userAccessToken1 = '';
    let userAccessToken2 = '';
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            {
                const username = 'user1';
                const password = 'my super password';
                yield servers[0].users.create({ username: username, password: password });
                userAccessToken1 = yield servers[0].login.getAccessToken({ username, password });
            }
            {
                const username = 'user2';
                const password = 'my super password';
                yield servers[0].users.create({ username: username, password: password });
                userAccessToken2 = yield servers[0].login.getAccessToken({ username, password });
            }
            {
                servers[0].store.videoCreated = yield servers[0].videos.upload({ token: userAccessToken1 });
            }
            {
                const { uuid } = yield servers[0].videos.upload();
                notBlacklistedVideoId = uuid;
            }
            {
                const { uuid } = yield servers[1].videos.upload();
                remoteVideoUUID = uuid;
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            command = servers[0].blacklist;
        });
    });
    describe('When adding a video in blacklist', function () {
        const basePath = '/api/v1/videos/';
        it('Should fail with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({ url: servers[0].url, path, token: servers[0].accessToken, fields });
            });
        });
        it('Should fail with a wrong video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const wrongPath = '/api/v1/videos/blabla/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({ url: servers[0].url, path: wrongPath, token: servers[0].accessToken, fields });
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({ url: servers[0].url, path, token: 'hello', fields, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: servers[0].url,
                    path,
                    token: userAccessToken2,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with an invalid reason', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated.uuid + '/blacklist';
                const fields = { reason: 'a'.repeat(305) };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: servers[0].url, path, token: servers[0].accessToken, fields });
            });
        });
        it('Should fail to unfederate a remote video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + remoteVideoUUID + '/blacklist';
                const fields = { unfederate: true };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: servers[0].url,
                    path,
                    token: servers[0].accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated.uuid + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: servers[0].url,
                    path,
                    token: servers[0].accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When updating a video in blacklist', function () {
        const basePath = '/api/v1/videos/';
        it('Should fail with a wrong video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const wrongPath = '/api/v1/videos/blabla/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePutBodyRequest)({ url: servers[0].url, path: wrongPath, token: servers[0].accessToken, fields });
            });
        });
        it('Should fail with a video not blacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/' + notBlacklistedVideoId + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path,
                    token: servers[0].accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePutBodyRequest)({ url: servers[0].url, path, token: 'hello', fields, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated + '/blacklist';
                const fields = {};
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path,
                    token: userAccessToken2,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with an invalid reason', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated.uuid + '/blacklist';
                const fields = { reason: 'a'.repeat(305) };
                yield (0, extra_utils_1.makePutBodyRequest)({ url: servers[0].url, path, token: servers[0].accessToken, fields });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const path = basePath + servers[0].store.videoCreated.shortUUID + '/blacklist';
                const fields = { reason: 'hello' };
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: servers[0].url,
                    path,
                    token: servers[0].accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When getting blacklisted video', function () {
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.get({ id: servers[0].store.videoCreated.uuid, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.getWithToken({
                    token: userAccessToken2,
                    id: servers[0].store.videoCreated.uuid,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should succeed with the owner authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const video = yield servers[0].videos.getWithToken({ token: userAccessToken1, id: servers[0].store.videoCreated.uuid });
                (0, chai_1.expect)(video.blacklisted).to.be.true;
            });
        });
        it('Should succeed with an admin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const video = servers[0].store.videoCreated;
                for (const id of [video.id, video.uuid, video.shortUUID]) {
                    const video = yield servers[0].videos.getWithToken({ id, expectedStatus: models_1.HttpStatusCode.OK_200 });
                    (0, chai_1.expect)(video.blacklisted).to.be.true;
                }
            });
        });
    });
    describe('When removing a video in blacklist', function () {
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.remove({
                    token: 'fake token',
                    videoId: servers[0].store.videoCreated.uuid,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.remove({
                    token: userAccessToken2,
                    videoId: servers[0].store.videoCreated.uuid,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with an incorrect id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.remove({ videoId: 'hello', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with a not blacklisted video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.remove({ videoId: notBlacklistedVideoId, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.remove({ videoId: servers[0].store.videoCreated.uuid, expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
            });
        });
    });
    describe('When listing videos in blacklist', function () {
        const basePath = '/api/v1/videos/blacklist/';
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].blacklist.list({ token: 'fake token', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].blacklist.list({ token: userAccessToken2, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(servers[0].url, basePath, servers[0].accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(servers[0].url, basePath, servers[0].accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(servers[0].url, basePath, servers[0].accessToken);
            });
        });
        it('Should fail with an invalid type', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].blacklist.list({ type: 0, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].blacklist.list({ type: 1 });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
