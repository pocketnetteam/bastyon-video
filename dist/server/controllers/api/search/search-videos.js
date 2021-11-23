"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVideosRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const core_utils_1 = require("@server/helpers/core-utils");
const query_1 = require("@server/helpers/query");
const requests_1 = require("@server/helpers/requests");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const videos_1 = require("@server/lib/activitypub/videos");
const hooks_1 = require("@server/lib/plugins/hooks");
const search_1 = require("@server/lib/search");
const models_1 = require("@shared/models");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const middlewares_1 = require("../../../middlewares");
const video_1 = require("../../../models/video/video");
const searchVideosRouter = express_1.default.Router();
exports.searchVideosRouter = searchVideosRouter;
searchVideosRouter.get('/videos', (0, middlewares_1.openapiOperationDoc)({ operationId: 'searchVideos' }), middlewares_1.paginationValidator, middlewares_1.setDefaultPagination, middlewares_1.videosSearchSortValidator, middlewares_1.setDefaultSearchSort, middlewares_1.optionalAuthenticate, middlewares_1.commonVideosFiltersValidator, middlewares_1.videosSearchValidator, (0, middlewares_1.asyncMiddleware)(searchVideos));
function searchVideos(req, res) {
    const query = (0, query_1.pickSearchVideoQuery)(req.query);
    const search = query.search;
    if ((0, search_1.isURISearch)(search)) {
        return searchVideoURI(search, res);
    }
    if ((0, search_1.isSearchIndexSearch)(query)) {
        return searchVideosIndex(query, res);
    }
    return searchVideosDB(query, res);
}
function searchVideosIndex(query, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const result = yield (0, search_1.buildMutedForSearchIndex)(res);
        let body = Object.assign(Object.assign({}, query), result);
        if (!body.nsfw) {
            const nsfwPolicy = res.locals.oauth
                ? res.locals.oauth.token.User.nsfwPolicy
                : config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY;
            body.nsfw = nsfwPolicy === 'do_not_list'
                ? 'false'
                : 'both';
        }
        body = yield hooks_1.Hooks.wrapObject(body, 'filter:api.search.videos.index.list.params');
        const url = (0, core_utils_1.sanitizeUrl)(config_1.CONFIG.SEARCH.SEARCH_INDEX.URL) + '/api/v1/search/videos';
        try {
            logger_1.logger.debug('Doing videos search index request on %s.', url, { body });
            const { body: searchIndexResult } = yield (0, requests_1.doJSONRequest)(url, { method: 'POST', json: body });
            const jsonResult = yield hooks_1.Hooks.wrapObject(searchIndexResult, 'filter:api.search.videos.index.list.result');
            return res.json(jsonResult);
        }
        catch (err) {
            logger_1.logger.warn('Cannot use search index to make video search.', { err });
            return res.fail({
                status: models_1.HttpStatusCode.INTERNAL_SERVER_ERROR_500,
                message: 'Cannot use search index to make video search'
            });
        }
    });
}
function searchVideosDB(query, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const apiOptions = yield hooks_1.Hooks.wrapObject(Object.assign(Object.assign({}, query), { includeLocalVideos: true, filter: query.filter, nsfw: (0, express_utils_1.buildNSFWFilter)(res, query.nsfw), user: res.locals.oauth
                ? res.locals.oauth.token.User
                : undefined }), 'filter:api.search.videos.local.list.params');
        const resultList = yield hooks_1.Hooks.wrapPromiseFun(video_1.VideoModel.searchAndPopulateAccountAndServer, apiOptions, 'filter:api.search.videos.local.list.result');
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total));
    });
}
function searchVideoURI(url, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let video;
        if ((0, express_utils_1.isUserAbleToSearchRemoteURI)(res)) {
            try {
                const syncParam = {
                    likes: false,
                    dislikes: false,
                    shares: false,
                    comments: false,
                    thumbnail: true,
                    refreshVideo: false
                };
                const result = yield (0, videos_1.getOrCreateAPVideo)({ videoObject: url, syncParam });
                video = result ? result.video : undefined;
            }
            catch (err) {
                logger_1.logger.info('Cannot search remote video %s.', url, { err });
            }
        }
        else {
            video = yield video_1.VideoModel.loadByUrlAndPopulateAccount(sanitizeLocalUrl(url));
        }
        return res.json({
            total: video ? 1 : 0,
            data: video ? [video.toFormattedJSON()] : []
        });
    });
}
function sanitizeLocalUrl(url) {
    if (!url)
        return '';
    return url.replace(new RegExp('^' + constants_1.WEBSERVER.URL + '/w/'), constants_1.WEBSERVER.URL + '/videos/watch/');
}
