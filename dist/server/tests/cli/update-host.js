"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
describe('Test update host scripts', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            const overrideConfig = {
                webserver: {
                    port: 9256
                }
            };
            server = yield (0, extra_utils_1.createSingleServer)(2, overrideConfig);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            const { uuid: video1UUID } = yield server.videos.upload();
            yield server.videos.upload();
            yield server.users.create({ username: 'toto', password: 'coucou' });
            const videoChannel = {
                name: 'second_channel',
                displayName: 'second video channel',
                description: 'super video channel description'
            };
            yield server.channels.create({ attributes: videoChannel });
            const text = 'my super first comment';
            yield server.comments.createThread({ videoId: video1UUID, text });
            yield (0, extra_utils_1.waitJobs)(server);
        });
    });
    it('Should run update host', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield (0, extra_utils_1.killallServers)([server]);
            yield server.run();
            yield server.cli.execWithEnv(`npm run update-host`);
        });
    });
    it('Should have updated videos url', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total, data } = yield server.videos.list();
            (0, chai_1.expect)(total).to.equal(2);
            for (const video of data) {
                const { body } = yield (0, extra_utils_1.makeActivityPubGetRequest)(server.url, '/videos/watch/' + video.uuid);
                (0, chai_1.expect)(body.id).to.equal('http://localhost:9002/videos/watch/' + video.uuid);
                const videoDetails = yield server.videos.get({ id: video.uuid });
                (0, chai_1.expect)(videoDetails.trackerUrls[0]).to.include(server.host);
                (0, chai_1.expect)(videoDetails.streamingPlaylists[0].playlistUrl).to.include(server.host);
                (0, chai_1.expect)(videoDetails.streamingPlaylists[0].segmentsSha256Url).to.include(server.host);
            }
        });
    });
    it('Should have updated video channels url', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data, total } = yield server.channels.list({ sort: '-name' });
            (0, chai_1.expect)(total).to.equal(3);
            for (const channel of data) {
                const { body } = yield (0, extra_utils_1.makeActivityPubGetRequest)(server.url, '/video-channels/' + channel.name);
                (0, chai_1.expect)(body.id).to.equal('http://localhost:9002/video-channels/' + channel.name);
            }
        });
    });
    it('Should have updated accounts url', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield server.accounts.list();
            (0, chai_1.expect)(body.total).to.equal(3);
            for (const account of body.data) {
                const usernameWithDomain = account.name;
                const { body } = yield (0, extra_utils_1.makeActivityPubGetRequest)(server.url, '/accounts/' + usernameWithDomain);
                (0, chai_1.expect)(body.id).to.equal('http://localhost:9002/accounts/' + usernameWithDomain);
            }
        });
    });
    it('Should have updated torrent hosts', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const { data } = yield server.videos.list();
            (0, chai_1.expect)(data).to.have.lengthOf(2);
            for (const video of data) {
                const videoDetails = yield server.videos.get({ id: video.id });
                const files = videoDetails.files.concat(videoDetails.streamingPlaylists[0].files);
                (0, chai_1.expect)(files).to.have.lengthOf(8);
                for (const file of files) {
                    (0, chai_1.expect)(file.magnetUri).to.contain('localhost%3A9002%2Ftracker%2Fsocket');
                    (0, chai_1.expect)(file.magnetUri).to.contain('localhost%3A9002%2Fstatic%2F');
                    const torrent = yield (0, extra_utils_1.parseTorrentVideo)(server, file);
                    const announceWS = torrent.announce.find(a => a === 'ws://localhost:9002/tracker/socket');
                    (0, chai_1.expect)(announceWS).to.not.be.undefined;
                    const announceHttp = torrent.announce.find(a => a === 'http://localhost:9002/tracker/announce');
                    (0, chai_1.expect)(announceHttp).to.not.be.undefined;
                    (0, chai_1.expect)(torrent.urlList[0]).to.contain('http://localhost:9002/static/');
                }
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
