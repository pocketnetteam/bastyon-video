"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test plugin filter hooks', function () {
    let servers;
    let videoUUID;
    let threadId;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            yield servers[0].plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath() });
            yield servers[0].plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-filter-translations') });
            for (let i = 0; i < 10; i++) {
                yield servers[0].videos.upload({ attributes: { name: 'default video ' + i } });
            }
            const { data } = yield servers[0].videos.list();
            videoUUID = data[0].uuid;
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: { enabled: true },
                    signup: { enabled: true },
                    import: {
                        videos: {
                            http: { enabled: true },
                            torrent: { enabled: true }
                        }
                    }
                }
            });
        });
    });
    it('Should run filter:api.videos.list.params', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield servers[0].videos.list({ start: 0, count: 2 });
            expect(data).to.have.lengthOf(4);
        });
    });
    it('Should run filter:api.videos.list.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total } = yield servers[0].videos.list({ start: 0, count: 0 });
            expect(total).to.equal(11);
        });
    });
    it('Should run filter:api.accounts.videos.list.params', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield servers[0].videos.listByAccount({ handle: 'root', start: 0, count: 2 });
            expect(data).to.have.lengthOf(3);
        });
    });
    it('Should run filter:api.accounts.videos.list.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total } = yield servers[0].videos.listByAccount({ handle: 'root', start: 0, count: 2 });
            expect(total).to.equal(12);
        });
    });
    it('Should run filter:api.video-channels.videos.list.params', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield servers[0].videos.listByChannel({ handle: 'root_channel', start: 0, count: 2 });
            expect(data).to.have.lengthOf(5);
        });
    });
    it('Should run filter:api.video-channels.videos.list.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total } = yield servers[0].videos.listByChannel({ handle: 'root_channel', start: 0, count: 2 });
            expect(total).to.equal(13);
        });
    });
    it('Should run filter:api.user.me.videos.list.params', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield servers[0].videos.listMyVideos({ start: 0, count: 2 });
            expect(data).to.have.lengthOf(6);
        });
    });
    it('Should run filter:api.user.me.videos.list.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total } = yield servers[0].videos.listMyVideos({ start: 0, count: 2 });
            expect(total).to.equal(14);
        });
    });
    it('Should run filter:api.video.get.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const video = yield servers[0].videos.get({ id: videoUUID });
            expect(video.name).to.contain('<3');
        });
    });
    it('Should run filter:api.video.upload.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].videos.upload({ attributes: { name: 'video with bad word' }, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
        });
    });
    it('Should run filter:api.live-video.create.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = {
                name: 'video with bad word',
                privacy: 1,
                channelId: servers[0].store.channel.id
            };
            yield servers[0].live.create({ fields: attributes, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
        });
    });
    it('Should run filter:api.video.pre-import-url.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = {
                name: 'normal title',
                privacy: 1,
                channelId: servers[0].store.channel.id,
                targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo + 'bad'
            };
            yield servers[0].imports.importVideo({ attributes, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
        });
    });
    it('Should run filter:api.video.pre-import-torrent.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = {
                name: 'bad torrent',
                privacy: 1,
                channelId: servers[0].store.channel.id,
                torrentfile: 'video-720p.torrent'
            };
            yield servers[0].imports.importVideo({ attributes, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
        });
    });
    it('Should run filter:api.video.post-import-url.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            let videoImportId;
            {
                const attributes = {
                    name: 'title with bad word',
                    privacy: 1,
                    channelId: servers[0].store.channel.id,
                    targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo
                };
                const body = yield servers[0].imports.importVideo({ attributes });
                videoImportId = body.id;
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const body = yield servers[0].imports.getMyVideoImports();
                const videoImports = body.data;
                const videoImport = videoImports.find(i => i.id === videoImportId);
                expect(videoImport.state.id).to.equal(4);
                expect(videoImport.state.label).to.equal('Rejected');
            }
        });
    });
    it('Should run filter:api.video.post-import-torrent.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            let videoImportId;
            {
                const attributes = {
                    name: 'title with bad word',
                    privacy: 1,
                    channelId: servers[0].store.channel.id,
                    torrentfile: 'video-720p.torrent'
                };
                const body = yield servers[0].imports.importVideo({ attributes });
                videoImportId = body.id;
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const { data: videoImports } = yield servers[0].imports.getMyVideoImports();
                const videoImport = videoImports.find(i => i.id === videoImportId);
                expect(videoImport.state.id).to.equal(4);
                expect(videoImport.state.label).to.equal('Rejected');
            }
        });
    });
    it('Should run filter:api.video-thread.create.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].comments.createThread({
                videoId: videoUUID,
                text: 'comment with bad word',
                expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
            });
        });
    });
    it('Should run filter:api.video-comment-reply.create.accept.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const created = yield servers[0].comments.createThread({ videoId: videoUUID, text: 'thread' });
            threadId = created.id;
            yield servers[0].comments.addReply({
                videoId: videoUUID,
                toCommentId: threadId,
                text: 'comment with bad word',
                expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
            });
            yield servers[0].comments.addReply({
                videoId: videoUUID,
                toCommentId: threadId,
                text: 'comment with good word',
                expectedStatus: models_1.HttpStatusCode.OK_200
            });
        });
    });
    it('Should run filter:api.video-threads.list.params', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield servers[0].comments.listThreads({ videoId: videoUUID, start: 0, count: 0 });
            expect(data).to.have.lengthOf(1);
        });
    });
    it('Should run filter:api.video-threads.list.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total } = yield servers[0].comments.listThreads({ videoId: videoUUID, start: 0, count: 0 });
            expect(total).to.equal(2);
        });
    });
    it('Should run filter:api.video-thread-comments.list.params');
    it('Should run filter:api.video-thread-comments.list.result', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const thread = yield servers[0].comments.getThread({ videoId: videoUUID, threadId });
            expect(thread.comment.text.endsWith(' <3')).to.be.true;
        });
    });
    it('Should run filter:api.overviews.videos.list.{params,result}', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].overviews.getVideos({ page: 1 });
            yield servers[0].servers.waitUntilLog('Run hook filter:api.overviews.videos.list.params', 3);
            yield servers[0].servers.waitUntilLog('Run hook filter:api.overviews.videos.list.result', 3);
        });
    });
    describe('Should run filter:video.auto-blacklist.result', function () {
        function checkIsBlacklisted(id, value) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const video = yield servers[0].videos.getWithToken({ id });
                expect(video.blacklisted).to.equal(value);
            });
        }
        it('Should blacklist on upload', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video please blacklist me' } });
                yield checkIsBlacklisted(uuid, true);
            });
        });
        it('Should blacklist on import', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(15000);
                const attributes = {
                    name: 'video please blacklist me',
                    targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo,
                    channelId: servers[0].store.channel.id
                };
                const body = yield servers[0].imports.importVideo({ attributes });
                yield checkIsBlacklisted(body.video.uuid, true);
            });
        });
        it('Should blacklist on update', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video' } });
                yield checkIsBlacklisted(uuid, false);
                yield servers[0].videos.update({ id: uuid, attributes: { name: 'please blacklist me' } });
                yield checkIsBlacklisted(uuid, true);
            });
        });
        it('Should blacklist on remote upload', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'remote please blacklist me' } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkIsBlacklisted(uuid, true);
            });
        });
        it('Should blacklist on remote update', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video' } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkIsBlacklisted(uuid, false);
                yield servers[1].videos.update({ id: uuid, attributes: { name: 'please blacklist me' } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkIsBlacklisted(uuid, true);
            });
        });
    });
    describe('Should run filter:api.user.signup.allowed.result', function () {
        it('Should run on config endpoint', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const body = yield servers[0].config.getConfig();
                expect(body.signup.allowed).to.be.true;
            });
        });
        it('Should allow a signup', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].users.register({ username: 'john', password: 'password' });
            });
        });
        it('Should not allow a signup', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield servers[0].users.register({
                    username: 'jma',
                    password: 'password',
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
                expect(res.body.error).to.equal('No jma');
            });
        });
    });
    describe('Download hooks', function () {
        const downloadVideos = [];
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield servers[0].config.updateCustomSubConfig({
                    newConfig: {
                        transcoding: {
                            webtorrent: {
                                enabled: true
                            },
                            hls: {
                                enabled: true
                            }
                        }
                    }
                });
                const uuids = [];
                for (const name of ['bad torrent', 'bad file', 'bad playlist file']) {
                    const uuid = (yield servers[0].videos.quickUpload({ name: name })).uuid;
                    uuids.push(uuid);
                }
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const uuid of uuids) {
                    downloadVideos.push(yield servers[0].videos.get({ id: uuid }));
                }
            });
        });
        it('Should run filter:api.download.torrent.allowed.result', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeRawRequest)(downloadVideos[0].files[0].torrentDownloadUrl, 403);
                expect(res.body.error).to.equal('Liu Bei');
                yield (0, extra_utils_1.makeRawRequest)(downloadVideos[1].files[0].torrentDownloadUrl, 200);
                yield (0, extra_utils_1.makeRawRequest)(downloadVideos[2].files[0].torrentDownloadUrl, 200);
            });
        });
        it('Should run filter:api.download.video.allowed.result', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const res = yield (0, extra_utils_1.makeRawRequest)(downloadVideos[1].files[0].fileDownloadUrl, 403);
                    expect(res.body.error).to.equal('Cao Cao');
                    yield (0, extra_utils_1.makeRawRequest)(downloadVideos[0].files[0].fileDownloadUrl, 200);
                    yield (0, extra_utils_1.makeRawRequest)(downloadVideos[2].files[0].fileDownloadUrl, 200);
                }
                {
                    const res = yield (0, extra_utils_1.makeRawRequest)(downloadVideos[2].streamingPlaylists[0].files[0].fileDownloadUrl, 403);
                    expect(res.body.error).to.equal('Sun Jian');
                    yield (0, extra_utils_1.makeRawRequest)(downloadVideos[2].files[0].fileDownloadUrl, 200);
                    yield (0, extra_utils_1.makeRawRequest)(downloadVideos[0].streamingPlaylists[0].files[0].fileDownloadUrl, 200);
                    yield (0, extra_utils_1.makeRawRequest)(downloadVideos[1].streamingPlaylists[0].files[0].fileDownloadUrl, 200);
                }
            });
        });
    });
    describe('Embed filters', function () {
        const embedVideos = [];
        const embedPlaylists = [];
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield servers[0].config.updateCustomSubConfig({
                    newConfig: {
                        transcoding: {
                            enabled: false
                        }
                    }
                });
                for (const name of ['bad embed', 'good embed']) {
                    {
                        const uuid = (yield servers[0].videos.quickUpload({ name: name })).uuid;
                        embedVideos.push(yield servers[0].videos.get({ id: uuid }));
                    }
                    {
                        const attributes = { displayName: name, videoChannelId: servers[0].store.channel.id, privacy: 1 };
                        const { id } = yield servers[0].playlists.create({ attributes });
                        const playlist = yield servers[0].playlists.get({ playlistId: id });
                        embedPlaylists.push(playlist);
                    }
                }
            });
        });
        it('Should run filter:html.embed.video.allowed.result', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeRawRequest)(servers[0].url + embedVideos[0].embedPath, 200);
                expect(res.text).to.equal('Lu Bu');
            });
        });
        it('Should run filter:html.embed.video-playlist.allowed.result', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeRawRequest)(servers[0].url + embedPlaylists[0].embedPath, 200);
                expect(res.text).to.equal('Diao Chan');
            });
        });
    });
    describe('Search filters', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].config.updateCustomSubConfig({
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
            });
        });
        it('Should run filter:api.search.videos.local.list.{params,result}', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].search.advancedVideoSearch({
                    search: {
                        search: 'Sun Quan'
                    }
                });
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.videos.local.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.videos.local.list.result', 1);
            });
        });
        it('Should run filter:api.search.videos.index.list.{params,result}', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].search.advancedVideoSearch({
                    search: {
                        search: 'Sun Quan',
                        searchTarget: 'search-index'
                    }
                });
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.videos.local.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.videos.local.list.result', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.videos.index.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.videos.index.list.result', 1);
            });
        });
        it('Should run filter:api.search.video-channels.local.list.{params,result}', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].search.advancedChannelSearch({
                    search: {
                        search: 'Sun Ce'
                    }
                });
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-channels.local.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-channels.local.list.result', 1);
            });
        });
        it('Should run filter:api.search.video-channels.index.list.{params,result}', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].search.advancedChannelSearch({
                    search: {
                        search: 'Sun Ce',
                        searchTarget: 'search-index'
                    }
                });
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-channels.local.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-channels.local.list.result', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-channels.index.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-channels.index.list.result', 1);
            });
        });
        it('Should run filter:api.search.video-playlists.local.list.{params,result}', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].search.advancedPlaylistSearch({
                    search: {
                        search: 'Sun Jian'
                    }
                });
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-playlists.local.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-playlists.local.list.result', 1);
            });
        });
        it('Should run filter:api.search.video-playlists.index.list.{params,result}', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].search.advancedPlaylistSearch({
                    search: {
                        search: 'Sun Jian',
                        searchTarget: 'search-index'
                    }
                });
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-playlists.local.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-playlists.local.list.result', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-playlists.index.list.params', 1);
                yield servers[0].servers.waitUntilLog('Run hook filter:api.search.video-playlists.index.list.result', 1);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
