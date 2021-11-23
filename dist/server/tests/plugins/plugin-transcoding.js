"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const extra_utils_1 = require("@shared/extra-utils");
function createLiveWrapper(server) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const liveAttributes = {
            name: 'live video',
            channelId: server.store.channel.id,
            privacy: 1
        };
        const { uuid } = yield server.live.create({ fields: liveAttributes });
        return uuid;
    });
}
function updateConf(server, vodProfile, liveProfile) {
    return server.config.updateCustomSubConfig({
        newConfig: {
            transcoding: {
                enabled: true,
                profile: vodProfile,
                hls: {
                    enabled: true
                },
                webtorrent: {
                    enabled: true
                },
                resolutions: {
                    '240p': true,
                    '360p': false,
                    '480p': false,
                    '720p': true
                }
            },
            live: {
                transcoding: {
                    profile: liveProfile,
                    enabled: true,
                    resolutions: {
                        '240p': true,
                        '360p': false,
                        '480p': false,
                        '720p': true
                    }
                }
            }
        }
    });
}
describe('Test transcoding plugins', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield (0, extra_utils_1.setDefaultVideoChannel)([server]);
            yield updateConf(server, 'default', 'default');
        });
    });
    describe('When using a plugin adding profiles to existing encoders', function () {
        function checkVideoFPS(uuid, type, fps) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const video = yield server.videos.get({ id: uuid });
                const files = video.files.concat(...video.streamingPlaylists.map(p => p.files));
                for (const file of files) {
                    if (type === 'above') {
                        (0, chai_1.expect)(file.fps).to.be.above(fps);
                    }
                    else {
                        (0, chai_1.expect)(file.fps).to.be.below(fps);
                    }
                }
            });
        }
        function checkLiveFPS(uuid, type, fps) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const playlistUrl = `${server.url}/static/streaming-playlists/hls/${uuid}/0.m3u8`;
                const videoFPS = yield (0, ffprobe_utils_1.getVideoFileFPS)(playlistUrl);
                if (type === 'above') {
                    (0, chai_1.expect)(videoFPS).to.be.above(fps);
                }
                else {
                    (0, chai_1.expect)(videoFPS).to.be.below(fps);
                }
            });
        }
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-transcoding-one') });
            });
        });
        it('Should have the appropriate available profiles', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const config = yield server.config.getConfig();
                (0, chai_1.expect)(config.transcoding.availableProfiles).to.have.members(['default', 'low-vod', 'input-options-vod', 'bad-scale-vod']);
                (0, chai_1.expect)(config.live.transcoding.availableProfiles).to.have.members(['default', 'high-live', 'input-options-live', 'bad-scale-live']);
            });
        });
        describe('VOD', function () {
            it('Should not use the plugin profile if not chosen by the admin', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    const videoUUID = (yield server.videos.quickUpload({ name: 'video' })).uuid;
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkVideoFPS(videoUUID, 'above', 20);
                });
            });
            it('Should use the vod profile', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield updateConf(server, 'low-vod', 'default');
                    const videoUUID = (yield server.videos.quickUpload({ name: 'video' })).uuid;
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkVideoFPS(videoUUID, 'below', 12);
                });
            });
            it('Should apply input options in vod profile', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield updateConf(server, 'input-options-vod', 'default');
                    const videoUUID = (yield server.videos.quickUpload({ name: 'video' })).uuid;
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkVideoFPS(videoUUID, 'below', 6);
                });
            });
            it('Should apply the scale filter in vod profile', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield updateConf(server, 'bad-scale-vod', 'default');
                    const videoUUID = (yield server.videos.quickUpload({ name: 'video' })).uuid;
                    yield (0, extra_utils_1.waitJobs)([server]);
                    const video = yield server.videos.get({ id: videoUUID });
                    (0, chai_1.expect)(video.files).to.have.lengthOf(1);
                    (0, chai_1.expect)(video.streamingPlaylists).to.have.lengthOf(0);
                });
            });
        });
        describe('Live', function () {
            it('Should not use the plugin profile if not chosen by the admin', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    const liveVideoId = yield createLiveWrapper(server);
                    yield server.live.sendRTMPStreamInVideo({ videoId: liveVideoId, fixtureName: 'video_very_short_240p.mp4' });
                    yield server.live.waitUntilPublished({ videoId: liveVideoId });
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkLiveFPS(liveVideoId, 'above', 20);
                });
            });
            it('Should use the live profile', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield updateConf(server, 'low-vod', 'high-live');
                    const liveVideoId = yield createLiveWrapper(server);
                    yield server.live.sendRTMPStreamInVideo({ videoId: liveVideoId, fixtureName: 'video_very_short_240p.mp4' });
                    yield server.live.waitUntilPublished({ videoId: liveVideoId });
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkLiveFPS(liveVideoId, 'above', 45);
                });
            });
            it('Should apply the input options on live profile', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield updateConf(server, 'low-vod', 'input-options-live');
                    const liveVideoId = yield createLiveWrapper(server);
                    yield server.live.sendRTMPStreamInVideo({ videoId: liveVideoId, fixtureName: 'video_very_short_240p.mp4' });
                    yield server.live.waitUntilPublished({ videoId: liveVideoId });
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkLiveFPS(liveVideoId, 'above', 45);
                });
            });
            it('Should apply the scale filter name on live profile', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield updateConf(server, 'low-vod', 'bad-scale-live');
                    const liveVideoId = yield createLiveWrapper(server);
                    const command = yield server.live.sendRTMPStreamInVideo({ videoId: liveVideoId, fixtureName: 'video_very_short_240p.mp4' });
                    yield (0, extra_utils_1.testFfmpegStreamError)(command, true);
                });
            });
            it('Should default to the default profile if the specified profile does not exist', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-transcoding-one' });
                    const config = yield server.config.getConfig();
                    (0, chai_1.expect)(config.transcoding.availableProfiles).to.deep.equal(['default']);
                    (0, chai_1.expect)(config.live.transcoding.availableProfiles).to.deep.equal(['default']);
                    const videoUUID = (yield server.videos.quickUpload({ name: 'video', fixture: 'video_very_short_240p.mp4' })).uuid;
                    yield (0, extra_utils_1.waitJobs)([server]);
                    yield checkVideoFPS(videoUUID, 'above', 20);
                });
            });
        });
    });
    describe('When using a plugin adding new encoders', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-transcoding-two') });
                yield updateConf(server, 'test-vod-profile', 'test-live-profile');
            });
        });
        it('Should use the new vod encoders', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(240000);
                const videoUUID = (yield server.videos.quickUpload({ name: 'video', fixture: 'video_very_short_240p.mp4' })).uuid;
                yield (0, extra_utils_1.waitJobs)([server]);
                const video = yield server.videos.get({ id: videoUUID });
                const path = server.servers.buildWebTorrentFilePath(video.files[0].fileUrl);
                const audioProbe = yield (0, ffprobe_utils_1.getAudioStream)(path);
                (0, chai_1.expect)(audioProbe.audioStream.codec_name).to.equal('opus');
                const videoProbe = yield (0, ffprobe_utils_1.getVideoStreamFromFile)(path);
                (0, chai_1.expect)(videoProbe.codec_name).to.equal('vp9');
            });
        });
        it('Should use the new live encoders', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(240000);
                const liveVideoId = yield createLiveWrapper(server);
                yield server.live.sendRTMPStreamInVideo({ videoId: liveVideoId, fixtureName: 'video_short2.webm' });
                yield server.live.waitUntilPublished({ videoId: liveVideoId });
                yield (0, extra_utils_1.waitJobs)([server]);
                const playlistUrl = `${server.url}/static/streaming-playlists/hls/${liveVideoId}/0.m3u8`;
                const audioProbe = yield (0, ffprobe_utils_1.getAudioStream)(playlistUrl);
                (0, chai_1.expect)(audioProbe.audioStream.codec_name).to.equal('opus');
                const videoProbe = yield (0, ffprobe_utils_1.getVideoStreamFromFile)(playlistUrl);
                (0, chai_1.expect)(videoProbe.codec_name).to.equal('h264');
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
