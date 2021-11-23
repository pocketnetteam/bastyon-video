"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test application behind a reverse proxy', function () {
    let server;
    let videoId;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const config = {
                rates_limit: {
                    api: {
                        max: 50,
                        window: 5000
                    },
                    signup: {
                        max: 3,
                        window: 5000
                    },
                    login: {
                        max: 20
                    }
                },
                signup: {
                    limit: 20
                }
            };
            server = yield (0, extra_utils_1.createSingleServer)(1, config);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const { uuid } = yield server.videos.upload();
            videoId = uuid;
        });
    });
    it('Should view a video only once with the same IP by default', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield server.videos.view({ id: videoId });
            yield server.videos.view({ id: videoId });
            yield (0, extra_utils_1.wait)(8000);
            const video = yield server.videos.get({ id: videoId });
            (0, chai_1.expect)(video.views).to.equal(1);
        });
    });
    it('Should view a video 2 times with the X-Forwarded-For header set', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield server.videos.view({ id: videoId, xForwardedFor: '0.0.0.1,127.0.0.1' });
            yield server.videos.view({ id: videoId, xForwardedFor: '0.0.0.2,127.0.0.1' });
            yield (0, extra_utils_1.wait)(8000);
            const video = yield server.videos.get({ id: videoId });
            (0, chai_1.expect)(video.views).to.equal(3);
        });
    });
    it('Should view a video only once with the same client IP in the X-Forwarded-For header', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield server.videos.view({ id: videoId, xForwardedFor: '0.0.0.4,0.0.0.3,::ffff:127.0.0.1' });
            yield server.videos.view({ id: videoId, xForwardedFor: '0.0.0.5,0.0.0.3,127.0.0.1' });
            yield (0, extra_utils_1.wait)(8000);
            const video = yield server.videos.get({ id: videoId });
            (0, chai_1.expect)(video.views).to.equal(4);
        });
    });
    it('Should view a video two times with a different client IP in the X-Forwarded-For header', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield server.videos.view({ id: videoId, xForwardedFor: '0.0.0.8,0.0.0.6,127.0.0.1' });
            yield server.videos.view({ id: videoId, xForwardedFor: '0.0.0.8,0.0.0.7,127.0.0.1' });
            yield (0, extra_utils_1.wait)(8000);
            const video = yield server.videos.get({ id: videoId });
            (0, chai_1.expect)(video.views).to.equal(6);
        });
    });
    it('Should rate limit logins', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = { username: 'root', password: 'fail' };
            for (let i = 0; i < 19; i++) {
                yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            }
            yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.TOO_MANY_REQUESTS_429 });
        });
    });
    it('Should rate limit signup', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (let i = 0; i < 10; i++) {
                try {
                    yield server.users.register({ username: 'test' + i });
                }
                catch (_a) {
                }
            }
            yield server.users.register({ username: 'test42', expectedStatus: models_1.HttpStatusCode.TOO_MANY_REQUESTS_429 });
        });
    });
    it('Should not rate limit failed signup', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield (0, extra_utils_1.wait)(7000);
            for (let i = 0; i < 3; i++) {
                yield server.users.register({ username: 'test' + i, expectedStatus: models_1.HttpStatusCode.CONFLICT_409 });
            }
            yield server.users.register({ username: 'test43', expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
        });
    });
    it('Should rate limit API calls', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield (0, extra_utils_1.wait)(7000);
            for (let i = 0; i < 100; i++) {
                try {
                    yield server.videos.get({ id: videoId });
                }
                catch (_a) {
                }
            }
            yield server.videos.get({ id: videoId, expectedStatus: models_1.HttpStatusCode.TOO_MANY_REQUESTS_429 });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
