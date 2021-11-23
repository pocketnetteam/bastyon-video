"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const tslib_1 = require("tslib");
const cors_1 = (0, tslib_1.__importDefault)(require("cors"));
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const express_rate_limit_1 = (0, tslib_1.__importDefault)(require("express-rate-limit"));
const models_1 = require("../../../shared/models");
const express_utils_1 = require("../../helpers/express-utils");
const config_1 = require("../../initializers/config");
const abuse_1 = require("./abuse");
const accounts_1 = require("./accounts");
const bulk_1 = require("./bulk");
const config_2 = require("./config");
const custom_page_1 = require("./custom-page");
const jobs_1 = require("./jobs");
const oauth_clients_1 = require("./oauth-clients");
const overviews_1 = require("./overviews");
const plugins_1 = require("./plugins");
const search_1 = require("./search");
const server_1 = require("./server");
const users_1 = require("./users");
const video_channel_1 = require("./video-channel");
const video_playlist_1 = require("./video-playlist");
const videos_1 = require("./videos");
const images_1 = require("./images");
const apiRouter = express_1.default.Router();
exports.apiRouter = apiRouter;
apiRouter.use((0, cors_1.default)({
    origin: '*',
    exposedHeaders: 'Retry-After',
    credentials: true
}));
const apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.CONFIG.RATES_LIMIT.API.WINDOW_MS,
    max: config_1.CONFIG.RATES_LIMIT.API.MAX
});
apiRouter.use(apiRateLimiter);
apiRouter.use('/server', server_1.serverRouter);
apiRouter.use('/abuses', abuse_1.abuseRouter);
apiRouter.use('/bulk', bulk_1.bulkRouter);
apiRouter.use('/oauth-clients', oauth_clients_1.oauthClientsRouter);
apiRouter.use('/config', config_2.configRouter);
apiRouter.use('/users', users_1.usersRouter);
apiRouter.use('/accounts', accounts_1.accountsRouter);
apiRouter.use('/video-channels', video_channel_1.videoChannelRouter);
apiRouter.use('/video-playlists', video_playlist_1.videoPlaylistRouter);
apiRouter.use('/videos', videos_1.videosRouter);
apiRouter.use('/images', images_1.imagesRouter);
apiRouter.use('/jobs', jobs_1.jobsRouter);
apiRouter.use('/search', search_1.searchRouter);
apiRouter.use('/overviews', overviews_1.overviewsRouter);
apiRouter.use('/plugins', plugins_1.pluginRouter);
apiRouter.use('/custom-pages', custom_page_1.customPageRouter);
apiRouter.use('/ping', pong);
apiRouter.use('/*', express_utils_1.badRequest);
function pong(req, res) {
    return res.send('pong').status(models_1.HttpStatusCode.OK_200).end();
}
