"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test resumable upload', function () {
    const defaultFixture = 'video_short.mp4';
    let server;
    let rootId;
    function buildSize(fixture, size) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (size !== undefined)
                return size;
            const baseFixture = extra_utils_1.buildAbsoluteFixturePath(fixture);
            return (yield fs_extra_1.stat(baseFixture)).size;
        });
    }
    function prepareUpload(sizeArg) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const size = yield buildSize(defaultFixture, sizeArg);
            const attributes = {
                name: 'video',
                channelId: server.store.channel.id,
                privacy: 1,
                fixture: defaultFixture
            };
            const mimetype = 'video/mp4';
            const res = yield server.videos.prepareResumableUpload({ attributes, size, mimetype });
            return res.header['location'].split('?')[1];
        });
    }
    function sendChunks(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { pathUploadId, expectedStatus, contentLength, contentRangeBuilder } = options;
            const size = yield buildSize(defaultFixture, options.size);
            const absoluteFilePath = extra_utils_1.buildAbsoluteFixturePath(defaultFixture);
            return server.videos.sendResumableChunks({
                pathUploadId,
                videoFilePath: absoluteFilePath,
                size,
                contentLength,
                contentRangeBuilder,
                expectedStatus
            });
        });
    }
    function checkFileSize(uploadIdArg, expectedSize) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const uploadId = uploadIdArg.replace(/^upload_id=/, '');
            const subPath = path_1.join('tmp', 'resumable-uploads', uploadId);
            const filePath = server.servers.buildDirectory(subPath);
            const exists = yield fs_extra_1.pathExists(filePath);
            if (expectedSize === null) {
                expect(exists).to.be.false;
                return;
            }
            expect(exists).to.be.true;
            expect((yield fs_extra_1.stat(filePath)).size).to.equal(expectedSize);
        });
    }
    function countResumableUploads() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const subPath = path_1.join('tmp', 'resumable-uploads');
            const filePath = server.servers.buildDirectory(subPath);
            const files = yield fs_extra_1.readdir(filePath);
            return files.length;
        });
    }
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield extra_utils_1.setDefaultVideoChannel([server]);
            const body = yield server.users.getMyInfo();
            rootId = body.id;
            yield server.users.update({ userId: rootId, videoQuota: 10000000 });
        });
    });
    describe('Directory cleaning', function () {
        it('Should correctly delete files after an upload', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const uploadId = yield prepareUpload();
                yield sendChunks({ pathUploadId: uploadId });
                yield server.videos.endResumableUpload({ pathUploadId: uploadId });
                expect(yield countResumableUploads()).to.equal(0);
            });
        });
        it('Should not delete files after an unfinished upload', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield prepareUpload();
                expect(yield countResumableUploads()).to.equal(2);
            });
        });
        it('Should not delete recent uploads', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.debug.sendCommand({ body: { command: 'remove-dandling-resumable-uploads' } });
                expect(yield countResumableUploads()).to.equal(2);
            });
        });
        it('Should delete old uploads', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.debug.sendCommand({ body: { command: 'remove-dandling-resumable-uploads' } });
                expect(yield countResumableUploads()).to.equal(0);
            });
        });
    });
    describe('Resumable upload and chunks', function () {
        it('Should accept the same amount of chunks', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const uploadId = yield prepareUpload();
                yield sendChunks({ pathUploadId: uploadId });
                yield checkFileSize(uploadId, null);
            });
        });
        it('Should not accept more chunks than expected', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const uploadId = yield prepareUpload(100);
                yield sendChunks({ pathUploadId: uploadId, expectedStatus: models_1.HttpStatusCode.CONFLICT_409 });
                yield checkFileSize(uploadId, 0);
            });
        });
        it('Should not accept more chunks than expected with an invalid content length/content range', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const uploadId = yield prepareUpload(1500);
                if (process.version.startsWith('v16')) {
                    yield sendChunks({ pathUploadId: uploadId, expectedStatus: models_1.HttpStatusCode.CONFLICT_409, contentLength: 1000 });
                    yield checkFileSize(uploadId, 1000);
                }
                else {
                    yield sendChunks({ pathUploadId: uploadId, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400, contentLength: 1000 });
                    yield checkFileSize(uploadId, 0);
                }
            });
        });
        it('Should not accept more chunks than expected with an invalid content length', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const uploadId = yield prepareUpload(500);
                const size = 1000;
                const expectedStatus = process.version.startsWith('v16')
                    ? models_1.HttpStatusCode.CONFLICT_409
                    : models_1.HttpStatusCode.BAD_REQUEST_400;
                const contentRangeBuilder = (start) => `bytes ${start}-${start + size - 1}/${size}`;
                yield sendChunks({ pathUploadId: uploadId, expectedStatus, contentRangeBuilder, contentLength: size });
                yield checkFileSize(uploadId, 0);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
