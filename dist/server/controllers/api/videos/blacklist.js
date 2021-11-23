"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklistRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const video_blacklist_1 = require("@server/lib/video-blacklist");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const database_1 = require("../../../initializers/database");
const middlewares_1 = require("../../../middlewares");
const video_blacklist_2 = require("../../../models/video/video-blacklist");
const blacklistRouter = express_1.default.Router();
exports.blacklistRouter = blacklistRouter;
blacklistRouter.post('/:videoId/blacklist', (0, middlewares_1.openapiOperationDoc)({ operationId: 'addVideoBlock' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(12), (0, middlewares_1.asyncMiddleware)(middlewares_1.videosBlacklistAddValidator), (0, middlewares_1.asyncMiddleware)(addVideoToBlacklistController));
blacklistRouter.get('/blacklist', (0, middlewares_1.openapiOperationDoc)({ operationId: 'getVideoBlocks' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(12), middlewares_1.paginationValidator, middlewares_1.blacklistSortValidator, middlewares_1.setBlacklistSort, middlewares_1.setDefaultPagination, middlewares_1.videosBlacklistFiltersValidator, (0, middlewares_1.asyncMiddleware)(listBlacklist));
blacklistRouter.put('/:videoId/blacklist', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(12), (0, middlewares_1.asyncMiddleware)(middlewares_1.videosBlacklistUpdateValidator), (0, middlewares_1.asyncMiddleware)(updateVideoBlacklistController));
blacklistRouter.delete('/:videoId/blacklist', (0, middlewares_1.openapiOperationDoc)({ operationId: 'delVideoBlock' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(12), (0, middlewares_1.asyncMiddleware)(middlewares_1.videosBlacklistRemoveValidator), (0, middlewares_1.asyncMiddleware)(removeVideoFromBlacklistController));
function addVideoToBlacklistController(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoInstance = res.locals.videoAll;
        const body = req.body;
        yield (0, video_blacklist_1.blacklistVideo)(videoInstance, body);
        logger_1.logger.info('Video %s blacklisted.', videoInstance.uuid);
        return res.type('json').status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function updateVideoBlacklistController(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoBlacklist = res.locals.videoBlacklist;
        if (req.body.reason !== undefined)
            videoBlacklist.reason = req.body.reason;
        yield database_1.sequelizeTypescript.transaction(t => {
            return videoBlacklist.save({ transaction: t });
        });
        return res.type('json').status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function listBlacklist(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const resultList = yield video_blacklist_2.VideoBlacklistModel.listForApi({
            start: req.query.start,
            count: req.query.count,
            sort: req.query.sort,
            search: req.query.search,
            type: req.query.type
        });
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total));
    });
}
function removeVideoFromBlacklistController(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoBlacklist = res.locals.videoBlacklist;
        const video = res.locals.videoAll;
        yield (0, video_blacklist_1.unblacklistVideo)(videoBlacklist, video);
        logger_1.logger.info('Video %s removed from blacklist.', video.uuid);
        return res.type('json').status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
