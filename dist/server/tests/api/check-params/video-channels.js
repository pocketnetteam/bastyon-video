"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test video channels API validator', function () {
    const videoChannelPath = '/api/v1/video-channels';
    let server;
    let accessTokenUser;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const user = {
                username: 'fake',
                password: 'fake_password'
            };
            {
                yield server.users.create({ username: user.username, password: user.password });
                accessTokenUser = yield server.login.getAccessToken(user);
            }
            command = server.channels;
        });
    });
    describe('When listing a video channels', function () {
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, videoChannelPath, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, videoChannelPath, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, videoChannelPath, server.accessToken);
            });
        });
    });
    describe('When listing account video channels', function () {
        const accountChannelPath = '/api/v1/accounts/fake/video-channels';
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, accountChannelPath, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, accountChannelPath, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, accountChannelPath, server.accessToken);
            });
        });
        it('Should fail with a unknown account', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.channels.listByAccount({ accountName: 'unknown', expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: accountChannelPath,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When adding a video channel', function () {
        const baseCorrectParams = {
            name: 'super_channel',
            displayName: 'hello',
            description: 'super description',
            support: 'super support text'
        };
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path: videoChannelPath,
                    token: 'none',
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should fail without a name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = (0, lodash_1.omit)(baseCorrectParams, 'name');
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { name: 'super name' });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should fail without a name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = (0, lodash_1.omit)(baseCorrectParams, 'displayName');
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { displayName: 'super'.repeat(25) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long description', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { description: 'super'.repeat(201) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long support text', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { support: 'super'.repeat(201) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path: videoChannelPath, token: server.accessToken, fields });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path: videoChannelPath,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should fail when adding a channel with the same username', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path: videoChannelPath,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
    });
    describe('When updating a video channel', function () {
        const baseCorrectParams = {
            displayName: 'hello',
            description: 'super description',
            support: 'toto',
            bulkVideosSupportUpdate: false
        };
        let path;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                path = videoChannelPath + '/super_channel';
            });
        });
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    token: 'hi',
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with another authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    token: accessTokenUser,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with a long name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { displayName: 'super'.repeat(25) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long description', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { description: 'super'.repeat(201) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long support text', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { support: 'super'.repeat(201) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad bulkVideosSupportUpdate field', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { bulkVideosSupportUpdate: 'super' });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When updating video channel avatar/banner', function () {
        const types = ['avatar', 'banner'];
        let path;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                path = videoChannelPath + '/super_channel';
            });
        });
        it('Should fail with an incorrect input file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const type of types) {
                    const fields = {};
                    const attaches = {
                        [type + 'file']: (0, extra_utils_1.buildAbsoluteFixturePath)('video_short.mp4')
                    };
                    yield (0, extra_utils_1.makeUploadRequest)({ url: server.url, path: `${path}/${type}/pick`, token: server.accessToken, fields, attaches });
                }
            });
        });
        it('Should fail with a big file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const type of types) {
                    const fields = {};
                    const attaches = {
                        [type + 'file']: (0, extra_utils_1.buildAbsoluteFixturePath)('avatar-big.png')
                    };
                    yield (0, extra_utils_1.makeUploadRequest)({ url: server.url, path: `${path}/${type}/pick`, token: server.accessToken, fields, attaches });
                }
            });
        });
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const type of types) {
                    const fields = {};
                    const attaches = {
                        [type + 'file']: (0, extra_utils_1.buildAbsoluteFixturePath)('avatar.png')
                    };
                    yield (0, extra_utils_1.makeUploadRequest)({
                        url: server.url,
                        path: `${path}/${type}/pick`,
                        fields,
                        attaches,
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                    });
                }
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const type of types) {
                    const fields = {};
                    const attaches = {
                        [type + 'file']: (0, extra_utils_1.buildAbsoluteFixturePath)('avatar.png')
                    };
                    yield (0, extra_utils_1.makeUploadRequest)({
                        url: server.url,
                        path: `${path}/${type}/pick`,
                        token: server.accessToken,
                        fields,
                        attaches,
                        expectedStatus: models_1.HttpStatusCode.OK_200
                    });
                }
            });
        });
    });
    describe('When getting a video channel', function () {
        it('Should return the list of the video channels with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: videoChannelPath,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                expect(res.body.data).to.be.an('array');
            });
        });
        it('Should return 404 with an incorrect video channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: videoChannelPath + '/super_channel2',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: videoChannelPath + '/super_channel',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When deleting a video channel', function () {
        it('Should fail with a non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ token: 'coucou', channelName: 'super_channel', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with another authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ token: accessTokenUser, channelName: 'super_channel', expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with an unknown video channel id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ channelName: 'super_channel2', expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ channelName: 'super_channel' });
            });
        });
        it('Should fail to delete the last user video channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ channelName: 'root_channel', expectedStatus: models_1.HttpStatusCode.CONFLICT_409 });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
