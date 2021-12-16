"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test config API validators', function () {
    const path = '/api/v1/config/custom';
    let server;
    let userAccessToken;
    const updateParams = {
        instance: {
            name: 'PeerTube updated',
            shortDescription: 'my short description',
            description: 'my super description',
            terms: 'my super terms',
            codeOfConduct: 'my super coc',
            creationReason: 'my super reason',
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
            enabled: false
        },
        user: {
            videoQuota: 5242881,
            videoQuotaDaily: 318742
        },
        transcoding: {
            enabled: true,
            allowAdditionalExtensions: true,
            allowAudioFiles: true,
            concurrency: 1,
            threads: 1,
            profile: 'vod_profile',
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
            maxDuration: 30,
            maxInstanceLives: -1,
            maxUserLives: 50,
            transcoding: {
                enabled: true,
                threads: 4,
                profile: 'live_profile',
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
                concurrency: 1,
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
                    default: 'most-viewed'
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
                enabled: false,
                manualApproval: true
            }
        },
        followings: {
            instance: {
                autoFollowBack: {
                    enabled: true
                },
                autoFollowIndex: {
                    enabled: true,
                    indexUrl: 'https://index.example.com'
                }
            }
        },
        broadcastMessage: {
            enabled: true,
            dismissable: true,
            message: 'super message',
            level: 'warning'
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
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            const user = {
                username: 'user1',
                password: 'password'
            };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
        });
    });
    describe('When getting the configuration', function () {
        it('Should fail without token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
    });
    describe('When updating the configuration', function () {
        it('Should fail without token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: updateParams,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: updateParams,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should fail if it misses a key', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const newUpdateParams = lodash_1.omit(updateParams, 'admin.email');
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: newUpdateParams,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a bad default NSFW policy', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const newUpdateParams = Object.assign(Object.assign({}, updateParams), { instance: {
                        defaultNSFWPolicy: 'hello'
                    } });
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: newUpdateParams,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail if email disabled and signup requires email verification', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const newUpdateParams = Object.assign(Object.assign({}, updateParams), { signup: {
                        enabled: true,
                        limit: 5,
                        requiresEmailVerification: true
                    } });
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: newUpdateParams,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should fail with a disabled webtorrent & hls transcoding', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const newUpdateParams = Object.assign(Object.assign({}, updateParams), { transcoding: {
                        hls: {
                            enabled: false
                        },
                        webtorrent: {
                            enabled: false
                        }
                    } });
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: newUpdateParams,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path,
                    fields: updateParams,
                    token: server.accessToken,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When deleting the configuration', function () {
        it('Should fail without token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if the user is not an administrator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeDeleteRequest({
                    url: server.url,
                    path,
                    token: userAccessToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
