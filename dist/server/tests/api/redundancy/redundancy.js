"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const fs_extra_1 = require("fs-extra");
const magnet_uri_1 = (0, tslib_1.__importDefault)(require("magnet-uri"));
const path_1 = require("path");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
let servers = [];
let video1Server2;
function checkMagnetWebseeds(file, baseWebseeds, server) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const parsed = magnet_uri_1.default.decode(file.magnetUri);
        for (const ws of baseWebseeds) {
            const found = parsed.urlList.find(url => url === `${ws}${(0, path_1.basename)(file.fileUrl)}`);
            expect(found, `Webseed ${ws} not found in ${file.magnetUri} on server ${server.url}`).to.not.be.undefined;
        }
        expect(parsed.urlList).to.have.lengthOf(baseWebseeds.length);
        for (const url of parsed.urlList) {
            yield (0, extra_utils_1.makeRawRequest)(url, models_1.HttpStatusCode.OK_200);
        }
    });
}
function createServers(strategy, additionalParams = {}, withWebtorrent = true) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const strategies = [];
        if (strategy !== null) {
            strategies.push(Object.assign({ min_lifetime: '1 hour', strategy: strategy, size: '400KB' }, additionalParams));
        }
        const config = {
            transcoding: {
                webtorrent: {
                    enabled: withWebtorrent
                },
                hls: {
                    enabled: true
                }
            },
            redundancy: {
                videos: {
                    check_interval: '5 seconds',
                    strategies
                }
            }
        };
        servers = yield (0, extra_utils_1.createMultipleServers)(3, config);
        yield (0, extra_utils_1.setAccessTokensToServers)(servers);
        {
            const { id } = yield servers[1].videos.upload({ attributes: { name: 'video 1 server 2' } });
            video1Server2 = yield servers[1].videos.get({ id });
            yield servers[1].videos.view({ id });
        }
        yield (0, extra_utils_1.waitJobs)(servers);
        yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        yield (0, extra_utils_1.doubleFollow)(servers[0], servers[2]);
        yield (0, extra_utils_1.doubleFollow)(servers[1], servers[2]);
        yield (0, extra_utils_1.waitJobs)(servers);
    });
}
function ensureSameFilenames(videoUUID) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let webtorrentFilenames;
        let hlsFilenames;
        for (const server of servers) {
            const video = yield server.videos.getWithToken({ id: videoUUID });
            const localWebtorrentFilenames = video.files.map(f => (0, path_1.basename)(f.fileUrl)).sort();
            const localHLSFilenames = video.streamingPlaylists[0].files.map(f => (0, path_1.basename)(f.fileUrl)).sort();
            if (webtorrentFilenames)
                expect(webtorrentFilenames).to.deep.equal(localWebtorrentFilenames);
            else
                webtorrentFilenames = localWebtorrentFilenames;
            if (hlsFilenames)
                expect(hlsFilenames).to.deep.equal(localHLSFilenames);
            else
                hlsFilenames = localHLSFilenames;
        }
        return { webtorrentFilenames, hlsFilenames };
    });
}
function check1WebSeed(videoUUID) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!videoUUID)
            videoUUID = video1Server2.uuid;
        const webseeds = [
            `http://localhost:${servers[1].port}/static/webseed/`
        ];
        for (const server of servers) {
            const video = yield server.videos.getWithToken({ id: videoUUID });
            for (const f of video.files) {
                yield checkMagnetWebseeds(f, webseeds, server);
            }
        }
        yield ensureSameFilenames(videoUUID);
    });
}
function check2Webseeds(videoUUID) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!videoUUID)
            videoUUID = video1Server2.uuid;
        const webseeds = [
            `http://localhost:${servers[0].port}/static/redundancy/`,
            `http://localhost:${servers[1].port}/static/webseed/`
        ];
        for (const server of servers) {
            const video = yield server.videos.get({ id: videoUUID });
            for (const file of video.files) {
                yield checkMagnetWebseeds(file, webseeds, server);
            }
        }
        const { webtorrentFilenames } = yield ensureSameFilenames(videoUUID);
        const directories = [
            'test' + servers[0].internalServerNumber + '/redundancy',
            'test' + servers[1].internalServerNumber + '/videos'
        ];
        for (const directory of directories) {
            const files = yield (0, fs_extra_1.readdir)((0, path_1.join)((0, extra_utils_1.root)(), directory));
            expect(files).to.have.length.at.least(4);
            expect(files.find(f => webtorrentFilenames.includes(f))).to.exist;
        }
    });
}
function check0PlaylistRedundancies(videoUUID) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!videoUUID)
            videoUUID = video1Server2.uuid;
        for (const server of servers) {
            const video = yield server.videos.getWithToken({ id: videoUUID });
            expect(video.streamingPlaylists).to.be.an('array');
            expect(video.streamingPlaylists).to.have.lengthOf(1);
            expect(video.streamingPlaylists[0].redundancies).to.have.lengthOf(0);
        }
        yield ensureSameFilenames(videoUUID);
    });
}
function check1PlaylistRedundancies(videoUUID) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!videoUUID)
            videoUUID = video1Server2.uuid;
        for (const server of servers) {
            const video = yield server.videos.get({ id: videoUUID });
            expect(video.streamingPlaylists).to.have.lengthOf(1);
            expect(video.streamingPlaylists[0].redundancies).to.have.lengthOf(1);
            const redundancy = video.streamingPlaylists[0].redundancies[0];
            expect(redundancy.baseUrl).to.equal(servers[0].url + '/static/redundancy/hls/' + videoUUID);
        }
        const baseUrlPlaylist = servers[1].url + '/static/streaming-playlists/hls/' + videoUUID;
        const baseUrlSegment = servers[0].url + '/static/redundancy/hls/' + videoUUID;
        const video = yield servers[0].videos.get({ id: videoUUID });
        const hlsPlaylist = video.streamingPlaylists[0];
        for (const resolution of [240, 360, 480, 720]) {
            yield (0, extra_utils_1.checkSegmentHash)({ server: servers[1], baseUrlPlaylist, baseUrlSegment, resolution, hlsPlaylist });
        }
        const { hlsFilenames } = yield ensureSameFilenames(videoUUID);
        const directories = [
            'test' + servers[0].internalServerNumber + '/redundancy/hls',
            'test' + servers[1].internalServerNumber + '/streaming-playlists/hls'
        ];
        for (const directory of directories) {
            const files = yield (0, fs_extra_1.readdir)((0, path_1.join)((0, extra_utils_1.root)(), directory, videoUUID));
            expect(files).to.have.length.at.least(4);
            expect(files.find(f => hlsFilenames.includes(f))).to.exist;
        }
    });
}
function checkStatsGlobal(strategy) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let totalSize = null;
        let statsLength = 1;
        if (strategy !== 'manual') {
            totalSize = 409600;
            statsLength = 2;
        }
        const data = yield servers[0].stats.get();
        expect(data.videosRedundancy).to.have.lengthOf(statsLength);
        const stat = data.videosRedundancy[0];
        expect(stat.strategy).to.equal(strategy);
        expect(stat.totalSize).to.equal(totalSize);
        return stat;
    });
}
function checkStatsWith1Redundancy(strategy, onlyHls = false) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const stat = yield checkStatsGlobal(strategy);
        expect(stat.totalUsed).to.be.at.least(1).and.below(409601);
        expect(stat.totalVideoFiles).to.equal(onlyHls ? 4 : 8);
        expect(stat.totalVideos).to.equal(1);
    });
}
function checkStatsWithoutRedundancy(strategy) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const stat = yield checkStatsGlobal(strategy);
        expect(stat.totalUsed).to.equal(0);
        expect(stat.totalVideoFiles).to.equal(0);
        expect(stat.totalVideos).to.equal(0);
    });
}
function findServerFollows() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = yield servers[0].follows.getFollowings({ start: 0, count: 5, sort: '-createdAt' });
        const follows = body.data;
        const server2 = follows.find(f => f.following.host === `localhost:${servers[1].port}`);
        const server3 = follows.find(f => f.following.host === `localhost:${servers[2].port}`);
        return { server2, server3 };
    });
}
function enableRedundancyOnServer1() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield servers[0].redundancy.updateRedundancy({ host: servers[1].host, redundancyAllowed: true });
        const { server2, server3 } = yield findServerFollows();
        expect(server3).to.not.be.undefined;
        expect(server3.following.hostRedundancyAllowed).to.be.false;
        expect(server2).to.not.be.undefined;
        expect(server2.following.hostRedundancyAllowed).to.be.true;
    });
}
function disableRedundancyOnServer1() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield servers[0].redundancy.updateRedundancy({ host: servers[1].host, redundancyAllowed: false });
        const { server2, server3 } = yield findServerFollows();
        expect(server3).to.not.be.undefined;
        expect(server3.following.hostRedundancyAllowed).to.be.false;
        expect(server2).to.not.be.undefined;
        expect(server2.following.hostRedundancyAllowed).to.be.false;
    });
}
describe('Test videos redundancy', function () {
    describe('With most-views strategy', function () {
        const strategy = 'most-views';
        before(function () {
            this.timeout(120000);
            return createServers(strategy);
        });
        it('Should have 1 webseed on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield checkStatsWithoutRedundancy(strategy);
            });
        });
        it('Should enable redundancy on server 1', function () {
            return enableRedundancyOnServer1();
        });
        it('Should have 2 webseeds on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].servers.waitUntilLog('Duplicated ', 5);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check2Webseeds();
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy(strategy);
            });
        });
        it('Should undo redundancy on server 1 and remove duplicated videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield disableRedundancyOnServer1();
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(5000);
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server: servers[0], video: video1Server2, onlyVideoFiles: true });
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                return (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
    describe('With trending strategy', function () {
        const strategy = 'trending';
        before(function () {
            this.timeout(120000);
            return createServers(strategy);
        });
        it('Should have 1 webseed on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield checkStatsWithoutRedundancy(strategy);
            });
        });
        it('Should enable redundancy on server 1', function () {
            return enableRedundancyOnServer1();
        });
        it('Should have 2 webseeds on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].servers.waitUntilLog('Duplicated ', 5);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check2Webseeds();
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy(strategy);
            });
        });
        it('Should unfollow server 3 and keep duplicated videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield servers[0].follows.unfollow({ target: servers[2] });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(5000);
                yield check2Webseeds();
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy(strategy);
            });
        });
        it('Should unfollow server 2 and remove duplicated videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield servers[0].follows.unfollow({ target: servers[1] });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(5000);
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server: servers[0], video: video1Server2, onlyVideoFiles: true });
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
    describe('With recently added strategy', function () {
        const strategy = 'recently-added';
        before(function () {
            this.timeout(120000);
            return createServers(strategy, { min_views: 3 });
        });
        it('Should have 1 webseed on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield checkStatsWithoutRedundancy(strategy);
            });
        });
        it('Should enable redundancy on server 1', function () {
            return enableRedundancyOnServer1();
        });
        it('Should still have 1 webseed on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(15000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield checkStatsWithoutRedundancy(strategy);
            });
        });
        it('Should view 2 times the first video to have > min_views config', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield servers[0].videos.view({ id: video1Server2.uuid });
                yield servers[2].videos.view({ id: video1Server2.uuid });
                yield (0, extra_utils_1.wait)(10000);
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should have 2 webseeds on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].servers.waitUntilLog('Duplicated ', 5);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check2Webseeds();
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy(strategy);
            });
        });
        it('Should remove the video and the redundancy files', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield (0, extra_utils_1.saveVideoInServers)(servers, video1Server2.uuid);
                yield servers[1].videos.remove({ id: video1Server2.uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server, video: server.store.videoDetails });
                }
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
    describe('With only HLS files', function () {
        const strategy = 'recently-added';
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield createServers(strategy, { min_views: 3 }, false);
            });
        });
        it('Should have 0 playlist redundancy on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
            });
        });
        it('Should enable redundancy on server 1', function () {
            return enableRedundancyOnServer1();
        });
        it('Should still have 0 redundancy on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(15000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check0PlaylistRedundancies();
                yield checkStatsWithoutRedundancy(strategy);
            });
        });
        it('Should have 1 redundancy on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(160000);
                yield servers[0].videos.view({ id: video1Server2.uuid });
                yield servers[2].videos.view({ id: video1Server2.uuid });
                yield (0, extra_utils_1.wait)(10000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].servers.waitUntilLog('Duplicated ', 1);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy(strategy, true);
            });
        });
        it('Should remove the video and the redundancy files', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield (0, extra_utils_1.saveVideoInServers)(servers, video1Server2.uuid);
                yield servers[1].videos.remove({ id: video1Server2.uuid });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server, video: server.store.videoDetails });
                }
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
    describe('With manual strategy', function () {
        before(function () {
            this.timeout(120000);
            return createServers(null);
        });
        it('Should have 1 webseed on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield checkStatsWithoutRedundancy('manual');
            });
        });
        it('Should create a redundancy on first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].redundancy.addVideo({ videoId: video1Server2.id });
            });
        });
        it('Should have 2 webseeds on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].servers.waitUntilLog('Duplicated ', 5);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check2Webseeds();
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy('manual');
            });
        });
        it('Should manually remove redundancies on server 1 and remove duplicated videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                const body = yield servers[0].redundancy.listVideos({ target: 'remote-videos' });
                const videos = body.data;
                expect(videos).to.have.lengthOf(1);
                const video = videos[0];
                for (const r of video.redundancies.files.concat(video.redundancies.streamingPlaylists)) {
                    yield servers[0].redundancy.removeVideo({ redundancyId: r.id });
                }
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(5000);
                yield check1WebSeed();
                yield check0PlaylistRedundancies();
                yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server: servers[0], video: video1Server2, onlyVideoFiles: true });
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
    describe('Test expiration', function () {
        const strategy = 'recently-added';
        function checkContains(servers, str) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const video = yield server.videos.get({ id: video1Server2.uuid });
                    for (const f of video.files) {
                        expect(f.magnetUri).to.contain(str);
                    }
                }
            });
        }
        function checkNotContains(servers, str) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const video = yield server.videos.get({ id: video1Server2.uuid });
                    for (const f of video.files) {
                        expect(f.magnetUri).to.not.contain(str);
                    }
                }
            });
        }
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield createServers(strategy, { min_lifetime: '7 seconds', min_views: 0 });
                yield enableRedundancyOnServer1();
            });
        });
        it('Should still have 2 webseeds after 10 seconds', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.wait)(10000);
                try {
                    yield checkContains(servers, 'http%3A%2F%2Flocalhost%3A' + servers[0].port);
                }
                catch (_a) {
                    yield (0, extra_utils_1.wait)(2000);
                    yield checkContains(servers, 'http%3A%2F%2Flocalhost%3A' + servers[0].port);
                }
            });
        });
        it('Should stop server 1 and expire video redundancy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.killallServers)([servers[0]]);
                yield (0, extra_utils_1.wait)(15000);
                yield checkNotContains([servers[1], servers[2]], 'http%3A%2F%2Flocalhost%3A' + servers[0].port);
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
    describe('Test file replacement', function () {
        let video2Server2UUID;
        const strategy = 'recently-added';
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield createServers(strategy, { min_lifetime: '7 seconds', min_views: 0 });
                yield enableRedundancyOnServer1();
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[0].servers.waitUntilLog('Duplicated ', 5);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield check2Webseeds();
                yield check1PlaylistRedundancies();
                yield checkStatsWith1Redundancy(strategy);
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video 2 server 2', privacy: 3 } });
                video2Server2UUID = uuid;
                yield (0, extra_utils_1.waitJobs)(servers);
                yield servers[1].videos.update({ id: video2Server2UUID, attributes: { privacy: 1 } });
            });
        });
        it('Should cache video 2 webseeds on the first video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield (0, extra_utils_1.waitJobs)(servers);
                let checked = false;
                while (checked === false) {
                    yield (0, extra_utils_1.wait)(1000);
                    try {
                        yield check1WebSeed();
                        yield check0PlaylistRedundancies();
                        yield check2Webseeds(video2Server2UUID);
                        yield check1PlaylistRedundancies(video2Server2UUID);
                        checked = true;
                    }
                    catch (_a) {
                        checked = false;
                    }
                }
            });
        });
        it('Should disable strategy and remove redundancies', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(80000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.killallServers)([servers[0]]);
                yield servers[0].run({
                    redundancy: {
                        videos: {
                            check_interval: '1 second',
                            strategies: []
                        }
                    }
                });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.checkVideoFilesWereRemoved)({ server: servers[0], video: video1Server2, onlyVideoFiles: true });
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.cleanupTests)(servers);
            });
        });
    });
});
