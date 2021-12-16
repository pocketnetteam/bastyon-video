"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
function importVideo(server) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const attributes = {
            name: 'import 2',
            privacy: 1,
            channelId: server.store.channel.id,
            targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo720
        };
        const { video: { uuid } } = yield server.imports.importVideo({ attributes });
        return uuid;
    });
}
describe('Object storage for video import', function () {
    if (extra_utils_1.areObjectStorageTestsDisabled())
        return;
    let server;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
            server = yield extra_utils_1.createSingleServer(1, extra_utils_1.ObjectStorageCommand.getDefaultConfig());
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield extra_utils_1.setDefaultVideoChannel([server]);
            yield server.config.enableImports();
        });
    });
    describe('Without transcoding', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            before(function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield server.config.disableTranscoding();
                });
            });
            it('Should import a video and have sent it to object storage', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(120000);
                    const uuid = yield importVideo(server);
                    yield extra_utils_1.waitJobs(server);
                    const video = yield server.videos.get({ id: uuid });
                    expect(video.files).to.have.lengthOf(1);
                    expect(video.streamingPlaylists).to.have.lengthOf(0);
                    const fileUrl = video.files[0].fileUrl;
                    extra_utils_1.expectStartWith(fileUrl, extra_utils_1.ObjectStorageCommand.getWebTorrentBaseUrl());
                    yield extra_utils_1.makeRawRequest(fileUrl, models_1.HttpStatusCode.OK_200);
                });
            });
        });
    });
    describe('With transcoding', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            before(function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield server.config.enableTranscoding();
                });
            });
            it('Should import a video and have sent it to object storage', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(120000);
                    const uuid = yield importVideo(server);
                    yield extra_utils_1.waitJobs(server);
                    const video = yield server.videos.get({ id: uuid });
                    expect(video.files).to.have.lengthOf(4);
                    expect(video.streamingPlaylists).to.have.lengthOf(1);
                    expect(video.streamingPlaylists[0].files).to.have.lengthOf(4);
                    for (const file of video.files) {
                        extra_utils_1.expectStartWith(file.fileUrl, extra_utils_1.ObjectStorageCommand.getWebTorrentBaseUrl());
                        yield extra_utils_1.makeRawRequest(file.fileUrl, models_1.HttpStatusCode.OK_200);
                    }
                    for (const file of video.streamingPlaylists[0].files) {
                        extra_utils_1.expectStartWith(file.fileUrl, extra_utils_1.ObjectStorageCommand.getPlaylistBaseUrl());
                        yield extra_utils_1.makeRawRequest(file.fileUrl, models_1.HttpStatusCode.OK_200);
                    }
                });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.killallServers([server]);
        });
    });
});
