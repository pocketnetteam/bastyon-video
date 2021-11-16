"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPlaylistsRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const core_utils_1 = require("@server/helpers/core-utils");
const express_utils_1 = require("@server/helpers/express-utils");
const logger_1 = require("@server/helpers/logger");
const query_1 = require("@server/helpers/query");
const requests_1 = require("@server/helpers/requests");
const utils_1 = require("@server/helpers/utils");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const get_1 = require("@server/lib/activitypub/playlists/get");
const hooks_1 = require("@server/lib/plugins/hooks");
const search_1 = require("@server/lib/search");
const application_1 = require("@server/models/application/application");
const video_playlist_1 = require("@server/models/video/video-playlist");
const models_1 = require("@shared/models");
const middlewares_1 = require("../../../middlewares");
const searchPlaylistsRouter = express_1.default.Router();
exports.searchPlaylistsRouter = searchPlaylistsRouter;
searchPlaylistsRouter.get('/video-playlists', middlewares_1.openapiOperationDoc({ operationId: 'searchPlaylists' }), middlewares_1.paginationValidator, middlewares_1.setDefaultPagination, middlewares_1.videoPlaylistsSearchSortValidator, middlewares_1.setDefaultSearchSort, middlewares_1.optionalAuthenticate, middlewares_1.videoPlaylistsListSearchValidator, middlewares_1.asyncMiddleware(searchVideoPlaylists));
function searchVideoPlaylists(req, res) {
    const query = query_1.pickSearchPlaylistQuery(req.query);
    const search = query.search;
    if (search_1.isURISearch(search))
        return searchVideoPlaylistsURI(search, res);
    if (search_1.isSearchIndexSearch(query)) {
        return searchVideoPlaylistsIndex(query, res);
    }
    return searchVideoPlaylistsDB(query, res);
}
function searchVideoPlaylistsIndex(query, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield search_1.buildMutedForSearchIndex(res);
        const body = yield hooks_1.Hooks.wrapObject(Object.assign(query, result), 'filter:api.search.video-playlists.index.list.params');
        const url = core_utils_1.sanitizeUrl(config_1.CONFIG.SEARCH.SEARCH_INDEX.URL) + '/api/v1/search/video-playlists';
        try {
            logger_1.logger.debug('Doing video playlists search index request on %s.', url, { body });
            const { body: searchIndexResult } = yield requests_1.doJSONRequest(url, { method: 'POST', json: body });
            const jsonResult = yield hooks_1.Hooks.wrapObject(searchIndexResult, 'filter:api.search.video-playlists.index.list.result');
            return res.json(jsonResult);
        }
        catch (err) {
            logger_1.logger.warn('Cannot use search index to make video playlists search.', { err });
            return res.fail({
                status: models_1.HttpStatusCode.INTERNAL_SERVER_ERROR_500,
                message: 'Cannot use search index to make video playlists search'
            });
        }
    });
}
function searchVideoPlaylistsDB(query, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const serverActor = yield application_1.getServerActor();
        const apiOptions = yield hooks_1.Hooks.wrapObject(Object.assign(Object.assign({}, query), { followerActorId: serverActor.id }), 'filter:api.search.video-playlists.local.list.params');
        const resultList = yield hooks_1.Hooks.wrapPromiseFun(video_playlist_1.VideoPlaylistModel.searchForApi, apiOptions, 'filter:api.search.video-playlists.local.list.result');
        return res.json(utils_1.getFormattedObjects(resultList.data, resultList.total));
    });
}
function searchVideoPlaylistsURI(search, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let videoPlaylist;
        if (express_utils_1.isUserAbleToSearchRemoteURI(res)) {
            try {
                videoPlaylist = yield get_1.getOrCreateAPVideoPlaylist(search);
            }
            catch (err) {
                logger_1.logger.info('Cannot search remote video playlist %s.', search, { err });
            }
        }
        else {
            videoPlaylist = yield video_playlist_1.VideoPlaylistModel.loadByUrlWithAccountAndChannelSummary(sanitizeLocalUrl(search));
        }
        return res.json({
            total: videoPlaylist ? 1 : 0,
            data: videoPlaylist ? [videoPlaylist.toFormattedJSON()] : []
        });
    });
}
function sanitizeLocalUrl(url) {
    if (!url)
        return '';
    return url.replace(new RegExp('^' + constants_1.WEBSERVER.URL + '/videos/watch/playlist/'), constants_1.WEBSERVER.URL + '/video-playlists/')
        .replace(new RegExp('^' + constants_1.WEBSERVER.URL + '/w/p/'), constants_1.WEBSERVER.URL + '/video-playlists/');
}
