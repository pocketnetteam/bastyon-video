"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverRedundancyRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const job_queue_1 = require("@server/lib/job-queue");
const video_redundancy_1 = require("@server/models/redundancy/video-redundancy");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const logger_1 = require("../../../helpers/logger");
const redundancy_1 = require("../../../lib/redundancy");
const middlewares_1 = require("../../../middlewares");
const redundancy_2 = require("../../../middlewares/validators/redundancy");
const serverRedundancyRouter = express_1.default.Router();
exports.serverRedundancyRouter = serverRedundancyRouter;
serverRedundancyRouter.put('/redundancy/:host', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(2), (0, middlewares_1.asyncMiddleware)(redundancy_2.updateServerRedundancyValidator), (0, middlewares_1.asyncMiddleware)(updateRedundancy));
serverRedundancyRouter.get('/redundancy/videos', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(24), redundancy_2.listVideoRedundanciesValidator, middlewares_1.paginationValidator, middlewares_1.videoRedundanciesSortValidator, middlewares_1.setDefaultVideoRedundanciesSort, middlewares_1.setDefaultPagination, (0, middlewares_1.asyncMiddleware)(listVideoRedundancies));
serverRedundancyRouter.post('/redundancy/videos', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(24), redundancy_2.addVideoRedundancyValidator, (0, middlewares_1.asyncMiddleware)(addVideoRedundancy));
serverRedundancyRouter.delete('/redundancy/videos/:redundancyId', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(24), redundancy_2.removeVideoRedundancyValidator, (0, middlewares_1.asyncMiddleware)(removeVideoRedundancyController));
function listVideoRedundancies(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const resultList = yield video_redundancy_1.VideoRedundancyModel.listForApi({
            start: req.query.start,
            count: req.query.count,
            sort: req.query.sort,
            target: req.query.target,
            strategy: req.query.strategy
        });
        const result = {
            total: resultList.total,
            data: resultList.data.map(r => video_redundancy_1.VideoRedundancyModel.toFormattedJSONStatic(r))
        };
        return res.json(result);
    });
}
function addVideoRedundancy(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = {
            videoId: res.locals.onlyVideo.id
        };
        yield job_queue_1.JobQueue.Instance.createJobWithPromise({
            type: 'video-redundancy',
            payload
        });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function removeVideoRedundancyController(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, redundancy_1.removeVideoRedundancy)(res.locals.videoRedundancy);
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function updateRedundancy(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const server = res.locals.server;
        server.redundancyAllowed = req.body.redundancyAllowed;
        yield server.save();
        if (server.redundancyAllowed !== true) {
            (0, redundancy_1.removeRedundanciesOfServer)(server.id)
                .catch(err => logger_1.logger.error('Cannot remove redundancy of %s.', server.host, { err }));
        }
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
