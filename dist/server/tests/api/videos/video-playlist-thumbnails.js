"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("../../../../shared/extra-utils");
const expect = chai.expect;
describe('Playlist thumbnail', function () {
    let servers = [];
    let playlistWithoutThumbnailId;
    let playlistWithThumbnailId;
    let withThumbnailE1;
    let withThumbnailE2;
    let withoutThumbnailE1;
    let withoutThumbnailE2;
    let video1;
    let video2;
    function getPlaylistWithoutThumbnail(server) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield server.playlists.list({ start: 0, count: 10 });
            return body.data.find(p => p.displayName === 'playlist without thumbnail');
        });
    }
    function getPlaylistWithThumbnail(server) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield server.playlists.list({ start: 0, count: 10 });
            return body.data.find(p => p.displayName === 'playlist with thumbnail');
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2, { transcoding: { enabled: false } });
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            video1 = (yield servers[0].videos.quickUpload({ name: 'video 1' })).id;
            video2 = (yield servers[0].videos.quickUpload({ name: 'video 2' })).id;
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should automatically update the thumbnail when adding an element', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const created = yield servers[1].playlists.create({
                attributes: {
                    displayName: 'playlist without thumbnail',
                    privacy: 1,
                    videoChannelId: servers[1].store.channel.id
                }
            });
            playlistWithoutThumbnailId = created.id;
            const added = yield servers[1].playlists.addElement({
                playlistId: playlistWithoutThumbnailId,
                attributes: { videoId: video1 }
            });
            withoutThumbnailE1 = added.id;
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithoutThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail-playlist', p.thumbnailPath);
            }
        });
    });
    it('Should not update the thumbnail if we explicitly uploaded a thumbnail', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const created = yield servers[1].playlists.create({
                attributes: {
                    displayName: 'playlist with thumbnail',
                    privacy: 1,
                    videoChannelId: servers[1].store.channel.id,
                    thumbnailfile: 'thumbnail.jpg'
                }
            });
            playlistWithThumbnailId = created.id;
            const added = yield servers[1].playlists.addElement({
                playlistId: playlistWithThumbnailId,
                attributes: { videoId: video1 }
            });
            withThumbnailE1 = added.id;
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail', p.thumbnailPath);
            }
        });
    });
    it('Should automatically update the thumbnail when moving the first element', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const added = yield servers[1].playlists.addElement({
                playlistId: playlistWithoutThumbnailId,
                attributes: { videoId: video2 }
            });
            withoutThumbnailE2 = added.id;
            yield servers[1].playlists.reorderElements({
                playlistId: playlistWithoutThumbnailId,
                attributes: {
                    startPosition: 1,
                    insertAfterPosition: 2
                }
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithoutThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail-playlist', p.thumbnailPath);
            }
        });
    });
    it('Should not update the thumbnail when moving the first element if we explicitly uploaded a thumbnail', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const added = yield servers[1].playlists.addElement({
                playlistId: playlistWithThumbnailId,
                attributes: { videoId: video2 }
            });
            withThumbnailE2 = added.id;
            yield servers[1].playlists.reorderElements({
                playlistId: playlistWithThumbnailId,
                attributes: {
                    startPosition: 1,
                    insertAfterPosition: 2
                }
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail', p.thumbnailPath);
            }
        });
    });
    it('Should automatically update the thumbnail when deleting the first element', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[1].playlists.removeElement({
                playlistId: playlistWithoutThumbnailId,
                elementId: withoutThumbnailE1
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithoutThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail-playlist', p.thumbnailPath);
            }
        });
    });
    it('Should not update the thumbnail when deleting the first element if we explicitly uploaded a thumbnail', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[1].playlists.removeElement({
                playlistId: playlistWithThumbnailId,
                elementId: withThumbnailE1
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail', p.thumbnailPath);
            }
        });
    });
    it('Should the thumbnail when we delete the last element', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[1].playlists.removeElement({
                playlistId: playlistWithoutThumbnailId,
                elementId: withoutThumbnailE2
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithoutThumbnail(server);
                expect(p.thumbnailPath).to.be.null;
            }
        });
    });
    it('Should not update the thumbnail when we delete the last element if we explicitly uploaded a thumbnail', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[1].playlists.removeElement({
                playlistId: playlistWithThumbnailId,
                elementId: withThumbnailE2
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const p = yield getPlaylistWithThumbnail(server);
                yield (0, extra_utils_1.testImage)(server.url, 'thumbnail', p.thumbnailPath);
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
