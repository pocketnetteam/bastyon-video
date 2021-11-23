"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const lodash_1 = require("lodash");
const path_1 = require("path");
const core_utils_1 = require("@shared/core-utils");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test videos API validator', function () {
    const path = '/api/v1/videos/';
    let server;
    let userAccessToken = '';
    let accountName;
    let channelId;
    let channelName;
    let video;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const username = 'user1';
            const password = 'my super password';
            yield server.users.create({ username: username, password: password });
            userAccessToken = yield server.login.getAccessToken({ username, password });
            {
                const body = yield server.users.getMyInfo();
                channelId = body.videoChannels[0].id;
                channelName = body.videoChannels[0].name;
                accountName = body.account.name + '@' + body.account.host;
            }
        });
    });
    describe('When listing videos', function () {
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path);
            });
        });
        it('Should fail with a bad skipVideos query', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.OK_200, query: { skipCount: 'toto' } });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.OK_200, query: { skipCount: false } });
            });
        });
    });
    describe('When searching a video', function () {
        it('Should fail with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: (0, path_1.join)(path, 'search'),
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, (0, path_1.join)(path, 'search', 'test'));
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, (0, path_1.join)(path, 'search', 'test'));
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, (0, path_1.join)(path, 'search', 'test'));
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When listing my videos', function () {
        const path = '/api/v1/users/me/videos';
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
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, token: server.accessToken, path, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When listing account videos', function () {
        let path;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                path = '/api/v1/accounts/' + accountName + '/videos';
            });
        });
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
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When listing video channel videos', function () {
        let path;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                path = '/api/v1/video-channels/' + channelName + '/videos';
            });
        });
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
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When adding a video', function () {
        let baseCorrectParams;
        const baseCorrectAttaches = {
            fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.webm')
        };
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
                channelId: channelId,
                originallyPublishedAt: new Date().toISOString()
            };
        });
        function runSuite(mode) {
            it('Should fail with nothing', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = {};
                    const attaches = {};
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail without name', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = (0, lodash_1.omit)(baseCorrectParams, 'name');
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a long name', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { name: 'super'.repeat(65) });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad category', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { category: 125 });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad licence', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { licence: 125 });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad language', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { language: 'a'.repeat(15) });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a long description', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { description: 'super'.repeat(2500) });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a long support text', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { support: 'super'.repeat(201) });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail without a channel', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = (0, lodash_1.omit)(baseCorrectParams, 'channelId');
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad channel', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: 545454 });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with another user channel', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const user = {
                        username: 'fake' + (0, core_utils_1.randomInt)(0, 1500),
                        password: 'fake_password'
                    };
                    yield server.users.create({ username: user.username, password: user.password });
                    const accessTokenUser = yield server.login.getAccessToken(user);
                    const { videoChannels } = yield server.users.getMyInfo({ token: accessTokenUser });
                    const customChannelId = videoChannels[0].id;
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: customChannelId });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, userAccessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with too many tags', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a tag length too low', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 't'] });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a tag length too big', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'my_super_tag_too_long_long_long_long_long_long'] });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad schedule update (miss updateAt)', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { scheduleUpdate: { privacy: 1 } });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad schedule update (wrong updateAt)', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { scheduleUpdate: {
                            privacy: 1,
                            updateAt: 'toto'
                        } });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a bad originally published at attribute', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { originallyPublishedAt: 'toto' });
                    const attaches = baseCorrectAttaches;
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail without an input file', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = baseCorrectParams;
                    const attaches = {};
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with an incorrect input file', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = baseCorrectParams;
                    let attaches = { fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short_fake.webm') };
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.UNPROCESSABLE_ENTITY_422, mode);
                    attaches = { fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mkv') };
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.UNSUPPORTED_MEDIA_TYPE_415, mode);
                });
            });
            it('Should fail with an incorrect thumbnail file', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = baseCorrectParams;
                    const attaches = {
                        thumbnailfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4'),
                        fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4')
                    };
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a big thumbnail file', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = baseCorrectParams;
                    const attaches = {
                        thumbnailfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'preview-big.png'),
                        fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4')
                    };
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with an incorrect preview file', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = baseCorrectParams;
                    const attaches = {
                        previewfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4'),
                        fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4')
                    };
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should fail with a big preview file', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = baseCorrectParams;
                    const attaches = {
                        previewfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'preview-big.png'),
                        fixture: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4')
                    };
                    yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                });
            });
            it('Should report the appropriate error', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { language: 'a'.repeat(15) });
                    const attaches = baseCorrectAttaches;
                    const attributes = Object.assign(Object.assign({}, fields), attaches);
                    const body = yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, attributes, models_1.HttpStatusCode.BAD_REQUEST_400, mode);
                    const error = body;
                    if (mode === 'legacy') {
                        expect(error.docs).to.equal('https://docs.joinpeertube.org/api-rest-reference.html#operation/uploadLegacy');
                    }
                    else {
                        expect(error.docs).to.equal('https://docs.joinpeertube.org/api-rest-reference.html#operation/uploadResumableInit');
                    }
                    expect(error.type).to.equal('about:blank');
                    expect(error.title).to.equal('Bad Request');
                    expect(error.detail).to.equal('Incorrect request parameters: language');
                    expect(error.error).to.equal('Incorrect request parameters: language');
                    expect(error.status).to.equal(models_1.HttpStatusCode.BAD_REQUEST_400);
                    expect(error['invalid-params'].language).to.exist;
                });
            });
            it('Should succeed with the correct parameters', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(10000);
                    const fields = baseCorrectParams;
                    {
                        const attaches = baseCorrectAttaches;
                        yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.OK_200, mode);
                    }
                    {
                        const attaches = Object.assign(Object.assign({}, baseCorrectAttaches), { videofile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4') });
                        yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.OK_200, mode);
                    }
                    {
                        const attaches = Object.assign(Object.assign({}, baseCorrectAttaches), { videofile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.ogv') });
                        yield (0, extra_utils_1.checkUploadVideoParam)(server, server.accessToken, Object.assign(Object.assign({}, fields), attaches), models_1.HttpStatusCode.OK_200, mode);
                    }
                });
            });
        }
        describe('Resumable upload', function () {
            runSuite('resumable');
        });
        describe('Legacy upload', function () {
            runSuite('legacy');
        });
    });
    describe('When updating a video', function () {
        const baseCorrectParams = {
            name: 'my super name',
            category: 5,
            licence: 2,
            language: 'pt',
            nsfw: false,
            commentsEnabled: false,
            downloadEnabled: false,
            description: 'my super description',
            privacy: 1,
            tags: ['tag1', 'tag2']
        };
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield server.videos.list();
                video = data[0];
            });
        });
        it('Should fail with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {};
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail without a valid uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + 'blabla', token: server.accessToken, fields });
            });
        });
        it('Should fail with an unknown id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df5630b06',
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with a long name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { name: 'super'.repeat(65) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad category', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { category: 125 });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad licence', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { licence: 125 });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { language: 'a'.repeat(15) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long description', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { description: 'super'.repeat(2500) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a long support text', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { support: 'super'.repeat(201) });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channelId: 545454 });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with too many tags', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a tag length too low', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 't'] });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a tag length too big', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { tags: ['tag1', 'my_super_tag_too_long_long_long_long_long_long'] });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad schedule update (miss updateAt)', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { scheduleUpdate: { privacy: 1 } });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad schedule update (wrong updateAt)', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { scheduleUpdate: { updateAt: 'toto', privacy: 1 } });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad originally published at param', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { originallyPublishedAt: 'toto' });
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect thumbnail file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    thumbnailfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4')
                };
                yield (0, extra_utils_1.makeUploadRequest)({
                    url: server.url,
                    method: 'PUT',
                    path: path + video.shortUUID,
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail with a big thumbnail file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    thumbnailfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'preview-big.png')
                };
                yield (0, extra_utils_1.makeUploadRequest)({
                    url: server.url,
                    method: 'PUT',
                    path: path + video.shortUUID,
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail with an incorrect preview file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    previewfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'video_short.mp4')
                };
                yield (0, extra_utils_1.makeUploadRequest)({
                    url: server.url,
                    method: 'PUT',
                    path: path + video.shortUUID,
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail with a big preview file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                const attaches = {
                    previewfile: (0, path_1.join)((0, extra_utils_1.root)(), 'server', 'tests', 'fixtures', 'preview-big.png')
                };
                yield (0, extra_utils_1.makeUploadRequest)({
                    url: server.url,
                    method: 'PUT',
                    path: path + video.shortUUID,
                    token: server.accessToken,
                    fields,
                    attaches
                });
            });
        });
        it('Should fail with a video of another user without the appropriate right', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + video.shortUUID,
                    token: userAccessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail with a video of another server');
        it('Shoud report the appropriate error', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { licence: 125 });
                const res = yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + video.shortUUID, token: server.accessToken, fields });
                const error = res.body;
                expect(error.docs).to.equal('https://docs.joinpeertube.org/api-rest-reference.html#operation/putVideo');
                expect(error.type).to.equal('about:blank');
                expect(error.title).to.equal('Bad Request');
                expect(error.detail).to.equal('Incorrect request parameters: licence');
                expect(error.error).to.equal('Incorrect request parameters: licence');
                expect(error.status).to.equal(models_1.HttpStatusCode.BAD_REQUEST_400);
                expect(error['invalid-params'].licence).to.exist;
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = baseCorrectParams;
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + video.shortUUID,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When getting a video', function () {
        it('Should return the list of the videos with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                expect(res.body.data).to.be.an('array');
                expect(res.body.data.length).to.equal(6);
            });
        });
        it('Should fail without a correct uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.get({ id: 'coucou', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should return 404 with an incorrect video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.get({ id: '4da6fde3-88f7-4d16-b119-108df5630b06', expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Shoud report the appropriate error', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = yield server.videos.get({ id: 'hi', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const error = body;
                expect(error.docs).to.equal('https://docs.joinpeertube.org/api-rest-reference.html#operation/getVideo');
                expect(error.type).to.equal('about:blank');
                expect(error.title).to.equal('Bad Request');
                expect(error.detail).to.equal('Incorrect request parameters: id');
                expect(error.error).to.equal('Incorrect request parameters: id');
                expect(error.status).to.equal(models_1.HttpStatusCode.BAD_REQUEST_400);
                expect(error['invalid-params'].id).to.exist;
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.get({ id: video.shortUUID });
            });
        });
    });
    describe('When rating a video', function () {
        let videoId;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield server.videos.list();
                videoId = data[0].id;
            });
        });
        it('Should fail without a valid uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {
                    rating: 'like'
                };
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + 'blabla/rate', token: server.accessToken, fields });
            });
        });
        it('Should fail with an unknown id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {
                    rating: 'like'
                };
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + '4da6fde3-88f7-4d16-b119-108df5630b06/rate',
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            });
        });
        it('Should fail with a wrong rating', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {
                    rating: 'likes'
                };
                yield (0, extra_utils_1.makePutBodyRequest)({ url: server.url, path: path + videoId + '/rate', token: server.accessToken, fields });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const fields = {
                    rating: 'like'
                };
                yield (0, extra_utils_1.makePutBodyRequest)({
                    url: server.url,
                    path: path + videoId + '/rate',
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When removing a video', function () {
        it('Should have 404 with nothing', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeDeleteRequest)({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail without a correct uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.remove({ id: 'hello', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with a video which does not exist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.remove({ id: '4da6fde3-88f7-4d16-b119-108df5630b06', expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a video of another user without the appropriate right', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.remove({ token: userAccessToken, id: video.uuid, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a video of another server');
        it('Shoud report the appropriate error', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = yield server.videos.remove({ id: 'hello', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const error = body;
                expect(error.docs).to.equal('https://docs.joinpeertube.org/api-rest-reference.html#operation/delVideo');
                expect(error.type).to.equal('about:blank');
                expect(error.title).to.equal('Bad Request');
                expect(error.detail).to.equal('Incorrect request parameters: id');
                expect(error.error).to.equal('Incorrect request parameters: id');
                expect(error.status).to.equal(models_1.HttpStatusCode.BAD_REQUEST_400);
                expect(error['invalid-params'].id).to.exist;
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.videos.remove({ id: video.uuid });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
