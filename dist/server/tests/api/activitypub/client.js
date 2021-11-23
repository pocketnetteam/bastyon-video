"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test activitypub', function () {
    let servers = [];
    let video;
    let playlist;
    function testAccount(path) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const res = yield (0, extra_utils_1.makeActivityPubGetRequest)(servers[0].url, path);
            const object = res.body;
            expect(object.type).to.equal('Person');
            expect(object.id).to.equal('http://localhost:' + servers[0].port + '/accounts/root');
            expect(object.name).to.equal('root');
            expect(object.preferredUsername).to.equal('root');
        });
    }
    function testChannel(path) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const res = yield (0, extra_utils_1.makeActivityPubGetRequest)(servers[0].url, path);
            const object = res.body;
            expect(object.type).to.equal('Group');
            expect(object.id).to.equal('http://localhost:' + servers[0].port + '/video-channels/root_channel');
            expect(object.name).to.equal('Main root channel');
            expect(object.preferredUsername).to.equal('root_channel');
        });
    }
    function testVideo(path) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const res = yield (0, extra_utils_1.makeActivityPubGetRequest)(servers[0].url, path);
            const object = res.body;
            expect(object.type).to.equal('Video');
            expect(object.id).to.equal('http://localhost:' + servers[0].port + '/videos/watch/' + video.uuid);
            expect(object.name).to.equal('video');
        });
    }
    function testPlaylist(path) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const res = yield (0, extra_utils_1.makeActivityPubGetRequest)(servers[0].url, path);
            const object = res.body;
            expect(object.type).to.equal('Playlist');
            expect(object.id).to.equal('http://localhost:' + servers[0].port + '/video-playlists/' + playlist.uuid);
            expect(object.name).to.equal('playlist');
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            {
                video = yield servers[0].videos.quickUpload({ name: 'video' });
            }
            {
                const attributes = { displayName: 'playlist', privacy: 1, videoChannelId: servers[0].store.channel.id };
                playlist = yield servers[0].playlists.create({ attributes });
            }
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should return the account object', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield testAccount('/accounts/root');
            yield testAccount('/a/root');
        });
    });
    it('Should return the channel object', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield testChannel('/video-channels/root_channel');
            yield testChannel('/c/root_channel');
        });
    });
    it('Should return the video object', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield testVideo('/videos/watch/' + video.id);
            yield testVideo('/videos/watch/' + video.uuid);
            yield testVideo('/videos/watch/' + video.shortUUID);
            yield testVideo('/w/' + video.id);
            yield testVideo('/w/' + video.uuid);
            yield testVideo('/w/' + video.shortUUID);
        });
    });
    it('Should return the playlist object', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield testPlaylist('/video-playlists/' + playlist.id);
            yield testPlaylist('/video-playlists/' + playlist.uuid);
            yield testPlaylist('/video-playlists/' + playlist.shortUUID);
            yield testPlaylist('/w/p/' + playlist.id);
            yield testPlaylist('/w/p/' + playlist.uuid);
            yield testPlaylist('/w/p/' + playlist.shortUUID);
            yield testPlaylist('/videos/watch/playlist/' + playlist.id);
            yield testPlaylist('/videos/watch/playlist/' + playlist.uuid);
            yield testPlaylist('/videos/watch/playlist/' + playlist.shortUUID);
        });
    });
    it('Should redirect to the origin video object', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const res = yield (0, extra_utils_1.makeActivityPubGetRequest)(servers[1].url, '/videos/watch/' + video.uuid, models_1.HttpStatusCode.FOUND_302);
            expect(res.header.location).to.equal('http://localhost:' + servers[0].port + '/videos/watch/' + video.uuid);
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
