"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
function assertVideoProperties(video, resolution, extname, size) {
    expect(video).to.have.nested.property('resolution.id', resolution);
    expect(video).to.have.property('torrentUrl').that.includes(`-${resolution}.torrent`);
    expect(video).to.have.property('fileUrl').that.includes(`.${extname}`);
    expect(video).to.have.property('magnetUri').that.includes(`.${extname}`);
    expect(video).to.have.property('size').that.is.above(0);
    if (size)
        expect(video.size).to.equal(size);
}
function checkFiles(video, objectStorage) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        for (const file of video.files) {
            if (objectStorage)
                (0, extra_utils_1.expectStartWith)(file.fileUrl, extra_utils_1.ObjectStorageCommand.getWebTorrentBaseUrl());
            yield (0, extra_utils_1.makeRawRequest)(file.fileUrl, models_1.HttpStatusCode.OK_200);
        }
    });
}
function runTests(objectStorage) {
    let video1ShortId;
    let video2UUID;
    let servers = [];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(90000);
            const config = objectStorage
                ? extra_utils_1.ObjectStorageCommand.getDefaultConfig()
                : {};
            servers = yield (0, extra_utils_1.createMultipleServers)(2, config);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            if (objectStorage)
                yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
            {
                const { shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'video1' } });
                video1ShortId = shortUUID;
            }
            {
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video2' } });
                video2UUID = uuid;
            }
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should run a import job on video 1 with a lower resolution', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const command = `npm run create-import-video-file-job -- -v ${video1ShortId} -i server/tests/fixtures/video_short-480.webm`;
            yield servers[0].cli.execWithEnv(command);
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { data: videos } = yield server.videos.list();
                expect(videos).to.have.lengthOf(2);
                const video = videos.find(({ shortUUID }) => shortUUID === video1ShortId);
                const videoDetails = yield server.videos.get({ id: video.shortUUID });
                expect(videoDetails.files).to.have.lengthOf(2);
                const [originalVideo, transcodedVideo] = videoDetails.files;
                assertVideoProperties(originalVideo, 720, 'webm', 218910);
                assertVideoProperties(transcodedVideo, 480, 'webm', 69217);
                yield checkFiles(videoDetails, objectStorage);
            }
        });
    });
    it('Should run a import job on video 2 with the same resolution and a different extension', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const command = `npm run create-import-video-file-job -- -v ${video2UUID} -i server/tests/fixtures/video_short.ogv`;
            yield servers[1].cli.execWithEnv(command);
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { data: videos } = yield server.videos.list();
                expect(videos).to.have.lengthOf(2);
                const video = videos.find(({ uuid }) => uuid === video2UUID);
                const videoDetails = yield server.videos.get({ id: video.uuid });
                expect(videoDetails.files).to.have.lengthOf(4);
                const [originalVideo, transcodedVideo420, transcodedVideo320, transcodedVideo240] = videoDetails.files;
                assertVideoProperties(originalVideo, 720, 'ogv', 140849);
                assertVideoProperties(transcodedVideo420, 480, 'mp4');
                assertVideoProperties(transcodedVideo320, 360, 'mp4');
                assertVideoProperties(transcodedVideo240, 240, 'mp4');
                yield checkFiles(videoDetails, objectStorage);
            }
        });
    });
    it('Should run a import job on video 2 with the same resolution and the same extension', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const command = `npm run create-import-video-file-job -- -v ${video1ShortId} -i server/tests/fixtures/video_short2.webm`;
            yield servers[0].cli.execWithEnv(command);
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { data: videos } = yield server.videos.list();
                expect(videos).to.have.lengthOf(2);
                const video = videos.find(({ shortUUID }) => shortUUID === video1ShortId);
                const videoDetails = yield server.videos.get({ id: video.uuid });
                expect(videoDetails.files).to.have.lengthOf(2);
                const [video720, video480] = videoDetails.files;
                assertVideoProperties(video720, 720, 'webm', 942961);
                assertVideoProperties(video480, 480, 'webm', 69217);
                yield checkFiles(videoDetails, objectStorage);
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
}
describe('Test create import video jobs', function () {
    describe('On filesystem', function () {
        runTests(false);
    });
    describe('On object storage', function () {
        if ((0, extra_utils_1.areObjectStorageTestsDisabled)())
            return;
        runTests(true);
    });
});
