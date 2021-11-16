"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("../../../../shared/extra-utils");
const expect = chai.expect;
describe('Permanent live', function () {
    let servers = [];
    let videoUUID;
    function createLiveWrapper(permanentLive) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const attributes = {
                channelId: servers[0].store.channel.id,
                privacy: 1,
                name: 'my super live',
                saveReplay: false,
                permanentLive
            };
            const { uuid } = yield servers[0].live.create({ fields: attributes });
            return uuid;
        });
    }
    function checkVideoState(videoId, state) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoId });
                expect(video.state.id).to.equal(state);
            }
        });
    }
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.setDefaultVideoChannel(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        maxDuration: -1,
                        transcoding: {
                            enabled: true,
                            resolutions: extra_utils_1.ConfigCommand.getCustomConfigResolutions(true)
                        }
                    }
                }
            });
        });
    });
    it('Should create a non permanent live and update it to be a permanent live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            const videoUUID = yield createLiveWrapper(false);
            {
                const live = yield servers[0].live.get({ videoId: videoUUID });
                expect(live.permanentLive).to.be.false;
            }
            yield servers[0].live.update({ videoId: videoUUID, fields: { permanentLive: true } });
            {
                const live = yield servers[0].live.get({ videoId: videoUUID });
                expect(live.permanentLive).to.be.true;
            }
        });
    });
    it('Should create a permanent live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            videoUUID = yield createLiveWrapper(true);
            const live = yield servers[0].live.get({ videoId: videoUUID });
            expect(live.permanentLive).to.be.true;
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should stream into this permanent live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: videoUUID });
            for (const server of servers) {
                yield server.live.waitUntilPublished({ videoId: videoUUID });
            }
            yield checkVideoState(videoUUID, 1);
            yield extra_utils_1.stopFfmpeg(ffmpegCommand);
            yield servers[0].live.waitUntilWaiting({ videoId: videoUUID });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should not have cleaned up this live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(40000);
            yield extra_utils_1.wait(5000);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const videoDetails = yield server.videos.get({ id: videoUUID });
                expect(videoDetails.streamingPlaylists).to.have.lengthOf(1);
            }
        });
    });
    it('Should have set this live to waiting for live state', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield checkVideoState(videoUUID, 4);
        });
    });
    it('Should be able to stream again in the permanent live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        maxDuration: -1,
                        transcoding: {
                            enabled: true,
                            resolutions: extra_utils_1.ConfigCommand.getCustomConfigResolutions(false)
                        }
                    }
                }
            });
            const ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: videoUUID });
            for (const server of servers) {
                yield server.live.waitUntilPublished({ videoId: videoUUID });
            }
            yield checkVideoState(videoUUID, 1);
            const count = yield servers[0].live.countPlaylists({ videoUUID });
            expect(count).to.equal(2);
            yield extra_utils_1.stopFfmpeg(ffmpegCommand);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
