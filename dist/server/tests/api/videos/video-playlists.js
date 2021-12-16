"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
function checkPlaylistElementType(servers, playlistId, type, position, name, total) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const server of servers) {
            const body = yield server.playlists.listVideos({ token: server.accessToken, playlistId, start: 0, count: 10 });
            expect(body.total).to.equal(total);
            const videoElement = body.data.find(e => e.position === position);
            expect(videoElement.type).to.equal(type, 'On server ' + server.url);
            if (type === 0) {
                expect(videoElement.video).to.not.be.null;
                expect(videoElement.video.name).to.equal(name);
            }
            else {
                expect(videoElement.video).to.be.null;
            }
        }
    });
}
describe('Test video playlists', function () {
    let servers = [];
    let playlistServer2Id1;
    let playlistServer2Id2;
    let playlistServer2UUID2;
    let playlistServer1Id;
    let playlistServer1UUID;
    let playlistServer1UUID2;
    let playlistElementServer1Video4;
    let playlistElementServer1Video5;
    let playlistElementNSFW;
    let nsfwVideoServer1;
    let userTokenServer1;
    let commands;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(3, { transcoding: { enabled: false } });
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.setDefaultVideoChannel(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield extra_utils_1.doubleFollow(servers[0], servers[2]);
            commands = servers.map(s => s.playlists);
            {
                servers[0].store.videos = [];
                servers[1].store.videos = [];
                servers[2].store.videos = [];
                for (const server of servers) {
                    for (let i = 0; i < 7; i++) {
                        const name = `video ${i} server ${server.serverNumber}`;
                        const video = yield server.videos.upload({ attributes: { name, nsfw: false } });
                        server.store.videos.push(video);
                    }
                }
            }
            nsfwVideoServer1 = (yield servers[0].videos.quickUpload({ name: 'NSFW video', nsfw: true })).id;
            userTokenServer1 = yield servers[0].users.generateUserAndToken('user1');
            yield extra_utils_1.waitJobs(servers);
        });
    });
    describe('Get default playlists', function () {
        it('Should list video playlist privacies', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const privacies = yield commands[0].getPrivacies();
                expect(Object.keys(privacies)).to.have.length.at.least(3);
                expect(privacies[3]).to.equal('Private');
            });
        });
        it('Should list watch later playlist', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const token = servers[0].accessToken;
                {
                    const body = yield commands[0].listByAccount({ token, handle: 'root', playlistType: 2 });
                    expect(body.total).to.equal(1);
                    expect(body.data).to.have.lengthOf(1);
                    const playlist = body.data[0];
                    expect(playlist.displayName).to.equal('Watch later');
                    expect(playlist.type.id).to.equal(2);
                    expect(playlist.type.label).to.equal('Watch later');
                }
                {
                    const body = yield commands[0].listByAccount({ token, handle: 'root', playlistType: 1 });
                    expect(body.total).to.equal(0);
                    expect(body.data).to.have.lengthOf(0);
                }
                {
                    const body = yield commands[0].listByAccount({ handle: 'root' });
                    expect(body.total).to.equal(0);
                    expect(body.data).to.have.lengthOf(0);
                }
            });
        });
        it('Should get private playlist for a classic user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const token = yield servers[0].users.generateUserAndToken('toto');
                const body = yield commands[0].listByAccount({ token, handle: 'toto' });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const playlistId = body.data[0].id;
                yield commands[0].listVideos({ token, playlistId });
            });
        });
    });
    describe('Create and federate playlists', function () {
        it('Should create a playlist on server 1 and have the playlist on server 2 and 3', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield commands[0].create({
                    attributes: {
                        displayName: 'my super playlist',
                        privacy: 1,
                        description: 'my super description',
                        thumbnailfile: 'thumbnail.jpg',
                        videoChannelId: servers[0].store.channel.id
                    }
                });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.wait(3000);
                for (const server of servers) {
                    const body = yield server.playlists.list({ start: 0, count: 5 });
                    expect(body.total).to.equal(1);
                    expect(body.data).to.have.lengthOf(1);
                    const playlistFromList = body.data[0];
                    const playlistFromGet = yield server.playlists.get({ playlistId: playlistFromList.uuid });
                    for (const playlist of [playlistFromGet, playlistFromList]) {
                        expect(playlist.id).to.be.a('number');
                        expect(playlist.uuid).to.be.a('string');
                        expect(playlist.isLocal).to.equal(server.serverNumber === 1);
                        expect(playlist.displayName).to.equal('my super playlist');
                        expect(playlist.description).to.equal('my super description');
                        expect(playlist.privacy.id).to.equal(1);
                        expect(playlist.privacy.label).to.equal('Public');
                        expect(playlist.type.id).to.equal(1);
                        expect(playlist.type.label).to.equal('Regular');
                        expect(playlist.embedPath).to.equal('/video-playlists/embed/' + playlist.uuid);
                        expect(playlist.videosLength).to.equal(0);
                        expect(playlist.ownerAccount.name).to.equal('root');
                        expect(playlist.ownerAccount.displayName).to.equal('root');
                        expect(playlist.videoChannel.name).to.equal('root_channel');
                        expect(playlist.videoChannel.displayName).to.equal('Main root channel');
                    }
                }
            });
        });
        it('Should create a playlist on server 2 and have the playlist on server 1 but not on server 3', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                {
                    const playlist = yield servers[1].playlists.create({
                        attributes: {
                            displayName: 'playlist 2',
                            privacy: 1,
                            videoChannelId: servers[1].store.channel.id
                        }
                    });
                    playlistServer2Id1 = playlist.id;
                }
                {
                    const playlist = yield servers[1].playlists.create({
                        attributes: {
                            displayName: 'playlist 3',
                            privacy: 1,
                            thumbnailfile: 'thumbnail.jpg',
                            videoChannelId: servers[1].store.channel.id
                        }
                    });
                    playlistServer2Id2 = playlist.id;
                    playlistServer2UUID2 = playlist.uuid;
                }
                for (const id of [playlistServer2Id1, playlistServer2Id2]) {
                    yield servers[1].playlists.addElement({
                        playlistId: id,
                        attributes: { videoId: servers[1].store.videos[0].id, startTimestamp: 1, stopTimestamp: 2 }
                    });
                    yield servers[1].playlists.addElement({
                        playlistId: id,
                        attributes: { videoId: servers[1].store.videos[1].id }
                    });
                }
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.wait(3000);
                for (const server of [servers[0], servers[1]]) {
                    const body = yield server.playlists.list({ start: 0, count: 5 });
                    const playlist2 = body.data.find(p => p.displayName === 'playlist 2');
                    expect(playlist2).to.not.be.undefined;
                    yield extra_utils_1.testImage(server.url, 'thumbnail-playlist', playlist2.thumbnailPath);
                    const playlist3 = body.data.find(p => p.displayName === 'playlist 3');
                    expect(playlist3).to.not.be.undefined;
                    yield extra_utils_1.testImage(server.url, 'thumbnail', playlist3.thumbnailPath);
                }
                const body = yield servers[2].playlists.list({ start: 0, count: 5 });
                expect(body.data.find(p => p.displayName === 'playlist 2')).to.be.undefined;
                expect(body.data.find(p => p.displayName === 'playlist 3')).to.be.undefined;
            });
        });
        it('Should have the playlist on server 3 after a new follow', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.doubleFollow(servers[1], servers[2]);
                const body = yield servers[2].playlists.list({ start: 0, count: 5 });
                const playlist2 = body.data.find(p => p.displayName === 'playlist 2');
                expect(playlist2).to.not.be.undefined;
                yield extra_utils_1.testImage(servers[2].url, 'thumbnail-playlist', playlist2.thumbnailPath);
                expect(body.data.find(p => p.displayName === 'playlist 3')).to.not.be.undefined;
            });
        });
    });
    describe('List playlists', function () {
        it('Should correctly list the playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                {
                    const body = yield servers[2].playlists.list({ start: 1, count: 2, sort: 'createdAt' });
                    expect(body.total).to.equal(3);
                    const data = body.data;
                    expect(data).to.have.lengthOf(2);
                    expect(data[0].displayName).to.equal('playlist 2');
                    expect(data[1].displayName).to.equal('playlist 3');
                }
                {
                    const body = yield servers[2].playlists.list({ start: 1, count: 2, sort: '-createdAt' });
                    expect(body.total).to.equal(3);
                    const data = body.data;
                    expect(data).to.have.lengthOf(2);
                    expect(data[0].displayName).to.equal('playlist 2');
                    expect(data[1].displayName).to.equal('my super playlist');
                }
            });
        });
        it('Should list video channel playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                {
                    const body = yield commands[0].listByChannel({ handle: 'root_channel', start: 0, count: 2, sort: '-createdAt' });
                    expect(body.total).to.equal(1);
                    const data = body.data;
                    expect(data).to.have.lengthOf(1);
                    expect(data[0].displayName).to.equal('my super playlist');
                }
            });
        });
        it('Should list account playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                {
                    const body = yield servers[1].playlists.listByAccount({ handle: 'root', start: 1, count: 2, sort: '-createdAt' });
                    expect(body.total).to.equal(2);
                    const data = body.data;
                    expect(data).to.have.lengthOf(1);
                    expect(data[0].displayName).to.equal('playlist 2');
                }
                {
                    const body = yield servers[1].playlists.listByAccount({ handle: 'root', start: 1, count: 2, sort: 'createdAt' });
                    expect(body.total).to.equal(2);
                    const data = body.data;
                    expect(data).to.have.lengthOf(1);
                    expect(data[0].displayName).to.equal('playlist 3');
                }
                {
                    const body = yield servers[1].playlists.listByAccount({ handle: 'root', sort: 'createdAt', search: '3' });
                    expect(body.total).to.equal(1);
                    const data = body.data;
                    expect(data).to.have.lengthOf(1);
                    expect(data[0].displayName).to.equal('playlist 3');
                }
                {
                    const body = yield servers[1].playlists.listByAccount({ handle: 'root', sort: 'createdAt', search: '4' });
                    expect(body.total).to.equal(0);
                    const data = body.data;
                    expect(data).to.have.lengthOf(0);
                }
            });
        });
    });
    describe('Playlist rights', function () {
        let unlistedPlaylist;
        let privatePlaylist;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                {
                    unlistedPlaylist = yield servers[1].playlists.create({
                        attributes: {
                            displayName: 'playlist unlisted',
                            privacy: 2,
                            videoChannelId: servers[1].store.channel.id
                        }
                    });
                }
                {
                    privatePlaylist = yield servers[1].playlists.create({
                        attributes: {
                            displayName: 'playlist private',
                            privacy: 3
                        }
                    });
                }
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.wait(3000);
            });
        });
        it('Should not list unlisted or private playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const results = [
                        yield server.playlists.listByAccount({ handle: 'root@localhost:' + servers[1].port, sort: '-createdAt' }),
                        yield server.playlists.list({ start: 0, count: 2, sort: '-createdAt' })
                    ];
                    expect(results[0].total).to.equal(2);
                    expect(results[1].total).to.equal(3);
                    for (const body of results) {
                        const data = body.data;
                        expect(data).to.have.lengthOf(2);
                        expect(data[0].displayName).to.equal('playlist 3');
                        expect(data[1].displayName).to.equal('playlist 2');
                    }
                }
            });
        });
        it('Should not get unlisted playlist using only the id', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield servers[1].playlists.get({ playlistId: unlistedPlaylist.id, expectedStatus: 404 });
            });
        });
        it('Should get unlisted plyaylist using uuid or shortUUID', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield servers[1].playlists.get({ playlistId: unlistedPlaylist.uuid });
                yield servers[1].playlists.get({ playlistId: unlistedPlaylist.shortUUID });
            });
        });
        it('Should not get private playlist without token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const id of [privatePlaylist.id, privatePlaylist.uuid, privatePlaylist.shortUUID]) {
                    yield servers[1].playlists.get({ playlistId: id, expectedStatus: 401 });
                }
            });
        });
        it('Should get private playlist with a token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const id of [privatePlaylist.id, privatePlaylist.uuid, privatePlaylist.shortUUID]) {
                    yield servers[1].playlists.get({ token: servers[1].accessToken, playlistId: id });
                }
            });
        });
    });
    describe('Update playlists', function () {
        it('Should update a playlist', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[1].playlists.update({
                    attributes: {
                        displayName: 'playlist 3 updated',
                        description: 'description updated',
                        privacy: 2,
                        thumbnailfile: 'thumbnail.jpg',
                        videoChannelId: servers[1].store.channel.id
                    },
                    playlistId: playlistServer2Id2
                });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const playlist = yield server.playlists.get({ playlistId: playlistServer2UUID2 });
                    expect(playlist.displayName).to.equal('playlist 3 updated');
                    expect(playlist.description).to.equal('description updated');
                    expect(playlist.privacy.id).to.equal(2);
                    expect(playlist.privacy.label).to.equal('Unlisted');
                    expect(playlist.type.id).to.equal(1);
                    expect(playlist.type.label).to.equal('Regular');
                    expect(playlist.videosLength).to.equal(2);
                    expect(playlist.ownerAccount.name).to.equal('root');
                    expect(playlist.ownerAccount.displayName).to.equal('root');
                    expect(playlist.videoChannel.name).to.equal('root_channel');
                    expect(playlist.videoChannel.displayName).to.equal('Main root channel');
                }
            });
        });
    });
    describe('Element timestamps', function () {
        it('Should create a playlist containing different startTimestamp/endTimestamp videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const addVideo = (attributes) => {
                    return commands[0].addElement({ playlistId: playlistServer1Id, attributes });
                };
                const playlist = yield commands[0].create({
                    attributes: {
                        displayName: 'playlist 4',
                        privacy: 1,
                        videoChannelId: servers[0].store.channel.id
                    }
                });
                playlistServer1Id = playlist.id;
                playlistServer1UUID = playlist.uuid;
                yield addVideo({ videoId: servers[0].store.videos[0].uuid, startTimestamp: 15, stopTimestamp: 28 });
                yield addVideo({ videoId: servers[2].store.videos[1].uuid, startTimestamp: 35 });
                yield addVideo({ videoId: servers[2].store.videos[2].uuid });
                {
                    const element = yield addVideo({ videoId: servers[0].store.videos[3].uuid, stopTimestamp: 35 });
                    playlistElementServer1Video4 = element.id;
                }
                {
                    const element = yield addVideo({ videoId: servers[0].store.videos[4].uuid, startTimestamp: 45, stopTimestamp: 60 });
                    playlistElementServer1Video5 = element.id;
                }
                {
                    const element = yield addVideo({ videoId: nsfwVideoServer1, startTimestamp: 5 });
                    playlistElementNSFW = element.id;
                    yield addVideo({ videoId: nsfwVideoServer1, startTimestamp: 4 });
                    yield addVideo({ videoId: nsfwVideoServer1 });
                }
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should correctly list playlist videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                for (const server of servers) {
                    {
                        const body = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 10 });
                        expect(body.total).to.equal(8);
                        const videoElements = body.data;
                        expect(videoElements).to.have.lengthOf(8);
                        expect(videoElements[0].video.name).to.equal('video 0 server 1');
                        expect(videoElements[0].position).to.equal(1);
                        expect(videoElements[0].startTimestamp).to.equal(15);
                        expect(videoElements[0].stopTimestamp).to.equal(28);
                        expect(videoElements[1].video.name).to.equal('video 1 server 3');
                        expect(videoElements[1].position).to.equal(2);
                        expect(videoElements[1].startTimestamp).to.equal(35);
                        expect(videoElements[1].stopTimestamp).to.be.null;
                        expect(videoElements[2].video.name).to.equal('video 2 server 3');
                        expect(videoElements[2].position).to.equal(3);
                        expect(videoElements[2].startTimestamp).to.be.null;
                        expect(videoElements[2].stopTimestamp).to.be.null;
                        expect(videoElements[3].video.name).to.equal('video 3 server 1');
                        expect(videoElements[3].position).to.equal(4);
                        expect(videoElements[3].startTimestamp).to.be.null;
                        expect(videoElements[3].stopTimestamp).to.equal(35);
                        expect(videoElements[4].video.name).to.equal('video 4 server 1');
                        expect(videoElements[4].position).to.equal(5);
                        expect(videoElements[4].startTimestamp).to.equal(45);
                        expect(videoElements[4].stopTimestamp).to.equal(60);
                        expect(videoElements[5].video.name).to.equal('NSFW video');
                        expect(videoElements[5].position).to.equal(6);
                        expect(videoElements[5].startTimestamp).to.equal(5);
                        expect(videoElements[5].stopTimestamp).to.be.null;
                        expect(videoElements[6].video.name).to.equal('NSFW video');
                        expect(videoElements[6].position).to.equal(7);
                        expect(videoElements[6].startTimestamp).to.equal(4);
                        expect(videoElements[6].stopTimestamp).to.be.null;
                        expect(videoElements[7].video.name).to.equal('NSFW video');
                        expect(videoElements[7].position).to.equal(8);
                        expect(videoElements[7].startTimestamp).to.be.null;
                        expect(videoElements[7].stopTimestamp).to.be.null;
                    }
                    {
                        const body = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 2 });
                        expect(body.data).to.have.lengthOf(2);
                    }
                }
            });
        });
    });
    describe('Element type', function () {
        let groupUser1;
        let groupWithoutToken1;
        let group1;
        let group2;
        let video1;
        let video2;
        let video3;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                groupUser1 = [Object.assign({}, servers[0], { accessToken: userTokenServer1 })];
                groupWithoutToken1 = [Object.assign({}, servers[0], { accessToken: undefined })];
                group1 = [servers[0]];
                group2 = [servers[1], servers[2]];
                const playlist = yield commands[0].create({
                    token: userTokenServer1,
                    attributes: {
                        displayName: 'playlist 56',
                        privacy: 1,
                        videoChannelId: servers[0].store.channel.id
                    }
                });
                const playlistServer1Id2 = playlist.id;
                playlistServer1UUID2 = playlist.uuid;
                const addVideo = (attributes) => {
                    return commands[0].addElement({ token: userTokenServer1, playlistId: playlistServer1Id2, attributes });
                };
                video1 = (yield servers[0].videos.quickUpload({ name: 'video 89', token: userTokenServer1 })).uuid;
                video2 = (yield servers[1].videos.quickUpload({ name: 'video 90' })).uuid;
                video3 = (yield servers[0].videos.quickUpload({ name: 'video 91', nsfw: true })).uuid;
                yield extra_utils_1.waitJobs(servers);
                yield addVideo({ videoId: video1, startTimestamp: 15, stopTimestamp: 28 });
                yield addVideo({ videoId: video2, startTimestamp: 35 });
                yield addVideo({ videoId: video3 });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should update the element type if the video is private', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const name = 'video 89';
                const position = 1;
                {
                    yield servers[0].videos.update({ id: video1, attributes: { privacy: 3 } });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(groupWithoutToken1, playlistServer1UUID2, 2, position, name, 3);
                    yield checkPlaylistElementType(group1, playlistServer1UUID2, 2, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 1, position, name, 3);
                }
                {
                    yield servers[0].videos.update({ id: video1, attributes: { privacy: 1 } });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(groupWithoutToken1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(group1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 1, position, name, 3);
                }
            });
        });
        it('Should update the element type if the video is blacklisted', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const name = 'video 89';
                const position = 1;
                {
                    yield servers[0].blacklist.add({ videoId: video1, reason: 'reason', unfederate: true });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(groupWithoutToken1, playlistServer1UUID2, 3, position, name, 3);
                    yield checkPlaylistElementType(group1, playlistServer1UUID2, 3, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 1, position, name, 3);
                }
                {
                    yield servers[0].blacklist.remove({ videoId: video1 });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(groupWithoutToken1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(group1, playlistServer1UUID2, 0, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 1, position, name, 3);
                }
            });
        });
        it('Should update the element type if the account or server of the video is blocked', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(90000);
                const command = servers[0].blocklist;
                const name = 'video 90';
                const position = 2;
                {
                    yield command.addToMyBlocklist({ token: userTokenServer1, account: 'root@localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 3, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                    yield command.removeFromMyBlocklist({ token: userTokenServer1, account: 'root@localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                }
                {
                    yield command.addToMyBlocklist({ token: userTokenServer1, server: 'localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 3, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                    yield command.removeFromMyBlocklist({ token: userTokenServer1, server: 'localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                }
                {
                    yield command.addToServerBlocklist({ account: 'root@localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 3, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                    yield command.removeFromServerBlocklist({ account: 'root@localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                }
                {
                    yield command.addToServerBlocklist({ server: 'localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(groupUser1, playlistServer1UUID2, 3, position, name, 3);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                    yield command.removeFromServerBlocklist({ server: 'localhost:' + servers[1].port });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkPlaylistElementType(group2, playlistServer1UUID2, 0, position, name, 3);
                }
            });
        });
        it('Should hide the video if it is NSFW', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield commands[0].listVideos({ token: userTokenServer1, playlistId: playlistServer1UUID2, query: { nsfw: 'false' } });
                expect(body.total).to.equal(3);
                const elements = body.data;
                const element = elements.find(e => e.position === 3);
                expect(element).to.exist;
                expect(element.video).to.be.null;
                expect(element.type).to.equal(3);
            });
        });
    });
    describe('Managing playlist elements', function () {
        it('Should reorder the playlist', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                {
                    yield commands[0].reorderElements({
                        playlistId: playlistServer1Id,
                        attributes: {
                            startPosition: 2,
                            insertAfterPosition: 3
                        }
                    });
                    yield extra_utils_1.waitJobs(servers);
                    for (const server of servers) {
                        const body = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 10 });
                        const names = body.data.map(v => v.video.name);
                        expect(names).to.deep.equal([
                            'video 0 server 1',
                            'video 2 server 3',
                            'video 1 server 3',
                            'video 3 server 1',
                            'video 4 server 1',
                            'NSFW video',
                            'NSFW video',
                            'NSFW video'
                        ]);
                    }
                }
                {
                    yield commands[0].reorderElements({
                        playlistId: playlistServer1Id,
                        attributes: {
                            startPosition: 1,
                            reorderLength: 3,
                            insertAfterPosition: 4
                        }
                    });
                    yield extra_utils_1.waitJobs(servers);
                    for (const server of servers) {
                        const body = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 10 });
                        const names = body.data.map(v => v.video.name);
                        expect(names).to.deep.equal([
                            'video 3 server 1',
                            'video 0 server 1',
                            'video 2 server 3',
                            'video 1 server 3',
                            'video 4 server 1',
                            'NSFW video',
                            'NSFW video',
                            'NSFW video'
                        ]);
                    }
                }
                {
                    yield commands[0].reorderElements({
                        playlistId: playlistServer1Id,
                        attributes: {
                            startPosition: 6,
                            insertAfterPosition: 3
                        }
                    });
                    yield extra_utils_1.waitJobs(servers);
                    for (const server of servers) {
                        const { data: elements } = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 10 });
                        const names = elements.map(v => v.video.name);
                        expect(names).to.deep.equal([
                            'video 3 server 1',
                            'video 0 server 1',
                            'video 2 server 3',
                            'NSFW video',
                            'video 1 server 3',
                            'video 4 server 1',
                            'NSFW video',
                            'NSFW video'
                        ]);
                        for (let i = 1; i <= elements.length; i++) {
                            expect(elements[i - 1].position).to.equal(i);
                        }
                    }
                }
            });
        });
        it('Should update startTimestamp/endTimestamp of some elements', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield commands[0].updateElement({
                    playlistId: playlistServer1Id,
                    elementId: playlistElementServer1Video4,
                    attributes: {
                        startTimestamp: 1
                    }
                });
                yield commands[0].updateElement({
                    playlistId: playlistServer1Id,
                    elementId: playlistElementServer1Video5,
                    attributes: {
                        stopTimestamp: null
                    }
                });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const { data: elements } = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 10 });
                    expect(elements[0].video.name).to.equal('video 3 server 1');
                    expect(elements[0].position).to.equal(1);
                    expect(elements[0].startTimestamp).to.equal(1);
                    expect(elements[0].stopTimestamp).to.equal(35);
                    expect(elements[5].video.name).to.equal('video 4 server 1');
                    expect(elements[5].position).to.equal(6);
                    expect(elements[5].startTimestamp).to.equal(45);
                    expect(elements[5].stopTimestamp).to.be.null;
                }
            });
        });
        it('Should check videos existence in my playlist', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const videoIds = [
                    servers[0].store.videos[0].id,
                    42000,
                    servers[0].store.videos[3].id,
                    43000,
                    servers[0].store.videos[4].id
                ];
                const obj = yield commands[0].videosExist({ videoIds });
                {
                    const elem = obj[servers[0].store.videos[0].id];
                    expect(elem).to.have.lengthOf(1);
                    expect(elem[0].playlistElementId).to.exist;
                    expect(elem[0].playlistId).to.equal(playlistServer1Id);
                    expect(elem[0].startTimestamp).to.equal(15);
                    expect(elem[0].stopTimestamp).to.equal(28);
                }
                {
                    const elem = obj[servers[0].store.videos[3].id];
                    expect(elem).to.have.lengthOf(1);
                    expect(elem[0].playlistElementId).to.equal(playlistElementServer1Video4);
                    expect(elem[0].playlistId).to.equal(playlistServer1Id);
                    expect(elem[0].startTimestamp).to.equal(1);
                    expect(elem[0].stopTimestamp).to.equal(35);
                }
                {
                    const elem = obj[servers[0].store.videos[4].id];
                    expect(elem).to.have.lengthOf(1);
                    expect(elem[0].playlistId).to.equal(playlistServer1Id);
                    expect(elem[0].startTimestamp).to.equal(45);
                    expect(elem[0].stopTimestamp).to.equal(null);
                }
                expect(obj[42000]).to.have.lengthOf(0);
                expect(obj[43000]).to.have.lengthOf(0);
            });
        });
        it('Should automatically update updatedAt field of playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const server = servers[1];
                const videoId = servers[1].store.videos[5].id;
                function getPlaylistNames() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const { data } = yield server.playlists.listByAccount({ token: server.accessToken, handle: 'root', sort: '-updatedAt' });
                        return data.map(p => p.displayName);
                    });
                }
                const attributes = { videoId };
                const element1 = yield server.playlists.addElement({ playlistId: playlistServer2Id1, attributes });
                const element2 = yield server.playlists.addElement({ playlistId: playlistServer2Id2, attributes });
                const names1 = yield getPlaylistNames();
                expect(names1[0]).to.equal('playlist 3 updated');
                expect(names1[1]).to.equal('playlist 2');
                yield server.playlists.removeElement({ playlistId: playlistServer2Id1, elementId: element1.id });
                const names2 = yield getPlaylistNames();
                expect(names2[0]).to.equal('playlist 2');
                expect(names2[1]).to.equal('playlist 3 updated');
                yield server.playlists.removeElement({ playlistId: playlistServer2Id2, elementId: element2.id });
                const names3 = yield getPlaylistNames();
                expect(names3[0]).to.equal('playlist 3 updated');
                expect(names3[1]).to.equal('playlist 2');
            });
        });
        it('Should delete some elements', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield commands[0].removeElement({ playlistId: playlistServer1Id, elementId: playlistElementServer1Video4 });
                yield commands[0].removeElement({ playlistId: playlistServer1Id, elementId: playlistElementNSFW });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const body = yield server.playlists.listVideos({ playlistId: playlistServer1UUID, start: 0, count: 10 });
                    expect(body.total).to.equal(6);
                    const elements = body.data;
                    expect(elements).to.have.lengthOf(6);
                    expect(elements[0].video.name).to.equal('video 0 server 1');
                    expect(elements[0].position).to.equal(1);
                    expect(elements[1].video.name).to.equal('video 2 server 3');
                    expect(elements[1].position).to.equal(2);
                    expect(elements[2].video.name).to.equal('video 1 server 3');
                    expect(elements[2].position).to.equal(3);
                    expect(elements[3].video.name).to.equal('video 4 server 1');
                    expect(elements[3].position).to.equal(4);
                    expect(elements[4].video.name).to.equal('NSFW video');
                    expect(elements[4].position).to.equal(5);
                    expect(elements[5].video.name).to.equal('NSFW video');
                    expect(elements[5].position).to.equal(6);
                }
            });
        });
        it('Should be able to create a public playlist, and set it to private', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const videoPlaylistIds = yield commands[0].create({
                    attributes: {
                        displayName: 'my super public playlist',
                        privacy: 1,
                        videoChannelId: servers[0].store.channel.id
                    }
                });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    yield server.playlists.get({ playlistId: videoPlaylistIds.uuid, expectedStatus: models_1.HttpStatusCode.OK_200 });
                }
                const attributes = { privacy: 3 };
                yield commands[0].update({ playlistId: videoPlaylistIds.id, attributes });
                yield extra_utils_1.waitJobs(servers);
                for (const server of [servers[1], servers[2]]) {
                    yield server.playlists.get({ playlistId: videoPlaylistIds.uuid, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                }
                yield commands[0].get({ playlistId: videoPlaylistIds.uuid, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield commands[0].get({ token: servers[0].accessToken, playlistId: videoPlaylistIds.uuid, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('Playlist deletion', function () {
        it('Should delete the playlist on server 1 and delete on server 2 and 3', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield commands[0].delete({ playlistId: playlistServer1Id });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    yield server.playlists.get({ playlistId: playlistServer1UUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                }
            });
        });
        it('Should have deleted the thumbnail on server 1, 2 and 3', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                for (const server of servers) {
                    yield extra_utils_1.checkPlaylistFilesWereRemoved(playlistServer1UUID, server.internalServerNumber);
                }
            });
        });
        it('Should unfollow servers 1 and 2 and hide their playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const finder = (data) => data.find(p => p.displayName === 'my super playlist');
                {
                    const body = yield servers[2].playlists.list({ start: 0, count: 5 });
                    expect(body.total).to.equal(3);
                    expect(finder(body.data)).to.not.be.undefined;
                }
                yield servers[2].follows.unfollow({ target: servers[0] });
                {
                    const body = yield servers[2].playlists.list({ start: 0, count: 5 });
                    expect(body.total).to.equal(1);
                    expect(finder(body.data)).to.be.undefined;
                }
            });
        });
        it('Should delete a channel and put the associated playlist in private mode', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const channel = yield servers[0].channels.create({ attributes: { name: 'super_channel', displayName: 'super channel' } });
                const playlistCreated = yield commands[0].create({
                    attributes: {
                        displayName: 'channel playlist',
                        privacy: 1,
                        videoChannelId: channel.id
                    }
                });
                yield extra_utils_1.waitJobs(servers);
                yield servers[0].channels.delete({ channelName: 'super_channel' });
                yield extra_utils_1.waitJobs(servers);
                const body = yield commands[0].get({ token: servers[0].accessToken, playlistId: playlistCreated.uuid });
                expect(body.displayName).to.equal('channel playlist');
                expect(body.privacy.id).to.equal(3);
                yield servers[1].playlists.get({ playlistId: playlistCreated.uuid, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should delete an account and delete its playlists', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const { userId, token } = yield servers[0].users.generate('user_1');
                const { videoChannels } = yield servers[0].users.getMyInfo({ token });
                const userChannel = videoChannels[0];
                yield commands[0].create({
                    attributes: {
                        displayName: 'playlist to be deleted',
                        privacy: 1,
                        videoChannelId: userChannel.id
                    }
                });
                yield extra_utils_1.waitJobs(servers);
                const finder = (data) => data.find(p => p.displayName === 'playlist to be deleted');
                {
                    for (const server of [servers[0], servers[1]]) {
                        const body = yield server.playlists.list({ start: 0, count: 15 });
                        expect(finder(body.data)).to.not.be.undefined;
                    }
                }
                yield servers[0].users.remove({ userId });
                yield extra_utils_1.waitJobs(servers);
                {
                    for (const server of [servers[0], servers[1]]) {
                        const body = yield server.playlists.list({ start: 0, count: 15 });
                        expect(finder(body.data)).to.be.undefined;
                    }
                }
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
