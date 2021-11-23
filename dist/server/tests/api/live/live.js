"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const path_1 = require("path");
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test live', function () {
    let servers = [];
    let commands;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        transcoding: {
                            enabled: false
                        }
                    }
                }
            });
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            commands = servers.map(s => s.live);
        });
    });
    describe('Live creation, update and delete', function () {
        let liveVideoUUID;
        it('Should create a live with the appropriate parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const attributes = {
                    category: 1,
                    licence: 2,
                    language: 'fr',
                    description: 'super live description',
                    support: 'support field',
                    channelId: servers[0].store.channel.id,
                    nsfw: false,
                    waitTranscoding: false,
                    name: 'my super live',
                    tags: ['tag1', 'tag2'],
                    commentsEnabled: false,
                    downloadEnabled: false,
                    saveReplay: true,
                    privacy: 1,
                    previewfile: 'video_short1-preview.webm.jpg',
                    thumbnailfile: 'video_short1.webm.jpg'
                };
                const live = yield commands[0].create({ fields: attributes });
                liveVideoUUID = live.uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    const video = yield server.videos.get({ id: liveVideoUUID });
                    expect(video.category.id).to.equal(1);
                    expect(video.licence.id).to.equal(2);
                    expect(video.language.id).to.equal('fr');
                    expect(video.description).to.equal('super live description');
                    expect(video.support).to.equal('support field');
                    expect(video.channel.name).to.equal(servers[0].store.channel.name);
                    expect(video.channel.host).to.equal(servers[0].store.channel.host);
                    expect(video.isLive).to.be.true;
                    expect(video.nsfw).to.be.false;
                    expect(video.waitTranscoding).to.be.false;
                    expect(video.name).to.equal('my super live');
                    expect(video.tags).to.deep.equal(['tag1', 'tag2']);
                    expect(video.commentsEnabled).to.be.false;
                    expect(video.downloadEnabled).to.be.false;
                    expect(video.privacy.id).to.equal(1);
                    yield (0, extra_utils_1.testImage)(server.url, 'video_short1-preview.webm', video.previewPath);
                    yield (0, extra_utils_1.testImage)(server.url, 'video_short1.webm', video.thumbnailPath);
                    const live = yield server.live.get({ videoId: liveVideoUUID });
                    if (server.url === servers[0].url) {
                        expect(live.rtmpUrl).to.equal('rtmp://' + server.hostname + ':' + servers[0].rtmpPort + '/live');
                        expect(live.streamKey).to.not.be.empty;
                    }
                    else {
                        expect(live.rtmpUrl).to.be.null;
                        expect(live.streamKey).to.be.null;
                    }
                    expect(live.saveReplay).to.be.true;
                }
            });
        });
        it('Should have a default preview and thumbnail', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                const attributes = {
                    name: 'default live thumbnail',
                    channelId: servers[0].store.channel.id,
                    privacy: 2,
                    nsfw: true
                };
                const live = yield commands[0].create({ fields: attributes });
                const videoId = live.uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    const video = yield server.videos.get({ id: videoId });
                    expect(video.privacy.id).to.equal(2);
                    expect(video.nsfw).to.be.true;
                    yield (0, extra_utils_1.makeRawRequest)(server.url + video.thumbnailPath, models_1.HttpStatusCode.OK_200);
                    yield (0, extra_utils_1.makeRawRequest)(server.url + video.previewPath, models_1.HttpStatusCode.OK_200);
                }
            });
        });
        it('Should not have the live listed since nobody streams into', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const { total, data } = yield server.videos.list();
                    expect(total).to.equal(0);
                    expect(data).to.have.lengthOf(0);
                }
            });
        });
        it('Should not be able to update a live of another server', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield commands[1].update({ videoId: liveVideoUUID, fields: { saveReplay: false }, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should update the live', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield commands[0].update({ videoId: liveVideoUUID, fields: { saveReplay: false } });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Have the live updated', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const live = yield server.live.get({ videoId: liveVideoUUID });
                    if (server.url === servers[0].url) {
                        expect(live.rtmpUrl).to.equal('rtmp://' + server.hostname + ':' + servers[0].rtmpPort + '/live');
                        expect(live.streamKey).to.not.be.empty;
                    }
                    else {
                        expect(live.rtmpUrl).to.be.null;
                        expect(live.streamKey).to.be.null;
                    }
                    expect(live.saveReplay).to.be.false;
                }
            });
        });
        it('Delete the live', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].videos.remove({ id: liveVideoUUID });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should have the live deleted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    yield server.videos.get({ id: liveVideoUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield server.live.get({ videoId: liveVideoUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                }
            });
        });
    });
    describe('Live filters', function () {
        let ffmpegCommand;
        let liveVideoId;
        let vodVideoId;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                vodVideoId = (yield servers[0].videos.quickUpload({ name: 'vod video' })).uuid;
                const liveOptions = { name: 'live', privacy: 1, channelId: servers[0].store.channel.id };
                const live = yield commands[0].create({ fields: liveOptions });
                liveVideoId = live.uuid;
                ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoId });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should only display lives', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data, total } = yield servers[0].videos.list({ isLive: true });
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
                expect(data[0].name).to.equal('live');
            });
        });
        it('Should not display lives', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data, total } = yield servers[0].videos.list({ isLive: false });
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
                expect(data[0].name).to.equal('vod video');
            });
        });
        it('Should display my lives', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
                yield (0, extra_utils_1.waitJobs)(servers);
                const { data } = yield servers[0].videos.listMyVideos({ isLive: true });
                const result = data.every(v => v.isLive);
                expect(result).to.be.true;
            });
        });
        it('Should not display my lives', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { data } = yield servers[0].videos.listMyVideos({ isLive: false });
                const result = data.every(v => !v.isLive);
                expect(result).to.be.true;
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.remove({ id: vodVideoId });
                yield servers[0].videos.remove({ id: liveVideoId });
            });
        });
    });
    describe('Stream checks', function () {
        let liveVideo;
        let rtmpUrl;
        before(function () {
            rtmpUrl = 'rtmp://' + servers[0].hostname + ':' + servers[0].rtmpPort + '';
        });
        function createLiveWrapper() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const liveAttributes = {
                    name: 'user live',
                    channelId: servers[0].store.channel.id,
                    privacy: 1,
                    saveReplay: false
                };
                const { uuid } = yield commands[0].create({ fields: liveAttributes });
                const live = yield commands[0].get({ videoId: uuid });
                const video = yield servers[0].videos.get({ id: uuid });
                return Object.assign(video, live);
            });
        }
        it('Should not allow a stream without the appropriate path', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                liveVideo = yield createLiveWrapper();
                const command = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: rtmpUrl + '/bad-live', streamKey: liveVideo.streamKey });
                yield (0, extra_utils_1.testFfmpegStreamError)(command, true);
            });
        });
        it('Should not allow a stream without the appropriate stream key', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                const command = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: rtmpUrl + '/live', streamKey: 'bad-stream-key' });
                yield (0, extra_utils_1.testFfmpegStreamError)(command, true);
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                const command = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: rtmpUrl + '/live', streamKey: liveVideo.streamKey });
                yield (0, extra_utils_1.testFfmpegStreamError)(command, false);
            });
        });
        it('Should list this live now someone stream into it', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const { total, data } = yield server.videos.list();
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                    const video = data[0];
                    expect(video.name).to.equal('user live');
                    expect(video.isLive).to.be.true;
                }
            });
        });
        it('Should not allow a stream on a live that was blacklisted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                liveVideo = yield createLiveWrapper();
                yield servers[0].blacklist.add({ videoId: liveVideo.uuid });
                const command = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: rtmpUrl + '/live', streamKey: liveVideo.streamKey });
                yield (0, extra_utils_1.testFfmpegStreamError)(command, true);
            });
        });
        it('Should not allow a stream on a live that was deleted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                liveVideo = yield createLiveWrapper();
                yield servers[0].videos.remove({ id: liveVideo.uuid });
                const command = (0, extra_utils_1.sendRTMPStream)({ rtmpBaseUrl: rtmpUrl + '/live', streamKey: liveVideo.streamKey });
                yield (0, extra_utils_1.testFfmpegStreamError)(command, true);
            });
        });
    });
    describe('Live transcoding', function () {
        let liveVideoId;
        function createLiveWrapper(saveReplay) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const liveAttributes = {
                    name: 'live video',
                    channelId: servers[0].store.channel.id,
                    privacy: 1,
                    saveReplay
                };
                const { uuid } = yield commands[0].create({ fields: liveAttributes });
                return uuid;
            });
        }
        function testVideoResolutions(liveVideoId, resolutions) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    expect(data.find(v => v.uuid === liveVideoId)).to.exist;
                    const video = yield server.videos.get({ id: liveVideoId });
                    expect(video.streamingPlaylists).to.have.lengthOf(1);
                    const hlsPlaylist = video.streamingPlaylists.find(s => s.type === 1);
                    expect(hlsPlaylist).to.exist;
                    expect(hlsPlaylist.files).to.have.lengthOf(0);
                    yield (0, extra_utils_1.checkResolutionsInMasterPlaylist)({ server, playlistUrl: hlsPlaylist.playlistUrl, resolutions });
                    for (let i = 0; i < resolutions.length; i++) {
                        const segmentNum = 3;
                        const segmentName = `${i}-00000${segmentNum}.ts`;
                        yield commands[0].waitUntilSegmentGeneration({ videoUUID: video.uuid, resolution: i, segment: segmentNum });
                        const subPlaylist = yield servers[0].streamingPlaylists.get({
                            url: `${servers[0].url}/static/streaming-playlists/hls/${video.uuid}/${i}.m3u8`
                        });
                        expect(subPlaylist).to.contain(segmentName);
                        const baseUrlAndPath = servers[0].url + '/static/streaming-playlists/hls';
                        yield (0, extra_utils_1.checkLiveSegmentHash)({
                            server,
                            baseUrlSegment: baseUrlAndPath,
                            videoUUID: video.uuid,
                            segmentName,
                            hlsPlaylist
                        });
                    }
                }
            });
        }
        function updateConf(resolutions) {
            return servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        maxDuration: -1,
                        transcoding: {
                            enabled: true,
                            resolutions: {
                                '240p': resolutions.includes(240),
                                '360p': resolutions.includes(360),
                                '480p': resolutions.includes(480),
                                '720p': resolutions.includes(720),
                                '1080p': resolutions.includes(1080),
                                '2160p': resolutions.includes(2160)
                            }
                        }
                    }
                }
            });
        }
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield updateConf([]);
            });
        });
        it('Should enable transcoding without additional resolutions', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                liveVideoId = yield createLiveWrapper(false);
                const ffmpegCommand = yield commands[0].sendRTMPStreamInVideo({ videoId: liveVideoId });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield testVideoResolutions(liveVideoId, [720]);
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
            });
        });
        it('Should enable transcoding with some resolutions', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const resolutions = [240, 480];
                yield updateConf(resolutions);
                liveVideoId = yield createLiveWrapper(false);
                const ffmpegCommand = yield commands[0].sendRTMPStreamInVideo({ videoId: liveVideoId });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield testVideoResolutions(liveVideoId, resolutions);
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
            });
        });
        it('Should correctly set the appropriate bitrate depending on the input', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                liveVideoId = yield createLiveWrapper(false);
                const ffmpegCommand = yield commands[0].sendRTMPStreamInVideo({
                    videoId: liveVideoId,
                    fixtureName: 'video_short.mp4',
                    copyCodecs: true
                });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                yield (0, extra_utils_1.waitJobs)(servers);
                const video = yield servers[0].videos.get({ id: liveVideoId });
                const masterPlaylist = video.streamingPlaylists[0].playlistUrl;
                const probe = yield (0, ffprobe_utils_1.ffprobePromise)(masterPlaylist);
                const bitrates = probe.streams.map(s => parseInt(s.tags.variant_bitrate));
                for (const bitrate of bitrates) {
                    expect(bitrate).to.exist;
                    expect(isNaN(bitrate)).to.be.false;
                    expect(bitrate).to.be.below(61000000);
                }
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
            });
        });
        it('Should enable transcoding with some resolutions and correctly save them', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(200000);
                const resolutions = [240, 360, 720];
                yield updateConf(resolutions);
                liveVideoId = yield createLiveWrapper(true);
                const ffmpegCommand = yield commands[0].sendRTMPStreamInVideo({ videoId: liveVideoId, fixtureName: 'video_short2.webm' });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield testVideoResolutions(liveVideoId, resolutions);
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
                yield commands[0].waitUntilEnded({ videoId: liveVideoId });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                const maxBitrateLimits = {
                    720: 6500 * 1000,
                    360: 1250 * 1000,
                    240: 700 * 1000
                };
                const minBitrateLimits = {
                    720: 5500 * 1000,
                    360: 1000 * 1000,
                    240: 550 * 1000
                };
                for (const server of servers) {
                    const video = yield server.videos.get({ id: liveVideoId });
                    expect(video.state.id).to.equal(1);
                    expect(video.duration).to.be.greaterThan(1);
                    expect(video.files).to.have.lengthOf(0);
                    const hlsPlaylist = video.streamingPlaylists.find(s => s.type === 1);
                    yield (0, extra_utils_1.makeRawRequest)(hlsPlaylist.playlistUrl, models_1.HttpStatusCode.OK_200);
                    yield (0, extra_utils_1.makeRawRequest)(hlsPlaylist.segmentsSha256Url, models_1.HttpStatusCode.OK_200);
                    expect((0, path_1.basename)(hlsPlaylist.playlistUrl)).to.not.equal('master.m3u8');
                    expect((0, path_1.basename)(hlsPlaylist.segmentsSha256Url)).to.not.equal('segments-sha256.json');
                    expect(hlsPlaylist.files).to.have.lengthOf(resolutions.length);
                    for (const resolution of resolutions) {
                        const file = hlsPlaylist.files.find(f => f.resolution.id === resolution);
                        expect(file).to.exist;
                        expect(file.size).to.be.greaterThan(1);
                        if (resolution >= 720) {
                            expect(file.fps).to.be.approximately(60, 2);
                        }
                        else {
                            expect(file.fps).to.be.approximately(30, 2);
                        }
                        const filename = (0, path_1.basename)(file.fileUrl);
                        expect(filename).to.not.contain(video.uuid);
                        const segmentPath = servers[0].servers.buildDirectory((0, path_1.join)('streaming-playlists', 'hls', video.uuid, filename));
                        const probe = yield (0, ffprobe_utils_1.ffprobePromise)(segmentPath);
                        const videoStream = yield (0, ffprobe_utils_1.getVideoStreamFromFile)(segmentPath, probe);
                        expect(probe.format.bit_rate).to.be.below(maxBitrateLimits[videoStream.height]);
                        expect(probe.format.bit_rate).to.be.at.least(minBitrateLimits[videoStream.height]);
                        yield (0, extra_utils_1.makeRawRequest)(file.torrentUrl, models_1.HttpStatusCode.OK_200);
                        yield (0, extra_utils_1.makeRawRequest)(file.fileUrl, models_1.HttpStatusCode.OK_200);
                    }
                }
            });
        });
        it('Should correctly have cleaned up the live files', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield (0, extra_utils_1.checkLiveCleanupAfterSave)(servers[0], liveVideoId, [240, 360, 720]);
            });
        });
    });
    describe('After a server restart', function () {
        let liveVideoId;
        let liveVideoReplayId;
        function createLiveWrapper(saveReplay) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const liveAttributes = {
                    name: 'live video',
                    channelId: servers[0].store.channel.id,
                    privacy: 1,
                    saveReplay
                };
                const { uuid } = yield commands[0].create({ fields: liveAttributes });
                return uuid;
            });
        }
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                liveVideoId = yield createLiveWrapper(false);
                liveVideoReplayId = yield createLiveWrapper(true);
                yield Promise.all([
                    commands[0].sendRTMPStreamInVideo({ videoId: liveVideoId }),
                    commands[0].sendRTMPStreamInVideo({ videoId: liveVideoReplayId })
                ]);
                yield Promise.all([
                    commands[0].waitUntilPublished({ videoId: liveVideoId }),
                    commands[0].waitUntilPublished({ videoId: liveVideoReplayId })
                ]);
                yield commands[0].waitUntilSegmentGeneration({ videoUUID: liveVideoId, resolution: 0, segment: 2 });
                yield commands[0].waitUntilSegmentGeneration({ videoUUID: liveVideoReplayId, resolution: 0, segment: 2 });
                yield (0, extra_utils_1.killallServers)([servers[0]]);
                yield servers[0].run();
                yield (0, extra_utils_1.wait)(5000);
            });
        });
        it('Should cleanup lives', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield commands[0].waitUntilEnded({ videoId: liveVideoId });
            });
        });
        it('Should save a live replay', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield commands[0].waitUntilPublished({ videoId: liveVideoReplayId });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
