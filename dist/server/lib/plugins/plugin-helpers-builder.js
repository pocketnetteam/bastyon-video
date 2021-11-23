"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPluginHelpers = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const database_1 = require("@server/initializers/database");
const account_1 = require("@server/models/account/account");
const account_blocklist_1 = require("@server/models/account/account-blocklist");
const application_1 = require("@server/models/application/application");
const server_1 = require("@server/models/server/server");
const server_blocklist_1 = require("@server/models/server/server-blocklist");
const video_1 = require("@server/models/video/video");
const video_blacklist_1 = require("@server/models/video/video-blacklist");
const blocklist_1 = require("../blocklist");
const server_config_manager_1 = require("../server-config-manager");
const video_blacklist_2 = require("../video-blacklist");
const user_1 = require("@server/models/user/user");
function buildPluginHelpers(pluginModel, npmName) {
    const logger = buildPluginLogger(npmName);
    const database = buildDatabaseHelpers();
    const videos = buildVideosHelpers();
    const config = buildConfigHelpers();
    const server = buildServerHelpers();
    const moderation = buildModerationHelpers();
    const plugin = buildPluginRelatedHelpers(pluginModel, npmName);
    const user = buildUserHelpers();
    return {
        logger,
        database,
        videos,
        config,
        moderation,
        plugin,
        server,
        user
    };
}
exports.buildPluginHelpers = buildPluginHelpers;
function buildPluginLogger(npmName) {
    return (0, logger_1.buildLogger)(npmName);
}
function buildDatabaseHelpers() {
    return {
        query: database_1.sequelizeTypescript.query.bind(database_1.sequelizeTypescript)
    };
}
function buildServerHelpers() {
    return {
        getServerActor: () => (0, application_1.getServerActor)()
    };
}
function buildVideosHelpers() {
    return {
        loadByUrl: (url) => {
            return video_1.VideoModel.loadByUrl(url);
        },
        loadByIdOrUUID: (id) => {
            return video_1.VideoModel.load(id);
        },
        removeVideo: (id) => {
            return database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(id, t);
                yield video.destroy({ transaction: t });
            }));
        }
    };
}
function buildModerationHelpers() {
    return {
        blockServer: (options) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const serverToBlock = yield server_1.ServerModel.loadOrCreateByHost(options.hostToBlock);
            yield (0, blocklist_1.addServerInBlocklist)(options.byAccountId, serverToBlock.id);
        }),
        unblockServer: (options) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const serverBlock = yield server_blocklist_1.ServerBlocklistModel.loadByAccountAndHost(options.byAccountId, options.hostToUnblock);
            if (!serverBlock)
                return;
            yield (0, blocklist_1.removeServerFromBlocklist)(serverBlock);
        }),
        blockAccount: (options) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const accountToBlock = yield account_1.AccountModel.loadByNameWithHost(options.handleToBlock);
            if (!accountToBlock)
                return;
            yield (0, blocklist_1.addAccountInBlocklist)(options.byAccountId, accountToBlock.id);
        }),
        unblockAccount: (options) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const targetAccount = yield account_1.AccountModel.loadByNameWithHost(options.handleToUnblock);
            if (!targetAccount)
                return;
            const accountBlock = yield account_blocklist_1.AccountBlocklistModel.loadByAccountAndTarget(options.byAccountId, targetAccount.id);
            if (!accountBlock)
                return;
            yield (0, blocklist_1.removeAccountFromBlocklist)(accountBlock);
        }),
        blacklistVideo: (options) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(options.videoIdOrUUID);
            if (!video)
                return;
            yield (0, video_blacklist_2.blacklistVideo)(video, options.createOptions);
        }),
        unblacklistVideo: (options) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(options.videoIdOrUUID);
            if (!video)
                return;
            const videoBlacklist = yield video_blacklist_1.VideoBlacklistModel.loadByVideoId(video.id);
            if (!videoBlacklist)
                return;
            yield (0, video_blacklist_2.unblacklistVideo)(videoBlacklist, video);
        })
    };
}
function buildConfigHelpers() {
    return {
        getWebserverUrl() {
            return constants_1.WEBSERVER.URL;
        },
        getServerConfig() {
            return server_config_manager_1.ServerConfigManager.Instance.getServerConfig();
        }
    };
}
function buildPluginRelatedHelpers(plugin, npmName) {
    return {
        getBaseStaticRoute: () => `/plugins/${plugin.name}/${plugin.version}/static/`,
        getBaseRouterRoute: () => `/plugins/${plugin.name}/${plugin.version}/router/`,
        getDataDirectoryPath: () => (0, path_1.join)(config_1.CONFIG.STORAGE.PLUGINS_DIR, 'data', npmName)
    };
}
function buildUserHelpers() {
    return {
        getAuthUser: (res) => {
            var _a, _b;
            const user = (_b = (_a = res.locals.oauth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.User;
            if (!user)
                return undefined;
            return user_1.UserModel.loadByIdFull(user.id);
        }
    };
}
