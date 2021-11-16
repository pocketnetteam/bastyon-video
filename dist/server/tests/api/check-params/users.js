"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test users API validators', function () {
    const path = '/api/v1/users/';
    let userId;
    let rootId;
    let moderatorId;
    let video;
    let server;
    let serverWithRegistrationDisabled;
    let userToken = '';
    let moderatorToken = '';
    let emailPort;
    let overrideConfig;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            const emails = [];
            emailPort = yield extra_utils_1.MockSmtpServer.Instance.collectEmails(emails);
            overrideConfig = { signup: { limit: 8 } };
            {
                const res = yield Promise.all([
                    extra_utils_1.createSingleServer(1, overrideConfig),
                    extra_utils_1.createSingleServer(2)
                ]);
                server = res[0];
                serverWithRegistrationDisabled = res[1];
                yield extra_utils_1.setAccessTokensToServers([server]);
            }
            {
                const user = { username: 'user1' };
                yield server.users.create(Object.assign({}, user));
                userToken = yield server.login.getAccessToken(user);
            }
            {
                const moderator = { username: 'moderator1' };
                yield server.users.create(Object.assign(Object.assign({}, moderator), { role: models_1.UserRole.MODERATOR }));
                moderatorToken = yield server.login.getAccessToken(moderator);
            }
            {
                const moderator = { username: 'moderator2' };
                yield server.users.create(Object.assign(Object.assign({}, moderator), { role: models_1.UserRole.MODERATOR }));
            }
            {
                video = yield server.videos.upload();
            }
            {
                const { data } = yield server.users.list();
                userId = data.find(u => u.username === 'user1').id;
                rootId = data.find(u => u.username === 'root').id;
                moderatorId = data.find(u => u.username === 'moderator2').id;
            }
        });
    });
    describe('When listing users', function () {
        it('Should fail with a bad start pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadStartPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadCountPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadSortPagination(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: userToken,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
    });
    describe('When adding a new user', function () {
        const baseCorrectParams = {
            username: 'user2',
            email: 'test@example.com',
            password: 'my super password',
            videoQuota: -1,
            videoQuotaDaily: -1,
            role: models_1.UserRole.USER,
            adminFlags: 1
        };
        it('Should fail with a too small username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: '' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too long username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'super'.repeat(50) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a not lowercase username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'Toto' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'my username' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a missing email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'email');
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { email: 'test_example.com' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too small password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { password: 'bla' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too long password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { password: 'super'.repeat(61) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with empty password and no smtp configured', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { password: '' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should succeed with no password on a server with smtp enabled', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield extra_utils_1.killallServers([server]);
                const config = Object.assign(Object.assign({}, overrideConfig), { smtp: {
                        hostname: 'localhost',
                        port: emailPort
                    } });
                yield server.run(config);
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { password: '', username: 'create_password', email: 'create_password@example.com' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should fail with invalid admin flags', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { adminFlags: 'toto' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: 'super token',
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail if we add a user with the same username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'user1' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should fail if we add a user with the same email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { email: 'user1@example.com' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should fail without a videoQuota', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'videoQuota');
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail without a videoQuotaDaily', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'videoQuotaDaily');
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid videoQuota', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { videoQuota: -5 });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid videoQuotaDaily', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { videoQuotaDaily: -7 });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail without a user role', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'role');
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid user role', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { role: 88989 });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with a "peertube" username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'peertube' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should fail to create a moderator or an admin with a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const role of [models_1.UserRole.MODERATOR, models_1.UserRole.ADMINISTRATOR]) {
                    const fields = Object.assign(Object.assign({}, baseCorrectParams), { role });
                    yield extra_utils_1.makePostBodyRequest({
                        url: server.url,
                        path,
                        token: moderatorToken,
                        fields,
                        expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                    });
                }
            });
        });
        it('Should succeed to create a user with a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'a4656', email: 'a4656@example.com', role: models_1.UserRole.USER });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: moderatorToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields: baseCorrectParams,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = { username: 'user1' };
                userToken = yield server.login.getAccessToken(user);
                const fields = {
                    username: 'user3',
                    email: 'test@example.com',
                    password: 'my super password',
                    videoQuota: 42000000
                };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: userToken, fields, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
    });
    describe('When updating my account', function () {
        it('Should fail with an invalid email attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    email: 'blabla'
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: server.accessToken, fields });
            });
        });
        it('Should fail with a too small password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'bla'
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with a too long password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'super'.repeat(61)
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail without the current password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'super'.repeat(61)
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an invalid current password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'my super password fail',
                    password: 'super'.repeat(61)
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + 'me',
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with an invalid NSFW policy attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    nsfwPolicy: 'hello'
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an invalid autoPlayVideo attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    autoPlayVideo: -1
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an invalid autoPlayNextVideo attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    autoPlayNextVideo: -1
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an invalid videosHistoryEnabled attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    videosHistoryEnabled: -1
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'my super password'
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + 'me',
                    token: 'super token',
                    fields,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a too long description', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    description: 'super'.repeat(201)
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an invalid videoLanguages attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const fields = {
                        videoLanguages: 'toto'
                    };
                    yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
                }
                {
                    const languages = [];
                    for (let i = 0; i < 1000; i++) {
                        languages.push('fr');
                    }
                    const fields = {
                        videoLanguages: languages
                    };
                    yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
                }
            });
        });
        it('Should fail with an invalid theme', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { theme: 'invalid' };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with an unknown theme', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { theme: 'peertube-theme-unknown' };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
            });
        });
        it('Should fail with invalid no modal attributes', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const keys = [
                    'noInstanceConfigWarningModal',
                    'noAccountSetupWarningModal',
                    'noWelcomeModal'
                ];
                for (const key of keys) {
                    const fields = {
                        [key]: -1
                    };
                    yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + 'me', token: userToken, fields });
                }
            });
        });
        it('Should succeed to change password with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'my super password',
                    nsfwPolicy: 'blur',
                    autoPlayVideo: false,
                    email: 'super_email@example.com',
                    theme: 'default',
                    noInstanceConfigWarningModal: true,
                    noWelcomeModal: true,
                    noAccountSetupWarningModal: true
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + 'me',
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
        it('Should succeed without password change with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    nsfwPolicy: 'blur',
                    autoPlayVideo: false
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + 'me',
                    token: userToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When updating my avatar', function () {
        it('Should fail without an incorrect input file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                const attaches = {
                    avatarfile: extra_utils_1.buildAbsoluteFixturePath('video_short.mp4')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path: path + '/me/avatar/pick', token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with a big file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                const attaches = {
                    avatarfile: extra_utils_1.buildAbsoluteFixturePath('avatar-big.png')
                };
                yield extra_utils_1.makeUploadRequest({ url: server.url, path: path + '/me/avatar/pick', token: server.accessToken, fields, attaches });
            });
        });
        it('Should fail with an unauthenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                const attaches = {
                    avatarfile: extra_utils_1.buildAbsoluteFixturePath('avatar.png')
                };
                yield extra_utils_1.makeUploadRequest({
                    url: server.url,
                    path: path + '/me/avatar/pick',
                    fields,
                    attaches,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                const attaches = {
                    avatarfile: extra_utils_1.buildAbsoluteFixturePath('avatar.png')
                };
                yield extra_utils_1.makeUploadRequest({
                    url: server.url,
                    path: path + '/me/avatar/pick',
                    token: server.accessToken,
                    fields,
                    attaches,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When managing my scoped tokens', function () {
        it('Should fail to get my scoped tokens with an non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyScopedTokens({ token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail to get my scoped tokens with a bad token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyScopedTokens({ token: 'bad', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should succeed to get my scoped tokens', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyScopedTokens();
            });
        });
        it('Should fail to renew my scoped tokens with an non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.renewMyScopedTokens({ token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail to renew my scoped tokens with a bad token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.renewMyScopedTokens({ token: 'bad', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should succeed to renew my scoped tokens', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.renewMyScopedTokens();
            });
        });
    });
    describe('When getting a user', function () {
        it('Should fail with an non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path: path + userId,
                    token: 'super token',
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with a non admin user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: server.url, path, token: userToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: server.url, path: path + userId, token: server.accessToken, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When updating a user', function () {
        it('Should fail with an invalid email attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    email: 'blabla'
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + userId, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid emailVerified attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    emailVerified: 'yes'
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + userId, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid videoQuota attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    videoQuota: -90
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + userId, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid user role attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    role: 54878
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + userId, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too small password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'bla'
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + userId, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too long password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    currentPassword: 'password',
                    password: 'super'.repeat(61)
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + userId, token: server.accessToken, fields });
            });
        });
        it('Should fail with an non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    videoQuota: 42
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + userId,
                    token: 'super token',
                    fields,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail when updating root role', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    role: models_1.UserRole.MODERATOR
                };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path: path + rootId, token: server.accessToken, fields });
            });
        });
        it('Should fail with invalid admin flags', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { adminFlags: 'toto' };
                yield extra_utils_1.makePutBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail to update an admin with a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    videoQuota: 42
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + moderatorId,
                    token: moderatorToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should succeed to update a user with a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    videoQuota: 42
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + userId,
                    token: moderatorToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    email: 'email@example.com',
                    emailVerified: true,
                    videoQuota: 42,
                    role: models_1.UserRole.USER
                };
                yield extra_utils_1.makePutBodyRequest({
                    url: server.url,
                    path: path + userId,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When getting my information', function () {
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyInfo({ token: 'fake_token', expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should success with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyInfo({ token: userToken });
            });
        });
    });
    describe('When getting my video rating', function () {
        let command;
        before(function () {
            command = server.users;
        });
        it('Should fail with a non authenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.getMyRating({ token: 'fake_token', videoId: video.id, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with an incorrect video uuid', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.getMyRating({ videoId: 'blabla', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with an unknown video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.getMyRating({ videoId: '4da6fde3-88f7-4d16-b119-108df5630b06', expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.getMyRating({ videoId: video.id });
                yield command.getMyRating({ videoId: video.uuid });
                yield command.getMyRating({ videoId: video.shortUUID });
            });
        });
    });
    describe('When retrieving my global ratings', function () {
        const path = '/api/v1/accounts/user1/ratings';
        it('Should fail with a bad start pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadStartPagination(server.url, path, userToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadCountPagination(server.url, path, userToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkBadSortPagination(server.url, path, userToken);
            });
        });
        it('Should fail with a unauthenticated user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: server.url, path, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should fail with a another user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: server.url, path, token: server.accessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a bad type', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    path,
                    token: userToken,
                    query: { rating: 'toto ' },
                    expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: server.url, path, token: userToken, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When blocking/unblocking/removing user', function () {
        it('Should fail with an incorrect id', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const options = { userId: 'blabla', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 };
                yield server.users.remove(options);
                yield server.users.banUser({ userId: 'blabla', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                yield server.users.unbanUser({ userId: 'blabla', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with the root user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const options = { userId: rootId, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 };
                yield server.users.remove(options);
                yield server.users.banUser(options);
                yield server.users.unbanUser(options);
            });
        });
        it('Should return 404 with a non existing id', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const options = { userId: 4545454, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 };
                yield server.users.remove(options);
                yield server.users.banUser(options);
                yield server.users.unbanUser(options);
            });
        });
        it('Should fail with a non admin user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const options = { userId, token: userToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 };
                yield server.users.remove(options);
                yield server.users.banUser(options);
                yield server.users.unbanUser(options);
            });
        });
        it('Should fail on a moderator with a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const options = { userId: moderatorId, token: moderatorToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 };
                yield server.users.remove(options);
                yield server.users.banUser(options);
                yield server.users.unbanUser(options);
            });
        });
        it('Should succeed on a user with a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const options = { userId, token: moderatorToken };
                yield server.users.banUser(options);
                yield server.users.unbanUser(options);
            });
        });
    });
    describe('When deleting our account', function () {
        it('Should fail with with the root account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.deleteMe({ expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
    });
    describe('When registering a new user', function () {
        const registrationPath = path + '/register';
        const baseCorrectParams = {
            username: 'user3',
            displayName: 'super user',
            email: 'test3@example.com',
            password: 'my super password'
        };
        it('Should fail with a too small username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: '' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too long username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'super'.repeat(50) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with an incorrect username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'my username' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a missing email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = lodash_1.omit(baseCorrectParams, 'email');
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { email: 'test_example.com' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too small password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { password: 'bla' });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a too long password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { password: 'super'.repeat(61) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail if we register a user with the same username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'root' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: registrationPath,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should fail with a "peertube" username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { username: 'peertube' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: registrationPath,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should fail if we register a user with the same email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { email: 'admin' + server.internalServerNumber + '@example.com' });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: registrationPath,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should fail with a bad display name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { displayName: 'a'.repeat(150) });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad channel name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channel: { name: '[]azf', displayName: 'toto' } });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a bad channel display name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channel: { name: 'toto', displayName: '' } });
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with a channel name that is the same as username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const source = { username: 'super_user', channel: { name: 'super_user', displayName: 'display name' } };
                const fields = Object.assign(Object.assign({}, baseCorrectParams), source);
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path: registrationPath, token: server.accessToken, fields });
            });
        });
        it('Should fail with an existing channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attributes = { name: 'existing_channel', displayName: 'hello', description: 'super description' };
                yield server.channels.create({ attributes });
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channel: { name: 'existing_channel', displayName: 'toto' } });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: registrationPath,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.CONFLICT_409
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = Object.assign(Object.assign({}, baseCorrectParams), { channel: { name: 'super_channel', displayName: 'toto' } });
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path: registrationPath,
                    token: server.accessToken,
                    fields: fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
        it('Should fail on a server with registration disabled', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {
                    username: 'user4',
                    email: 'test4@example.com',
                    password: 'my super password 4'
                };
                yield extra_utils_1.makePostBodyRequest({
                    url: serverWithRegistrationDisabled.url,
                    path: registrationPath,
                    token: serverWithRegistrationDisabled.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
    });
    describe('When registering multiple users on a server with users limit', function () {
        it('Should fail when after 3 registrations', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.register({ username: 'user42', expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
    });
    describe('When asking a password reset', function () {
        const path = '/api/v1/users/ask-reset-password';
        it('Should fail with a missing email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { email: 'hello' };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should success with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { email: 'admin@example.com' };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    describe('When asking for an account verification email', function () {
        const path = '/api/v1/users/ask-send-verify-email';
        it('Should fail with a missing email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = {};
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should fail with an invalid email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { email: 'hello' };
                yield extra_utils_1.makePostBodyRequest({ url: server.url, path, token: server.accessToken, fields });
            });
        });
        it('Should succeed with the correct params', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fields = { email: 'admin@example.com' };
                yield extra_utils_1.makePostBodyRequest({
                    url: server.url,
                    path,
                    token: server.accessToken,
                    fields,
                    expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
                });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield extra_utils_1.cleanupTests([server, serverWithRegistrationDisabled]);
        });
    });
});
