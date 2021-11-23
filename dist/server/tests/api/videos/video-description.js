"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test video description', function () {
    let servers = [];
    let videoUUID = '';
    let videoId;
    const longDescription = 'my super description for server 1'.repeat(50);
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(40000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should upload video with long description', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            const attributes = {
                description: longDescription
            };
            yield servers[0].videos.upload({ attributes });
            yield (0, extra_utils_1.waitJobs)(servers);
            const { data } = yield servers[0].videos.list();
            videoId = data[0].id;
            videoUUID = data[0].uuid;
        });
    });
    it('Should have a truncated description on each server', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                const truncatedDescription = 'my super description for server 1'.repeat(7) +
                    'my super descrip...';
                expect(video.description).to.equal(truncatedDescription);
            }
        });
    });
    it('Should fetch long description on each server', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                const { description } = yield server.videos.getDescription({ descriptionPath: video.descriptionPath });
                expect(description).to.equal(longDescription);
            }
        });
    });
    it('Should update with a short description', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            const attributes = {
                description: 'short description'
            };
            yield servers[0].videos.update({ id: videoId, attributes });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should have a small description on each server', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                expect(video.description).to.equal('short description');
                const { description } = yield server.videos.getDescription({ descriptionPath: video.descriptionPath });
                expect(description).to.equal('short description');
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
