"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const models_1 = require("@shared/models");
const extra_utils_1 = require("../../../shared/extra-utils");
function testThumbnail(server, videoId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const video = yield server.videos.get({ id: videoId });
        const requests = [
            extra_utils_1.makeRawRequest(path_1.join(server.url, video.thumbnailPath), models_1.HttpStatusCode.OK_200),
            extra_utils_1.makeRawRequest(path_1.join(server.url, video.thumbnailPath), models_1.HttpStatusCode.OK_200)
        ];
        for (const req of requests) {
            const res = yield req;
            chai_1.expect(res.body).to.not.have.lengthOf(0);
        }
    });
}
describe('Test regenerate thumbnails script', function () {
    let servers;
    let video1;
    let video2;
    let remoteVideo;
    let thumbnail1Path;
    let thumbnailRemotePath;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            {
                const videoUUID1 = (yield servers[0].videos.quickUpload({ name: 'video 1' })).uuid;
                video1 = yield servers[0].videos.get({ id: videoUUID1 });
                thumbnail1Path = path_1.join(servers[0].servers.buildDirectory('thumbnails'), path_1.basename(video1.thumbnailPath));
                const videoUUID2 = (yield servers[0].videos.quickUpload({ name: 'video 2' })).uuid;
                video2 = yield servers[0].videos.get({ id: videoUUID2 });
            }
            {
                const videoUUID = (yield servers[1].videos.quickUpload({ name: 'video 3' })).uuid;
                yield extra_utils_1.waitJobs(servers);
                remoteVideo = yield servers[0].videos.get({ id: videoUUID });
                thumbnailRemotePath = path_1.join(servers[0].servers.buildDirectory('thumbnails'), path_1.basename(remoteVideo.thumbnailPath));
            }
            yield fs_extra_1.writeFile(thumbnail1Path, '');
            yield fs_extra_1.writeFile(thumbnailRemotePath, '');
        });
    });
    it('Should have empty thumbnails', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const res = yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, video1.thumbnailPath), models_1.HttpStatusCode.OK_200);
                chai_1.expect(res.body).to.have.lengthOf(0);
            }
            {
                const res = yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, video2.thumbnailPath), models_1.HttpStatusCode.OK_200);
                chai_1.expect(res.body).to.not.have.lengthOf(0);
            }
            {
                const res = yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, remoteVideo.thumbnailPath), models_1.HttpStatusCode.OK_200);
                chai_1.expect(res.body).to.have.lengthOf(0);
            }
        });
    });
    it('Should regenerate local thumbnails from the CLI', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield servers[0].cli.execWithEnv(`npm run regenerate-thumbnails`);
        });
    });
    it('Should have generated new thumbnail files', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield testThumbnail(servers[0], video1.uuid);
            yield testThumbnail(servers[0], video2.uuid);
            const res = yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, remoteVideo.thumbnailPath), models_1.HttpStatusCode.OK_200);
            chai_1.expect(res.body).to.have.lengthOf(0);
        });
    });
    it('Should have deleted old thumbnail files', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, video1.thumbnailPath), models_1.HttpStatusCode.NOT_FOUND_404);
            }
            {
                yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, video2.thumbnailPath), models_1.HttpStatusCode.NOT_FOUND_404);
            }
            {
                const res = yield extra_utils_1.makeRawRequest(path_1.join(servers[0].url, remoteVideo.thumbnailPath), models_1.HttpStatusCode.OK_200);
                chai_1.expect(res.body).to.have.lengthOf(0);
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
