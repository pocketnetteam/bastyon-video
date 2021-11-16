"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class SearchCommand extends shared_1.AbstractCommand {
    searchChannels(options) {
        return this.advancedChannelSearch(Object.assign(Object.assign({}, options), { search: { search: options.search } }));
    }
    advancedChannelSearch(options) {
        const { search } = options;
        const path = '/api/v1/search/video-channels';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: search, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    searchPlaylists(options) {
        return this.advancedPlaylistSearch(Object.assign(Object.assign({}, options), { search: { search: options.search } }));
    }
    advancedPlaylistSearch(options) {
        const { search } = options;
        const path = '/api/v1/search/video-playlists';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: search, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    searchVideos(options) {
        const { search, sort } = options;
        return this.advancedVideoSearch(Object.assign(Object.assign({}, options), { search: {
                search: search,
                sort: sort !== null && sort !== void 0 ? sort : '-publishedAt'
            } }));
    }
    advancedVideoSearch(options) {
        const { search } = options;
        const path = '/api/v1/search/videos';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: search, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.SearchCommand = SearchCommand;
