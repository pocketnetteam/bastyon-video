"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test ActivityPub playlists search', function () {
    let servers;
    let playlistServer1UUID;
    let playlistServer2UUID;
    let video2Server2;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.setDefaultVideoChannel(servers);
            {
                const video1 = (yield servers[0].videos.quickUpload({ name: 'video 1' })).uuid;
                const video2 = (yield servers[0].videos.quickUpload({ name: 'video 2' })).uuid;
                const attributes = {
                    displayName: 'playlist 1 on server 1',
                    privacy: 1,
                    videoChannelId: servers[0].store.channel.id
                };
                const created = yield servers[0].playlists.create({ attributes });
                playlistServer1UUID = created.uuid;
                for (const videoId of [video1, video2]) {
                    yield servers[0].playlists.addElement({ playlistId: playlistServer1UUID, attributes: { videoId } });
                }
            }
            {
                const videoId = (yield servers[1].videos.quickUpload({ name: 'video 1' })).uuid;
                video2Server2 = (yield servers[1].videos.quickUpload({ name: 'video 2' })).uuid;
                const attributes = {
                    displayName: 'playlist 1 on server 2',
                    privacy: 1,
                    videoChannelId: servers[1].store.channel.id
                };
                const created = yield servers[1].playlists.create({ attributes });
                playlistServer2UUID = created.uuid;
                yield servers[1].playlists.addElement({ playlistId: playlistServer2UUID, attributes: { videoId } });
            }
            yield extra_utils_1.waitJobs(servers);
            command = servers[0].search;
        });
    });
    it('Should not find a remote playlist', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const search = 'http://localhost:' + servers[1].port + '/video-playlists/43';
                const body = yield command.searchPlaylists({ search, token: servers[0].accessToken });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const search = 'http://localhost:' + servers[1].port + '/video-playlists/' + playlistServer2UUID;
                const body = yield command.searchPlaylists({ search });
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should search a local playlist', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = 'http://localhost:' + servers[0].port + '/video-playlists/' + playlistServer1UUID;
            const body = yield command.searchPlaylists({ search });
            expect(body.total).to.equal(1);
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(1);
            expect(body.data[0].displayName).to.equal('playlist 1 on server 1');
            expect(body.data[0].videosLength).to.equal(2);
        });
    });
    it('Should search a local playlist with an alternative URL', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searches = [
                'http://localhost:' + servers[0].port + '/videos/watch/playlist/' + playlistServer1UUID,
                'http://localhost:' + servers[0].port + '/w/p/' + playlistServer1UUID
            ];
            for (const search of searches) {
                for (const token of [undefined, servers[0].accessToken]) {
                    const body = yield command.searchPlaylists({ search, token });
                    expect(body.total).to.equal(1);
                    expect(body.data).to.be.an('array');
                    expect(body.data).to.have.lengthOf(1);
                    expect(body.data[0].displayName).to.equal('playlist 1 on server 1');
                    expect(body.data[0].videosLength).to.equal(2);
                }
            }
        });
    });
    it('Should search a remote playlist', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searches = [
                'http://localhost:' + servers[1].port + '/video-playlists/' + playlistServer2UUID,
                'http://localhost:' + servers[1].port + '/videos/watch/playlist/' + playlistServer2UUID,
                'http://localhost:' + servers[1].port + '/w/p/' + playlistServer2UUID
            ];
            for (const search of searches) {
                const body = yield command.searchPlaylists({ search, token: servers[0].accessToken });
                expect(body.total).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].displayName).to.equal('playlist 1 on server 2');
                expect(body.data[0].videosLength).to.equal(1);
            }
        });
    });
    it('Should not list this remote playlist', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield servers[0].playlists.list({ start: 0, count: 10 });
            expect(body.total).to.equal(1);
            expect(body.data).to.have.lengthOf(1);
            expect(body.data[0].displayName).to.equal('playlist 1 on server 1');
        });
    });
    it('Should update the playlist of server 2, and refresh it on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[1].playlists.addElement({ playlistId: playlistServer2UUID, attributes: { videoId: video2Server2 } });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/video-playlists/' + playlistServer2UUID;
            yield command.searchPlaylists({ search, token: servers[0].accessToken });
            yield extra_utils_1.wait(5000);
            const body = yield command.searchPlaylists({ search, token: servers[0].accessToken });
            expect(body.total).to.equal(1);
            expect(body.data).to.have.lengthOf(1);
            const playlist = body.data[0];
            expect(playlist.videosLength).to.equal(2);
        });
    });
    it('Should delete playlist of server 2, and delete it on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[1].playlists.delete({ playlistId: playlistServer2UUID });
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.wait(10000);
            const search = 'http://localhost:' + servers[1].port + '/video-playlists/' + playlistServer2UUID;
            yield command.searchPlaylists({ search, token: servers[0].accessToken });
            yield extra_utils_1.wait(5000);
            const body = yield command.searchPlaylists({ search, token: servers[0].accessToken });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
