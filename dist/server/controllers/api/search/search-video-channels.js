"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchChannelsRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const core_utils_1 = require("@server/helpers/core-utils");
const query_1 = require("@server/helpers/query");
const requests_1 = require("@server/helpers/requests");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const hooks_1 = require("@server/lib/plugins/hooks");
const search_1 = require("@server/lib/search");
const application_1 = require("@server/models/application/application");
const models_1 = require("@shared/models");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const actors_1 = require("../../../lib/activitypub/actors");
const middlewares_1 = require("../../../middlewares");
const video_channel_1 = require("../../../models/video/video-channel");
const searchChannelsRouter = express_1.default.Router();
exports.searchChannelsRouter = searchChannelsRouter;
searchChannelsRouter.get('/video-channels', (0, middlewares_1.openapiOperationDoc)({ operationId: 'searchChannels' }), middlewares_1.paginationValidator, middlewares_1.setDefaultPagination, middlewares_1.videoChannelsSearchSortValidator, middlewares_1.setDefaultSearchSort, middlewares_1.optionalAuthenticate, middlewares_1.videoChannelsListSearchValidator, (0, middlewares_1.asyncMiddleware)(searchVideoChannels));
function searchVideoChannels(req, res) {
    const query = (0, query_1.pickSearchChannelQuery)(req.query);
    let search = query.search || '';
    const parts = search.split('@');
    if (parts.length === 3 && parts[0].length === 0)
        parts.shift();
    const isWebfingerSearch = parts.length === 2 && parts.every(p => p && !p.includes(' '));
    if ((0, search_1.isURISearch)(search) || isWebfingerSearch)
        return searchVideoChannelURI(search, isWebfingerSearch, res);
    if (search.startsWith('@'))
        search = search.replace(/^@/, '');
    if ((0, search_1.isSearchIndexSearch)(query)) {
        return searchVideoChannelsIndex(query, res);
    }
    return searchVideoChannelsDB(query, res);
}
function searchVideoChannelsIndex(query, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const result = yield (0, search_1.buildMutedForSearchIndex)(res);
        const body = yield hooks_1.Hooks.wrapObject(Object.assign(query, result), 'filter:api.search.video-channels.index.list.params');
        const url = (0, core_utils_1.sanitizeUrl)(config_1.CONFIG.SEARCH.SEARCH_INDEX.URL) + '/api/v1/search/video-channels';
        try {
            logger_1.logger.debug('Doing video channels search index request on %s.', url, { body });
            const { body: searchIndexResult } = yield (0, requests_1.doJSONRequest)(url, { method: 'POST', json: body });
            const jsonResult = yield hooks_1.Hooks.wrapObject(searchIndexResult, 'filter:api.search.video-channels.index.list.result');
            return res.json(jsonResult);
        }
        catch (err) {
            logger_1.logger.warn('Cannot use search index to make video channels search.', { err });
            return res.fail({
                status: models_1.HttpStatusCode.INTERNAL_SERVER_ERROR_500,
                message: 'Cannot use search index to make video channels search'
            });
        }
    });
}
function searchVideoChannelsDB(query, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const serverActor = yield (0, application_1.getServerActor)();
        const apiOptions = yield hooks_1.Hooks.wrapObject(Object.assign(Object.assign({}, query), { actorId: serverActor.id }), 'filter:api.search.video-channels.local.list.params');
        const resultList = yield hooks_1.Hooks.wrapPromiseFun(video_channel_1.VideoChannelModel.searchForApi, apiOptions, 'filter:api.search.video-channels.local.list.result');
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total));
    });
}
function searchVideoChannelURI(search, isWebfingerSearch, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let videoChannel;
        let uri = search;
        if (isWebfingerSearch) {
            try {
                uri = yield (0, actors_1.loadActorUrlOrGetFromWebfinger)(search);
            }
            catch (err) {
                logger_1.logger.warn('Cannot load actor URL or get from webfinger.', { search, err });
                return res.json({ total: 0, data: [] });
            }
        }
        if ((0, express_utils_1.isUserAbleToSearchRemoteURI)(res)) {
            try {
                const actor = yield (0, actors_1.getOrCreateAPActor)(uri, 'all', true, true);
                videoChannel = actor.VideoChannel;
            }
            catch (err) {
                logger_1.logger.info('Cannot search remote video channel %s.', uri, { err });
            }
        }
        else {
            videoChannel = yield video_channel_1.VideoChannelModel.loadByUrlAndPopulateAccount(sanitizeLocalUrl(uri));
        }
        return res.json({
            total: videoChannel ? 1 : 0,
            data: videoChannel ? [videoChannel.toFormattedJSON()] : []
        });
    });
}
function sanitizeLocalUrl(url) {
    if (!url)
        return '';
    return url.replace(new RegExp('^' + constants_1.WEBSERVER.URL + '/c/'), constants_1.WEBSERVER.URL + '/video-channels/');
}
