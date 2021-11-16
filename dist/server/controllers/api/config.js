"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const validator_1 = tslib_1.__importDefault(require("validator"));
const server_config_manager_1 = require("@server/lib/server-config-manager");
const audit_logger_1 = require("../../helpers/audit-logger");
const core_utils_1 = require("../../helpers/core-utils");
const config_1 = require("../../initializers/config");
const client_html_1 = require("../../lib/client-html");
const middlewares_1 = require("../../middlewares");
const config_2 = require("../../middlewares/validators/config");
const configRouter = express_1.default.Router();
exports.configRouter = configRouter;
const auditLogger = audit_logger_1.auditLoggerFactory('config');
configRouter.get('/', middlewares_1.openapiOperationDoc({ operationId: 'getConfig' }), middlewares_1.asyncMiddleware(getConfig));
configRouter.get('/about', middlewares_1.openapiOperationDoc({ operationId: 'getAbout' }), getAbout);
configRouter.get('/custom', middlewares_1.openapiOperationDoc({ operationId: 'getCustomConfig' }), middlewares_1.authenticate, middlewares_1.ensureUserHasRight(8), getCustomConfig);
configRouter.put('/custom', middlewares_1.openapiOperationDoc({ operationId: 'putCustomConfig' }), middlewares_1.authenticate, middlewares_1.ensureUserHasRight(8), config_2.customConfigUpdateValidator, middlewares_1.asyncMiddleware(updateCustomConfig));
configRouter.delete('/custom', middlewares_1.openapiOperationDoc({ operationId: 'delCustomConfig' }), middlewares_1.authenticate, middlewares_1.ensureUserHasRight(8), middlewares_1.asyncMiddleware(deleteCustomConfig));
function getConfig(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const json = yield server_config_manager_1.ServerConfigManager.Instance.getServerConfig(req.ip);
        return res.json(json);
    });
}
function getAbout(req, res) {
    const about = {
        instance: {
            name: config_1.CONFIG.INSTANCE.NAME,
            shortDescription: config_1.CONFIG.INSTANCE.SHORT_DESCRIPTION,
            description: config_1.CONFIG.INSTANCE.DESCRIPTION,
            terms: config_1.CONFIG.INSTANCE.TERMS,
            codeOfConduct: config_1.CONFIG.INSTANCE.CODE_OF_CONDUCT,
            hardwareInformation: config_1.CONFIG.INSTANCE.HARDWARE_INFORMATION,
            creationReason: config_1.CONFIG.INSTANCE.CREATION_REASON,
            moderationInformation: config_1.CONFIG.INSTANCE.MODERATION_INFORMATION,
            administrator: config_1.CONFIG.INSTANCE.ADMINISTRATOR,
            maintenanceLifetime: config_1.CONFIG.INSTANCE.MAINTENANCE_LIFETIME,
            businessModel: config_1.CONFIG.INSTANCE.BUSINESS_MODEL,
            languages: config_1.CONFIG.INSTANCE.LANGUAGES,
            categories: config_1.CONFIG.INSTANCE.CATEGORIES
        }
    };
    return res.json(about);
}
function getCustomConfig(req, res) {
    const data = customConfig();
    return res.json(data);
}
function deleteCustomConfig(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.remove(config_1.CONFIG.CUSTOM_FILE);
        auditLogger.delete(audit_logger_1.getAuditIdFromRes(res), new audit_logger_1.CustomConfigAuditView(customConfig()));
        config_1.reloadConfig();
        client_html_1.ClientHtml.invalidCache();
        const data = customConfig();
        return res.json(data);
    });
}
function updateCustomConfig(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const oldCustomConfigAuditKeys = new audit_logger_1.CustomConfigAuditView(customConfig());
        const toUpdateJSON = convertCustomConfigBody(req.body);
        yield fs_extra_1.writeJSON(config_1.CONFIG.CUSTOM_FILE, toUpdateJSON, { spaces: 2 });
        config_1.reloadConfig();
        client_html_1.ClientHtml.invalidCache();
        const data = customConfig();
        auditLogger.update(audit_logger_1.getAuditIdFromRes(res), new audit_logger_1.CustomConfigAuditView(data), oldCustomConfigAuditKeys);
        return res.json(data);
    });
}
function customConfig() {
    return {
        instance: {
            name: config_1.CONFIG.INSTANCE.NAME,
            shortDescription: config_1.CONFIG.INSTANCE.SHORT_DESCRIPTION,
            description: config_1.CONFIG.INSTANCE.DESCRIPTION,
            terms: config_1.CONFIG.INSTANCE.TERMS,
            codeOfConduct: config_1.CONFIG.INSTANCE.CODE_OF_CONDUCT,
            creationReason: config_1.CONFIG.INSTANCE.CREATION_REASON,
            moderationInformation: config_1.CONFIG.INSTANCE.MODERATION_INFORMATION,
            administrator: config_1.CONFIG.INSTANCE.ADMINISTRATOR,
            maintenanceLifetime: config_1.CONFIG.INSTANCE.MAINTENANCE_LIFETIME,
            businessModel: config_1.CONFIG.INSTANCE.BUSINESS_MODEL,
            hardwareInformation: config_1.CONFIG.INSTANCE.HARDWARE_INFORMATION,
            languages: config_1.CONFIG.INSTANCE.LANGUAGES,
            categories: config_1.CONFIG.INSTANCE.CATEGORIES,
            isNSFW: config_1.CONFIG.INSTANCE.IS_NSFW,
            defaultNSFWPolicy: config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY,
            defaultClientRoute: config_1.CONFIG.INSTANCE.DEFAULT_CLIENT_ROUTE,
            customizations: {
                css: config_1.CONFIG.INSTANCE.CUSTOMIZATIONS.CSS,
                javascript: config_1.CONFIG.INSTANCE.CUSTOMIZATIONS.JAVASCRIPT
            }
        },
        theme: {
            default: config_1.CONFIG.THEME.DEFAULT
        },
        services: {
            twitter: {
                username: config_1.CONFIG.SERVICES.TWITTER.USERNAME,
                whitelisted: config_1.CONFIG.SERVICES.TWITTER.WHITELISTED
            }
        },
        cache: {
            previews: {
                size: config_1.CONFIG.CACHE.PREVIEWS.SIZE
            },
            captions: {
                size: config_1.CONFIG.CACHE.VIDEO_CAPTIONS.SIZE
            },
            torrents: {
                size: config_1.CONFIG.CACHE.TORRENTS.SIZE
            }
        },
        signup: {
            enabled: config_1.CONFIG.SIGNUP.ENABLED,
            limit: config_1.CONFIG.SIGNUP.LIMIT,
            requiresEmailVerification: config_1.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION,
            minimumAge: config_1.CONFIG.SIGNUP.MINIMUM_AGE
        },
        admin: {
            email: config_1.CONFIG.ADMIN.EMAIL
        },
        contactForm: {
            enabled: config_1.CONFIG.CONTACT_FORM.ENABLED
        },
        user: {
            videoQuota: config_1.CONFIG.USER.VIDEO_QUOTA,
            videoQuotaDaily: config_1.CONFIG.USER.VIDEO_QUOTA_DAILY
        },
        transcoding: {
            enabled: config_1.CONFIG.TRANSCODING.ENABLED,
            allowAdditionalExtensions: config_1.CONFIG.TRANSCODING.ALLOW_ADDITIONAL_EXTENSIONS,
            allowAudioFiles: config_1.CONFIG.TRANSCODING.ALLOW_AUDIO_FILES,
            threads: config_1.CONFIG.TRANSCODING.THREADS,
            concurrency: config_1.CONFIG.TRANSCODING.CONCURRENCY,
            profile: config_1.CONFIG.TRANSCODING.PROFILE,
            resolutions: {
                '0p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['0p'],
                '240p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['240p'],
                '360p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['360p'],
                '480p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['480p'],
                '720p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['720p'],
                '1080p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['1080p'],
                '1440p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['1440p'],
                '2160p': config_1.CONFIG.TRANSCODING.RESOLUTIONS['2160p']
            },
            webtorrent: {
                enabled: config_1.CONFIG.TRANSCODING.WEBTORRENT.ENABLED
            },
            hls: {
                enabled: config_1.CONFIG.TRANSCODING.HLS.ENABLED
            }
        },
        live: {
            enabled: config_1.CONFIG.LIVE.ENABLED,
            allowReplay: config_1.CONFIG.LIVE.ALLOW_REPLAY,
            maxDuration: config_1.CONFIG.LIVE.MAX_DURATION,
            maxInstanceLives: config_1.CONFIG.LIVE.MAX_INSTANCE_LIVES,
            maxUserLives: config_1.CONFIG.LIVE.MAX_USER_LIVES,
            transcoding: {
                enabled: config_1.CONFIG.LIVE.TRANSCODING.ENABLED,
                threads: config_1.CONFIG.LIVE.TRANSCODING.THREADS,
                profile: config_1.CONFIG.LIVE.TRANSCODING.PROFILE,
                resolutions: {
                    '240p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['240p'],
                    '360p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['360p'],
                    '480p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['480p'],
                    '720p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['720p'],
                    '1080p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['1080p'],
                    '1440p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['1440p'],
                    '2160p': config_1.CONFIG.LIVE.TRANSCODING.RESOLUTIONS['2160p']
                }
            }
        },
        import: {
            videos: {
                concurrency: config_1.CONFIG.IMPORT.VIDEOS.CONCURRENCY,
                http: {
                    enabled: config_1.CONFIG.IMPORT.VIDEOS.HTTP.ENABLED
                },
                torrent: {
                    enabled: config_1.CONFIG.IMPORT.VIDEOS.TORRENT.ENABLED
                }
            }
        },
        trending: {
            videos: {
                algorithms: {
                    enabled: config_1.CONFIG.TRENDING.VIDEOS.ALGORITHMS.ENABLED,
                    default: config_1.CONFIG.TRENDING.VIDEOS.ALGORITHMS.DEFAULT
                }
            }
        },
        autoBlacklist: {
            videos: {
                ofUsers: {
                    enabled: config_1.CONFIG.AUTO_BLACKLIST.VIDEOS.OF_USERS.ENABLED
                }
            }
        },
        followers: {
            instance: {
                enabled: config_1.CONFIG.FOLLOWERS.INSTANCE.ENABLED,
                manualApproval: config_1.CONFIG.FOLLOWERS.INSTANCE.MANUAL_APPROVAL
            }
        },
        followings: {
            instance: {
                autoFollowBack: {
                    enabled: config_1.CONFIG.FOLLOWINGS.INSTANCE.AUTO_FOLLOW_BACK.ENABLED
                },
                autoFollowIndex: {
                    enabled: config_1.CONFIG.FOLLOWINGS.INSTANCE.AUTO_FOLLOW_INDEX.ENABLED,
                    indexUrl: config_1.CONFIG.FOLLOWINGS.INSTANCE.AUTO_FOLLOW_INDEX.INDEX_URL
                }
            }
        },
        broadcastMessage: {
            enabled: config_1.CONFIG.BROADCAST_MESSAGE.ENABLED,
            message: config_1.CONFIG.BROADCAST_MESSAGE.MESSAGE,
            level: config_1.CONFIG.BROADCAST_MESSAGE.LEVEL,
            dismissable: config_1.CONFIG.BROADCAST_MESSAGE.DISMISSABLE
        },
        search: {
            remoteUri: {
                users: config_1.CONFIG.SEARCH.REMOTE_URI.USERS,
                anonymous: config_1.CONFIG.SEARCH.REMOTE_URI.ANONYMOUS
            },
            searchIndex: {
                enabled: config_1.CONFIG.SEARCH.SEARCH_INDEX.ENABLED,
                url: config_1.CONFIG.SEARCH.SEARCH_INDEX.URL,
                disableLocalSearch: config_1.CONFIG.SEARCH.SEARCH_INDEX.DISABLE_LOCAL_SEARCH,
                isDefaultSearch: config_1.CONFIG.SEARCH.SEARCH_INDEX.IS_DEFAULT_SEARCH
            }
        }
    };
}
function convertCustomConfigBody(body) {
    function keyConverter(k) {
        if (/^\d{3,4}p$/.exec(k))
            return k;
        if (k === '0p')
            return k;
        return lodash_1.snakeCase(k);
    }
    function valueConverter(v) {
        if (validator_1.default.isNumeric(v + ''))
            return parseInt('' + v, 10);
        return v;
    }
    return core_utils_1.objectConverter(body, keyConverter, valueConverter);
}
