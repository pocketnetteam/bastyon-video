"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
function createLive(server) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const attributes = {
            channelId: server.store.channel.id,
            privacy: 1,
            name: 'my super live',
            saveReplay: true
        };
        const { uuid } = yield server.live.create({ fields: attributes });
        return uuid;
    });
}
function checkFiles(files) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        for (const file of files) {
            (0, extra_utils_1.expectStartWith)(file.fileUrl, extra_utils_1.ObjectStorageCommand.getPlaylistBaseUrl());
            yield (0, extra_utils_1.makeRawRequest)(file.fileUrl, models_1.HttpStatusCode.OK_200);
        }
    });
}
describe('Object storage for lives', function () {
    if ((0, extra_utils_1.areObjectStorageTestsDisabled)())
        return;
    let ffmpegCommand;
    let servers;
    let videoUUID;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
            servers = yield (0, extra_utils_1.createMultipleServers)(2, extra_utils_1.ObjectStorageCommand.getDefaultConfig());
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            yield servers[0].config.enableTranscoding();
        });
    });
    describe('Without live transcoding', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            before(function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].config.enableLive({ transcoding: false });
                    videoUUID = yield createLive(servers[0]);
                });
            });
            it('Should create a live and save the replay on object storage', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(220000);
                    ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: videoUUID });
                    yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, videoUUID);
                    yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
                    yield (0, extra_utils_1.waitUntilLiveSavedOnAllServers)(servers, videoUUID);
                    yield (0, extra_utils_1.waitJobs)(servers);
                    for (const server of servers) {
                        const video = yield server.videos.get({ id: videoUUID });
                        expect(video.files).to.have.lengthOf(0);
                        expect(video.streamingPlaylists).to.have.lengthOf(1);
                        const files = video.streamingPlaylists[0].files;
                        yield checkFiles(files);
                    }
                });
            });
        });
    });
    describe('With live transcoding', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            before(function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].config.enableLive({ transcoding: true });
                    videoUUID = yield createLive(servers[0]);
                });
            });
            it('Should import a video and have sent it to object storage', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: videoUUID });
                    yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, videoUUID);
                    yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
                    yield (0, extra_utils_1.waitUntilLiveSavedOnAllServers)(servers, videoUUID);
                    yield (0, extra_utils_1.waitJobs)(servers);
                    for (const server of servers) {
                        const video = yield server.videos.get({ id: videoUUID });
                        expect(video.files).to.have.lengthOf(0);
                        expect(video.streamingPlaylists).to.have.lengthOf(1);
                        const files = video.streamingPlaylists[0].files;
                        expect(files).to.have.lengthOf(4);
                        yield checkFiles(files);
                    }
                });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.killallServers)(servers);
        });
    });
});
