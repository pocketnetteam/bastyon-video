"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test manage videos redundancy', function () {
    const targets = ['my-videos', 'remote-videos'];
    let servers;
    let video1Server2UUID;
    let video2Server2UUID;
    let redundanciesToRemove = [];
    let commands;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const config = {
                transcoding: {
                    hls: {
                        enabled: true
                    }
                },
                redundancy: {
                    videos: {
                        check_interval: '1 second',
                        strategies: [
                            {
                                strategy: 'recently-added',
                                min_lifetime: '1 hour',
                                size: '10MB',
                                min_views: 0
                            }
                        ]
                    }
                }
            };
            servers = yield extra_utils_1.createMultipleServers(3, config);
            yield extra_utils_1.setAccessTokensToServers(servers);
            commands = servers.map(s => s.redundancy);
            {
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video 1 server 2' } });
                video1Server2UUID = uuid;
            }
            {
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video 2 server 2' } });
                video2Server2UUID = uuid;
            }
            yield extra_utils_1.waitJobs(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield commands[0].updateRedundancy({ host: servers[1].host, redundancyAllowed: true });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should not have redundancies on server 3', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const target of targets) {
                const body = yield commands[2].listVideos({ target });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should not have "remote-videos" redundancies on server 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield extra_utils_1.waitJobs(servers);
            yield servers[0].servers.waitUntilLog('Duplicated ', 10);
            yield extra_utils_1.waitJobs(servers);
            const body = yield commands[1].listVideos({ target: 'remote-videos' });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should have "my-videos" redundancies on server 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const body = yield commands[1].listVideos({ target: 'my-videos' });
            expect(body.total).to.equal(2);
            const videos = body.data;
            expect(videos).to.have.lengthOf(2);
            const videos1 = videos.find(v => v.uuid === video1Server2UUID);
            const videos2 = videos.find(v => v.uuid === video2Server2UUID);
            expect(videos1.name).to.equal('video 1 server 2');
            expect(videos2.name).to.equal('video 2 server 2');
            expect(videos1.redundancies.files).to.have.lengthOf(4);
            expect(videos1.redundancies.streamingPlaylists).to.have.lengthOf(1);
            const redundancies = videos1.redundancies.files.concat(videos1.redundancies.streamingPlaylists);
            for (const r of redundancies) {
                expect(r.strategy).to.be.null;
                expect(r.fileUrl).to.exist;
                expect(r.createdAt).to.exist;
                expect(r.updatedAt).to.exist;
                expect(r.expiresOn).to.exist;
            }
        });
    });
    it('Should not have "my-videos" redundancies on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield commands[0].listVideos({ target: 'my-videos' });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should have "remote-videos" redundancies on server 1', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const body = yield commands[0].listVideos({ target: 'remote-videos' });
            expect(body.total).to.equal(2);
            const videos = body.data;
            expect(videos).to.have.lengthOf(2);
            const videos1 = videos.find(v => v.uuid === video1Server2UUID);
            const videos2 = videos.find(v => v.uuid === video2Server2UUID);
            expect(videos1.name).to.equal('video 1 server 2');
            expect(videos2.name).to.equal('video 2 server 2');
            expect(videos1.redundancies.files).to.have.lengthOf(4);
            expect(videos1.redundancies.streamingPlaylists).to.have.lengthOf(1);
            const redundancies = videos1.redundancies.files.concat(videos1.redundancies.streamingPlaylists);
            for (const r of redundancies) {
                expect(r.strategy).to.equal('recently-added');
                expect(r.fileUrl).to.exist;
                expect(r.createdAt).to.exist;
                expect(r.updatedAt).to.exist;
                expect(r.expiresOn).to.exist;
            }
        });
    });
    it('Should correctly paginate and sort results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield commands[0].listVideos({
                    target: 'remote-videos',
                    sort: 'name',
                    start: 0,
                    count: 2
                });
                const videos = body.data;
                expect(videos[0].name).to.equal('video 1 server 2');
                expect(videos[1].name).to.equal('video 2 server 2');
            }
            {
                const body = yield commands[0].listVideos({
                    target: 'remote-videos',
                    sort: '-name',
                    start: 0,
                    count: 2
                });
                const videos = body.data;
                expect(videos[0].name).to.equal('video 2 server 2');
                expect(videos[1].name).to.equal('video 1 server 2');
            }
            {
                const body = yield commands[0].listVideos({
                    target: 'remote-videos',
                    sort: '-name',
                    start: 1,
                    count: 1
                });
                expect(body.data[0].name).to.equal('video 1 server 2');
            }
        });
    });
    it('Should manually add a redundancy and list it', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const uuid = (yield servers[1].videos.quickUpload({ name: 'video 3 server 2', privacy: 2 })).uuid;
            yield extra_utils_1.waitJobs(servers);
            const videoId = yield servers[0].videos.getId({ uuid });
            yield commands[0].addVideo({ videoId });
            yield extra_utils_1.waitJobs(servers);
            yield servers[0].servers.waitUntilLog('Duplicated ', 15);
            yield extra_utils_1.waitJobs(servers);
            {
                const body = yield commands[0].listVideos({
                    target: 'remote-videos',
                    sort: '-name',
                    start: 0,
                    count: 5
                });
                const video = body.data[0];
                expect(video.name).to.equal('video 3 server 2');
                expect(video.redundancies.files).to.have.lengthOf(4);
                expect(video.redundancies.streamingPlaylists).to.have.lengthOf(1);
                const redundancies = video.redundancies.files.concat(video.redundancies.streamingPlaylists);
                for (const r of redundancies) {
                    redundanciesToRemove.push(r.id);
                    expect(r.strategy).to.equal('manual');
                    expect(r.fileUrl).to.exist;
                    expect(r.createdAt).to.exist;
                    expect(r.updatedAt).to.exist;
                    expect(r.expiresOn).to.be.null;
                }
            }
            const body = yield commands[1].listVideos({
                target: 'my-videos',
                sort: '-name',
                start: 0,
                count: 5
            });
            const video = body.data[0];
            expect(video.name).to.equal('video 3 server 2');
            expect(video.redundancies.files).to.have.lengthOf(4);
            expect(video.redundancies.streamingPlaylists).to.have.lengthOf(1);
            const redundancies = video.redundancies.files.concat(video.redundancies.streamingPlaylists);
            for (const r of redundancies) {
                expect(r.strategy).to.be.null;
                expect(r.fileUrl).to.exist;
                expect(r.createdAt).to.exist;
                expect(r.updatedAt).to.exist;
                expect(r.expiresOn).to.be.null;
            }
        });
    });
    it('Should manually remove a redundancy and remove it from the list', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            for (const redundancyId of redundanciesToRemove) {
                yield commands[0].removeVideo({ redundancyId });
            }
            {
                const body = yield commands[0].listVideos({
                    target: 'remote-videos',
                    sort: '-name',
                    start: 0,
                    count: 5
                });
                const videos = body.data;
                expect(videos).to.have.lengthOf(2);
                const video = videos[0];
                expect(video.name).to.equal('video 2 server 2');
                expect(video.redundancies.files).to.have.lengthOf(4);
                expect(video.redundancies.streamingPlaylists).to.have.lengthOf(1);
                const redundancies = video.redundancies.files.concat(video.redundancies.streamingPlaylists);
                redundanciesToRemove = redundancies.map(r => r.id);
            }
        });
    });
    it('Should remove another (auto) redundancy', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const redundancyId of redundanciesToRemove) {
                yield commands[0].removeVideo({ redundancyId });
            }
            const body = yield commands[0].listVideos({
                target: 'remote-videos',
                sort: '-name',
                start: 0,
                count: 5
            });
            const videos = body.data;
            expect(videos).to.have.lengthOf(1);
            expect(videos[0].name).to.equal('video 1 server 2');
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
