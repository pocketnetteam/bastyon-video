"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test server follows API validators', function () {
    let server;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
        });
    });
    describe('When managing following', function () {
        let userAccessToken = null;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                userAccessToken = yield server.users.generateUserAndToken('user1');
            });
        });
        describe('When adding follows', function () {
            const path = '/api/v1/server/following';
            it('Should fail with nothing', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail if hosts is not composed by hosts', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { hosts: ['localhost:9002', 'localhost:coucou'] },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail if hosts is composed with http schemes', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { hosts: ['localhost:9002', 'http://localhost:9003'] },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail if hosts are not unique', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { urls: ['localhost:9002', 'localhost:9002'] },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail if handles is not composed by handles', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { handles: ['hello@example.com', 'localhost:9001'] },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail if handles are not unique', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { urls: ['hello@example.com', 'hello@example.com'] },
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail with an invalid token', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { hosts: ['localhost:9002'] },
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                });
            });
            it('Should fail if the user is not an administrator', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        fields: { hosts: ['localhost:9002'] },
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                });
            });
        });
        describe('When listing followings', function () {
            const path = '/api/v1/server/following';
            it('Should fail with a bad start pagination', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.checkBadStartPagination(server.url, path);
                });
            });
            it('Should fail with a bad count pagination', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.checkBadCountPagination(server.url, path);
                });
            });
            it('Should fail with an incorrect sort', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.checkBadSortPagination(server.url, path);
                });
            });
            it('Should fail with an incorrect state', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeGetRequest({
                        url: server.url,
                        path,
                        query: {
                            state: 'blabla'
                        }
                    });
                });
            });
            it('Should fail with an incorrect actor type', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeGetRequest({
                        url: server.url,
                        path,
                        query: {
                            actorType: 'blabla'
                        }
                    });
                });
            });
            it('Should fail succeed with the correct params', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeGetRequest({
                        url: server.url,
                        path,
                        expectedStatus: models_1.HttpStatusCode.OK_200,
                        query: {
                            state: 'accepted',
                            actorType: 'Application'
                        }
                    });
                });
            });
        });
        describe('When listing followers', function () {
            const path = '/api/v1/server/followers';
            it('Should fail with a bad start pagination', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.checkBadStartPagination(server.url, path);
                });
            });
            it('Should fail with a bad count pagination', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.checkBadCountPagination(server.url, path);
                });
            });
            it('Should fail with an incorrect sort', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.checkBadSortPagination(server.url, path);
                });
            });
            it('Should fail with an incorrect actor type', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeGetRequest({
                        url: server.url,
                        path,
                        query: {
                            actorType: 'blabla'
                        }
                    });
                });
            });
            it('Should fail with an incorrect state', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeGetRequest({
                        url: server.url,
                        path,
                        query: {
                            state: 'blabla',
                            actorType: 'Application'
                        }
                    });
                });
            });
            it('Should fail succeed with the correct params', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeGetRequest({
                        url: server.url,
                        path,
                        expectedStatus: models_1.HttpStatusCode.OK_200,
                        query: {
                            state: 'accepted'
                        }
                    });
                });
            });
        });
        describe('When removing a follower', function () {
            const path = '/api/v1/server/followers';
            it('Should fail with an invalid token', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9002',
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                });
            });
            it('Should fail if the user is not an administrator', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9002',
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                });
            });
            it('Should fail with an invalid follower', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/toto',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail with an unknown follower', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9003',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                    });
                });
            });
        });
        describe('When accepting a follower', function () {
            const path = '/api/v1/server/followers';
            it('Should fail with an invalid token', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9002/accept',
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                });
            });
            it('Should fail if the user is not an administrator', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9002/accept',
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                });
            });
            it('Should fail with an invalid follower', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto/accept',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail with an unknown follower', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9003/accept',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                    });
                });
            });
        });
        describe('When rejecting a follower', function () {
            const path = '/api/v1/server/followers';
            it('Should fail with an invalid token', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9002/reject',
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                });
            });
            it('Should fail if the user is not an administrator', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9002/reject',
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                });
            });
            it('Should fail with an invalid follower', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto/reject',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                    });
                });
            });
            it('Should fail with an unknown follower', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path: path + '/toto@localhost:9003/reject',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                    });
                });
            });
        });
        describe('When removing following', function () {
            const path = '/api/v1/server/following';
            it('Should fail with an invalid token', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/localhost:9002',
                        token: 'fake_token',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                });
            });
            it('Should fail if the user is not an administrator', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/localhost:9002',
                        token: userAccessToken,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                });
            });
            it('Should fail if we do not follow this server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield extra_utils_1.makeDeleteRequest({
                        url: server.url,
                        path: path + '/example.com',
                        token: server.accessToken,
                        expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                    });
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
