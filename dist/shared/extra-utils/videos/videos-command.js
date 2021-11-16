"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosCommand = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const got_1 = tslib_1.__importDefault(require("got"));
const lodash_1 = require("lodash");
const validator_1 = tslib_1.__importDefault(require("validator"));
const uuid_1 = require("@server/helpers/uuid");
const constants_1 = require("@server/initializers/constants");
const core_utils_1 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const miscs_1 = require("../miscs");
const requests_1 = require("../requests");
const server_1 = require("../server");
const shared_1 = require("../shared");
class VideosCommand extends shared_1.AbstractCommand {
    constructor(server) {
        super(server);
        constants_1.loadLanguages();
    }
    getCategories(options = {}) {
        const path = '/api/v1/videos/categories';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getLicences(options = {}) {
        const path = '/api/v1/videos/licences';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getLanguages(options = {}) {
        const path = '/api/v1/videos/languages';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getPrivacies(options = {}) {
        const path = '/api/v1/videos/privacies';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getDescription(options) {
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path: options.descriptionPath, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getFileMetadata(options) {
        return requests_1.unwrapBody(this.getRawRequest(Object.assign(Object.assign({}, options), { url: options.url, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    view(options) {
        const { id, xForwardedFor } = options;
        const path = '/api/v1/videos/' + id + '/views';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path,
            xForwardedFor, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    rate(options) {
        const { id, rating } = options;
        const path = '/api/v1/videos/' + id + '/rate';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { rating }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    get(options) {
        const path = '/api/v1/videos/' + options.id;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getWithToken(options) {
        return this.get(Object.assign(Object.assign({}, options), { token: this.buildCommonRequestToken(Object.assign(Object.assign({}, options), { implicitToken: true })) }));
    }
    getId(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { uuid } = options;
            if (validator_1.default.isUUID('' + uuid) === false)
                return uuid;
            const { id } = yield this.get(Object.assign(Object.assign({}, options), { id: uuid }));
            return id;
        });
    }
    listFiles(options) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const video = yield this.get(options);
            const files = video.files || [];
            const hlsFiles = ((_a = video.streamingPlaylists[0]) === null || _a === void 0 ? void 0 : _a.files) || [];
            return files.concat(hlsFiles);
        });
    }
    listMyVideos(options = {}) {
        const path = '/api/v1/users/me/videos';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: core_utils_1.pick(options, ['start', 'count', 'sort', 'search', 'isLive']), implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    list(options = {}) {
        const path = '/api/v1/videos';
        const query = this.buildListQuery(options);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: Object.assign({ sort: 'name' }, query), implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listWithToken(options = {}) {
        return this.list(Object.assign(Object.assign({}, options), { token: this.buildCommonRequestToken(Object.assign(Object.assign({}, options), { implicitToken: true })) }));
    }
    listByAccount(options) {
        const { handle, search } = options;
        const path = '/api/v1/accounts/' + handle + '/videos';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: Object.assign({ search }, this.buildListQuery(options)), implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listByChannel(options) {
        const { handle } = options;
        const path = '/api/v1/video-channels/' + handle + '/videos';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: this.buildListQuery(options), implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    find(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.list(options);
            return data.find(v => v.name === options.name);
        });
    }
    update(options) {
        const { id, attributes = {} } = options;
        const path = '/api/v1/videos/' + id;
        if (attributes.thumbnailfile || attributes.previewfile) {
            const attaches = {};
            if (attributes.thumbnailfile)
                attaches.thumbnailfile = attributes.thumbnailfile;
            if (attributes.previewfile)
                attaches.previewfile = attributes.previewfile;
            return this.putUploadRequest(Object.assign(Object.assign({}, options), { path, fields: options.attributes, attaches: {
                    thumbnailfile: attributes.thumbnailfile,
                    previewfile: attributes.previewfile
                }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
        }
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: options.attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    remove(options) {
        const path = '/api/v1/videos/' + options.id;
        return requests_1.unwrapBody(this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 })));
    }
    removeAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.list();
            for (const v of data) {
                yield this.remove({ id: v.id });
            }
        });
    }
    upload(options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { mode = 'legacy' } = options;
            let defaultChannelId = 1;
            try {
                const { videoChannels } = yield this.server.users.getMyInfo({ token: options.token });
                defaultChannelId = videoChannels[0].id;
            }
            catch (e) { }
            const attributes = Object.assign({ name: 'my super video', category: 5, licence: 4, language: 'zh', channelId: defaultChannelId, nsfw: true, waitTranscoding: false, description: 'my super description', support: 'my super support text', tags: ['tag'], privacy: 1, commentsEnabled: true, downloadEnabled: true, fixture: 'video_short.webm' }, options.attributes);
            const created = mode === 'legacy'
                ? yield this.buildLegacyUpload(Object.assign(Object.assign({}, options), { attributes }))
                : yield this.buildResumeUpload(Object.assign(Object.assign({}, options), { attributes }));
            const expectedStatus = this.buildExpectedStatus(Object.assign(Object.assign({}, options), { defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
            if (expectedStatus === models_1.HttpStatusCode.OK_200) {
                let video;
                do {
                    video = yield this.getWithToken(Object.assign(Object.assign({}, options), { id: created.uuid }));
                    yield miscs_1.wait(50);
                } while (!video.files[0].torrentUrl);
            }
            return created;
        });
    }
    buildLegacyUpload(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const path = '/api/v1/videos/upload';
            return requests_1.unwrapBody(this.postUploadRequest(Object.assign(Object.assign({}, options), { path, fields: this.buildUploadFields(options.attributes), attaches: this.buildUploadAttaches(options.attributes), implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }))).then(body => body.video || body);
        });
    }
    buildResumeUpload(options) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { attributes, expectedStatus } = options;
            let size = 0;
            let videoFilePath;
            let mimetype = 'video/mp4';
            if (attributes.fixture) {
                videoFilePath = miscs_1.buildAbsoluteFixturePath(attributes.fixture);
                size = (yield fs_extra_1.stat(videoFilePath)).size;
                if (videoFilePath.endsWith('.mkv')) {
                    mimetype = 'video/x-matroska';
                }
                else if (videoFilePath.endsWith('.webm')) {
                    mimetype = 'video/webm';
                }
            }
            const initializeSessionRes = yield this.prepareResumableUpload(Object.assign(Object.assign({}, options), { expectedStatus: null, attributes, size, mimetype }));
            const initStatus = initializeSessionRes.status;
            if (videoFilePath && initStatus === models_1.HttpStatusCode.CREATED_201) {
                const locationHeader = initializeSessionRes.header['location'];
                chai_1.expect(locationHeader).to.not.be.undefined;
                const pathUploadId = locationHeader.split('?')[1];
                const result = yield this.sendResumableChunks(Object.assign(Object.assign({}, options), { pathUploadId, videoFilePath, size }));
                if (result.statusCode === models_1.HttpStatusCode.OK_200) {
                    yield this.endResumableUpload(Object.assign(Object.assign({}, options), { expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204, pathUploadId }));
                }
                return ((_a = result.body) === null || _a === void 0 ? void 0 : _a.video) || result.body;
            }
            const expectedInitStatus = expectedStatus === models_1.HttpStatusCode.OK_200
                ? models_1.HttpStatusCode.CREATED_201
                : expectedStatus;
            chai_1.expect(initStatus).to.equal(expectedInitStatus);
            return initializeSessionRes.body.video || initializeSessionRes.body;
        });
    }
    prepareResumableUpload(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { attributes, size, mimetype } = options;
            const path = '/api/v1/videos/upload-resumable';
            return this.postUploadRequest(Object.assign(Object.assign({}, options), { path, headers: {
                    'X-Upload-Content-Type': mimetype,
                    'X-Upload-Content-Length': size.toString()
                }, fields: Object.assign({ filename: attributes.fixture }, this.buildUploadFields(options.attributes)), attaches: this.buildUploadAttaches(lodash_1.omit(options.attributes, 'fixture')), implicitToken: true, defaultExpectedStatus: null }));
        });
    }
    sendResumableChunks(options) {
        const { pathUploadId, videoFilePath, size, contentLength, contentRangeBuilder, expectedStatus = models_1.HttpStatusCode.OK_200 } = options;
        const path = '/api/v1/videos/upload-resumable';
        let start = 0;
        const token = this.buildCommonRequestToken(Object.assign(Object.assign({}, options), { implicitToken: true }));
        const url = this.server.url;
        const readable = fs_extra_1.createReadStream(videoFilePath, { highWaterMark: 8 * 1024 });
        return new Promise((resolve, reject) => {
            readable.on('data', function onData(chunk) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    readable.pause();
                    const headers = {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/octet-stream',
                        'Content-Range': contentRangeBuilder
                            ? contentRangeBuilder(start, chunk)
                            : `bytes ${start}-${start + chunk.length - 1}/${size}`,
                        'Content-Length': contentLength ? contentLength + '' : chunk.length + ''
                    };
                    const res = yield got_1.default({
                        url,
                        method: 'put',
                        headers,
                        path: path + '?' + pathUploadId,
                        body: chunk,
                        responseType: 'json',
                        throwHttpErrors: false
                    });
                    start += chunk.length;
                    if (res.statusCode === expectedStatus) {
                        return resolve(res);
                    }
                    if (res.statusCode !== models_1.HttpStatusCode.PERMANENT_REDIRECT_308) {
                        readable.off('data', onData);
                        return reject(new Error('Incorrect transient behaviour sending intermediary chunks'));
                    }
                    readable.resume();
                });
            });
        });
    }
    endResumableUpload(options) {
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path: '/api/v1/videos/upload-resumable', rawQuery: options.pathUploadId, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    quickUpload(options) {
        const attributes = { name: options.name };
        if (options.nsfw)
            attributes.nsfw = options.nsfw;
        if (options.privacy)
            attributes.privacy = options.privacy;
        if (options.fixture)
            attributes.fixture = options.fixture;
        return this.upload(Object.assign(Object.assign({}, options), { attributes }));
    }
    randomUpload(options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { wait = true, additionalParams } = options;
            const prefixName = (additionalParams === null || additionalParams === void 0 ? void 0 : additionalParams.prefixName) || '';
            const name = prefixName + uuid_1.buildUUID();
            const attributes = Object.assign({ name }, additionalParams);
            const result = yield this.upload(Object.assign(Object.assign({}, options), { attributes }));
            if (wait)
                yield server_1.waitJobs([this.server]);
            return Object.assign(Object.assign({}, result), { name });
        });
    }
    buildListQuery(options) {
        return core_utils_1.pick(options, [
            'start',
            'count',
            'sort',
            'nsfw',
            'isLive',
            'categoryOneOf',
            'licenceOneOf',
            'languageOneOf',
            'tagsOneOf',
            'tagsAllOf',
            'filter',
            'skipCount'
        ]);
    }
    buildUploadFields(attributes) {
        return lodash_1.omit(attributes, ['fixture', 'thumbnailfile', 'previewfile']);
    }
    buildUploadAttaches(attributes) {
        const attaches = {};
        for (const key of ['thumbnailfile', 'previewfile']) {
            if (attributes[key])
                attaches[key] = miscs_1.buildAbsoluteFixturePath(attributes[key]);
        }
        if (attributes.fixture)
            attaches.videofile = miscs_1.buildAbsoluteFixturePath(attributes.fixture);
        return attaches;
    }
}
exports.VideosCommand = VideosCommand;
