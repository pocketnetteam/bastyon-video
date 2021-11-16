"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticRouter = void 0;
const tslib_1 = require("tslib");
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const path_1 = require("path");
const client_html_1 = require("@server/lib/client-html");
const server_config_manager_1 = require("@server/lib/server-config-manager");
const models_1 = require("@shared/models");
const core_utils_1 = require("../helpers/core-utils");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const theme_utils_1 = require("../lib/plugins/theme-utils");
const middlewares_1 = require("../middlewares");
const cache_1 = require("../middlewares/cache/cache");
const user_1 = require("../models/user/user");
const video_1 = require("../models/video/video");
const video_comment_1 = require("../models/video/video-comment");
const staticRouter = express_1.default.Router();
exports.staticRouter = staticRouter;
staticRouter.use(cors_1.default());
const torrentsPhysicalPath = config_1.CONFIG.STORAGE.TORRENTS_DIR;
staticRouter.use(constants_1.STATIC_PATHS.TORRENTS, express_1.default.static(torrentsPhysicalPath, { maxAge: 0 }));
staticRouter.use(constants_1.STATIC_PATHS.WEBSEED, express_1.default.static(config_1.CONFIG.STORAGE.VIDEOS_DIR, { fallthrough: false }));
staticRouter.use(constants_1.STATIC_PATHS.REDUNDANCY, express_1.default.static(config_1.CONFIG.STORAGE.REDUNDANCY_DIR, { fallthrough: false }));
staticRouter.use(constants_1.STATIC_PATHS.STREAMING_PLAYLISTS.HLS, cors_1.default(), express_1.default.static(constants_1.HLS_STREAMING_PLAYLIST_DIRECTORY, { fallthrough: false }));
const thumbnailsPhysicalPath = config_1.CONFIG.STORAGE.THUMBNAILS_DIR;
staticRouter.use(constants_1.STATIC_PATHS.THUMBNAILS, express_1.default.static(thumbnailsPhysicalPath, { maxAge: constants_1.STATIC_MAX_AGE.SERVER, fallthrough: false }));
staticRouter.get('/robots.txt', cache_1.cacheRoute(constants_1.ROUTE_CACHE_LIFETIME.ROBOTS), (_, res) => {
    res.type('text/plain');
    return res.send(config_1.CONFIG.INSTANCE.ROBOTS);
});
staticRouter.all('/teapot', getCup, middlewares_1.asyncMiddleware(client_html_1.serveIndexHTML));
staticRouter.get('/security.txt', (_, res) => {
    return res.redirect(models_1.HttpStatusCode.MOVED_PERMANENTLY_301, '/.well-known/security.txt');
});
staticRouter.get('/.well-known/security.txt', cache_1.cacheRoute(constants_1.ROUTE_CACHE_LIFETIME.SECURITYTXT), (_, res) => {
    res.type('text/plain');
    return res.send(config_1.CONFIG.INSTANCE.SECURITYTXT + config_1.CONFIG.INSTANCE.SECURITYTXT_CONTACT);
});
staticRouter.use('/.well-known/nodeinfo', cache_1.cacheRoute(constants_1.ROUTE_CACHE_LIFETIME.NODEINFO), (_, res) => {
    return res.json({
        links: [
            {
                rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0',
                href: constants_1.WEBSERVER.URL + '/nodeinfo/2.0.json'
            }
        ]
    });
});
staticRouter.use('/nodeinfo/:version.json', cache_1.cacheRoute(constants_1.ROUTE_CACHE_LIFETIME.NODEINFO), middlewares_1.asyncMiddleware(generateNodeinfo));
staticRouter.use('/.well-known/dnt-policy.txt', cache_1.cacheRoute(constants_1.ROUTE_CACHE_LIFETIME.DNT_POLICY), (_, res) => {
    res.type('text/plain');
    return res.sendFile(path_1.join(core_utils_1.root(), 'dist/server/static/dnt-policy/dnt-policy-1.0.txt'));
});
staticRouter.use('/.well-known/dnt/', (_, res) => {
    res.json({ tracking: 'N' });
});
staticRouter.use('/.well-known/change-password', (_, res) => {
    res.redirect('/my-account/settings');
});
staticRouter.use('/.well-known/host-meta', (_, res) => {
    res.type('application/xml');
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">\n' +
        `  <Link rel="lrdd" type="application/xrd+xml" template="${constants_1.WEBSERVER.URL}/.well-known/webfinger?resource={uri}"/>\n` +
        '</XRD>';
    res.send(xml).end();
});
function generateNodeinfo(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { totalVideos } = yield video_1.VideoModel.getStats();
        const { totalLocalVideoComments } = yield video_comment_1.VideoCommentModel.getStats();
        const { totalUsers, totalMonthlyActiveUsers, totalHalfYearActiveUsers } = yield user_1.UserModel.getStats();
        if (!req.params.version || req.params.version !== '2.0') {
            return res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Nodeinfo schema version not handled'
            });
        }
        const json = {
            version: '2.0',
            software: {
                name: 'peertube',
                version: constants_1.PEERTUBE_VERSION
            },
            protocols: [
                'activitypub'
            ],
            services: {
                inbound: [],
                outbound: [
                    'atom1.0',
                    'rss2.0'
                ]
            },
            openRegistrations: config_1.CONFIG.SIGNUP.ENABLED,
            usage: {
                users: {
                    total: totalUsers,
                    activeMonth: totalMonthlyActiveUsers,
                    activeHalfyear: totalHalfYearActiveUsers
                },
                localPosts: totalVideos,
                localComments: totalLocalVideoComments
            },
            metadata: {
                taxonomy: {
                    postsName: 'Videos'
                },
                nodeName: config_1.CONFIG.INSTANCE.NAME,
                nodeDescription: config_1.CONFIG.INSTANCE.SHORT_DESCRIPTION,
                nodeConfig: {
                    search: {
                        remoteUri: {
                            users: config_1.CONFIG.SEARCH.REMOTE_URI.USERS,
                            anonymous: config_1.CONFIG.SEARCH.REMOTE_URI.ANONYMOUS
                        }
                    },
                    plugin: {
                        registered: server_config_manager_1.ServerConfigManager.Instance.getRegisteredPlugins()
                    },
                    theme: {
                        registered: server_config_manager_1.ServerConfigManager.Instance.getRegisteredThemes(),
                        default: theme_utils_1.getThemeOrDefault(config_1.CONFIG.THEME.DEFAULT, constants_1.DEFAULT_THEME_NAME)
                    },
                    email: {
                        enabled: config_1.isEmailEnabled()
                    },
                    contactForm: {
                        enabled: config_1.CONFIG.CONTACT_FORM.ENABLED
                    },
                    transcoding: {
                        hls: {
                            enabled: config_1.CONFIG.TRANSCODING.HLS.ENABLED
                        },
                        webtorrent: {
                            enabled: config_1.CONFIG.TRANSCODING.WEBTORRENT.ENABLED
                        },
                        enabledResolutions: server_config_manager_1.ServerConfigManager.Instance.getEnabledResolutions('vod')
                    },
                    live: {
                        enabled: config_1.CONFIG.LIVE.ENABLED,
                        transcoding: {
                            enabled: config_1.CONFIG.LIVE.TRANSCODING.ENABLED,
                            enabledResolutions: server_config_manager_1.ServerConfigManager.Instance.getEnabledResolutions('live')
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
                            intervalDays: config_1.CONFIG.TRENDING.VIDEOS.INTERVAL_DAYS
                        }
                    },
                    tracker: {
                        enabled: config_1.CONFIG.TRACKER.ENABLED
                    }
                }
            }
        };
        res.contentType('application/json; profile="http://nodeinfo.diaspora.software/ns/schema/2.0#"')
            .send(json)
            .end();
    });
}
function getCup(req, res, next) {
    res.status(models_1.HttpStatusCode.I_AM_A_TEAPOT_418);
    res.setHeader('Accept-Additions', 'Non-Dairy;1,Sugar;1');
    res.setHeader('Safe', 'if-sepia-awake');
    return next();
}
