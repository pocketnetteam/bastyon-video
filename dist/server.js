"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const register_ts_paths_1 = require("./server/helpers/register-ts-paths");
register_ts_paths_1.registerTSPaths();
const core_utils_1 = require("./server/helpers/core-utils");
if (core_utils_1.isTestInstance()) {
    require('source-map-support').install();
}
const express_1 = tslib_1.__importDefault(require("express"));
const morgan_1 = tslib_1.__importStar(require("morgan"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const helmet_1 = require("helmet");
const useragent_1 = require("useragent");
const ip_anonymize_1 = tslib_1.__importDefault(require("ip-anonymize"));
const commander_1 = require("commander");
process.title = 'peertube';
const app = express_1.default().disable("x-powered-by");
const checker_before_init_1 = require("./server/initializers/checker-before-init");
const config_1 = require("./server/initializers/config");
const constants_1 = require("./server/initializers/constants");
const logger_1 = require("./server/helpers/logger");
const missed = checker_before_init_1.checkMissedConfig();
if (missed.length !== 0) {
    logger_1.logger.error('Your configuration files miss keys: ' + missed);
    process.exit(-1);
}
checker_before_init_1.checkFFmpeg(config_1.CONFIG)
    .catch(err => {
    logger_1.logger.error('Error in ffmpeg check.', { err });
    process.exit(-1);
});
checker_before_init_1.checkNodeVersion();
const checker_after_init_1 = require("./server/initializers/checker-after-init");
const errorMessage = checker_after_init_1.checkConfig();
if (errorMessage !== null) {
    throw new Error(errorMessage);
}
app.set('trust proxy', config_1.CONFIG.TRUST_PROXY);
const csp_1 = require("./server/middlewares/csp");
if (config_1.CONFIG.CSP.ENABLED) {
    app.use(csp_1.baseCSP);
}
if (config_1.CONFIG.SECURITY.FRAMEGUARD.ENABLED) {
    app.use(helmet_1.frameguard({
        action: 'deny'
    }));
}
const database_1 = require("./server/initializers/database");
database_1.checkDatabaseConnectionOrDie();
const migrator_1 = require("./server/initializers/migrator");
migrator_1.migrate()
    .then(() => database_1.initDatabaseModels(false))
    .then(() => startApplication())
    .catch(err => {
    logger_1.logger.error('Cannot start application.', { err });
    process.exit(-1);
});
constants_1.loadLanguages();
const installer_1 = require("./server/initializers/installer");
const emailer_1 = require("./server/lib/emailer");
const job_queue_1 = require("./server/lib/job-queue");
const files_cache_1 = require("./server/lib/files-cache");
const controllers_1 = require("./server/controllers");
const dnt_1 = require("./server/middlewares/dnt");
const error_1 = require("./server/middlewares/error");
const redis_1 = require("./server/lib/redis");
const actor_follow_scheduler_1 = require("./server/lib/schedulers/actor-follow-scheduler");
const remove_old_views_scheduler_1 = require("./server/lib/schedulers/remove-old-views-scheduler");
const remove_old_jobs_scheduler_1 = require("./server/lib/schedulers/remove-old-jobs-scheduler");
const update_videos_scheduler_1 = require("./server/lib/schedulers/update-videos-scheduler");
const youtube_dl_update_scheduler_1 = require("./server/lib/schedulers/youtube-dl-update-scheduler");
const videos_redundancy_scheduler_1 = require("./server/lib/schedulers/videos-redundancy-scheduler");
const remove_old_history_scheduler_1 = require("./server/lib/schedulers/remove-old-history-scheduler");
const auto_follow_index_instances_1 = require("./server/lib/schedulers/auto-follow-index-instances");
const remove_dangling_resumable_uploads_scheduler_1 = require("./server/lib/schedulers/remove-dangling-resumable-uploads-scheduler");
const peertube_crypto_1 = require("./server/helpers/peertube-crypto");
const peertube_socket_1 = require("./server/lib/peertube-socket");
const hls_1 = require("./server/lib/hls");
const plugins_check_scheduler_1 = require("./server/lib/schedulers/plugins-check-scheduler");
const peertube_version_check_scheduler_1 = require("./server/lib/schedulers/peertube-version-check-scheduler");
const hooks_1 = require("./server/lib/plugins/hooks");
const plugin_manager_1 = require("./server/lib/plugins/plugin-manager");
const live_1 = require("./server/lib/live");
const http_error_codes_1 = require("./shared/models/http/http-error-codes");
const videos_torrent_cache_1 = require("@server/lib/files-cache/videos-torrent-cache");
const server_config_manager_1 = require("@server/lib/server-config-manager");
commander_1.program
    .option('--no-client', 'Start PeerTube without client interface')
    .option('--no-plugins', 'Start PeerTube without plugins/themes enabled')
    .parse(process.argv);
if (core_utils_1.isTestInstance()) {
    app.use(cors_1.default({
        origin: '*',
        exposedHeaders: 'Retry-After',
        credentials: true
    }));
}
morgan_1.token('remote-addr', (req) => {
    if (config_1.CONFIG.LOG.ANONYMIZE_IP === true || req.get('DNT') === '1') {
        return ip_anonymize_1.default(req.ip, 16, 16);
    }
    return req.ip;
});
morgan_1.token('user-agent', (req) => {
    if (req.get('DNT') === '1') {
        return useragent_1.parse(req.get('user-agent')).family;
    }
    return req.get('user-agent');
});
app.use(morgan_1.default('combined', {
    stream: {
        write: (str) => logger_1.logger.info(str.trim(), { tags: ['http'] })
    },
    skip: req => config_1.CONFIG.LOG.LOG_PING_REQUESTS === false && req.originalUrl === '/api/v1/ping'
}));
app.use(error_1.apiFailMiddleware);
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json({
    type: ['application/json', 'application/*+json'],
    limit: '500kb',
    verify: (req, res, buf) => {
        const valid = peertube_crypto_1.isHTTPSignatureDigestValid(buf, req);
        if (valid !== true) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Invalid digest'
            });
        }
    }
}));
app.use(cookie_parser_1.default());
app.use(dnt_1.advertiseDoNotTrack);
const apiRoute = '/api/' + constants_1.API_VERSION;
app.use(apiRoute, controllers_1.apiRouter);
app.use('/services', controllers_1.servicesRouter);
app.use('/live', controllers_1.liveRouter);
app.use('/', controllers_1.pluginsRouter);
app.use('/', controllers_1.activityPubRouter);
app.use('/', controllers_1.feedsRouter);
app.use('/', controllers_1.webfingerRouter);
app.use('/', controllers_1.trackerRouter);
app.use('/', controllers_1.botsRouter);
app.use('/', controllers_1.staticRouter);
app.use('/', controllers_1.downloadRouter);
app.use('/', controllers_1.lazyStaticRouter);
const cliOptions = commander_1.program.opts();
if (cliOptions.client)
    app.use('/', controllers_1.clientsRouter);
app.use((req, res) => {
    res.status(http_error_codes_1.HttpStatusCode.NOT_FOUND_404).end();
});
app.use((err, req, res, next) => {
    let error = 'Unknown error.';
    if (err) {
        error = err.stack || err.message || err;
    }
    const sql = err.parent ? err.parent.sql : undefined;
    logger_1.logger.error('Error in controller.', { err: error, sql });
    return res.fail({
        status: err.status || http_error_codes_1.HttpStatusCode.INTERNAL_SERVER_ERROR_500,
        message: err.message,
        type: err.name
    });
});
const server = controllers_1.createWebsocketTrackerServer(app);
function startApplication() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const port = config_1.CONFIG.LISTEN.PORT;
        const hostname = config_1.CONFIG.LISTEN.HOSTNAME;
        yield installer_1.installApplication();
        checker_after_init_1.checkActivityPubUrls()
            .catch(err => {
            logger_1.logger.error('Error in ActivityPub URLs checker.', { err });
            process.exit(-1);
        });
        checker_after_init_1.checkFFmpegVersion()
            .catch(err => logger_1.logger.error('Cannot check ffmpeg version', { err }));
        emailer_1.Emailer.Instance.init();
        yield Promise.all([
            emailer_1.Emailer.Instance.checkConnection(),
            job_queue_1.JobQueue.Instance.init(),
            server_config_manager_1.ServerConfigManager.Instance.init()
        ]);
        files_cache_1.VideosPreviewCache.Instance.init(config_1.CONFIG.CACHE.PREVIEWS.SIZE, constants_1.FILES_CACHE.PREVIEWS.MAX_AGE);
        files_cache_1.VideosCaptionCache.Instance.init(config_1.CONFIG.CACHE.VIDEO_CAPTIONS.SIZE, constants_1.FILES_CACHE.VIDEO_CAPTIONS.MAX_AGE);
        videos_torrent_cache_1.VideosTorrentCache.Instance.init(config_1.CONFIG.CACHE.TORRENTS.SIZE, constants_1.FILES_CACHE.TORRENTS.MAX_AGE);
        actor_follow_scheduler_1.ActorFollowScheduler.Instance.enable();
        remove_old_jobs_scheduler_1.RemoveOldJobsScheduler.Instance.enable();
        update_videos_scheduler_1.UpdateVideosScheduler.Instance.enable();
        youtube_dl_update_scheduler_1.YoutubeDlUpdateScheduler.Instance.enable();
        videos_redundancy_scheduler_1.VideosRedundancyScheduler.Instance.enable();
        remove_old_history_scheduler_1.RemoveOldHistoryScheduler.Instance.enable();
        remove_old_views_scheduler_1.RemoveOldViewsScheduler.Instance.enable();
        plugins_check_scheduler_1.PluginsCheckScheduler.Instance.enable();
        peertube_version_check_scheduler_1.PeerTubeVersionCheckScheduler.Instance.enable();
        auto_follow_index_instances_1.AutoFollowIndexInstances.Instance.enable();
        remove_dangling_resumable_uploads_scheduler_1.RemoveDanglingResumableUploadsScheduler.Instance.enable();
        redis_1.Redis.Instance.init();
        peertube_socket_1.PeerTubeSocket.Instance.init(server);
        hls_1.updateStreamingPlaylistsInfohashesIfNeeded()
            .catch(err => logger_1.logger.error('Cannot update streaming playlist infohashes.', { err }));
        live_1.LiveManager.Instance.init();
        if (config_1.CONFIG.LIVE.ENABLED)
            live_1.LiveManager.Instance.run();
        server.listen(port, hostname, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (cliOptions.plugins) {
                try {
                    yield plugin_manager_1.PluginManager.Instance.registerPluginsAndThemes();
                }
                catch (err) {
                    logger_1.logger.error('Cannot register plugins and themes.', { err });
                }
            }
            logger_1.logger.info('HTTP server listening on %s:%d', hostname, port);
            logger_1.logger.info('Web server: %s', constants_1.WEBSERVER.URL);
            hooks_1.Hooks.runAction('action:application.listening');
        }));
        process.on('exit', () => {
            job_queue_1.JobQueue.Instance.terminate();
        });
        process.on('SIGINT', () => process.exit(0));
    });
}
