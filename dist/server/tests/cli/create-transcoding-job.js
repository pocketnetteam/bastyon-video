"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const models_1 = require("@shared/models");
const extra_utils_1 = require("../../../shared/extra-utils");
const expect = chai.expect;
function checkFilesInObjectStorage(files, type) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const file of files) {
            const shouldStartWith = type === 'webtorrent'
                ? extra_utils_1.ObjectStorageCommand.getWebTorrentBaseUrl()
                : extra_utils_1.ObjectStorageCommand.getPlaylistBaseUrl();
            extra_utils_1.expectStartWith(file.fileUrl, shouldStartWith);
            yield extra_utils_1.makeRawRequest(file.fileUrl, models_1.HttpStatusCode.OK_200);
        }
    });
}
function runTests(objectStorage) {
    let servers = [];
    const videosUUID = [];
    const publishedAt = [];
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const config = objectStorage
                ? extra_utils_1.ObjectStorageCommand.getDefaultConfig()
                : {};
            servers = yield extra_utils_1.createMultipleServers(2, config);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield servers[0].config.disableTranscoding();
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            if (objectStorage)
                yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
            for (let i = 1; i <= 5; i++) {
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'video' + i } });
                yield extra_utils_1.waitJobs(servers);
                const video = yield servers[0].videos.get({ id: uuid });
                publishedAt.push(video.publishedAt);
                if (i > 2) {
                    videosUUID.push(uuid);
                }
                else {
                    videosUUID.push(shortUUID);
                }
            }
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should have two video files on each server', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            for (const server of servers) {
                const { data } = yield server.videos.list();
                expect(data).to.have.lengthOf(videosUUID.length);
                for (const video of data) {
                    const videoDetail = yield server.videos.get({ id: video.uuid });
                    expect(videoDetail.files).to.have.lengthOf(1);
                    expect(videoDetail.streamingPlaylists).to.have.lengthOf(0);
                }
            }
        });
    });
    it('Should run a transcoding job on video 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].cli.execWithEnv(`npm run create-transcoding-job -- -v ${videosUUID[1]}`);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { data } = yield server.videos.list();
                let infoHashes;
                for (const video of data) {
                    const videoDetails = yield server.videos.get({ id: video.uuid });
                    if (video.shortUUID === videosUUID[1] || video.uuid === videosUUID[1]) {
                        expect(videoDetails.files).to.have.lengthOf(4);
                        expect(videoDetails.streamingPlaylists).to.have.lengthOf(0);
                        if (objectStorage)
                            yield checkFilesInObjectStorage(videoDetails.files, 'webtorrent');
                        if (!infoHashes) {
                            infoHashes = {};
                            for (const file of videoDetails.files) {
                                infoHashes[file.resolution.id.toString()] = file.magnetUri;
                            }
                        }
                        else {
                            for (const resolution of Object.keys(infoHashes)) {
                                const file = videoDetails.files.find(f => f.resolution.id.toString() === resolution);
                                expect(file.magnetUri).to.equal(infoHashes[resolution]);
                            }
                        }
                    }
                    else {
                        expect(videoDetails.files).to.have.lengthOf(1);
                        expect(videoDetails.streamingPlaylists).to.have.lengthOf(0);
                    }
                }
            }
        });
    });
    it('Should run a transcoding job on video 1 with resolution', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].cli.execWithEnv(`npm run create-transcoding-job -- -v ${videosUUID[0]} -r 480`);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { data } = yield server.videos.list();
                expect(data).to.have.lengthOf(videosUUID.length);
                const videoDetails = yield server.videos.get({ id: videosUUID[0] });
                expect(videoDetails.files).to.have.lengthOf(2);
                expect(videoDetails.files[0].resolution.id).to.equal(720);
                expect(videoDetails.files[1].resolution.id).to.equal(480);
                expect(videoDetails.streamingPlaylists).to.have.lengthOf(0);
                if (objectStorage)
                    yield checkFilesInObjectStorage(videoDetails.files, 'webtorrent');
            }
        });
    });
    it('Should generate an HLS resolution', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield servers[0].cli.execWithEnv(`npm run create-transcoding-job -- -v ${videosUUID[2]} --generate-hls -r 480`);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const videoDetails = yield server.videos.get({ id: videosUUID[2] });
                expect(videoDetails.files).to.have.lengthOf(1);
                if (objectStorage)
                    yield checkFilesInObjectStorage(videoDetails.files, 'webtorrent');
                expect(videoDetails.streamingPlaylists).to.have.lengthOf(1);
                const files = videoDetails.streamingPlaylists[0].files;
                expect(files).to.have.lengthOf(1);
                expect(files[0].resolution.id).to.equal(480);
                if (objectStorage)
                    yield checkFilesInObjectStorage(files, 'playlist');
            }
        });
    });
    it('Should not duplicate an HLS resolution', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield servers[0].cli.execWithEnv(`npm run create-transcoding-job -- -v ${videosUUID[2]} --generate-hls -r 480`);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const videoDetails = yield server.videos.get({ id: videosUUID[2] });
                const files = videoDetails.streamingPlaylists[0].files;
                expect(files).to.have.lengthOf(1);
                expect(files[0].resolution.id).to.equal(480);
                if (objectStorage)
                    yield checkFilesInObjectStorage(files, 'playlist');
            }
        });
    });
    it('Should generate all HLS resolutions', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield servers[0].cli.execWithEnv(`npm run create-transcoding-job -- -v ${videosUUID[3]} --generate-hls`);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const videoDetails = yield server.videos.get({ id: videosUUID[3] });
                expect(videoDetails.files).to.have.lengthOf(1);
                expect(videoDetails.streamingPlaylists).to.have.lengthOf(1);
                const files = videoDetails.streamingPlaylists[0].files;
                expect(files).to.have.lengthOf(4);
                if (objectStorage)
                    yield checkFilesInObjectStorage(files, 'playlist');
            }
        });
    });
    it('Should optimize the video file and generate HLS videos if enabled in config', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield servers[0].config.enableTranscoding();
            yield servers[0].cli.execWithEnv(`npm run create-transcoding-job -- -v ${videosUUID[4]}`);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const videoDetails = yield server.videos.get({ id: videosUUID[4] });
                expect(videoDetails.files).to.have.lengthOf(4);
                expect(videoDetails.streamingPlaylists).to.have.lengthOf(1);
                expect(videoDetails.streamingPlaylists[0].files).to.have.lengthOf(4);
                if (objectStorage) {
                    yield checkFilesInObjectStorage(videoDetails.files, 'webtorrent');
                    yield checkFilesInObjectStorage(videoDetails.streamingPlaylists[0].files, 'playlist');
                }
            }
        });
    });
    it('Should not have updated published at attributes', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const id of videosUUID) {
                const video = yield servers[0].videos.get({ id });
                expect(publishedAt.some(p => video.publishedAt === p)).to.be.true;
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
}
describe('Test create transcoding jobs', function () {
    describe('On filesystem', function () {
        runTests(false);
    });
    describe('On object storage', function () {
        if (extra_utils_1.areObjectStorageTestsDisabled())
            return;
        runTests(true);
    });
});
