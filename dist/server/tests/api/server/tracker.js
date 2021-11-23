"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const magnet_uri_1 = (0, tslib_1.__importDefault)(require("magnet-uri"));
const webtorrent_1 = (0, tslib_1.__importDefault)(require("webtorrent"));
const extra_utils_1 = require("@shared/extra-utils");
describe('Test tracker', function () {
    let server;
    let badMagnet;
    let goodMagnet;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            {
                const { uuid } = yield server.videos.upload();
                const video = yield server.videos.get({ id: uuid });
                goodMagnet = video.files[0].magnetUri;
                const parsed = magnet_uri_1.default.decode(goodMagnet);
                parsed.infoHash = '010597bb88b1968a5693a4fa8267c592ca65f2e9';
                badMagnet = magnet_uri_1.default.encode(parsed);
            }
        });
    });
    it('Should succeed with the correct infohash', function (done) {
        this.timeout(10000);
        const webtorrent = new webtorrent_1.default();
        const torrent = webtorrent.add(goodMagnet);
        torrent.on('error', done);
        torrent.on('warning', warn => {
            const message = typeof warn === 'string' ? warn : warn.message;
            if (message.includes('Unknown infoHash '))
                return done(new Error('Error on infohash'));
        });
        torrent.on('done', done);
    });
    it('Should disable the tracker', function (done) {
        this.timeout(20000);
        const errCb = () => done(new Error('Tracker is enabled'));
        (0, extra_utils_1.killallServers)([server])
            .then(() => server.run({ tracker: { enabled: false } }))
            .then(() => {
            const webtorrent = new webtorrent_1.default();
            const torrent = webtorrent.add(goodMagnet);
            torrent.on('error', done);
            torrent.on('warning', warn => {
                const message = typeof warn === 'string' ? warn : warn.message;
                if (message.includes('disabled ')) {
                    torrent.off('done', errCb);
                    return done();
                }
            });
            torrent.on('done', errCb);
        });
    });
    it('Should return an error when adding an incorrect infohash', function (done) {
        this.timeout(20000);
        (0, extra_utils_1.killallServers)([server])
            .then(() => server.run())
            .then(() => {
            const webtorrent = new webtorrent_1.default();
            const torrent = webtorrent.add(badMagnet);
            torrent.on('error', done);
            torrent.on('warning', warn => {
                const message = typeof warn === 'string' ? warn : warn.message;
                if (message.includes('Unknown infoHash '))
                    return done();
            });
            torrent.on('done', () => done(new Error('No error on infohash')));
        });
    });
    it('Should block the IP after the failed infohash', function (done) {
        const webtorrent = new webtorrent_1.default();
        const torrent = webtorrent.add(goodMagnet);
        torrent.on('error', done);
        torrent.on('warning', warn => {
            const message = typeof warn === 'string' ? warn : warn.message;
            if (message.includes('Unsupported tracker protocol'))
                return done();
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
