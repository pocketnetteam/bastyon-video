"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test users', function () {
    let server;
    let token;
    let userToken;
    let videoId;
    let userId;
    const user = {
        username: 'user_1',
        password: 'super password'
    };
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1, {
                rates_limit: {
                    login: {
                        max: 30
                    }
                }
            });
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield server.plugins.install({ npmName: 'peertube-theme-background-red' });
        });
    });
    describe('OAuth client', function () {
        it('Should create a new client');
        it('Should return the first client');
        it('Should remove the last client');
        it('Should not login with an invalid client id', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const client = { id: 'client', secret: server.store.client.secret };
                const body = yield server.login.login({ client, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                expect(body.code).to.equal("invalid_client");
                expect(body.error).to.contain('client is invalid');
                expect(body.type.startsWith('https://')).to.be.true;
                expect(body.type).to.contain("invalid_client");
            });
        });
        it('Should not login with an invalid client secret', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const client = { id: server.store.client.id, secret: 'coucou' };
                const body = yield server.login.login({ client, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                expect(body.code).to.equal("invalid_client");
                expect(body.error).to.contain('client is invalid');
                expect(body.type.startsWith('https://')).to.be.true;
                expect(body.type).to.contain("invalid_client");
            });
        });
    });
    describe('Login', function () {
        it('Should not login with an invalid username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = { username: 'captain crochet', password: server.store.user.password };
                const body = yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                expect(body.code).to.equal("invalid_grant");
                expect(body.error).to.contain('credentials are invalid');
                expect(body.type.startsWith('https://')).to.be.true;
                expect(body.type).to.contain("invalid_grant");
            });
        });
        it('Should not login with an invalid password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = { username: server.store.user.username, password: 'mew_three' };
                const body = yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                expect(body.code).to.equal("invalid_grant");
                expect(body.error).to.contain('credentials are invalid');
                expect(body.type.startsWith('https://')).to.be.true;
                expect(body.type).to.contain("invalid_grant");
            });
        });
        it('Should not be able to upload a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                token = 'my_super_token';
                yield server.videos.upload({ token, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should not be able to follow', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                token = 'my_super_token';
                yield server.follows.follow({
                    hosts: ['http://example.com'],
                    token,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should not be able to unfollow');
        it('Should be able to login', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield server.login.login({ expectedStatus: models_1.HttpStatusCode.OK_200 });
                token = body.access_token;
            });
        });
        it('Should be able to login with an insensitive username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = { username: 'RoOt', password: server.store.user.password };
                yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const user2 = { username: 'rOoT', password: server.store.user.password };
                yield server.login.login({ user: user2, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const user3 = { username: 'ROOt', password: server.store.user.password };
                yield server.login.login({ user: user3, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('Upload', function () {
        it('Should upload the video with the correct token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.upload({ token });
                const { data } = yield server.videos.list();
                const video = data[0];
                expect(video.account.name).to.equal('root');
                videoId = video.id;
            });
        });
        it('Should upload the video again with the correct token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.upload({ token });
            });
        });
    });
    describe('Ratings', function () {
        it('Should retrieve a video rating', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.rate({ id: videoId, rating: 'like' });
                const rating = yield server.users.getMyRating({ token, videoId });
                expect(rating.videoId).to.equal(videoId);
                expect(rating.rating).to.equal('like');
            });
        });
        it('Should retrieve ratings list', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.rate({ id: videoId, rating: 'like' });
                const body = yield server.accounts.listRatings({ accountName: server.store.user.username });
                expect(body.total).to.equal(1);
                expect(body.data[0].video.id).to.equal(videoId);
                expect(body.data[0].rating).to.equal('like');
            });
        });
        it('Should retrieve ratings list by rating type', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const body = yield server.accounts.listRatings({ accountName: server.store.user.username, rating: 'like' });
                    expect(body.data.length).to.equal(1);
                }
                {
                    const body = yield server.accounts.listRatings({ accountName: server.store.user.username, rating: 'dislike' });
                    expect(body.data.length).to.equal(0);
                }
            });
        });
    });
    describe('Remove video', function () {
        it('Should not be able to remove the video with an incorrect token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.remove({ token: 'bad_token', id: videoId, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should not be able to remove the video with the token of another account');
        it('Should be able to remove the video with the correct token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.remove({ token, id: videoId });
            });
        });
    });
    describe('Logout', function () {
        it('Should logout (revoke token)', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.login.logout({ token: server.accessToken });
            });
        });
        it('Should not be able to get the user information', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyInfo({ expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should not be able to upload a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.upload({ attributes: { name: 'video' }, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should not be able to rate a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const path = '/api/v1/videos/';
                const data = {
                    rating: 'likes'
                };
                const options = {
                    url: server.url,
                    path: path + videoId,
                    token: 'wrong token',
                    fields: data,
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                };
                yield extra_utils_1.makePutBodyRequest(options);
            });
        });
        it('Should be able to login again', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield server.login.login();
                server.accessToken = body.access_token;
                server.refreshToken = body.refresh_token;
            });
        });
        it('Should be able to get my user information again', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyInfo();
            });
        });
        it('Should have an expired access token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                yield server.sql.setTokenField(server.accessToken, 'accessTokenExpiresAt', new Date().toISOString());
                yield server.sql.setTokenField(server.accessToken, 'refreshTokenExpiresAt', new Date().toISOString());
                yield extra_utils_1.killallServers([server]);
                yield server.run();
                yield server.users.getMyInfo({ expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should not be able to refresh an access token with an expired refresh token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.login.refreshToken({ refreshToken: server.refreshToken, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should refresh the token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                const futureDate = new Date(new Date().getTime() + 1000 * 60).toISOString();
                yield server.sql.setTokenField(server.accessToken, 'refreshTokenExpiresAt', futureDate);
                yield extra_utils_1.killallServers([server]);
                yield server.run();
                const res = yield server.login.refreshToken({ refreshToken: server.refreshToken });
                server.accessToken = res.body.access_token;
                server.refreshToken = res.body.refresh_token;
            });
        });
        it('Should be able to get my user information again', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyInfo();
            });
        });
    });
    describe('Creating a user', function () {
        it('Should be able to create a new user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.create(Object.assign(Object.assign({}, user), { videoQuota: 2 * 1024 * 1024, adminFlags: 1 }));
            });
        });
        it('Should be able to login with this user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                userToken = yield server.login.getAccessToken(user);
            });
        });
        it('Should be able to get user information', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const userMe = yield server.users.getMyInfo({ token: userToken });
                const userGet = yield server.users.get({ userId: userMe.id, withStats: true });
                for (const user of [userMe, userGet]) {
                    expect(user.username).to.equal('user_1');
                    expect(user.email).to.equal('user_1@example.com');
                    expect(user.nsfwPolicy).to.equal('display');
                    expect(user.videoQuota).to.equal(2 * 1024 * 1024);
                    expect(user.roleLabel).to.equal('User');
                    expect(user.id).to.be.a('number');
                    expect(user.account.displayName).to.equal('user_1');
                    expect(user.account.description).to.be.null;
                }
                expect(userMe.adminFlags).to.equal(1);
                expect(userGet.adminFlags).to.equal(1);
                expect(userMe.specialPlaylists).to.have.lengthOf(1);
                expect(userMe.specialPlaylists[0].type).to.equal(2);
                expect(userGet.videosCount).to.be.a('number');
                expect(userGet.videosCount).to.equal(0);
                expect(userGet.videoCommentsCount).to.be.a('number');
                expect(userGet.videoCommentsCount).to.equal(0);
                expect(userGet.abusesCount).to.be.a('number');
                expect(userGet.abusesCount).to.equal(0);
                expect(userGet.abusesAcceptedCount).to.be.a('number');
                expect(userGet.abusesAcceptedCount).to.equal(0);
            });
        });
    });
    describe('My videos & quotas', function () {
        it('Should be able to upload a video with this user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const attributes = {
                    name: 'super user video',
                    fixture: 'video_short.webm'
                };
                yield server.videos.upload({ token: userToken, attributes });
            });
        });
        it('Should have video quota updated', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const quota = yield server.users.getMyQuotaUsed({ token: userToken });
                expect(quota.videoQuotaUsed).to.equal(218910);
                const { data } = yield server.users.list();
                const tmpUser = data.find(u => u.username === user.username);
                expect(tmpUser.videoQuotaUsed).to.equal(218910);
            });
        });
        it('Should be able to list my videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.listMyVideos({ token: userToken });
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
                const video = data[0];
                expect(video.name).to.equal('super user video');
                expect(video.thumbnailPath).to.not.be.null;
                expect(video.previewPath).to.not.be.null;
            });
        });
        it('Should be able to search in my videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { total, data } = yield server.videos.listMyVideos({ token: userToken, sort: '-createdAt', search: 'user video' });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                }
                {
                    const { total, data } = yield server.videos.listMyVideos({ token: userToken, sort: '-createdAt', search: 'toto' });
                    expect(total).to.equal(0);
                    expect(data).to.have.lengthOf(0);
                }
            });
        });
        it('Should disable webtorrent, enable HLS, and update my quota', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                {
                    const config = yield server.config.getCustomConfig();
                    config.transcoding.webtorrent.enabled = false;
                    config.transcoding.hls.enabled = true;
                    config.transcoding.enabled = true;
                    yield server.config.updateCustomSubConfig({ newConfig: config });
                }
                {
                    const attributes = {
                        name: 'super user video 2',
                        fixture: 'video_short.webm'
                    };
                    yield server.videos.upload({ token: userToken, attributes });
                    yield extra_utils_1.waitJobs([server]);
                }
                {
                    const data = yield server.users.getMyQuotaUsed({ token: userToken });
                    expect(data.videoQuotaUsed).to.be.greaterThan(220000);
                }
            });
        });
    });
    describe('Users listing', function () {
        it('Should list all the users', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data, total } = yield server.users.list();
                expect(total).to.equal(2);
                expect(data).to.be.an('array');
                expect(data.length).to.equal(2);
                const user = data[0];
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('user_1@example.com');
                expect(user.nsfwPolicy).to.equal('display');
                const rootUser = data[1];
                expect(rootUser.username).to.equal('root');
                expect(rootUser.email).to.equal('admin' + server.internalServerNumber + '@example.com');
                expect(user.nsfwPolicy).to.equal('display');
                expect(rootUser.lastLoginDate).to.exist;
                expect(user.lastLoginDate).to.exist;
                userId = user.id;
            });
        });
        it('Should list only the first user by username asc', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.users.list({ start: 0, count: 1, sort: 'username' });
                expect(total).to.equal(2);
                expect(data.length).to.equal(1);
                const user = data[0];
                expect(user.username).to.equal('root');
                expect(user.email).to.equal('admin' + server.internalServerNumber + '@example.com');
                expect(user.roleLabel).to.equal('Administrator');
                expect(user.nsfwPolicy).to.equal('display');
            });
        });
        it('Should list only the first user by username desc', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.users.list({ start: 0, count: 1, sort: '-username' });
                expect(total).to.equal(2);
                expect(data.length).to.equal(1);
                const user = data[0];
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('user_1@example.com');
                expect(user.nsfwPolicy).to.equal('display');
            });
        });
        it('Should list only the second user by createdAt desc', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data, total } = yield server.users.list({ start: 0, count: 1, sort: '-createdAt' });
                expect(total).to.equal(2);
                expect(data.length).to.equal(1);
                const user = data[0];
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('user_1@example.com');
                expect(user.nsfwPolicy).to.equal('display');
            });
        });
        it('Should list all the users by createdAt asc', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data, total } = yield server.users.list({ start: 0, count: 2, sort: 'createdAt' });
                expect(total).to.equal(2);
                expect(data.length).to.equal(2);
                expect(data[0].username).to.equal('root');
                expect(data[0].email).to.equal('admin' + server.internalServerNumber + '@example.com');
                expect(data[0].nsfwPolicy).to.equal('display');
                expect(data[1].username).to.equal('user_1');
                expect(data[1].email).to.equal('user_1@example.com');
                expect(data[1].nsfwPolicy).to.equal('display');
            });
        });
        it('Should search user by username', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data, total } = yield server.users.list({ start: 0, count: 2, sort: 'createdAt', search: 'oot' });
                expect(total).to.equal(1);
                expect(data.length).to.equal(1);
                expect(data[0].username).to.equal('root');
            });
        });
        it('Should search user by email', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { total, data } = yield server.users.list({ start: 0, count: 2, sort: 'createdAt', search: 'r_1@exam' });
                    expect(total).to.equal(1);
                    expect(data.length).to.equal(1);
                    expect(data[0].username).to.equal('user_1');
                    expect(data[0].email).to.equal('user_1@example.com');
                }
                {
                    const { total, data } = yield server.users.list({ start: 0, count: 2, sort: 'createdAt', search: 'example' });
                    expect(total).to.equal(2);
                    expect(data.length).to.equal(2);
                    expect(data[0].username).to.equal('root');
                    expect(data[1].username).to.equal('user_1');
                }
            });
        });
    });
    describe('Update my account', function () {
        it('Should update my password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({
                    token: userToken,
                    currentPassword: 'super password',
                    password: 'new password'
                });
                user.password = 'new password';
                yield server.login.login({ user });
            });
        });
        it('Should be able to change the NSFW display attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({
                    token: userToken,
                    nsfwPolicy: 'do_not_list'
                });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('user_1@example.com');
                expect(user.nsfwPolicy).to.equal('do_not_list');
                expect(user.videoQuota).to.equal(2 * 1024 * 1024);
                expect(user.id).to.be.a('number');
                expect(user.account.displayName).to.equal('user_1');
                expect(user.account.description).to.be.null;
            });
        });
        it('Should be able to change the autoPlayVideo attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({
                    token: userToken,
                    autoPlayVideo: false
                });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.autoPlayVideo).to.be.false;
            });
        });
        it('Should be able to change the autoPlayNextVideo attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({
                    token: userToken,
                    autoPlayNextVideo: true
                });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.autoPlayNextVideo).to.be.true;
            });
        });
        it('Should be able to change the email attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({
                    token: userToken,
                    currentPassword: 'new password',
                    email: 'updated@example.com'
                });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('updated@example.com');
                expect(user.nsfwPolicy).to.equal('do_not_list');
                expect(user.videoQuota).to.equal(2 * 1024 * 1024);
                expect(user.id).to.be.a('number');
                expect(user.account.displayName).to.equal('user_1');
                expect(user.account.description).to.be.null;
            });
        });
        it('Should be able to update my avatar with a gif', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const fixture = 'avatar.gif';
                yield server.users.updateMyAvatar({ token: userToken, fixture });
                const user = yield server.users.getMyInfo({ token: userToken });
                yield extra_utils_1.testImage(server.url, 'avatar-resized', user.account.avatar.path, '.gif');
            });
        });
        it('Should be able to update my avatar with a gif, and then a png', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const extension of ['.png', '.gif']) {
                    const fixture = 'avatar' + extension;
                    yield server.users.updateMyAvatar({ token: userToken, fixture });
                    const user = yield server.users.getMyInfo({ token: userToken });
                    yield extra_utils_1.testImage(server.url, 'avatar-resized', user.account.avatar.path, extension);
                }
            });
        });
        it('Should be able to update my display name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({ token: userToken, displayName: 'new display name' });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('updated@example.com');
                expect(user.nsfwPolicy).to.equal('do_not_list');
                expect(user.videoQuota).to.equal(2 * 1024 * 1024);
                expect(user.id).to.be.a('number');
                expect(user.account.displayName).to.equal('new display name');
                expect(user.account.description).to.be.null;
            });
        });
        it('Should be able to update my description', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({ token: userToken, description: 'my super description updated' });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('updated@example.com');
                expect(user.nsfwPolicy).to.equal('do_not_list');
                expect(user.videoQuota).to.equal(2 * 1024 * 1024);
                expect(user.id).to.be.a('number');
                expect(user.account.displayName).to.equal('new display name');
                expect(user.account.description).to.equal('my super description updated');
                expect(user.noWelcomeModal).to.be.false;
                expect(user.noInstanceConfigWarningModal).to.be.false;
                expect(user.noAccountSetupWarningModal).to.be.false;
            });
        });
        it('Should be able to update my theme', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const theme of ['background-red', 'default', 'instance-default']) {
                    yield server.users.updateMe({ token: userToken, theme });
                    const user = yield server.users.getMyInfo({ token: userToken });
                    expect(user.theme).to.equal(theme);
                }
            });
        });
        it('Should be able to update my modal preferences', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.updateMe({
                    token: userToken,
                    noInstanceConfigWarningModal: true,
                    noWelcomeModal: true,
                    noAccountSetupWarningModal: true
                });
                const user = yield server.users.getMyInfo({ token: userToken });
                expect(user.noWelcomeModal).to.be.true;
                expect(user.noInstanceConfigWarningModal).to.be.true;
                expect(user.noAccountSetupWarningModal).to.be.true;
            });
        });
    });
    describe('Updating another user', function () {
        it('Should be able to update another user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.update({
                    userId,
                    token,
                    email: 'updated2@example.com',
                    emailVerified: true,
                    videoQuota: 42,
                    role: models_1.UserRole.MODERATOR,
                    adminFlags: 0,
                    pluginAuth: 'toto'
                });
                const user = yield server.users.get({ token, userId });
                expect(user.username).to.equal('user_1');
                expect(user.email).to.equal('updated2@example.com');
                expect(user.emailVerified).to.be.true;
                expect(user.nsfwPolicy).to.equal('do_not_list');
                expect(user.videoQuota).to.equal(42);
                expect(user.roleLabel).to.equal('Moderator');
                expect(user.id).to.be.a('number');
                expect(user.adminFlags).to.equal(0);
                expect(user.pluginAuth).to.equal('toto');
            });
        });
        it('Should reset the auth plugin', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.update({ userId, token, pluginAuth: null });
                const user = yield server.users.get({ token, userId });
                expect(user.pluginAuth).to.be.null;
            });
        });
        it('Should have removed the user token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.getMyQuotaUsed({ token: userToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                userToken = yield server.login.getAccessToken(user);
            });
        });
        it('Should be able to update another user password', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.update({ userId, token, password: 'password updated' });
                yield server.users.getMyQuotaUsed({ token: userToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                user.password = 'password updated';
                userToken = yield server.login.getAccessToken(user);
            });
        });
    });
    describe('Video blacklists', function () {
        it('Should be able to list video blacklist by a moderator', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.blacklist.list({ token: userToken });
            });
        });
    });
    describe('Remove a user', function () {
        it('Should be able to remove this user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.remove({ userId, token });
            });
        });
        it('Should not be able to login with this user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.login.login({ user, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should not have videos of this user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data, total } = yield server.videos.list();
                expect(total).to.equal(1);
                const video = data[0];
                expect(video.account.name).to.equal('root');
            });
        });
    });
    describe('Registering a new user', function () {
        let user15AccessToken;
        it('Should register a new user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = { displayName: 'super user 15', username: 'user_15', password: 'my super password' };
                const channel = { name: 'my_user_15_channel', displayName: 'my channel rocks' };
                yield server.users.register(Object.assign(Object.assign({}, user), { channel }));
            });
        });
        it('Should be able to login with this registered user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user15 = {
                    username: 'user_15',
                    password: 'my super password'
                };
                user15AccessToken = yield server.login.getAccessToken(user15);
            });
        });
        it('Should have the correct display name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = yield server.users.getMyInfo({ token: user15AccessToken });
                expect(user.account.displayName).to.equal('super user 15');
            });
        });
        it('Should have the correct video quota', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = yield server.users.getMyInfo({ token: user15AccessToken });
                expect(user.videoQuota).to.equal(5 * 1024 * 1024);
            });
        });
        it('Should have created the channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { displayName } = yield server.channels.get({ channelName: 'my_user_15_channel' });
                expect(displayName).to.equal('my channel rocks');
            });
        });
        it('Should remove me', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { data } = yield server.users.list();
                    expect(data.find(u => u.username === 'user_15')).to.not.be.undefined;
                }
                yield server.users.deleteMe({ token: user15AccessToken });
                {
                    const { data } = yield server.users.list();
                    expect(data.find(u => u.username === 'user_15')).to.be.undefined;
                }
            });
        });
    });
    describe('User blocking', function () {
        let user16Id;
        let user16AccessToken;
        const user16 = {
            username: 'user_16',
            password: 'my super password'
        };
        it('Should block a user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user = yield server.users.create(Object.assign({}, user16));
                user16Id = user.id;
                user16AccessToken = yield server.login.getAccessToken(user16);
                yield server.users.getMyInfo({ token: user16AccessToken, expectedStatus: models_1.HttpStatusCode.OK_200 });
                yield server.users.banUser({ userId: user16Id });
                yield server.users.getMyInfo({ token: user16AccessToken, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield server.login.login({ user: user16, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should search user by banned status', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { data, total } = yield server.users.list({ start: 0, count: 2, sort: 'createdAt', blocked: true });
                    expect(total).to.equal(1);
                    expect(data.length).to.equal(1);
                    expect(data[0].username).to.equal(user16.username);
                }
                {
                    const { data, total } = yield server.users.list({ start: 0, count: 2, sort: 'createdAt', blocked: false });
                    expect(total).to.equal(1);
                    expect(data.length).to.equal(1);
                    expect(data[0].username).to.not.equal(user16.username);
                }
            });
        });
        it('Should unblock a user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.users.unbanUser({ userId: user16Id });
                user16AccessToken = yield server.login.getAccessToken(user16);
                yield server.users.getMyInfo({ token: user16AccessToken, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('User stats', function () {
        let user17Id;
        let user17AccessToken;
        it('Should report correct initial statistics about a user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const user17 = {
                    username: 'user_17',
                    password: 'my super password'
                };
                const created = yield server.users.create(Object.assign({}, user17));
                user17Id = created.id;
                user17AccessToken = yield server.login.getAccessToken(user17);
                const user = yield server.users.get({ userId: user17Id, withStats: true });
                expect(user.videosCount).to.equal(0);
                expect(user.videoCommentsCount).to.equal(0);
                expect(user.abusesCount).to.equal(0);
                expect(user.abusesCreatedCount).to.equal(0);
                expect(user.abusesAcceptedCount).to.equal(0);
            });
        });
        it('Should report correct videos count', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attributes = { name: 'video to test user stats' };
                yield server.videos.upload({ token: user17AccessToken, attributes });
                const { data } = yield server.videos.list();
                videoId = data.find(video => video.name === attributes.name).id;
                const user = yield server.users.get({ userId: user17Id, withStats: true });
                expect(user.videosCount).to.equal(1);
            });
        });
        it('Should report correct video comments for user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const text = 'super comment';
                yield server.comments.createThread({ token: user17AccessToken, videoId, text });
                const user = yield server.users.get({ userId: user17Id, withStats: true });
                expect(user.videoCommentsCount).to.equal(1);
            });
        });
        it('Should report correct abuses counts', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const reason = 'my super bad reason';
                yield server.abuses.report({ token: user17AccessToken, videoId, reason });
                const body1 = yield server.abuses.getAdminList();
                const abuseId = body1.data[0].id;
                const user2 = yield server.users.get({ userId: user17Id, withStats: true });
                expect(user2.abusesCount).to.equal(1);
                expect(user2.abusesCreatedCount).to.equal(1);
                yield server.abuses.update({ abuseId, body: { state: 3 } });
                const user3 = yield server.users.get({ userId: user17Id, withStats: true });
                expect(user3.abusesAcceptedCount).to.equal(1);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
