"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
function testEndpoints(server, token, filter, expectedStatus) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const paths = [
            '/api/v1/video-channels/root_channel/videos',
            '/api/v1/accounts/root/videos',
            '/api/v1/videos',
            '/api/v1/search/videos'
        ];
        for (const path of paths) {
            yield (0, extra_utils_1.makeGetRequest)({
                url: server.url,
                path,
                token,
                query: {
                    filter
                },
                expectedStatus
            });
        }
    });
}
describe('Test video filters validators', function () {
    let server;
    let userAccessToken;
    let moderatorAccessToken;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield (0, extra_utils_1.setDefaultVideoChannel)([server]);
            const user = { username: 'user1', password: 'my super password' };
            yield server.users.create({ username: user.username, password: user.password });
            userAccessToken = yield server.login.getAccessToken(user);
            const moderator = { username: 'moderator', password: 'my super password' };
            yield server.users.create({ username: moderator.username, password: moderator.password, role: models_1.UserRole.MODERATOR });
            moderatorAccessToken = yield server.login.getAccessToken(moderator);
        });
    });
    describe('When setting a video filter', function () {
        it('Should fail with a bad filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield testEndpoints(server, server.accessToken, 'bad-filter', models_1.HttpStatusCode.BAD_REQUEST_400);
            });
        });
        it('Should succeed with a good filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield testEndpoints(server, server.accessToken, 'local', models_1.HttpStatusCode.OK_200);
            });
        });
        it('Should fail to list all-local/all with a simple user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield testEndpoints(server, userAccessToken, 'all-local', models_1.HttpStatusCode.UNAUTHORIZED_401);
                yield testEndpoints(server, userAccessToken, 'all', models_1.HttpStatusCode.UNAUTHORIZED_401);
            });
        });
        it('Should succeed to list all-local/all with a moderator', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield testEndpoints(server, moderatorAccessToken, 'all-local', models_1.HttpStatusCode.OK_200);
                yield testEndpoints(server, moderatorAccessToken, 'all', models_1.HttpStatusCode.OK_200);
            });
        });
        it('Should succeed to list all-local/all with an admin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield testEndpoints(server, server.accessToken, 'all-local', models_1.HttpStatusCode.OK_200);
                yield testEndpoints(server, server.accessToken, 'all', models_1.HttpStatusCode.OK_200);
            });
        });
        it('Should fail on the feeds endpoint with the all-local/all filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const filter of ['all', 'all-local']) {
                    yield (0, extra_utils_1.makeGetRequest)({
                        url: server.url,
                        path: '/feeds/videos.json',
                        expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401,
                        query: {
                            filter
                        }
                    });
                }
            });
        });
        it('Should succeed on the feeds endpoint with the local filter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: '/feeds/videos.json',
                    expectedStatus: models_1.HttpStatusCode.OK_200,
                    query: {
                        filter: 'local'
                    }
                });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
