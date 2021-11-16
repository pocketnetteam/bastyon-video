"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test video imports API validator', function () {
    const path = '/api/v1/videos/imports';
    let server;
    let userAccessToken = '';
    let channelId;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            const username = 'user1';
            const password = 'my super password';
            yield server.users.create({ username: username, password: password });
            userAccessToken = yield server.login.getAccessToken({ username, password });
            {
                const { videoChannels } = yield server.users.getMyInfo();
                channelId = videoChannels[0].id;
            }
        });
    });
    describe('When listing my video imports', function () {
        const myPath = '/api/v1/users/me/videos/imports';
        it('Should fail with a bad start pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadStartPagination(server.url, myPath, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadCountPagination(server.url, myPath, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadSortPagination(server.url, myPath, server.accessToken);
            });
        });
        it('Should success with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: server.url, path: myPath, expectedStatus: models_1.HttpStatusCode.OK_200, token: server.accessToken });
            });
        });
    });
    describe('When adding a video import', function () {
        let baseCorrectParams;
        before(function () {
            baseCorrectParams = {
                targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo,
                name: 'my super name',
                category: 5,
                licence: 1,
                language: 'pt',
                nsfw: false,
                commentsEnabled: true,
                downloadEnabled: true,
                waitTranscoding: true,
                description: 'my super description',
                support: 'my super support text',
                tags: ['tag1', 'tag2'],
                privacy: 1,
                channelId
            };
        });
        it('Should fail with nothing', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail without a target url', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'targetUrl');
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a bad target url', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { targetUrl: 'htt://hello' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { name: 'super'.repeat(65) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad category', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { category: 125 });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad licence', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { licence: 125 });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad language', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { language: 'a'.repeat(15) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long description', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { description: 'super'.repeat(2500) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long support text', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { support: 'super'.repeat(201) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail without a channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'channelId');
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: 545454 });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with another user channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = {
                    username: 'fake',
                    password: 'fake_password'
                };
                yield server.users.create({ username: user.username, password: user.password });
                const accessTokenUser = yield server.login.getAccessToken(user);
                const { videoChannels } = yield server.users.getMyInfo({ token: accessTokenUser });
                const customChannelId = videoChannels[0].id;
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: customChannelId });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: userAccessToken, fields });
            });
        });
        it('Should fail with too many tags', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a tag length too low', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 't'] });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a tag length too big', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'my_super_tag_too_long_long_long_long_long_long'] });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect thumbnail file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    thumbnailfile: extra_utils_1.buildAbsoluteFixturePath('video_short.mp4')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with a big thumbnail file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    thumbnailfile: extra_utils_1.buildAbsoluteFixturePath('preview-big.png')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with an incorrect preview file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    previewfile: extra_utils_1.buildAbsoluteFixturePath('video_short.mp4')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with a big preview file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    previewfile: extra_utils_1.buildAbsoluteFixturePath('preview-big.png')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with an invalid torrent file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'targetUrl');
                const attaches = {
                    torrentfile: extra_utils_1.buildAbsoluteFixturePath('avatar-big.png')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with an invalid magnet URI', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                let fields = lodash_1.omit(baseCorrectParams, 'targetUrl');
                fields = Object.assign(Object.assign({}, fields), { magnetUri: 'blabla' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should forbid to import http videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        import: {
                            videos: {
                                http: {
                                    enabled: false
                                },
                                torrent: {
                                    enabled: true
                                }
                            }
                        }
                    }
                });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should forbid to import torrent videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        import: {
                            videos: {
                                http: {
                                    enabled: true
                                },
                                torrent: {
                                    enabled: false
                                }
                            }
                        }
                    }
                });
                let fields = lodash_1.omit(baseCorrectParams, 'targetUrl');
                fields = Object.assign(Object.assign({}, fields), { magnetUri: extra_utils_1.FIXTURE_URLS.magnet });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
                fields = lodash_1.omit(fields, 'magnetUri');
                const attaches = {
                    torrentfile: extra_utils_1.buildAbsoluteFixturePath('video-720p.torrent')
                };
                yield extra_utils_1.makeUploadRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    attaches,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
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
