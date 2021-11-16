"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test audio only video transcoding', function () {
    let servers = [];
    let videoUUID;
    let webtorrentAudioFileUrl;
    let fragmentedAudioFileUrl;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const configOverride = {
                transcoding: {
                    enabled: true,
                    resolutions: {
                        '0p': true,
                        '240p': true,
                        '360p': false,
                        '480p': false,
                        '720p': false,
                        '1080p': false,
                        '1440p': false,
                        '2160p': false
                    },
                    hls: {
                        enabled: true
                    },
                    webtorrent: {
                        enabled: true
                    }
                }
            };
            servers = yield extra_utils_1.createMultipleServers(2, configOverride);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
        });
    });
    it('Should upload a video and transcode it', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'audio only' } });
            videoUUID = uuid;
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                expect(video.streamingPlaylists).to.have.lengthOf(1);
                for (const files of [video.files, video.streamingPlaylists[0].files]) {
                    expect(files).to.have.lengthOf(3);
                    expect(files[0].resolution.id).to.equal(720);
                    expect(files[1].resolution.id).to.equal(240);
                    expect(files[2].resolution.id).to.equal(0);
                }
                if (server.serverNumber === 1) {
                    webtorrentAudioFileUrl = video.files[2].fileUrl;
                    fragmentedAudioFileUrl = video.streamingPlaylists[0].files[2].fileUrl;
                }
            }
        });
    });
    it('0p transcoded video should not have video', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const paths = [
                servers[0].servers.buildWebTorrentFilePath(webtorrentAudioFileUrl),
                servers[0].servers.buildFragmentedFilePath(videoUUID, fragmentedAudioFileUrl)
            ];
            for (const path of paths) {
                const { audioStream } = yield ffprobe_utils_1.getAudioStream(path);
                expect(audioStream['codec_name']).to.be.equal('aac');
                expect(audioStream['bit_rate']).to.be.at.most(384 * 8000);
                const size = yield ffprobe_utils_1.getVideoStreamSize(path);
                expect(size.height).to.equal(0);
                expect(size.width).to.equal(0);
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
