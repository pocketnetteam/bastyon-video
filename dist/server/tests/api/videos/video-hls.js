"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const path_1 = require("path");
const core_utils_1 = require("@shared/core-utils");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const constants_1 = require("../../../initializers/constants");
const expect = chai.expect;
function checkHlsPlaylist(options) {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { videoUUID, hlsOnly, objectStorageBaseUrl } = options;
        const resolutions = (_a = options.resolutions) !== null && _a !== void 0 ? _a : [240, 360, 480, 720];
        for (const server of options.servers) {
            const videoDetails = yield server.videos.get({ id: videoUUID });
            const baseUrl = `http://${videoDetails.account.host}`;
            expect(videoDetails.streamingPlaylists).to.have.lengthOf(1);
            const hlsPlaylist = videoDetails.streamingPlaylists.find(p => p.type === 1);
            expect(hlsPlaylist).to.not.be.undefined;
            const hlsFiles = hlsPlaylist.files;
            expect(hlsFiles).to.have.lengthOf(resolutions.length);
            if (hlsOnly)
                expect(videoDetails.files).to.have.lengthOf(0);
            else
                expect(videoDetails.files).to.have.lengthOf(resolutions.length);
            for (const resolution of resolutions) {
                const file = hlsFiles.find(f => f.resolution.id === resolution);
                expect(file).to.not.be.undefined;
                expect(file.magnetUri).to.have.lengthOf.above(2);
                expect(file.torrentUrl).to.match(new RegExp(`http://${server.host}/lazy-static/torrents/${core_utils_1.uuidRegex}-${file.resolution.id}-hls.torrent`));
                if (objectStorageBaseUrl) {
                    (0, extra_utils_1.expectStartWith)(file.fileUrl, objectStorageBaseUrl);
                }
                else {
                    expect(file.fileUrl).to.match(new RegExp(`${baseUrl}/static/streaming-playlists/hls/${videoDetails.uuid}/${core_utils_1.uuidRegex}-${file.resolution.id}-fragmented.mp4`));
                }
                expect(file.resolution.label).to.equal(resolution + 'p');
                yield (0, extra_utils_1.makeRawRequest)(file.torrentUrl, models_1.HttpStatusCode.OK_200);
                yield (0, extra_utils_1.makeRawRequest)(file.fileUrl, models_1.HttpStatusCode.OK_200);
                const torrent = yield (0, extra_utils_1.webtorrentAdd)(file.magnetUri, true);
                expect(torrent.files).to.be.an('array');
                expect(torrent.files.length).to.equal(1);
                expect(torrent.files[0].path).to.exist.and.to.not.equal('');
            }
            {
                yield (0, extra_utils_1.checkResolutionsInMasterPlaylist)({ server, playlistUrl: hlsPlaylist.playlistUrl, resolutions });
                const masterPlaylist = yield server.streamingPlaylists.get({ url: hlsPlaylist.playlistUrl });
                let i = 0;
                for (const resolution of resolutions) {
                    expect(masterPlaylist).to.contain(`${resolution}.m3u8`);
                    expect(masterPlaylist).to.contain(`${resolution}.m3u8`);
                    const url = 'http://' + videoDetails.account.host;
                    yield (0, extra_utils_1.hlsInfohashExist)(url, hlsPlaylist.playlistUrl, i);
                    i++;
                }
            }
            {
                for (const resolution of resolutions) {
                    const file = hlsFiles.find(f => f.resolution.id === resolution);
                    const playlistName = (0, core_utils_1.removeFragmentedMP4Ext)((0, path_1.basename)(file.fileUrl)) + '.m3u8';
                    const url = objectStorageBaseUrl
                        ? `${objectStorageBaseUrl}hls/${videoUUID}/${playlistName}`
                        : `${baseUrl}/static/streaming-playlists/hls/${videoUUID}/${playlistName}`;
                    const subPlaylist = yield server.streamingPlaylists.get({ url });
                    expect(subPlaylist).to.match(new RegExp(`${core_utils_1.uuidRegex}-${resolution}-fragmented.mp4`));
                    expect(subPlaylist).to.contain((0, path_1.basename)(file.fileUrl));
                }
            }
            {
                const baseUrlAndPath = objectStorageBaseUrl
                    ? objectStorageBaseUrl + 'hls/' + videoUUID
                    : baseUrl + '/static/streaming-playlists/hls/' + videoUUID;
                for (const resolution of resolutions) {
                    yield (0, extra_utils_1.checkSegmentHash)({
                        server,
                        baseUrlPlaylist: baseUrlAndPath,
                        baseUrlSegment: baseUrlAndPath,
                        resolution,
                        hlsPlaylist
                    });
                }
            }
        }
    });
}
describe('Test HLS videos', function () {
    let servers = [];
    let videoUUID = '';
    let videoAudioUUID = '';
    function runTestSuite(hlsOnly, objectStorageBaseUrl) {
        it('Should upload a video and transcode it to HLS', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video 1', fixture: 'video_short.webm' } });
                videoUUID = uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkHlsPlaylist({ servers, videoUUID, hlsOnly, objectStorageBaseUrl });
            });
        });
        it('Should upload an audio file and transcode it to HLS', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video audio', fixture: 'sample.ogg' } });
                videoAudioUUID = uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkHlsPlaylist({
                    servers,
                    videoUUID: videoAudioUUID,
                    hlsOnly,
                    resolutions: [constants_1.DEFAULT_AUDIO_RESOLUTION, 360, 240],
                    objectStorageBaseUrl
                });
            });
        });
        it('Should update the video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].videos.update({ id: videoUUID, attributes: { name: 'video 1 updated' } });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkHlsPlaylist({ servers, videoUUID, hlsOnly, objectStorageBaseUrl });
            });
        });
        it('Should delete videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].videos.remove({ id: videoUUID });
                yield servers[0].videos.remove({ id: videoAudioUUID });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    yield server.videos.get({ id: videoUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield server.videos.get({ id: videoAudioUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                }
            });
        });
        it('Should have the playlists/segment deleted from the disk', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    yield (0, extra_utils_1.checkDirectoryIsEmpty)(server, 'videos');
                    yield (0, extra_utils_1.checkDirectoryIsEmpty)(server, (0, path_1.join)('streaming-playlists', 'hls'));
                }
            });
        });
        it('Should have an empty tmp directory', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    yield (0, extra_utils_1.checkTmpIsEmpty)(server);
                }
            });
        });
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            const configOverride = {
                transcoding: {
                    enabled: true,
                    allow_audio_files: true,
                    hls: {
                        enabled: true
                    }
                }
            };
            servers = yield (0, extra_utils_1.createMultipleServers)(2, configOverride);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('With WebTorrent & HLS enabled', function () {
        runTestSuite(false);
    });
    describe('With only HLS enabled', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].config.updateCustomSubConfig({
                    newConfig: {
                        transcoding: {
                            enabled: true,
                            allowAudioFiles: true,
                            resolutions: {
                                '240p': true,
                                '360p': true,
                                '480p': true,
                                '720p': true,
                                '1080p': true,
                                '1440p': true,
                                '2160p': true
                            },
                            hls: {
                                enabled: true
                            },
                            webtorrent: {
                                enabled: false
                            }
                        }
                    }
                });
            });
        });
        runTestSuite(true);
    });
    describe('With object storage enabled', function () {
        if ((0, extra_utils_1.areObjectStorageTestsDisabled)())
            return;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const configOverride = extra_utils_1.ObjectStorageCommand.getDefaultConfig();
                yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
                yield servers[0].kill();
                yield servers[0].run(configOverride);
            });
        });
        runTestSuite(true, extra_utils_1.ObjectStorageCommand.getPlaylistBaseUrl());
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
