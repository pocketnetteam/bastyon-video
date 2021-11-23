"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test video lives API validator', function () {
    const path = '/api/v1/videos/live';
    let server;
    let userAccessToken = '';
    let channelId;
    let video;
    let videoIdNotLive;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield server.config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        maxInstanceLives: 20,
                        maxUserLives: 20,
                        allowReplay: true
                    }
                }
            });
            const username = 'user1';
            const password = 'my super password';
            yield server.users.create({ username: username, password: password });
            userAccessToken = yield server.login.getAccessToken({ username, password });
            {
                const { videoChannels } = yield server.users.getMyInfo();
                channelId = videoChannels[0].id;
            }
            {
                videoIdNotLive = (yield server.videos.quickUpload({ name: 'not live' })).id;
            }
            command = server.live;
        });
    });
    describe('When creating a live', function () {
        let baseCorrectParams;
        before(function () {
            baseCorrectParams = {
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
                channelId,
                saveReplay: false,
                permanentLive: false
            };
        });
        it('Should fail with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {};
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { name: 'super'.repeat(65) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad category', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { category: 125 });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad licence', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { licence: 125 });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { language: 'a'.repeat(15) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long description', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { description: 'super'.repeat(2500) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long support text', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { support: 'super'.repeat(201) });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail without a channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = (0, lodash_1.omit)(baseCorrectParams, 'channelId');
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: 545454 });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with another user channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const user = {
                    username: 'fake',
                    password: 'fake_password'
                };
                yield server.users.create({ username: user.username, password: user.password });
                const accessTokenUser = yield server.login.getAccessToken(user);
                const { videoChannels } = yield server.users.getMyInfo({ token: accessTokenUser });
                const customChannelId = videoChannels[0].id;
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: customChannelId });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: userAccessToken, fields });
            });
        });
        it('Should fail with too many tags', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a tag length too low', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 't'] });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a tag length too big', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'my_super_tag_too_long_long_long_long_long_long'] });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect thumbnail file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    thumbnailfile: (0, extra_utils_1.buildAbsoluteFixturePath)('video_short.mp4')
                };
                yield (0, extra_utils_1.makeUploadRequest)({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with a big thumbnail file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    thumbnailfile: (0, extra_utils_1.buildAbsoluteFixturePath)('preview-big.png')
                };
                yield (0, extra_utils_1.makeUploadRequest)({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with an incorrect preview file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    previewfile: (0, extra_utils_1.buildAbsoluteFixturePath)('video_short.mp4')
                };
                yield (0, extra_utils_1.makeUploadRequest)({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with a big preview file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    previewfile: (0, extra_utils_1.buildAbsoluteFixturePath)('preview-big.png')
                };
                yield (0, extra_utils_1.makeUploadRequest)({ url: server.url, path, token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with save replay and permanent live set to true', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { saveReplay: true, permanentLive: true });
                yield (0, extra_utils_1.makePostBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                const res = yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                video = res.body.video;
            });
        });
        it('Should forbid if live is disabled', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        live: {
                            enabled: false
                        }
                    }
                });
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should forbid to save replay if not enabled by the admin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { saveReplay: true });
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        live: {
                            enabled: true,
                            allowReplay: false
                        }
                    }
                });
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should allow to save replay if enabled by the admin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { saveReplay: true });
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        live: {
                            enabled: true,
                            allowReplay: true
                        }
                    }
                });
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should not allow live if max instance lives is reached', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        live: {
                            enabled: true,
                            maxInstanceLives: 1
                        }
                    }
                });
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should not allow live if max user lives is reached', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.config.updateCustomSubConfig({
                    newConfig: {
                        live: {
                            enabled: true,
                            maxInstanceLives: 20,
                            maxUserLives: 1
                        }
                    }
                });
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
    });
    describe('When getting live information', function () {
        it('Should fail without access token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ token: '', videoId: video.id, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a bad access token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ token: 'toto', videoId: video.id, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with access token of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ token: userAccessToken, videoId: video.id, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a bad video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ videoId: 'toto', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with an unknown video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ videoId: 454555, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a non live video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ videoId: videoIdNotLive, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ videoId: video.id });
                yield command.get({ videoId: video.uuid });
                yield command.get({ videoId: video.shortUUID });
            });
        });
    });
    describe('When updating live information', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            it('Should fail without access token', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ token: '', videoId: video.id, fields: {}, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                });
            });
            it('Should fail with a bad access token', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ token: 'toto', videoId: video.id, fields: {}, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                });
            });
            it('Should fail with access token of another user', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ token: userAccessToken, videoId: video.id, fields: {}, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                });
            });
            it('Should fail with a bad video id', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ videoId: 'toto', fields: {}, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                });
            });
            it('Should fail with an unknown video id', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ videoId: 454555, fields: {}, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                });
            });
            it('Should fail with a non live video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ videoId: videoIdNotLive, fields: {}, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                });
            });
            it('Should fail with save replay and permanent live set to true', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = { saveReplay: true, permanentLive: true };
                    yield command.update({ videoId: video.id, fields, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                });
            });
            it('Should succeed with the correct params', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield command.update({ videoId: video.id, fields: { saveReplay: false } });
                    yield command.update({ videoId: video.uuid, fields: { saveReplay: false } });
                    yield command.update({ videoId: video.shortUUID, fields: { saveReplay: false } });
                });
            });
            it('Should fail to update replay status if replay is not allowed on the instance', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield server.config.updateCustomSubConfig({
                        newConfig: {
                            live: {
                                enabled: true,
                                allowReplay: false
                            }
                        }
                    });
                    yield command.update({ videoId: video.id, fields: { saveReplay: true }, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                });
            });
            it('Should fail to update a live if it has already started', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(40000);
                    const live = yield command.get({ videoId: video.id });
                    const ffmpegCommand = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: live.rtmpUrl, streamKey: live.streamKey });
                    yield command.waitUntilPublished({ videoId: video.id });
                    yield command.update({ videoId: video.id, fields: {}, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                    yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
                });
            });
            it('Should fail to stream twice in the save live', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(40000);
                    const live = yield command.get({ videoId: video.id });
                    const ffmpegCommand = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: live.rtmpUrl, streamKey: live.streamKey });
                    yield command.waitUntilPublished({ videoId: video.id });
                    yield command.runAndTestStreamError({ videoId: video.id, shouldHaveError: true });
                    yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
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
