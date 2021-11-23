"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function createOverviewRes(overview) {
    const videos = overview.categories[0].videos;
    return { data: videos, total: videos.length };
}
describe('Test video NSFW policy', function () {
    let server;
    let userAccessToken;
    let customConfig;
    function getVideosFunctions(token, query = {}) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield server.users.getMyInfo();
            const channelName = user.videoChannels[0].name;
            const accountName = user.account.name + '@' + user.account.host;
            const hasQuery = Object.keys(query).length !== 0;
            let promises;
            if (token) {
                promises = [
                    server.search.advancedVideoSearch({ token, search: Object.assign({ search: 'n', sort: '-publishedAt' }, query) }),
                    server.videos.listWithToken(Object.assign({ token }, query)),
                    server.videos.listByAccount(Object.assign({ token, handle: accountName }, query)),
                    server.videos.listByChannel(Object.assign({ token, handle: channelName }, query))
                ];
                if (!hasQuery) {
                    const p = server.overviews.getVideos({ page: 1, token })
                        .then(res => createOverviewRes(res));
                    promises.push(p);
                }
                return Promise.all(promises);
            }
            promises = [
                server.search.searchVideos({ search: 'n', sort: '-publishedAt' }),
                server.videos.list(),
                server.videos.listByAccount({ token: null, handle: accountName }),
                server.videos.listByChannel({ token: null, handle: channelName })
            ];
            if (!hasQuery) {
                const p = server.overviews.getVideos({ page: 1 })
                    .then(res => createOverviewRes(res));
                promises.push(p);
            }
            return Promise.all(promises);
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(50000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            {
                const attributes = { name: 'nsfw', nsfw: true, category: 1 };
                yield server.videos.upload({ attributes });
            }
            {
                const attributes = { name: 'normal', nsfw: false, category: 1 };
                yield server.videos.upload({ attributes });
            }
            customConfig = yield server.config.getCustomConfig();
        });
    });
    describe('Instance default NSFW policy', function () {
        it('Should display NSFW videos with display default NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const serverConfig = yield server.config.getConfig();
                expect(serverConfig.instance.defaultNSFWPolicy).to.equal('display');
                for (const body of yield getVideosFunctions()) {
                    expect(body.total).to.equal(2);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(2);
                    expect(videos[0].name).to.equal('normal');
                    expect(videos[1].name).to.equal('nsfw');
                }
            });
        });
        it('Should not display NSFW videos with do_not_list default NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                customConfig.instance.defaultNSFWPolicy = 'do_not_list';
                yield server.config.updateCustomConfig({ newCustomConfig: customConfig });
                const serverConfig = yield server.config.getConfig();
                expect(serverConfig.instance.defaultNSFWPolicy).to.equal('do_not_list');
                for (const body of yield getVideosFunctions()) {
                    expect(body.total).to.equal(1);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(1);
                    expect(videos[0].name).to.equal('normal');
                }
            });
        });
        it('Should display NSFW videos with blur default NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                customConfig.instance.defaultNSFWPolicy = 'blur';
                yield server.config.updateCustomConfig({ newCustomConfig: customConfig });
                const serverConfig = yield server.config.getConfig();
                expect(serverConfig.instance.defaultNSFWPolicy).to.equal('blur');
                for (const body of yield getVideosFunctions()) {
                    expect(body.total).to.equal(2);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(2);
                    expect(videos[0].name).to.equal('normal');
                    expect(videos[1].name).to.equal('nsfw');
                }
            });
        });
    });
    describe('User NSFW policy', function () {
        it('Should create a user having the default nsfw policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const username = 'user1';
                const password = 'my super password';
                yield server.users.create({ username: username, password: password });
                userAccessToken = yield server.login.getAccessToken({ username, password });
                const user = yield server.users.getMyInfo({ token: userAccessToken });
                expect(user.nsfwPolicy).to.equal('blur');
            });
        });
        it('Should display NSFW videos with blur user NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                customConfig.instance.defaultNSFWPolicy = 'do_not_list';
                yield server.config.updateCustomConfig({ newCustomConfig: customConfig });
                for (const body of yield getVideosFunctions(userAccessToken)) {
                    expect(body.total).to.equal(2);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(2);
                    expect(videos[0].name).to.equal('normal');
                    expect(videos[1].name).to.equal('nsfw');
                }
            });
        });
        it('Should display NSFW videos with display user NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.users.updateMe({ nsfwPolicy: 'display' });
                for (const body of yield getVideosFunctions(server.accessToken)) {
                    expect(body.total).to.equal(2);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(2);
                    expect(videos[0].name).to.equal('normal');
                    expect(videos[1].name).to.equal('nsfw');
                }
            });
        });
        it('Should not display NSFW videos with do_not_list user NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.users.updateMe({ nsfwPolicy: 'do_not_list' });
                for (const body of yield getVideosFunctions(server.accessToken)) {
                    expect(body.total).to.equal(1);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(1);
                    expect(videos[0].name).to.equal('normal');
                }
            });
        });
        it('Should be able to see my NSFW videos even with do_not_list user NSFW policy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.listMyVideos();
                expect(total).to.equal(2);
                expect(data).to.have.lengthOf(2);
                expect(data[0].name).to.equal('normal');
                expect(data[1].name).to.equal('nsfw');
            });
        });
        it('Should display NSFW videos when the nsfw param === true', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const body of yield getVideosFunctions(server.accessToken, { nsfw: 'true' })) {
                    expect(body.total).to.equal(1);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(1);
                    expect(videos[0].name).to.equal('nsfw');
                }
            });
        });
        it('Should hide NSFW videos when the nsfw param === true', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const body of yield getVideosFunctions(server.accessToken, { nsfw: 'false' })) {
                    expect(body.total).to.equal(1);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(1);
                    expect(videos[0].name).to.equal('normal');
                }
            });
        });
        it('Should display both videos when the nsfw param === both', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const body of yield getVideosFunctions(server.accessToken, { nsfw: 'both' })) {
                    expect(body.total).to.equal(2);
                    const videos = body.data;
                    expect(videos).to.have.lengthOf(2);
                    expect(videos[0].name).to.equal('normal');
                    expect(videos[1].name).to.equal('nsfw');
                }
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
