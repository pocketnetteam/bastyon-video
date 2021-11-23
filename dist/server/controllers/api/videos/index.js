"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const toInt_1 = (0, tslib_1.__importDefault)(require("validator/lib/toInt"));
const query_1 = require("@server/helpers/query");
const requests_1 = require("@server/helpers/requests");
const live_1 = require("@server/lib/live");
const doc_1 = require("@server/middlewares/doc");
const application_1 = require("@server/models/application/application");
const models_1 = require("../../../../shared/models");
const audit_logger_1 = require("../../../helpers/audit-logger");
const express_utils_1 = require("../../../helpers/express-utils");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const send_view_1 = require("../../../lib/activitypub/send/send-view");
const job_queue_1 = require("../../../lib/job-queue");
const hooks_1 = require("../../../lib/plugins/hooks");
const redis_1 = require("../../../lib/redis");
const middlewares_1 = require("../../../middlewares");
const video_1 = require("../../../models/video/video");
const video_file_1 = require("../../../models/video/video-file");
const blacklist_1 = require("./blacklist");
const captions_1 = require("./captions");
const comment_1 = require("./comment");
const import_1 = require("./import");
const live_2 = require("./live");
const ownership_1 = require("./ownership");
const rate_1 = require("./rate");
const update_1 = require("./update");
const upload_1 = require("./upload");
const watching_1 = require("./watching");
const auditLogger = (0, audit_logger_1.auditLoggerFactory)('videos');
const videosRouter = express_1.default.Router();
exports.videosRouter = videosRouter;
videosRouter.use('/', blacklist_1.blacklistRouter);
videosRouter.use('/', rate_1.rateVideoRouter);
videosRouter.use('/', comment_1.videoCommentRouter);
videosRouter.use('/', captions_1.videoCaptionsRouter);
videosRouter.use('/', import_1.videoImportsRouter);
videosRouter.use('/', ownership_1.ownershipVideoRouter);
videosRouter.use('/', watching_1.watchingRouter);
videosRouter.use('/', live_2.liveRouter);
videosRouter.use('/', upload_1.uploadRouter);
videosRouter.use('/', update_1.updateRouter);
videosRouter.get('/categories', (0, doc_1.openapiOperationDoc)({ operationId: 'getCategories' }), listVideoCategories);
videosRouter.get('/licences', (0, doc_1.openapiOperationDoc)({ operationId: 'getLicences' }), listVideoLicences);
videosRouter.get('/languages', (0, doc_1.openapiOperationDoc)({ operationId: 'getLanguages' }), listVideoLanguages);
videosRouter.get('/privacies', (0, doc_1.openapiOperationDoc)({ operationId: 'getPrivacies' }), listVideoPrivacies);
videosRouter.get('/', (0, doc_1.openapiOperationDoc)({ operationId: 'getVideos' }), middlewares_1.paginationValidator, middlewares_1.videosSortValidator, middlewares_1.setDefaultVideosSort, middlewares_1.setDefaultPagination, middlewares_1.optionalAuthenticate, middlewares_1.commonVideosFiltersValidator, (0, middlewares_1.asyncMiddleware)(listVideos));
videosRouter.get('/:id/description', (0, doc_1.openapiOperationDoc)({ operationId: 'getVideoDesc' }), (0, middlewares_1.asyncMiddleware)(middlewares_1.videosGetValidator), (0, middlewares_1.asyncMiddleware)(getVideoDescription));
videosRouter.get('/:id/metadata/:videoFileId', (0, middlewares_1.asyncMiddleware)(middlewares_1.videoFileMetadataGetValidator), (0, middlewares_1.asyncMiddleware)(getVideoFileMetadata));
videosRouter.get('/:id', (0, doc_1.openapiOperationDoc)({ operationId: 'getVideo' }), middlewares_1.optionalAuthenticate, (0, middlewares_1.asyncMiddleware)((0, middlewares_1.videosCustomGetValidator)('for-api')), (0, middlewares_1.asyncMiddleware)(middlewares_1.checkVideoFollowConstraints), getVideo);
videosRouter.post('/:id/views', (0, doc_1.openapiOperationDoc)({ operationId: 'addView' }), (0, middlewares_1.asyncMiddleware)((0, middlewares_1.videosCustomGetValidator)('only-immutable-attributes')), (0, middlewares_1.asyncMiddleware)(viewVideo));
videosRouter.delete('/:id', (0, doc_1.openapiOperationDoc)({ operationId: 'delVideo' }), middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosRemoveValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(removeVideo));
function listVideoCategories(_req, res) {
    res.json(constants_1.VIDEO_CATEGORIES);
}
function listVideoLicences(_req, res) {
    res.json(constants_1.VIDEO_LICENCES);
}
function listVideoLanguages(_req, res) {
    res.json(constants_1.VIDEO_LANGUAGES);
}
function listVideoPrivacies(_req, res) {
    res.json(constants_1.VIDEO_PRIVACIES);
}
function getVideo(_req, res) {
    const video = res.locals.videoAPI;
    if (video.isOutdated()) {
        job_queue_1.JobQueue.Instance.createJob({ type: 'activitypub-refresher', payload: { type: 'video', url: video.url } });
    }
    return res.json(video.toFormattedDetailsJSON());
}
function viewVideo(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const immutableVideoAttrs = res.locals.onlyImmutableVideo;
        const ip = req.ip;
        const exists = yield redis_1.Redis.Instance.doesVideoIPViewExist(ip, immutableVideoAttrs.uuid);
        if (exists) {
            logger_1.logger.debug('View for ip %s and video %s already exists.', ip, immutableVideoAttrs.uuid);
            return res.status(models_1.HttpStatusCode.NO_CONTENT_204).end();
        }
        const video = yield video_1.VideoModel.load(immutableVideoAttrs.id);
        const promises = [
            redis_1.Redis.Instance.setIPVideoView(ip, video.uuid, video.isLive)
        ];
        let federateView = true;
        if (video.isLive && video.isOwned()) {
            live_1.LiveManager.Instance.addViewTo(video.id);
            federateView = false;
        }
        if (!video.isLive) {
            promises.push(redis_1.Redis.Instance.addVideoView(video.id));
        }
        if (federateView) {
            const serverActor = yield (0, application_1.getServerActor)();
            promises.push((0, send_view_1.sendView)(serverActor, video, undefined));
        }
        yield Promise.all(promises);
        hooks_1.Hooks.runAction('action:api.video.viewed', { video, ip });
        return res.status(models_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function getVideoDescription(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoInstance = res.locals.videoAll;
        const description = videoInstance.isOwned()
            ? videoInstance.description
            : yield fetchRemoteVideoDescription(videoInstance);
        return res.json({ description });
    });
}
function getVideoFileMetadata(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoFile = yield video_file_1.VideoFileModel.loadWithMetadata((0, toInt_1.default)(req.params.videoFileId));
        return res.json(videoFile.metadata);
    });
}
function listVideos(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const query = (0, query_1.pickCommonVideoQuery)(req.query);
        const countVideos = (0, express_utils_1.getCountVideos)(req);
        const apiOptions = yield hooks_1.Hooks.wrapObject(Object.assign(Object.assign({}, query), { includeLocalVideos: true, nsfw: (0, express_utils_1.buildNSFWFilter)(res, query.nsfw), withFiles: false, user: res.locals.oauth ? res.locals.oauth.token.User : undefined, countVideos }), 'filter:api.videos.list.params');
        const resultList = yield hooks_1.Hooks.wrapPromiseFun(video_1.VideoModel.listForApi, apiOptions, 'filter:api.videos.list.result');
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total));
    });
}
function removeVideo(_req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoInstance = res.locals.videoAll;
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield videoInstance.destroy({ transaction: t });
        }));
        auditLogger.delete((0, audit_logger_1.getAuditIdFromRes)(res), new audit_logger_1.VideoAuditView(videoInstance.toFormattedDetailsJSON()));
        logger_1.logger.info('Video with name %s and uuid %s deleted.', videoInstance.name, videoInstance.uuid);
        hooks_1.Hooks.runAction('action:api.video.deleted', { video: videoInstance });
        return res.type('json')
            .status(models_1.HttpStatusCode.NO_CONTENT_204)
            .end();
    });
}
function fetchRemoteVideoDescription(video) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const host = video.VideoChannel.Account.Actor.Server.host;
        const path = video.getDescriptionAPIPath();
        const url = constants_1.REMOTE_SCHEME.HTTP + '://' + host + path;
        const { body } = yield (0, requests_1.doJSONRequest)(url);
        return body.description || '';
    });
}
