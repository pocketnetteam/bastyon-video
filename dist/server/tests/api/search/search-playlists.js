"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test playlists search', function () {
    let server;
    let remoteServer;
    let command;
    let playlistUUID;
    let playlistShortUUID;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const servers = yield Promise.all([
                extra_utils_1.createSingleServer(1),
                extra_utils_1.createSingleServer(2, { transcoding: { enabled: false } })
            ]);
            server = servers[0];
            remoteServer = servers[1];
            yield extra_utils_1.setAccessTokensToServers([remoteServer, server]);
            yield extra_utils_1.setDefaultVideoChannel([remoteServer, server]);
            {
                const videoId = (yield server.videos.upload()).uuid;
                const attributes = {
                    displayName: 'Dr. Kenzo Tenma hospital videos',
                    privacy: 1,
                    videoChannelId: server.store.channel.id
                };
                const created = yield server.playlists.create({ attributes });
                playlistUUID = created.uuid;
                playlistShortUUID = created.shortUUID;
                yield server.playlists.addElement({ playlistId: created.id, attributes: { videoId } });
            }
            {
                const videoId = (yield remoteServer.videos.upload()).uuid;
                const attributes = {
                    displayName: 'Johan & Anna Libert music videos',
                    privacy: 1,
                    videoChannelId: remoteServer.store.channel.id
                };
                const created = yield remoteServer.playlists.create({ attributes });
                yield remoteServer.playlists.addElement({ playlistId: created.id, attributes: { videoId } });
            }
            {
                const attributes = {
                    displayName: 'Inspector Lunge playlist',
                    privacy: 1,
                    videoChannelId: server.store.channel.id
                };
                yield server.playlists.create({ attributes });
            }
            yield extra_utils_1.doubleFollow(server, remoteServer);
            command = server.search;
        });
    });
    it('Should make a simple search and not have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.searchPlaylists({ search: 'abc' });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should make a search and have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const search = {
                    search: 'tenma',
                    start: 0,
                    count: 1
                };
                const body = yield command.advancedPlaylistSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const playlist = body.data[0];
                expect(playlist.displayName).to.equal('Dr. Kenzo Tenma hospital videos');
                expect(playlist.url).to.equal(server.url + '/video-playlists/' + playlist.uuid);
            }
            {
                const search = {
                    search: 'Anna Livert music',
                    start: 0,
                    count: 1
                };
                const body = yield command.advancedPlaylistSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const playlist = body.data[0];
                expect(playlist.displayName).to.equal('Johan & Anna Libert music videos');
            }
        });
    });
    it('Should filter by host', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const search = { search: 'tenma', host: server.host };
                const body = yield command.advancedPlaylistSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const playlist = body.data[0];
                expect(playlist.displayName).to.equal('Dr. Kenzo Tenma hospital videos');
            }
            {
                const search = { search: 'Anna', host: 'example.com' };
                const body = yield command.advancedPlaylistSearch({ search });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const search = { search: 'video', host: remoteServer.host };
                const body = yield command.advancedPlaylistSearch({ search });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
                const playlist = body.data[0];
                expect(playlist.displayName).to.equal('Johan & Anna Libert music videos');
            }
        });
    });
    it('Should filter by UUIDs', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const uuid of [playlistUUID, playlistShortUUID]) {
                const body = yield command.advancedPlaylistSearch({ search: { uuids: [uuid] } });
                expect(body.total).to.equal(1);
                expect(body.data[0].displayName).to.equal('Dr. Kenzo Tenma hospital videos');
            }
            {
                const body = yield command.advancedPlaylistSearch({ search: { uuids: ['dfd70b83-639f-4980-94af-304a56ab4b35'] } });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should not display playlists without videos', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = {
                search: 'Lunge',
                start: 0,
                count: 1
            };
            const body = yield command.advancedPlaylistSearch({ search });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server, remoteServer]);
        });
    });
});
