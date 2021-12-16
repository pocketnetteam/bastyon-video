"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCommand = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class ConfigCommand extends shared_1.AbstractCommand {
    static getCustomConfigResolutions(enabled) {
        return {
            '240p': enabled,
            '360p': enabled,
            '480p': enabled,
            '720p': enabled,
            '1080p': enabled,
            '1440p': enabled,
            '2160p': enabled
        };
    }
    enableImports() {
        return this.updateExistingSubConfig({
            newConfig: {
                import: {
                    videos: {
                        http: {
                            enabled: true
                        },
                        torrent: {
                            enabled: true
                        }
                    }
                }
            }
        });
    }
    enableLive(options = {}) {
        var _a, _b;
        return this.updateExistingSubConfig({
            newConfig: {
                live: {
                    enabled: true,
                    allowReplay: (_a = options.allowReplay) !== null && _a !== void 0 ? _a : true,
                    transcoding: {
                        enabled: (_b = options.transcoding) !== null && _b !== void 0 ? _b : true,
                        resolutions: ConfigCommand.getCustomConfigResolutions(true)
                    }
                }
            }
        });
    }
    disableTranscoding() {
        return this.updateExistingSubConfig({
            newConfig: {
                transcoding: {
                    enabled: false
                }
            }
        });
    }
    enableTranscoding(webtorrent = true, hls = true) {
        return this.updateExistingSubConfig({
            newConfig: {
                transcoding: {
                    enabled: true,
                    resolutions: ConfigCommand.getCustomConfigResolutions(true),
                    webtorrent: {
                        enabled: webtorrent
                    },
                    hls: {
                        enabled: hls
                    }
                }
            }
        });
    }
    getConfig(options = {}) {
        const path = '/api/v1/config';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getAbout(options = {}) {
        const path = '/api/v1/config/about';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getCustomConfig(options = {}) {
        const path = '/api/v1/config/custom';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    updateCustomConfig(options) {
        const path = '/api/v1/config/custom';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: options.newCustomConfig, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    deleteCustomConfig(options = {}) {
        const path = '/api/v1/config/custom';
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    updateExistingSubConfig(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const existing = yield this.getCustomConfig(options);
            return this.updateCustomConfig(Object.assign(Object.assign({}, options), { newCustomConfig: lodash_1.merge({}, existing, options.newConfig) }));
        });
    }
    updateCustomSubConfig(options) {
        const newCustomConfig = {
            instance: {
                name: 'PeerTube updated',
                shortDescription: 'my short description',
                description: 'my super description',
                terms: 'my super terms',
                codeOfConduct: 'my super coc',
                creationReason: 'my super creation reason',
                moderationInformation: 'my super moderation information',
                administrator: 'Kuja',
                maintenanceLifetime: 'forever',
                businessModel: 'my super business model',
                hardwareInformation: '2vCore 3GB RAM',
                languages: ['en', 'es'],
                categories: [1, 2],
                isNSFW: true,
                defaultNSFWPolicy: 'blur',
                defaultClientRoute: '/videos/recently-added',
                customizations: {
                    javascript: 'alert("coucou")',
                    css: 'body { background-color: red; }'
                }
            },
            theme: {
                default: 'default'
            },
            services: {
                twitter: {
                    username: '@MySuperUsername',
                    whitelisted: true
                }
            },
            cache: {
                previews: {
                    size: 2
                },
                captions: {
                    size: 3
                },
                torrents: {
                    size: 4
                }
            },
            signup: {
                enabled: false,
                limit: 5,
                requiresEmailVerification: false,
                minimumAge: 16
            },
            admin: {
                email: 'superadmin1@example.com'
            },
            contactForm: {
                enabled: true
            },
            user: {
                videoQuota: 5242881,
                videoQuotaDaily: 318742
            },
            transcoding: {
                enabled: true,
                allowAdditionalExtensions: true,
                allowAudioFiles: true,
                threads: 1,
                concurrency: 3,
                profile: 'default',
                resolutions: {
                    '0p': false,
                    '240p': false,
                    '360p': true,
                    '480p': true,
                    '720p': false,
                    '1080p': false,
                    '1440p': false,
                    '2160p': false
                },
                webtorrent: {
                    enabled: true
                },
                hls: {
                    enabled: false
                }
            },
            live: {
                enabled: true,
                allowReplay: false,
                maxDuration: -1,
                maxInstanceLives: -1,
                maxUserLives: 50,
                transcoding: {
                    enabled: true,
                    threads: 4,
                    profile: 'default',
                    resolutions: {
                        '240p': true,
                        '360p': true,
                        '480p': true,
                        '720p': true,
                        '1080p': true,
                        '1440p': true,
                        '2160p': true
                    }
                }
            },
            import: {
                videos: {
                    concurrency: 3,
                    http: {
                        enabled: false
                    },
                    torrent: {
                        enabled: false
                    }
                }
            },
            trending: {
                videos: {
                    algorithms: {
                        enabled: ['best', 'hot', 'most-viewed', 'most-liked'],
                        default: 'hot'
                    }
                }
            },
            autoBlacklist: {
                videos: {
                    ofUsers: {
                        enabled: false
                    }
                }
            },
            followers: {
                instance: {
                    enabled: true,
                    manualApproval: false
                }
            },
            followings: {
                instance: {
                    autoFollowBack: {
                        enabled: false
                    },
                    autoFollowIndex: {
                        indexUrl: 'https://instances.joinpeertube.org/api/v1/instances/hosts',
                        enabled: false
                    }
                }
            },
            broadcastMessage: {
                enabled: true,
                level: 'warning',
                message: 'hello',
                dismissable: true
            },
            search: {
                remoteUri: {
                    users: true,
                    anonymous: true
                },
                searchIndex: {
                    enabled: true,
                    url: 'https://search.joinpeertube.org',
                    disableLocalSearch: true,
                    isDefaultSearch: true
                }
            }
        };
        lodash_1.merge(newCustomConfig, options.newConfig);
        return this.updateCustomConfig(Object.assign(Object.assign({}, options), { newCustomConfig }));
    }
}
exports.ConfigCommand = ConfigCommand;
