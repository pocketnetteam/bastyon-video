"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test video comments API validator', function () {
    let pathThread;
    let pathComment;
    let server;
    let video;
    let userAccessToken;
    let userAccessToken2;
    let commentId;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            {
                video = yield server.videos.upload({ attributes: {} });
                pathThread = '/api/v1/videos/' + video.uuid + '/comment-threads';
            }
            {
                const created = yield server.comments.createThread({ videoId: video.uuid, text: 'coucou' });
                commentId = created.id;
                pathComment = '/api/v1/videos/' + video.uuid + '/comments/' + commentId;
            }
            {
                const user = { username: 'user1', password: 'my super password' };
                yield server.users.create({ username: user.username, password: user.password });
                userAccessToken = yield server.login.getAccessToken(user);
            }
            {
                const user = { username: 'user2', password: 'my super password' };
                yield server.users.create({ username: user.username, password: user.password });
                userAccessToken2 = yield server.login.getAccessToken(user);
            }
        });
    });
    describe('When listing video comment threads', function () {
        it('Should fail with a bad start pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadStartPagination(server.url, pathThread, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadCountPagination(server.url, pathThread, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadSortPagination(server.url, pathThread, server.accessToken);
            });
        });
        it('Should fail with an incorrect video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: '/api/v1/videos/ba708d62-e3d7-45d9-9d73-41b9097cc02d/comment-threads',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
    });
    describe('When listing comments of a thread', function () {
        it('Should fail with an incorrect video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: '/api/v1/videos/ba708d62-e3d7-45d9-9d73-41b9097cc02d/comment-threads/' + commentId,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with an incorrect thread id', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: '/api/v1/videos/' + video.shortUUID + '/comment-threads/156',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should success with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: '/api/v1/videos/' + video.shortUUID + '/comment-threads/' + commentId,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When adding a video thread', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'text'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: pathThread,
                    token: 'none',
                    fields,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with nothing', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: pathThread, token: server.accessToken, fields });
            });
        });
        it('Should fail with a short comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: ''
                };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: pathThread, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'h'.repeat(10001)
                };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: pathThread, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/ba708d62-e3d7-45d9-9d73-41b9097cc02d/comment-threads';
                const fields = {
                    text: 'super comment'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'super comment'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: pathThread,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When adding a comment to a thread', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'text'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: pathComment,
                    token: 'none',
                    fields,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with nothing', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: pathComment, token: server.accessToken, fields });
            });
        });
        it('Should fail with a short comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: ''
                };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: pathComment, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'h'.repeat(10001)
                };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: pathComment, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/ba708d62-e3d7-45d9-9d73-41b9097cc02d/comments/' + commentId;
                const fields = {
                    text: 'super comment'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with an incorrect comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/' + video.uuid + '/comments/124';
                const fields = {
                    text: 'super comment'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'super comment'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: pathComment,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When removing video comments', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path: pathComment, token: 'none', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with another user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: pathComment,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with an incorrect video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/ba708d62-e3d7-45d9-9d73-41b9097cc02d/comments/' + commentId;
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path, token: server.accessToken, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with an incorrect comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/' + video.uuid + '/comments/124';
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path, token: server.accessToken, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the same user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let commentToDelete;
                {
                    const created = yield server.comments.createThread({ videoId: video.uuid, token: userAccessToken, text: 'hello' });
                    commentToDelete = created.id;
                }
                const path = '/api/v1/videos/' + video.uuid + '/comments/' + commentToDelete;
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path, token: userAccessToken2, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path, token: userAccessToken, expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
            });
        });
        it('Should succeed with the owner of the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let commentToDelete;
                let anotherVideoUUID;
                {
                    const { uuid } = yield server.videos.upload({ token: userAccessToken, attributes: { name: 'video' } });
                    anotherVideoUUID = uuid;
                }
                {
                    const created = yield server.comments.createThread({ videoId: anotherVideoUUID, text: 'hello' });
                    commentToDelete = created.id;
                }
                const path = '/api/v1/videos/' + anotherVideoUUID + '/comments/' + commentToDelete;
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path, token: userAccessToken2, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                yield extra_utils_1.makeDeleteRequest({ url: server.url, path, token: userAccessToken, expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path: pathComment,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When a video has comments disabled', function () {
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                video = yield server.videos.upload({ attributes: { commentsEnabled: false } });
                pathThread = '/api/v1/videos/' + video.uuid + '/comment-threads';
            });
        });
        it('Should return an empty thread list', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const res = yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: pathThread,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                expect(res.body.total).to.equal(0);
                expect(res.body.data).to.have.lengthOf(0);
            });
        });
        it('Should return an thread comments list');
        it('Should return conflict on thread add', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    text: 'super comment'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: pathThread,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should return conflict on comment thread add');
    });
    describe('When listing admin comments threads', function () {
        const path = '/api/v1/videos/comments';
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
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    query: {
                        isLocal: false,
                        search: 'toto',
                        searchAccount: 'toto',
                        searchVideo: 'toto'
                    },
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
