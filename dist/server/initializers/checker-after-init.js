"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkActivityPubUrls = exports.applicationExist = exports.usersExist = exports.checkFFmpegVersion = exports.clientsExist = exports.checkConfig = void 0;
const tslib_1 = require("tslib");
const config_1 = require("config");
const lodash_1 = require("lodash");
const url_1 = require("url");
const ffmpeg_utils_1 = require("@server/helpers/ffmpeg-utils");
const core_utils_1 = require("../helpers/core-utils");
const misc_1 = require("../helpers/custom-validators/misc");
const logger_1 = require("../helpers/logger");
const user_1 = require("../models/user/user");
const application_1 = require("../models/application/application");
const oauth_client_1 = require("../models/oauth/oauth-client");
const config_2 = require("./config");
const constants_1 = require("./constants");
function checkActivityPubUrls() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const actor = yield (0, application_1.getServerActor)();
        const parsed = new url_1.URL(actor.url);
        if (constants_1.WEBSERVER.HOST !== parsed.host) {
            const NODE_ENV = config_1.util.getEnv('NODE_ENV');
            const NODE_CONFIG_DIR = config_1.util.getEnv('NODE_CONFIG_DIR');
            logger_1.logger.warn('It seems PeerTube was started (and created some data) with another domain name. ' +
                'This means you will not be able to federate! ' +
                'Please use %s %s npm run update-host to fix this.', NODE_CONFIG_DIR ? `NODE_CONFIG_DIR=${NODE_CONFIG_DIR}` : '', NODE_ENV ? `NODE_ENV=${NODE_ENV}` : '');
        }
    });
}
exports.checkActivityPubUrls = checkActivityPubUrls;
function checkConfig() {
    if ((0, config_1.has)('services.csp-logger')) {
        logger_1.logger.warn('services.csp-logger configuration has been renamed to csp.report_uri. Please update your configuration file.');
    }
    if (!(0, config_2.isEmailEnabled)()) {
        if (config_2.CONFIG.SIGNUP.ENABLED && config_2.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION) {
            return 'Emailer is disabled but you require signup email verification.';
        }
        if (config_2.CONFIG.CONTACT_FORM.ENABLED) {
            logger_1.logger.warn('Emailer is disabled so the contact form will not work.');
        }
    }
    const defaultNSFWPolicy = config_2.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY;
    {
        const available = ['do_not_list', 'blur', 'display'];
        if (available.includes(defaultNSFWPolicy) === false) {
            return 'NSFW policy setting should be ' + available.join(' or ') + ' instead of ' + defaultNSFWPolicy;
        }
    }
    const redundancyVideos = config_2.CONFIG.REDUNDANCY.VIDEOS.STRATEGIES;
    if ((0, misc_1.isArray)(redundancyVideos)) {
        const available = ['most-views', 'trending', 'recently-added'];
        for (const r of redundancyVideos) {
            if (available.includes(r.strategy) === false) {
                return 'Videos redundancy should have ' + available.join(' or ') + ' strategy instead of ' + r.strategy;
            }
            if (!(0, core_utils_1.isTestInstance)() && r.minLifetime < 1000 * 3600 * 10) {
                r.minLifetime = 1000 * 3600 * 10;
            }
        }
        const filtered = (0, lodash_1.uniq)(redundancyVideos.map(r => r.strategy));
        if (filtered.length !== redundancyVideos.length) {
            return 'Redundancy video entries should have unique strategies';
        }
        const recentlyAddedStrategy = redundancyVideos.find(r => r.strategy === 'recently-added');
        if (recentlyAddedStrategy && isNaN(recentlyAddedStrategy.minViews)) {
            return 'Min views in recently added strategy is not a number';
        }
    }
    else {
        return 'Videos redundancy should be an array (you must uncomment lines containing - too)';
    }
    const acceptFrom = config_2.CONFIG.REMOTE_REDUNDANCY.VIDEOS.ACCEPT_FROM;
    const acceptFromValues = new Set(['nobody', 'anybody', 'followings']);
    if (acceptFromValues.has(acceptFrom) === false) {
        return 'remote_redundancy.videos.accept_from has an incorrect value';
    }
    if ((0, core_utils_1.isProdInstance)()) {
        const configStorage = (0, config_1.get)('storage');
        for (const key of Object.keys(configStorage)) {
            if (configStorage[key].startsWith('storage/')) {
                logger_1.logger.warn('Directory of %s should not be in the production directory of PeerTube. Please check your production configuration file.', key);
            }
        }
    }
    if (config_2.CONFIG.STORAGE.VIDEOS_DIR === config_2.CONFIG.STORAGE.REDUNDANCY_DIR) {
        logger_1.logger.warn('Redundancy directory should be different than the videos folder.');
    }
    if (config_2.CONFIG.TRANSCODING.ENABLED) {
        if (config_2.CONFIG.TRANSCODING.WEBTORRENT.ENABLED === false && config_2.CONFIG.TRANSCODING.HLS.ENABLED === false) {
            return 'You need to enable at least WebTorrent transcoding or HLS transcoding.';
        }
        if (config_2.CONFIG.TRANSCODING.CONCURRENCY <= 0) {
            return 'Transcoding concurrency should be > 0';
        }
    }
    if (config_2.CONFIG.IMPORT.VIDEOS.HTTP.ENABLED || config_2.CONFIG.IMPORT.VIDEOS.TORRENT.ENABLED) {
        if (config_2.CONFIG.IMPORT.VIDEOS.CONCURRENCY <= 0) {
            return 'Video import concurrency should be > 0';
        }
    }
    if (config_2.CONFIG.BROADCAST_MESSAGE.ENABLED) {
        const currentLevel = config_2.CONFIG.BROADCAST_MESSAGE.LEVEL;
        const available = ['info', 'warning', 'error'];
        if (available.includes(currentLevel) === false) {
            return 'Broadcast message level should be ' + available.join(' or ') + ' instead of ' + currentLevel;
        }
    }
    if (config_2.CONFIG.SEARCH.SEARCH_INDEX.ENABLED === true) {
        if (config_2.CONFIG.SEARCH.REMOTE_URI.USERS === false) {
            return 'You cannot enable search index without enabling remote URI search for users.';
        }
    }
    if (config_2.CONFIG.LIVE.ENABLED === true) {
        if (config_2.CONFIG.LIVE.ALLOW_REPLAY === true && config_2.CONFIG.TRANSCODING.ENABLED === false) {
            return 'Live allow replay cannot be enabled if transcoding is not enabled.';
        }
    }
    if (config_2.CONFIG.OBJECT_STORAGE.ENABLED === true) {
        if (!config_2.CONFIG.OBJECT_STORAGE.VIDEOS.BUCKET_NAME) {
            return 'videos_bucket should be set when object storage support is enabled.';
        }
        if (!config_2.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS.BUCKET_NAME) {
            return 'streaming_playlists_bucket should be set when object storage support is enabled.';
        }
        if (config_2.CONFIG.OBJECT_STORAGE.VIDEOS.BUCKET_NAME === config_2.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS.BUCKET_NAME &&
            config_2.CONFIG.OBJECT_STORAGE.VIDEOS.PREFIX === config_2.CONFIG.OBJECT_STORAGE.STREAMING_PLAYLISTS.PREFIX) {
            if (config_2.CONFIG.OBJECT_STORAGE.VIDEOS.PREFIX === '') {
                return 'Object storage bucket prefixes should be set when the same bucket is used for both types of video.';
            }
            else {
                return 'Object storage bucket prefixes should be set to different values when the same bucket is used for both types of video.';
            }
        }
    }
    return null;
}
exports.checkConfig = checkConfig;
function clientsExist() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const totalClients = yield oauth_client_1.OAuthClientModel.countTotal();
        return totalClients !== 0;
    });
}
exports.clientsExist = clientsExist;
function usersExist() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const totalUsers = yield user_1.UserModel.countTotal();
        return totalUsers !== 0;
    });
}
exports.usersExist = usersExist;
function applicationExist() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const totalApplication = yield application_1.ApplicationModel.countTotal();
        return totalApplication !== 0;
    });
}
exports.applicationExist = applicationExist;
function checkFFmpegVersion() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const version = yield (0, ffmpeg_utils_1.getFFmpegVersion)();
        const { major, minor } = (0, core_utils_1.parseSemVersion)(version);
        if (major < 4 || (major === 4 && minor < 1)) {
            logger_1.logger.warn('Your ffmpeg version (%s) is outdated. PeerTube supports ffmpeg >= 4.1. Please upgrade.', version);
        }
    });
}
exports.checkFFmpegVersion = checkFFmpegVersion;
