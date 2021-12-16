"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistsCommand = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const core_utils_1 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class PlaylistsCommand extends shared_1.AbstractCommand {
    list(options) {
        const path = '/api/v1/video-playlists';
        const query = core_utils_1.pick(options, ['start', 'count', 'sort']);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listByChannel(options) {
        const path = '/api/v1/video-channels/' + options.handle + '/video-playlists';
        const query = core_utils_1.pick(options, ['start', 'count', 'sort']);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listByAccount(options) {
        const path = '/api/v1/accounts/' + options.handle + '/video-playlists';
        const query = core_utils_1.pick(options, ['start', 'count', 'sort', 'search', 'playlistType']);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    get(options) {
        const { playlistId } = options;
        const path = '/api/v1/video-playlists/' + playlistId;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listVideos(options) {
        var _a;
        const path = '/api/v1/video-playlists/' + options.playlistId + '/videos';
        const query = (_a = options.query) !== null && _a !== void 0 ? _a : {};
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: Object.assign(Object.assign({}, query), { start: options.start, count: options.count }), implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    delete(options) {
        const path = '/api/v1/video-playlists/' + options.playlistId;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    create(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const path = '/api/v1/video-playlists';
            const fields = lodash_1.omit(options.attributes, 'thumbnailfile');
            const attaches = options.attributes.thumbnailfile
                ? { thumbnailfile: options.attributes.thumbnailfile }
                : {};
            const body = yield requests_1.unwrapBody(this.postUploadRequest(Object.assign(Object.assign({}, options), { path,
                fields,
                attaches, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
            return body.videoPlaylist;
        });
    }
    update(options) {
        const path = '/api/v1/video-playlists/' + options.playlistId;
        const fields = lodash_1.omit(options.attributes, 'thumbnailfile');
        const attaches = options.attributes.thumbnailfile
            ? { thumbnailfile: options.attributes.thumbnailfile }
            : {};
        return this.putUploadRequest(Object.assign(Object.assign({}, options), { path,
            fields,
            attaches, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    addElement(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const attributes = Object.assign(Object.assign({}, options.attributes), { videoId: yield this.server.videos.getId(Object.assign(Object.assign({}, options), { uuid: options.attributes.videoId })) });
            const path = '/api/v1/video-playlists/' + options.playlistId + '/videos';
            const body = yield requests_1.unwrapBody(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
            return body.videoPlaylistElement;
        });
    }
    updateElement(options) {
        const path = '/api/v1/video-playlists/' + options.playlistId + '/videos/' + options.elementId;
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: options.attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    removeElement(options) {
        const path = '/api/v1/video-playlists/' + options.playlistId + '/videos/' + options.elementId;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    reorderElements(options) {
        const path = '/api/v1/video-playlists/' + options.playlistId + '/videos/reorder';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: options.attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    getPrivacies(options = {}) {
        const path = '/api/v1/video-playlists/privacies';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    videosExist(options) {
        const { videoIds } = options;
        const path = '/api/v1/users/me/video-playlists/videos-exist';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { videoIds }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.PlaylistsCommand = PlaylistsCommand;
