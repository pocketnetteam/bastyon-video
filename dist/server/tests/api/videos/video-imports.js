"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test video imports', function () {
    let servers = [];
    let channelIdServer1;
    let channelIdServer2;
    if (extra_utils_1.areHttpImportTestsDisabled())
        return;
    function checkVideosServer1(server, idHttp, idMagnet, idTorrent) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const videoHttp = yield server.videos.get({ id: idHttp });
            expect(videoHttp.name).to.equal('small video - youtube');
            expect(videoHttp.language.label).to.equal('Unknown');
            expect(videoHttp.nsfw).to.be.false;
            expect(videoHttp.description).to.equal('this is a super description');
            expect(videoHttp.tags).to.deep.equal(['tag1', 'tag2']);
            expect(videoHttp.files).to.have.lengthOf(1);
            const originallyPublishedAt = new Date(videoHttp.originallyPublishedAt);
            expect(originallyPublishedAt.getDate()).to.equal(14);
            expect(originallyPublishedAt.getMonth()).to.equal(0);
            expect(originallyPublishedAt.getFullYear()).to.equal(2019);
            const videoMagnet = yield server.videos.get({ id: idMagnet });
            const videoTorrent = yield server.videos.get({ id: idTorrent });
            for (const video of [videoMagnet, videoTorrent]) {
                expect(video.category.label).to.equal('Misc');
                expect(video.licence.label).to.equal('Unknown');
                expect(video.language.label).to.equal('Unknown');
                expect(video.nsfw).to.be.false;
                expect(video.description).to.equal('this is a super torrent description');
                expect(video.tags).to.deep.equal(['tag_torrent1', 'tag_torrent2']);
                expect(video.files).to.have.lengthOf(1);
            }
            expect(videoTorrent.name).to.contain('你好 世界 720p.mp4');
            expect(videoMagnet.name).to.contain('super peertube2 video');
            const bodyCaptions = yield server.captions.list({ videoId: idHttp });
            expect(bodyCaptions.total).to.equal(2);
        });
    }
    function checkVideoServer2(server, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const video = yield server.videos.get({ id });
            expect(video.name).to.equal('my super name');
            expect(video.category.label).to.equal('Entertainment');
            expect(video.licence.label).to.equal('Public Domain Dedication');
            expect(video.language.label).to.equal('English');
            expect(video.nsfw).to.be.false;
            expect(video.description).to.equal('my super description');
            expect(video.tags).to.deep.equal(['supertag1', 'supertag2']);
            expect(video.files).to.have.lengthOf(1);
            const bodyCaptions = yield server.captions.list({ videoId: id });
            expect(bodyCaptions.total).to.equal(2);
        });
    }
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            {
                const { videoChannels } = yield servers[0].users.getMyInfo();
                channelIdServer1 = videoChannels[0].id;
            }
            {
                const { videoChannels } = yield servers[1].users.getMyInfo();
                channelIdServer2 = videoChannels[0].id;
            }
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
        });
    });
    it('Should import videos on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            const baseAttributes = {
                channelId: channelIdServer1,
                privacy: 1
            };
            {
                const attributes = Object.assign(Object.assign({}, baseAttributes), { targetUrl: extra_utils_1.FIXTURE_URLS.youtube });
                const { video } = yield servers[0].imports.importVideo({ attributes });
                expect(video.name).to.equal('small video - youtube');
                expect(video.thumbnailPath).to.match(new RegExp(`^/static/thumbnails/.+.jpg$`));
                expect(video.previewPath).to.match(new RegExp(`^/lazy-static/previews/.+.jpg$`));
                yield extra_utils_1.testImage(servers[0].url, 'video_import_thumbnail', video.thumbnailPath);
                yield extra_utils_1.testImage(servers[0].url, 'video_import_preview', video.previewPath);
                const bodyCaptions = yield servers[0].captions.list({ videoId: video.id });
                const videoCaptions = bodyCaptions.data;
                expect(videoCaptions).to.have.lengthOf(2);
                const enCaption = videoCaptions.find(caption => caption.language.id === 'en');
                expect(enCaption).to.exist;
                expect(enCaption.language.label).to.equal('English');
                expect(enCaption.captionPath).to.match(new RegExp(`^/lazy-static/video-captions/.+-en.vtt$`));
                yield extra_utils_1.testCaptionFile(servers[0].url, enCaption.captionPath, `WEBVTT
Kind: captions
Language: en

00:00:01.600 --> 00:00:04.200
English (US)

00:00:05.900 --> 00:00:07.999
This is a subtitle in American English

00:00:10.000 --> 00:00:14.000
Adding subtitles is very easy to do`);
                const frCaption = videoCaptions.find(caption => caption.language.id === 'fr');
                expect(frCaption).to.exist;
                expect(frCaption.language.label).to.equal('French');
                expect(frCaption.captionPath).to.match(new RegExp(`^/lazy-static/video-captions/.+-fr.vtt`));
                yield extra_utils_1.testCaptionFile(servers[0].url, frCaption.captionPath, `WEBVTT
Kind: captions
Language: fr

00:00:01.600 --> 00:00:04.200
Français (FR)

00:00:05.900 --> 00:00:07.999
C'est un sous-titre français

00:00:10.000 --> 00:00:14.000
Ajouter un sous-titre est vraiment facile`);
            }
            {
                const attributes = Object.assign(Object.assign({}, baseAttributes), { magnetUri: extra_utils_1.FIXTURE_URLS.magnet, description: 'this is a super torrent description', tags: ['tag_torrent1', 'tag_torrent2'] });
                const { video } = yield servers[0].imports.importVideo({ attributes });
                expect(video.name).to.equal('super peertube2 video');
            }
            {
                const attributes = Object.assign(Object.assign({}, baseAttributes), { torrentfile: 'video-720p.torrent', description: 'this is a super torrent description', tags: ['tag_torrent1', 'tag_torrent2'] });
                const { video } = yield servers[0].imports.importVideo({ attributes });
                expect(video.name).to.equal('你好 世界 720p.mp4');
            }
        });
    });
    it('Should list the videos to import in my videos on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.listMyVideos({ sort: 'createdAt' });
            expect(total).to.equal(3);
            expect(data).to.have.lengthOf(3);
            expect(data[0].name).to.equal('small video - youtube');
            expect(data[1].name).to.equal('super peertube2 video');
            expect(data[2].name).to.equal('你好 世界 720p.mp4');
        });
    });
    it('Should list the videos to import in my imports on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data: videoImports } = yield servers[0].imports.getMyVideoImports({ sort: '-createdAt' });
            expect(total).to.equal(3);
            expect(videoImports).to.have.lengthOf(3);
            expect(videoImports[2].targetUrl).to.equal(extra_utils_1.FIXTURE_URLS.youtube);
            expect(videoImports[2].magnetUri).to.be.null;
            expect(videoImports[2].torrentName).to.be.null;
            expect(videoImports[2].video.name).to.equal('small video - youtube');
            expect(videoImports[1].targetUrl).to.be.null;
            expect(videoImports[1].magnetUri).to.equal(extra_utils_1.FIXTURE_URLS.magnet);
            expect(videoImports[1].torrentName).to.be.null;
            expect(videoImports[1].video.name).to.equal('super peertube2 video');
            expect(videoImports[0].targetUrl).to.be.null;
            expect(videoImports[0].magnetUri).to.be.null;
            expect(videoImports[0].torrentName).to.equal('video-720p.torrent');
            expect(videoImports[0].video.name).to.equal('你好 世界 720p.mp4');
        });
    });
    it('Should have the video listed on the two instances', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(3);
                expect(data).to.have.lengthOf(3);
                const [videoHttp, videoMagnet, videoTorrent] = data;
                yield checkVideosServer1(server, videoHttp.uuid, videoMagnet.uuid, videoTorrent.uuid);
            }
        });
    });
    it('Should import a video on server 2 with some fields', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            const attributes = {
                targetUrl: extra_utils_1.FIXTURE_URLS.youtube,
                channelId: channelIdServer2,
                privacy: 1,
                category: 10,
                licence: 7,
                language: 'en',
                name: 'my super name',
                description: 'my super description',
                tags: ['supertag1', 'supertag2']
            };
            const { video } = yield servers[1].imports.importVideo({ attributes });
            expect(video.name).to.equal('my super name');
        });
    });
    it('Should have the videos listed on the two instances', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(4);
                expect(data).to.have.lengthOf(4);
                yield checkVideoServer2(server, data[0].uuid);
                const [, videoHttp, videoMagnet, videoTorrent] = data;
                yield checkVideosServer1(server, videoHttp.uuid, videoMagnet.uuid, videoTorrent.uuid);
            }
        });
    });
    it('Should import a video that will be transcoded', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const attributes = {
                name: 'transcoded video',
                magnetUri: extra_utils_1.FIXTURE_URLS.magnet,
                channelId: channelIdServer2,
                privacy: 1
            };
            const { video } = yield servers[1].imports.importVideo({ attributes });
            const videoUUID = video.uuid;
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                expect(video.name).to.equal('transcoded video');
                expect(video.files).to.have.lengthOf(4);
            }
        });
    });
    it('Should import no HDR version on a HDR video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const config = {
                transcoding: {
                    enabled: true,
                    resolutions: {
                        '240p': false,
                        '360p': false,
                        '480p': false,
                        '720p': false,
                        '1080p': true,
                        '1440p': false,
                        '2160p': false
                    },
                    webtorrent: { enabled: true },
                    hls: { enabled: false }
                },
                import: {
                    videos: {
                        http: {
                            enabled: true
                        },
                        torrent: {
                            enabled: true
                        }
                    }
                }
            };
            yield servers[0].config.updateCustomSubConfig({ newConfig: config });
            const attributes = {
                name: 'hdr video',
                targetUrl: extra_utils_1.FIXTURE_URLS.youtubeHDR,
                channelId: channelIdServer1,
                privacy: 1
            };
            const { video: videoImported } = yield servers[0].imports.importVideo({ attributes });
            const videoUUID = videoImported.uuid;
            yield extra_utils_1.waitJobs(servers);
            const video = yield servers[0].videos.get({ id: videoUUID });
            expect(video.name).to.equal('hdr video');
            const maxResolution = Math.max.apply(Math, video.files.map(function (o) { return o.resolution.id; }));
            expect(maxResolution, 'expected max resolution not met').to.equals(1080);
        });
    });
    it('Should import a peertube video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            for (const targetUrl of [extra_utils_1.FIXTURE_URLS.peertube_long]) {
                yield servers[0].config.disableTranscoding();
                const attributes = {
                    targetUrl,
                    channelId: channelIdServer1,
                    privacy: 1
                };
                const { video } = yield servers[0].imports.importVideo({ attributes });
                const videoUUID = video.uuid;
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const video = yield server.videos.get({ id: videoUUID });
                    expect(video.name).to.equal('E2E tests');
                }
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
