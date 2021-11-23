"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("../../../../shared/extra-utils");
const expect = chai.expect;
describe('Test live constraints', function () {
    let servers = [];
    let userId;
    let userAccessToken;
    let userChannelId;
    function createLiveWrapper(saveReplay) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const liveAttributes = {
                name: 'user live',
                channelId: userChannelId,
                privacy: 1,
                saveReplay
            };
            const { uuid } = yield servers[0].live.create({ token: userAccessToken, fields: liveAttributes });
            return uuid;
        });
    }
    function checkSaveReplay(videoId, resolutions = [720]) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoId });
                expect(video.isLive).to.be.false;
                expect(video.duration).to.be.greaterThan(0);
            }
            yield (0, extra_utils_1.checkLiveCleanupAfterSave)(servers[0], videoId, resolutions);
        });
    }
    function waitUntilLivePublishedOnAllServers(videoId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                yield server.live.waitUntilPublished({ videoId });
            }
        });
    }
    function updateQuota(options) {
        return servers[0].users.update({
            userId,
            videoQuota: options.total,
            videoQuotaDaily: options.daily
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        transcoding: {
                            enabled: false
                        }
                    }
                }
            });
            {
                const res = yield servers[0].users.generate('user1');
                userId = res.userId;
                userChannelId = res.userChannelId;
                userAccessToken = res.token;
                yield updateQuota({ total: 1, daily: -1 });
            }
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should not have size limit if save replay is disabled', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            const userVideoLiveoId = yield createLiveWrapper(false);
            yield servers[0].live.runAndTestStreamError({ token: userAccessToken, videoId: userVideoLiveoId, shouldHaveError: false });
        });
    });
    it('Should have size limit depending on user global quota if save replay is enabled', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield (0, extra_utils_1.wait)(5000);
            const userVideoLiveoId = yield createLiveWrapper(true);
            yield servers[0].live.runAndTestStreamError({ token: userAccessToken, videoId: userVideoLiveoId, shouldHaveError: true });
            yield waitUntilLivePublishedOnAllServers(userVideoLiveoId);
            yield (0, extra_utils_1.waitJobs)(servers);
            yield checkSaveReplay(userVideoLiveoId);
        });
    });
    it('Should have size limit depending on user daily quota if save replay is enabled', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield (0, extra_utils_1.wait)(5000);
            yield updateQuota({ total: -1, daily: 1 });
            const userVideoLiveoId = yield createLiveWrapper(true);
            yield servers[0].live.runAndTestStreamError({ token: userAccessToken, videoId: userVideoLiveoId, shouldHaveError: true });
            yield waitUntilLivePublishedOnAllServers(userVideoLiveoId);
            yield (0, extra_utils_1.waitJobs)(servers);
            yield checkSaveReplay(userVideoLiveoId);
        });
    });
    it('Should succeed without quota limit', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield (0, extra_utils_1.wait)(5000);
            yield updateQuota({ total: 10 * 1000 * 1000, daily: -1 });
            const userVideoLiveoId = yield createLiveWrapper(true);
            yield servers[0].live.runAndTestStreamError({ token: userAccessToken, videoId: userVideoLiveoId, shouldHaveError: false });
        });
    });
    it('Should have max duration limit', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        maxDuration: 1,
                        transcoding: {
                            enabled: true,
                            resolutions: extra_utils_1.ConfigCommand.getCustomConfigResolutions(true)
                        }
                    }
                }
            });
            const userVideoLiveoId = yield createLiveWrapper(true);
            yield servers[0].live.runAndTestStreamError({ token: userAccessToken, videoId: userVideoLiveoId, shouldHaveError: true });
            yield waitUntilLivePublishedOnAllServers(userVideoLiveoId);
            yield (0, extra_utils_1.waitJobs)(servers);
            yield checkSaveReplay(userVideoLiveoId, [720, 480, 360, 240]);
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
