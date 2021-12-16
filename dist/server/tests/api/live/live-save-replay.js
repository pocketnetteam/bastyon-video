"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Save replay setting', function () {
    let servers = [];
    let liveVideoUUID;
    let ffmpegCommand;
    function createLiveWrapper(saveReplay) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (liveVideoUUID) {
                try {
                    yield servers[0].videos.remove({ id: liveVideoUUID });
                    yield extra_utils_1.waitJobs(servers);
                }
                catch (_a) { }
            }
            const attributes = {
                channelId: servers[0].store.channel.id,
                privacy: 1,
                name: 'my super live',
                saveReplay
            };
            const { uuid } = yield servers[0].live.create({ fields: attributes });
            return uuid;
        });
    }
    function checkVideosExist(videoId, existsInList, expectedStatus) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                const length = existsInList ? 1 : 0;
                const { data, total } = yield server.videos.list();
                expect(data).to.have.lengthOf(length);
                expect(total).to.equal(length);
                if (expectedStatus) {
                    yield server.videos.get({ id: videoId, expectedStatus });
                }
            }
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
                            enabled: false,
                            resolutions: extra_utils_1.ConfigCommand.getCustomConfigResolutions(true)
                        }
                    }
                }
            });
        });
    });
    describe('With save replay disabled', function () {
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
            });
        });
        it('Should correctly create and federate the "waiting for stream" live', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                liveVideoUUID = yield createLiveWrapper(false);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false, models_1.HttpStatusCode.OK_200);
                yield checkVideoState(liveVideoUUID, 4);
            });
        });
        it('Should correctly have updated the live and federated it when streaming in the live', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield extra_utils_1.waitUntilLivePublishedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield checkVideoState(liveVideoUUID, 1);
            });
        });
        it('Should correctly delete the video files after the stream ended', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(40000);
                yield extra_utils_1.stopFfmpeg(ffmpegCommand);
                for (const server of servers) {
                    yield server.live.waitUntilEnded({ videoId: liveVideoUUID });
                }
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false, models_1.HttpStatusCode.OK_200);
                yield checkVideoState(liveVideoUUID, 5);
                yield extra_utils_1.checkLiveCleanupAfterSave(servers[0], liveVideoUUID, []);
            });
        });
        it('Should correctly terminate the stream on blacklist and delete the live', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(40000);
                liveVideoUUID = yield createLiveWrapper(false);
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield extra_utils_1.waitUntilLivePublishedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield Promise.all([
                    servers[0].blacklist.add({ videoId: liveVideoUUID, reason: 'bad live', unfederate: true }),
                    extra_utils_1.testFfmpegStreamError(ffmpegCommand, true)
                ]);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false);
                yield servers[0].videos.get({ id: liveVideoUUID, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield servers[1].videos.get({ id: liveVideoUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield extra_utils_1.wait(5000);
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkLiveCleanupAfterSave(servers[0], liveVideoUUID, []);
            });
        });
        it('Should correctly terminate the stream on delete and delete the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(40000);
                liveVideoUUID = yield createLiveWrapper(false);
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield extra_utils_1.waitUntilLivePublishedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield Promise.all([
                    extra_utils_1.testFfmpegStreamError(ffmpegCommand, true),
                    servers[0].videos.remove({ id: liveVideoUUID })
                ]);
                yield extra_utils_1.wait(5000);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false, models_1.HttpStatusCode.NOT_FOUND_404);
                yield extra_utils_1.checkLiveCleanupAfterSave(servers[0], liveVideoUUID, []);
            });
        });
    });
    describe('With save replay enabled', function () {
        it('Should correctly create and federate the "waiting for stream" live', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                liveVideoUUID = yield createLiveWrapper(true);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false, models_1.HttpStatusCode.OK_200);
                yield checkVideoState(liveVideoUUID, 4);
            });
        });
        it('Should correctly have updated the live and federated it when streaming in the live', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield extra_utils_1.waitUntilLivePublishedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield checkVideoState(liveVideoUUID, 1);
            });
        });
        it('Should correctly have saved the live and federated it after the streaming', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.stopFfmpeg(ffmpegCommand);
                yield extra_utils_1.waitUntilLiveSavedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield checkVideoState(liveVideoUUID, 1);
            });
        });
        it('Should update the saved live and correctly federate the updated attributes', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].videos.update({ id: liveVideoUUID, attributes: { name: 'video updated' } });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const video = yield server.videos.get({ id: liveVideoUUID });
                    expect(video.name).to.equal('video updated');
                    expect(video.isLive).to.be.false;
                }
            });
        });
        it('Should have cleaned up the live files', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.checkLiveCleanupAfterSave(servers[0], liveVideoUUID, [720]);
            });
        });
        it('Should correctly terminate the stream on blacklist and blacklist the saved replay video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(40000);
                liveVideoUUID = yield createLiveWrapper(true);
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield extra_utils_1.waitUntilLivePublishedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield Promise.all([
                    servers[0].blacklist.add({ videoId: liveVideoUUID, reason: 'bad live', unfederate: true }),
                    extra_utils_1.testFfmpegStreamError(ffmpegCommand, true)
                ]);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false);
                yield servers[0].videos.get({ id: liveVideoUUID, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield servers[1].videos.get({ id: liveVideoUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield extra_utils_1.wait(5000);
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkLiveCleanupAfterSave(servers[0], liveVideoUUID, [720]);
            });
        });
        it('Should correctly terminate the stream on delete and delete the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(40000);
                liveVideoUUID = yield createLiveWrapper(true);
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield extra_utils_1.waitUntilLivePublishedOnAllServers(servers, liveVideoUUID);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, true, models_1.HttpStatusCode.OK_200);
                yield Promise.all([
                    servers[0].videos.remove({ id: liveVideoUUID }),
                    extra_utils_1.testFfmpegStreamError(ffmpegCommand, true)
                ]);
                yield extra_utils_1.wait(5000);
                yield extra_utils_1.waitJobs(servers);
                yield checkVideosExist(liveVideoUUID, false, models_1.HttpStatusCode.NOT_FOUND_404);
                yield extra_utils_1.checkLiveCleanupAfterSave(servers[0], liveVideoUUID, []);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
