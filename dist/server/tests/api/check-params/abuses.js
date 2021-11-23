"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test abuses API validators', function () {
    const basePath = '/api/v1/abuses/';
    let server;
    let userToken = '';
    let userToken2 = '';
    let abuseId;
    let messageId;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            userToken = yield server.users.generateUserAndToken('user_1');
            userToken2 = yield server.users.generateUserAndToken('user_2');
            server.store.videoCreated = yield server.videos.upload();
            command = server.abuses;
        });
    });
    describe('When listing abuses for admins', function () {
        const path = basePath;
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
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    token: userToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with a bad id filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { id: 'toto' } });
            });
        });
        it('Should fail with a bad filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { filter: 'toto' } });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { filter: 'videos' } });
            });
        });
        it('Should fail with bad predefined reason', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { predefinedReason: 'violentOrRepulsives' } });
            });
        });
        it('Should fail with a bad state filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { state: 'toto' } });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { state: 0 } });
            });
        });
        it('Should fail with a bad videoIs filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query: { videoIs: 'toto' } });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const query = {
                    id: 13,
                    predefinedReason: 'violentOrRepulsive',
                    filter: 'comment',
                    state: 2,
                    videoIs: 'deleted'
                };
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: server.accessToken, query, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When listing abuses for users', function () {
        const path = '/api/v1/users/me/abuses';
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, userToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, userToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, userToken);
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a bad id filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: userToken, query: { id: 'toto' } });
            });
        });
        it('Should fail with a bad state filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: userToken, query: { state: 'toto' } });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: userToken, query: { state: 0 } });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const query = {
                    id: 13,
                    state: 2
                };
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, token: userToken, query, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When reporting an abuse', function () {
        const path = basePath;
        it('Should fail with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields });
            });
        });
        it('Should fail with a wrong video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: 'blabla' }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: path, token: userToken, fields });
            });
        });
        it('Should fail with an unknown video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: 42 }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with a wrong comment', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { comment: { id: 'blabla' }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: path, token: userToken, fields });
            });
        });
        it('Should fail with an unknown comment', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { comment: { id: 42 }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with a wrong account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { account: { id: 'blabla' }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: path, token: userToken, fields });
            });
        });
        it('Should fail with an unknown account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { account: { id: 42 }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with not account, comment or video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: server.store.videoCreated.id }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: 'hello', fields, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a reason too short', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: server.store.videoCreated.id }, reason: 'h' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields });
            });
        });
        it('Should fail with a too big reason', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: server.store.videoCreated.id }, reason: 'super'.repeat(605) };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields });
            });
        });
        it('Should succeed with the correct parameters (basic)', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: server.store.videoCreated.shortUUID }, reason: 'my super reason' };
                const res = yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                abuseId = res.body.abuse.id;
            });
        });
        it('Should fail with a wrong predefined reason', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: server.store.videoCreated, reason: 'my super reason', predefinedReasons: ['wrongPredefinedReason'] };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields });
            });
        });
        it('Should fail with negative timestamps', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: server.store.videoCreated.id, startAt: -1 }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields });
            });
        });
        it('Should fail mith misordered startAt/endAt', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = { video: { id: server.store.videoCreated.id, startAt: 5, endAt: 1 }, reason: 'my super reason' };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields });
            });
        });
        it('Should succeed with the corret parameters (advanced)', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {
                    video: {
                        id: server.store.videoCreated.id,
                        startAt: 1,
                        endAt: 5
                    },
                    reason: 'my super reason',
                    predefinedReasons: ['serverRules']
                };
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userToken, fields, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When updating an abuse', function () {
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.update({ token: 'blabla', abuseId, body: {}, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.update({ token: userToken, abuseId, body: {}, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a bad abuse id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.update({ abuseId: 45, body: {}, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a bad state', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = { state: 5 };
                yield command.update({ abuseId, body, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with a bad moderation comment', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = { moderationComment: 'b'.repeat(3001) };
                yield command.update({ abuseId, body, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = { state: 3 };
                yield command.update({ abuseId, body });
            });
        });
    });
    describe('When creating an abuse message', function () {
        const message = 'my super message';
        it('Should fail with an invalid abuse id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.addMessage({ token: userToken2, abuseId: 888, message, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.addMessage({ token: 'fake_token', abuseId, message, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with an invalid logged in user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.addMessage({ token: userToken2, abuseId, message, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with an invalid message', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.addMessage({ token: userToken, abuseId, message: 'a'.repeat(5000), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should suceed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield command.addMessage({ token: userToken, abuseId, message });
                messageId = res.body.abuseMessage.id;
            });
        });
    });
    describe('When listing abuse messages', function () {
        it('Should fail with an invalid abuse id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.listMessages({ token: userToken, abuseId: 888, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.listMessages({ token: 'fake_token', abuseId, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with an invalid logged in user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.listMessages({ token: userToken2, abuseId, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.listMessages({ token: userToken, abuseId });
            });
        });
    });
    describe('When deleting an abuse message', function () {
        it('Should fail with an invalid abuse id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.deleteMessage({ token: userToken, abuseId: 888, messageId, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with an invalid message id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.deleteMessage({ token: userToken, abuseId, messageId: 888, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.deleteMessage({ token: 'fake_token', abuseId, messageId, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with an invalid logged in user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.deleteMessage({ token: userToken2, abuseId, messageId, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.deleteMessage({ token: userToken, abuseId, messageId });
            });
        });
    });
    describe('When deleting a video abuse', function () {
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ token: 'blabla', abuseId, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a non admin user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ token: userToken, abuseId, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a bad abuse id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ abuseId: 45, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ abuseId });
            });
        });
    });
    describe('When trying to manage messages of a remote abuse', function () {
        let remoteAbuseId;
        let anotherServer;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(50000);
                anotherServer = yield (0, extra_utils_1.createSingleServer)(2);
                yield (0, extra_utils_1.setAccessTokensToServers)([anotherServer]);
                yield (0, extra_utils_1.doubleFollow)(anotherServer, server);
                const server2VideoId = yield anotherServer.videos.getId({ uuid: server.store.videoCreated.uuid });
                yield anotherServer.abuses.report({ reason: 'remote server', videoId: server2VideoId });
                yield (0, extra_utils_1.waitJobs)([server, anotherServer]);
                const body = yield command.getAdminList({ sort: '-createdAt' });
                remoteAbuseId = body.data[0].id;
            });
        });
        it('Should fail when listing abuse messages of a remote abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.listMessages({ abuseId: remoteAbuseId, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail when creating abuse message of a remote abuse', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.addMessage({ abuseId: remoteAbuseId, message: 'message', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)([anotherServer]);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
