"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConfigManager = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("@server/helpers/utils");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const signup_1 = require("@server/lib/signup");
const actor_custom_page_1 = require("@server/models/account/actor-custom-page");
const hooks_1 = require("./plugins/hooks");
const plugin_manager_1 = require("./plugins/plugin-manager");
const theme_utils_1 = require("./plugins/theme-utils");
const video_transcoding_profiles_1 = require("./transcoding/video-transcoding-profiles");
class ServerConfigManager {
    constructor() {
        this.homepageEnabled = false;
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const instanceHomepage = yield actor_custom_page_1.ActorCustomPageModel.loadInstanceHomepage();
            this.updateHomepageState(instanceHomepage === null || instanceHomepage === void 0 ? void 0 : instanceHomepage.content);
        });
    }
    updateHomepageState(content) {
        this.homepageEnabled = !!content;
    }
    getHTMLServerConfig() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.serverCommit === undefined)
                this.serverCommit = yield utils_1.getServerCommit();
            const defaultTheme = theme_utils_1.getThemeOrDefault(config_1.CONFIG.THEME.DEFAULT, constants_1.DEFAULT_THEME_NAME);
            return {
                instance: {
                    name: config_1.CONFIG.INSTANCE.NAME,
                    shortDescription: config_1.CONFIG.INSTANCE.SHORT_DESCRIPTION,
                    isNSFW: config_1.CONFIG.INSTANCE.IS_NSFW,
                    defaultNSFWPolicy: config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY,
                    defaultClientRoute: config_1.CONFIG.INSTANCE.DEFAULT_CLIENT_ROUTE,
                    customizations: {
                        javascript: config_1.CONFIG.INSTANCE.CUSTOMIZATIONS.JAVASCRIPT,
                        css: config_1.CONFIG.INSTANCE.CUSTOMIZATIONS.CSS
                    }
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
                },
                plugin: {
                    registered: this.getRegisteredPlugins(),
                    registeredExternalAuths: this.getExternalAuthsPlugins(),
                    registeredIdAndPassAuths: this.getIdAndPassAuthPlugins()
                },
                theme: {
                    registered: this.getRegisteredThemes(),
                    default: defaultTheme
                },
                email: {
                    enabled: config_1.isEmailEnabled()
                },
                contactForm: {
                    enabled: config_1.CONFIG.CONTACT_FORM.ENABLED
                },
                serverVersion: constants_1.PEERTUBE_VERSION,
                serverCommit: this.serverCommit,
                transcoding: {
                    hls: {
                        enabled: config_1.CONFIG.TRANSCODING.HLS.ENABLED
                    },
                    webtorrent: {
                        enabled: config_1.CONFIG.TRANSCODING.WEBTORRENT.ENABLED
                    },
                    enabledResolutions: this.getEnabledResolutions('vod'),
                    profile: config_1.CONFIG.TRANSCODING.PROFILE,
                    availableProfiles: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableProfiles('vod')
                },
                live: {
                    enabled: config_1.CONFIG.LIVE.ENABLED,
                    allowReplay: config_1.CONFIG.LIVE.ALLOW_REPLAY,
                    maxDuration: config_1.CONFIG.LIVE.MAX_DURATION,
                    maxInstanceLives: config_1.CONFIG.LIVE.MAX_INSTANCE_LIVES,
                    maxUserLives: config_1.CONFIG.LIVE.MAX_USER_LIVES,
                    transcoding: {
                        enabled: config_1.CONFIG.LIVE.TRANSCODING.ENABLED,
                        enabledResolutions: this.getEnabledResolutions('live'),
                        profile: config_1.CONFIG.LIVE.TRANSCODING.PROFILE,
                        availableProfiles: video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.getAvailableProfiles('live')
                    },
                    rtmp: {
                        port: config_1.CONFIG.LIVE.RTMP.PORT
                    }
                },
                import: {
                    videos: {
                        http: {
                            enabled: config_1.CONFIG.IMPORT.VIDEOS.HTTP.ENABLED
                        },
                        torrent: {
                            enabled: config_1.CONFIG.IMPORT.VIDEOS.TORRENT.ENABLED
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
                avatar: {
                    file: {
                        size: {
                            max: constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.FILE_SIZE.max
                        },
                        extensions: constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.EXTNAME
                    }
                },
                banner: {
                    file: {
                        size: {
                            max: constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.FILE_SIZE.max
                        },
                        extensions: constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.EXTNAME
                    }
                },
                video: {
                    image: {
                        extensions: constants_1.CONSTRAINTS_FIELDS.VIDEOS.IMAGE.EXTNAME,
                        size: {
                            max: constants_1.CONSTRAINTS_FIELDS.VIDEOS.IMAGE.FILE_SIZE.max
                        }
                    },
                    file: {
                        extensions: constants_1.CONSTRAINTS_FIELDS.VIDEOS.EXTNAME
                    }
                },
                videoCaption: {
                    file: {
                        size: {
                            max: constants_1.CONSTRAINTS_FIELDS.VIDEO_CAPTIONS.CAPTION_FILE.FILE_SIZE.max
                        },
                        extensions: constants_1.CONSTRAINTS_FIELDS.VIDEO_CAPTIONS.CAPTION_FILE.EXTNAME
                    }
                },
                user: {
                    videoQuota: config_1.CONFIG.USER.VIDEO_QUOTA,
                    videoQuotaDaily: config_1.CONFIG.USER.VIDEO_QUOTA_DAILY
                },
                trending: {
                    videos: {
                        intervalDays: config_1.CONFIG.TRENDING.VIDEOS.INTERVAL_DAYS,
                        algorithms: {
                            enabled: config_1.CONFIG.TRENDING.VIDEOS.ALGORITHMS.ENABLED,
                            default: config_1.CONFIG.TRENDING.VIDEOS.ALGORITHMS.DEFAULT
                        }
                    }
                },
                tracker: {
                    enabled: config_1.CONFIG.TRACKER.ENABLED
                },
                followings: {
                    instance: {
                        autoFollowIndex: {
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
                homepage: {
                    enabled: this.homepageEnabled
                }
            };
        });
    }
    getServerConfig(ip) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { allowed } = yield hooks_1.Hooks.wrapPromiseFun(signup_1.isSignupAllowed, {
                ip
            }, 'filter:api.user.signup.allowed.result');
            const allowedForCurrentIP = signup_1.isSignupAllowedForCurrentIP(ip);
            const signup = {
                allowed,
                allowedForCurrentIP,
                minimumAge: config_1.CONFIG.SIGNUP.MINIMUM_AGE,
                requiresEmailVerification: config_1.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION
            };
            const htmlConfig = yield this.getHTMLServerConfig();
            return Object.assign(Object.assign({}, htmlConfig), { signup });
        });
    }
    getRegisteredThemes() {
        return plugin_manager_1.PluginManager.Instance.getRegisteredThemes()
            .map(t => ({
            name: t.name,
            version: t.version,
            description: t.description,
            css: t.css,
            clientScripts: t.clientScripts
        }));
    }
    getRegisteredPlugins() {
        return plugin_manager_1.PluginManager.Instance.getRegisteredPlugins()
            .map(p => ({
            name: p.name,
            version: p.version,
            description: p.description,
            clientScripts: p.clientScripts
        }));
    }
    getEnabledResolutions(type) {
        const transcoding = type === 'vod'
            ? config_1.CONFIG.TRANSCODING
            : config_1.CONFIG.LIVE.TRANSCODING;
        return Object.keys(transcoding.RESOLUTIONS)
            .filter(key => transcoding.ENABLED && transcoding.RESOLUTIONS[key] === true)
            .map(r => parseInt(r, 10));
    }
    getIdAndPassAuthPlugins() {
        const result = [];
        for (const p of plugin_manager_1.PluginManager.Instance.getIdAndPassAuths()) {
            for (const auth of p.idAndPassAuths) {
                result.push({
                    npmName: p.npmName,
                    name: p.name,
                    version: p.version,
                    authName: auth.authName,
                    weight: auth.getWeight()
                });
            }
        }
        return result;
    }
    getExternalAuthsPlugins() {
        const result = [];
        for (const p of plugin_manager_1.PluginManager.Instance.getExternalAuths()) {
            for (const auth of p.externalAuths) {
                result.push({
                    npmName: p.npmName,
                    name: p.name,
                    version: p.version,
                    authName: auth.authName,
                    authDisplayName: auth.authDisplayName()
                });
            }
        }
        return result;
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.ServerConfigManager = ServerConfigManager;
