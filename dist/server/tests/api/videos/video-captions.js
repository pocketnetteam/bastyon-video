"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test video captions', function () {
    const uuidRegex = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    let servers;
    let videoUUID;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            yield (0, extra_utils_1.waitJobs)(servers);
            const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'my video name' } });
            videoUUID = uuid;
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should list the captions and return an empty list', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const body = yield server.captions.list({ videoId: videoUUID });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should create two new captions', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[0].captions.add({
                language: 'ar',
                videoId: videoUUID,
                fixture: 'subtitle-good1.vtt'
            });
            yield servers[0].captions.add({
                language: 'zh',
                videoId: videoUUID,
                fixture: 'subtitle-good2.vtt',
                mimeType: 'application/octet-stream'
            });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should list these uploaded captions', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const body = yield server.captions.list({ videoId: videoUUID });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                const caption1 = body.data[0];
                expect(caption1.language.id).to.equal('ar');
                expect(caption1.language.label).to.equal('Arabic');
                expect(caption1.captionPath).to.match(new RegExp('^/lazy-static/video-captions/' + uuidRegex + '-ar.vtt$'));
                yield (0, extra_utils_1.testCaptionFile)(server.url, caption1.captionPath, 'Subtitle good 1.');
                const caption2 = body.data[1];
                expect(caption2.language.id).to.equal('zh');
                expect(caption2.language.label).to.equal('Chinese');
                expect(caption2.captionPath).to.match(new RegExp('^/lazy-static/video-captions/' + uuidRegex + '-zh.vtt$'));
                yield (0, extra_utils_1.testCaptionFile)(server.url, caption2.captionPath, 'Subtitle good 2.');
            }
        });
    });
    it('Should replace an existing caption', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[0].captions.add({
                language: 'ar',
                videoId: videoUUID,
                fixture: 'subtitle-good2.vtt'
            });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should have this caption updated', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const body = yield server.captions.list({ videoId: videoUUID });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                const caption1 = body.data[0];
                expect(caption1.language.id).to.equal('ar');
                expect(caption1.language.label).to.equal('Arabic');
                expect(caption1.captionPath).to.match(new RegExp('^/lazy-static/video-captions/' + uuidRegex + '-ar.vtt$'));
                yield (0, extra_utils_1.testCaptionFile)(server.url, caption1.captionPath, 'Subtitle good 2.');
            }
        });
    });
    it('Should replace an existing caption with a srt file and convert it', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[0].captions.add({
                language: 'ar',
                videoId: videoUUID,
                fixture: 'subtitle-good.srt'
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield (0, extra_utils_1.wait)(3000);
        });
    });
    it('Should have this caption updated and converted', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const body = yield server.captions.list({ videoId: videoUUID });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                const caption1 = body.data[0];
                expect(caption1.language.id).to.equal('ar');
                expect(caption1.language.label).to.equal('Arabic');
                expect(caption1.captionPath).to.match(new RegExp('^/lazy-static/video-captions/' + uuidRegex + '-ar.vtt$'));
                const expected = 'WEBVTT FILE\r\n' +
                    '\r\n' +
                    '1\r\n' +
                    '00:00:01.600 --> 00:00:04.200\r\n' +
                    'English (US)\r\n' +
                    '\r\n' +
                    '2\r\n' +
                    '00:00:05.900 --> 00:00:07.999\r\n' +
                    'This is a subtitle in American English\r\n' +
                    '\r\n' +
                    '3\r\n' +
                    '00:00:10.000 --> 00:00:14.000\r\n' +
                    'Adding subtitles is very easy to do\r\n';
                yield (0, extra_utils_1.testCaptionFile)(server.url, caption1.captionPath, expected);
            }
        });
    });
    it('Should remove one caption', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[0].captions.delete({ videoId: videoUUID, language: 'ar' });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should only list the caption that was not deleted', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const body = yield server.captions.list({ videoId: videoUUID });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const caption = body.data[0];
                expect(caption.language.id).to.equal('zh');
                expect(caption.language.label).to.equal('Chinese');
                expect(caption.captionPath).to.match(new RegExp('^/lazy-static/video-captions/' + uuidRegex + '-zh.vtt$'));
                yield (0, extra_utils_1.testCaptionFile)(server.url, caption.captionPath, 'Subtitle good 2.');
            }
        });
    });
    it('Should remove the video, and thus all video captions', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const video = yield servers[0].videos.get({ id: videoUUID });
            const { data: captions } = yield servers[0].captions.list({ videoId: videoUUID });
            yield servers[0].videos.remove({ id: videoUUID });
            yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server: servers[0], video, captions });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
