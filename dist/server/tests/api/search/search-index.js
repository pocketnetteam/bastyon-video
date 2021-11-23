"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test videos search', function () {
    const localVideoName = 'local video' + new Date().toISOString();
    let server = null;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield server.videos.upload({ attributes: { name: localVideoName } });
            command = server.search;
        });
    });
    describe('Default search', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            it('Should make a local videos search by default', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(10000);
                    yield server.config.updateCustomSubConfig({
                        newConfig: {
                            search: {
                                searchIndex: {
                                    enabled: true,
                                    isDefaultSearch: false,
                                    disableLocalSearch: false
                                }
                            }
                        }
                    });
                    const body = yield command.searchVideos({ search: 'local video' });
                    expect(body.total).to.equal(1);
                    expect(body.data[0].name).to.equal(localVideoName);
                });
            });
            it('Should make a local channels search by default', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchChannels({ search: 'root' });
                    expect(body.total).to.equal(1);
                    expect(body.data[0].name).to.equal('root_channel');
                    expect(body.data[0].host).to.equal('localhost:' + server.port);
                });
            });
            it('Should make an index videos search by default', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield server.config.updateCustomSubConfig({
                        newConfig: {
                            search: {
                                searchIndex: {
                                    enabled: true,
                                    isDefaultSearch: true,
                                    disableLocalSearch: false
                                }
                            }
                        }
                    });
                    const body = yield command.searchVideos({ search: 'local video' });
                    expect(body.total).to.be.greaterThan(2);
                });
            });
            it('Should make an index channels search by default', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchChannels({ search: 'root' });
                    expect(body.total).to.be.greaterThan(2);
                });
            });
            it('Should make an index videos search if local search is disabled', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield server.config.updateCustomSubConfig({
                        newConfig: {
                            search: {
                                searchIndex: {
                                    enabled: true,
                                    isDefaultSearch: false,
                                    disableLocalSearch: true
                                }
                            }
                        }
                    });
                    const body = yield command.searchVideos({ search: 'local video' });
                    expect(body.total).to.be.greaterThan(2);
                });
            });
            it('Should make an index channels search if local search is disabled', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchChannels({ search: 'root' });
                    expect(body.total).to.be.greaterThan(2);
                });
            });
        });
    });
    describe('Videos search', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            function check(search, exists = true) {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.advancedVideoSearch({ search });
                    if (exists === false) {
                        expect(body.total).to.equal(0);
                        expect(body.data).to.have.lengthOf(0);
                        return;
                    }
                    expect(body.total).to.equal(1);
                    expect(body.data).to.have.lengthOf(1);
                    const video = body.data[0];
                    expect(video.name).to.equal('What is PeerTube?');
                    expect(video.category.label).to.equal('Science & Technology');
                    expect(video.licence.label).to.equal('Attribution - Share Alike');
                    expect(video.privacy.label).to.equal('Public');
                    expect(video.duration).to.equal(113);
                    expect(video.thumbnailUrl.startsWith('https://framatube.org/static/thumbnails')).to.be.true;
                    expect(video.account.host).to.equal('framatube.org');
                    expect(video.account.name).to.equal('framasoft');
                    expect(video.account.url).to.equal('https://framatube.org/accounts/framasoft');
                    expect(video.account.avatar).to.exist;
                    expect(video.channel.host).to.equal('framatube.org');
                    expect(video.channel.name).to.equal('joinpeertube');
                    expect(video.channel.url).to.equal('https://framatube.org/video-channels/joinpeertube');
                    expect(video.channel.avatar).to.exist;
                });
            }
            const baseSearch = {
                search: 'what is peertube',
                start: 0,
                count: 2,
                categoryOneOf: [15],
                licenceOneOf: [2],
                tagsAllOf: ['framasoft', 'peertube'],
                startDate: '2018-10-01T10:50:46.396Z',
                endDate: '2018-10-01T10:55:46.396Z'
            };
            it('Should make a simple search and not have results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchVideos({ search: 'djidane'.repeat(50) });
                    expect(body.total).to.equal(0);
                    expect(body.data).to.have.lengthOf(0);
                });
            });
            it('Should make a simple search and have results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchVideos({ search: 'What is PeerTube' });
                    expect(body.total).to.be.greaterThan(1);
                });
            });
            it('Should make a simple search', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield check(baseSearch);
                });
            });
            it('Should search by start date', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const search = Object.assign(Object.assign({}, baseSearch), { startDate: '2018-10-01T10:54:46.396Z' });
                    yield check(search, false);
                });
            });
            it('Should search by tags', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const search = Object.assign(Object.assign({}, baseSearch), { tagsAllOf: ['toto', 'framasoft'] });
                    yield check(search, false);
                });
            });
            it('Should search by duration', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const search = Object.assign(Object.assign({}, baseSearch), { durationMin: 2000 });
                    yield check(search, false);
                });
            });
            it('Should search by nsfw attribute', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    {
                        const search = Object.assign(Object.assign({}, baseSearch), { nsfw: 'true' });
                        yield check(search, false);
                    }
                    {
                        const search = Object.assign(Object.assign({}, baseSearch), { nsfw: 'false' });
                        yield check(search, true);
                    }
                    {
                        const search = Object.assign(Object.assign({}, baseSearch), { nsfw: 'both' });
                        yield check(search, true);
                    }
                });
            });
            it('Should search by host', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    {
                        const search = Object.assign(Object.assign({}, baseSearch), { host: 'example.com' });
                        yield check(search, false);
                    }
                    {
                        const search = Object.assign(Object.assign({}, baseSearch), { host: 'framatube.org' });
                        yield check(search, true);
                    }
                });
            });
            it('Should search by uuids', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const goodUUID = '9c9de5e8-0a1e-484a-b099-e80766180a6d';
                    const goodShortUUID = 'kkGMgK9ZtnKfYAgnEtQxbv';
                    const badUUID = 'c29c5b77-4a04-493d-96a9-2e9267e308f0';
                    const badShortUUID = 'rP5RgUeX9XwTSrspCdkDej';
                    {
                        const uuidsMatrix = [
                            [goodUUID],
                            [goodUUID, badShortUUID],
                            [badShortUUID, goodShortUUID],
                            [goodUUID, goodShortUUID]
                        ];
                        for (const uuids of uuidsMatrix) {
                            const search = Object.assign(Object.assign({}, baseSearch), { uuids });
                            yield check(search, true);
                        }
                    }
                    {
                        const uuidsMatrix = [
                            [badUUID],
                            [badShortUUID]
                        ];
                        for (const uuids of uuidsMatrix) {
                            const search = Object.assign(Object.assign({}, baseSearch), { uuids });
                            yield check(search, false);
                        }
                    }
                });
            });
            it('Should have a correct pagination', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const search = {
                        search: 'video',
                        start: 0,
                        count: 5
                    };
                    const body = yield command.advancedVideoSearch({ search });
                    expect(body.total).to.be.greaterThan(5);
                    expect(body.data).to.have.lengthOf(5);
                });
            });
            it('Should use the nsfw instance policy as default', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    let nsfwUUID;
                    {
                        yield server.config.updateCustomSubConfig({
                            newConfig: {
                                instance: { defaultNSFWPolicy: 'display' }
                            }
                        });
                        const body = yield command.searchVideos({ search: 'NSFW search index', sort: '-match' });
                        expect(body.data).to.have.length.greaterThan(0);
                        const video = body.data[0];
                        expect(video.nsfw).to.be.true;
                        nsfwUUID = video.uuid;
                    }
                    {
                        yield server.config.updateCustomSubConfig({
                            newConfig: {
                                instance: { defaultNSFWPolicy: 'do_not_list' }
                            }
                        });
                        const body = yield command.searchVideos({ search: 'NSFW search index', sort: '-match' });
                        try {
                            expect(body.data).to.have.lengthOf(0);
                        }
                        catch (_a) {
                            const video = body.data[0];
                            expect(video.uuid).not.equal(nsfwUUID);
                        }
                    }
                });
            });
        });
    });
    describe('Channels search', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            function check(search, exists = true) {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.advancedChannelSearch({ search });
                    if (exists === false) {
                        expect(body.total).to.equal(0);
                        expect(body.data).to.have.lengthOf(0);
                        return;
                    }
                    expect(body.total).to.be.greaterThan(0);
                    expect(body.data).to.have.length.greaterThan(0);
                    const videoChannel = body.data[0];
                    expect(videoChannel.url).to.equal('https://framatube.org/video-channels/bf54d359-cfad-4935-9d45-9d6be93f63e8');
                    expect(videoChannel.host).to.equal('framatube.org');
                    expect(videoChannel.avatar).to.exist;
                    expect(videoChannel.displayName).to.exist;
                    expect(videoChannel.ownerAccount.url).to.equal('https://framatube.org/accounts/framasoft');
                    expect(videoChannel.ownerAccount.name).to.equal('framasoft');
                    expect(videoChannel.ownerAccount.host).to.equal('framatube.org');
                    expect(videoChannel.ownerAccount.avatar).to.exist;
                });
            }
            it('Should make a simple search and not have results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchChannels({ search: 'a'.repeat(500) });
                    expect(body.total).to.equal(0);
                    expect(body.data).to.have.lengthOf(0);
                });
            });
            it('Should make a search and have results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield check({ search: 'Framasoft', sort: 'createdAt' }, true);
                });
            });
            it('Should make host search and have appropriate results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield check({ search: 'Framasoft', host: 'example.com' }, false);
                    yield check({ search: 'Framasoft', host: 'framatube.org' }, true);
                });
            });
            it('Should make handles search and have appropriate results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield check({ handles: ['bf54d359-cfad-4935-9d45-9d6be93f63e8@framatube.org'] }, true);
                    yield check({ handles: ['jeanine', 'bf54d359-cfad-4935-9d45-9d6be93f63e8@framatube.org'] }, true);
                    yield check({ handles: ['jeanine', 'chocobozzz_channel2@peertube2.cpy.re'] }, false);
                });
            });
            it('Should have a correct pagination', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.advancedChannelSearch({ search: { search: 'root', start: 0, count: 2 } });
                    expect(body.total).to.be.greaterThan(2);
                    expect(body.data).to.have.lengthOf(2);
                });
            });
        });
    });
    describe('Playlists search', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            function check(search, exists = true) {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.advancedPlaylistSearch({ search });
                    if (exists === false) {
                        expect(body.total).to.equal(0);
                        expect(body.data).to.have.lengthOf(0);
                        return;
                    }
                    expect(body.total).to.be.greaterThan(0);
                    expect(body.data).to.have.length.greaterThan(0);
                    const videoPlaylist = body.data[0];
                    expect(videoPlaylist.url).to.equal('https://peertube2.cpy.re/videos/watch/playlist/73804a40-da9a-40c2-b1eb-2c6d9eec8f0a');
                    expect(videoPlaylist.thumbnailUrl).to.exist;
                    expect(videoPlaylist.embedUrl).to.equal('https://peertube2.cpy.re/video-playlists/embed/73804a40-da9a-40c2-b1eb-2c6d9eec8f0a');
                    expect(videoPlaylist.type.id).to.equal(1);
                    expect(videoPlaylist.privacy.id).to.equal(1);
                    expect(videoPlaylist.videosLength).to.exist;
                    expect(videoPlaylist.createdAt).to.exist;
                    expect(videoPlaylist.updatedAt).to.exist;
                    expect(videoPlaylist.uuid).to.equal('73804a40-da9a-40c2-b1eb-2c6d9eec8f0a');
                    expect(videoPlaylist.displayName).to.exist;
                    expect(videoPlaylist.ownerAccount.url).to.equal('https://peertube2.cpy.re/accounts/chocobozzz');
                    expect(videoPlaylist.ownerAccount.name).to.equal('chocobozzz');
                    expect(videoPlaylist.ownerAccount.host).to.equal('peertube2.cpy.re');
                    expect(videoPlaylist.ownerAccount.avatar).to.exist;
                    expect(videoPlaylist.videoChannel.url).to.equal('https://peertube2.cpy.re/video-channels/chocobozzz_channel');
                    expect(videoPlaylist.videoChannel.name).to.equal('chocobozzz_channel');
                    expect(videoPlaylist.videoChannel.host).to.equal('peertube2.cpy.re');
                    expect(videoPlaylist.videoChannel.avatar).to.exist;
                });
            }
            it('Should make a simple search and not have results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.searchPlaylists({ search: 'a'.repeat(500) });
                    expect(body.total).to.equal(0);
                    expect(body.data).to.have.lengthOf(0);
                });
            });
            it('Should make a search and have results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield check({ search: 'E2E playlist', sort: '-match' }, true);
                });
            });
            it('Should make host search and have appropriate results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield check({ search: 'E2E playlist', host: 'example.com' }, false);
                    yield check({ search: 'E2E playlist', host: 'peertube2.cpy.re', sort: '-match' }, true);
                });
            });
            it('Should make a search by uuids and have appropriate results', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const goodUUID = '73804a40-da9a-40c2-b1eb-2c6d9eec8f0a';
                    const goodShortUUID = 'fgei1ws1oa6FCaJ2qZPG29';
                    const badUUID = 'c29c5b77-4a04-493d-96a9-2e9267e308f0';
                    const badShortUUID = 'rP5RgUeX9XwTSrspCdkDej';
                    {
                        const uuidsMatrix = [
                            [goodUUID],
                            [goodUUID, badShortUUID],
                            [badShortUUID, goodShortUUID],
                            [goodUUID, goodShortUUID]
                        ];
                        for (const uuids of uuidsMatrix) {
                            const search = { search: 'E2E playlist', sort: '-match', uuids };
                            yield check(search, true);
                        }
                    }
                    {
                        const uuidsMatrix = [
                            [badUUID],
                            [badShortUUID]
                        ];
                        for (const uuids of uuidsMatrix) {
                            const search = { search: 'E2E playlist', sort: '-match', uuids };
                            yield check(search, false);
                        }
                    }
                });
            });
            it('Should have a correct pagination', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.advancedChannelSearch({ search: { search: 'root', start: 0, count: 2 } });
                    expect(body.total).to.be.greaterThan(2);
                    expect(body.data).to.have.lengthOf(2);
                });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
