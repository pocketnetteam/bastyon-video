"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test a single server', function () {
    function runSuite(mode) {
        let server = null;
        let videoId;
        let videoId2;
        let videoUUID = '';
        let videosListBase = null;
        const getCheckAttributes = () => ({
            name: 'my super name',
            category: 2,
            licence: 6,
            language: 'zh',
            nsfw: true,
            description: 'my super description',
            support: 'my super support text',
            account: {
                name: 'root',
                host: 'localhost:' + server.port
            },
            isLocal: true,
            duration: 5,
            tags: ['tag1', 'tag2', 'tag3'],
            privacy: 1,
            commentsEnabled: true,
            downloadEnabled: true,
            channel: {
                displayName: 'Main root channel',
                name: 'root_channel',
                description: '',
                isLocal: true
            },
            fixture: 'video_short.webm',
            files: [
                {
                    resolution: 720,
                    size: 218910
                }
            ]
        });
        const updateCheckAttributes = () => ({
            name: 'my super video updated',
            category: 4,
            licence: 2,
            language: 'ar',
            nsfw: false,
            description: 'my super description updated',
            support: 'my super support text updated',
            account: {
                name: 'root',
                host: 'localhost:' + server.port
            },
            isLocal: true,
            tags: ['tagup1', 'tagup2'],
            privacy: 1,
            duration: 5,
            commentsEnabled: false,
            downloadEnabled: false,
            channel: {
                name: 'root_channel',
                displayName: 'Main root channel',
                description: '',
                isLocal: true
            },
            fixture: 'video_short3.webm',
            files: [
                {
                    resolution: 720,
                    size: 292677
                }
            ]
        });
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                server = yield extra_utils_1.createSingleServer(1);
                yield extra_utils_1.setAccessTokensToServers([server]);
            });
        });
        it('Should list video categories', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const categories = yield server.videos.getCategories();
                expect(Object.keys(categories)).to.have.length.above(10);
                expect(categories[11]).to.equal('News & Politics');
            });
        });
        it('Should list video licences', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const licences = yield server.videos.getLicences();
                expect(Object.keys(licences)).to.have.length.above(5);
                expect(licences[3]).to.equal('Attribution - No Derivatives');
            });
        });
        it('Should list video languages', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const languages = yield server.videos.getLanguages();
                expect(Object.keys(languages)).to.have.length.above(5);
                expect(languages['ru']).to.equal('Russian');
            });
        });
        it('Should list video privacies', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const privacies = yield server.videos.getPrivacies();
                expect(Object.keys(privacies)).to.have.length.at.least(3);
                expect(privacies[3]).to.equal('Private');
            });
        });
        it('Should not have videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data, total } = yield server.videos.list();
                expect(total).to.equal(0);
                expect(data).to.be.an('array');
                expect(data.length).to.equal(0);
            });
        });
        it('Should upload the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const attributes = {
                    name: 'my super name',
                    category: 2,
                    nsfw: true,
                    licence: 6,
                    tags: ['tag1', 'tag2', 'tag3']
                };
                const video = yield server.videos.upload({ attributes, mode });
                expect(video).to.not.be.undefined;
                expect(video.id).to.equal(1);
                expect(video.uuid).to.have.length.above(5);
                videoId = video.id;
                videoUUID = video.uuid;
            });
        });
        it('Should get and seed the uploaded video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const { data, total } = yield server.videos.list();
                expect(total).to.equal(1);
                expect(data).to.be.an('array');
                expect(data.length).to.equal(1);
                const video = data[0];
                yield extra_utils_1.completeVideoCheck(server, video, getCheckAttributes());
            });
        });
        it('Should get the video by UUID', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const video = yield server.videos.get({ id: videoUUID });
                yield extra_utils_1.completeVideoCheck(server, video, getCheckAttributes());
            });
        });
        it('Should have the views updated', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.videos.view({ id: videoId });
                yield server.videos.view({ id: videoId });
                yield server.videos.view({ id: videoId });
                yield extra_utils_1.wait(1500);
                yield server.videos.view({ id: videoId });
                yield server.videos.view({ id: videoId });
                yield extra_utils_1.wait(1500);
                yield server.videos.view({ id: videoId });
                yield server.videos.view({ id: videoId });
                yield extra_utils_1.wait(8000);
                const video = yield server.videos.get({ id: videoId });
                expect(video.views).to.equal(3);
            });
        });
        it('Should remove the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const video = yield server.videos.get({ id: videoId });
                yield server.videos.remove({ id: videoId });
                yield extra_utils_1.checkVideoFilesWereRemoved({ video, server });
            });
        });
        it('Should not have videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(0);
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(0);
            });
        });
        it('Should upload 6 videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(25000);
                const videos = new Set([
                    'video_short.mp4', 'video_short.ogv', 'video_short.webm',
                    'video_short1.webm', 'video_short2.webm', 'video_short3.webm'
                ]);
                for (const video of videos) {
                    const attributes = {
                        name: video + ' name',
                        description: video + ' description',
                        category: 2,
                        licence: 1,
                        language: 'en',
                        nsfw: true,
                        tags: ['tag1', 'tag2', 'tag3'],
                        fixture: video
                    };
                    yield server.videos.upload({ attributes, mode });
                }
            });
        });
        it('Should have the correct durations', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(6);
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(6);
                const videosByName = {};
                data.forEach(v => { videosByName[v.name] = v; });
                expect(videosByName['video_short.mp4 name'].duration).to.equal(5);
                expect(videosByName['video_short.ogv name'].duration).to.equal(5);
                expect(videosByName['video_short.webm name'].duration).to.equal(5);
                expect(videosByName['video_short1.webm name'].duration).to.equal(10);
                expect(videosByName['video_short2.webm name'].duration).to.equal(5);
                expect(videosByName['video_short3.webm name'].duration).to.equal(5);
            });
        });
        it('Should have the correct thumbnails', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data } = yield server.videos.list();
                videosListBase = data;
                for (const video of data) {
                    const videoName = video.name.replace(' name', '');
                    yield extra_utils_1.testImage(server.url, videoName, video.thumbnailPath);
                }
            });
        });
        it('Should list only the two first videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 0, count: 2, sort: 'name' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(2);
                expect(data[0].name).to.equal(videosListBase[0].name);
                expect(data[1].name).to.equal(videosListBase[1].name);
            });
        });
        it('Should list only the next three videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 2, count: 3, sort: 'name' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(3);
                expect(data[0].name).to.equal(videosListBase[2].name);
                expect(data[1].name).to.equal(videosListBase[3].name);
                expect(data[2].name).to.equal(videosListBase[4].name);
            });
        });
        it('Should list the last video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 5, count: 6, sort: 'name' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(1);
                expect(data[0].name).to.equal(videosListBase[5].name);
            });
        });
        it('Should not have the total field', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 5, count: 6, sort: 'name', skipCount: true });
                expect(total).to.not.exist;
                expect(data.length).to.equal(1);
                expect(data[0].name).to.equal(videosListBase[5].name);
            });
        });
        it('Should list and sort by name in descending order', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ sort: '-name' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(6);
                expect(data[0].name).to.equal('video_short.webm name');
                expect(data[1].name).to.equal('video_short.ogv name');
                expect(data[2].name).to.equal('video_short.mp4 name');
                expect(data[3].name).to.equal('video_short3.webm name');
                expect(data[4].name).to.equal('video_short2.webm name');
                expect(data[5].name).to.equal('video_short1.webm name');
                videoId = data[3].uuid;
                videoId2 = data[5].uuid;
            });
        });
        it('Should list and sort by trending in descending order', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 0, count: 2, sort: '-trending' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(2);
            });
        });
        it('Should list and sort by hotness in descending order', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 0, count: 2, sort: '-hot' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(2);
            });
        });
        it('Should list and sort by best in descending order', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list({ start: 0, count: 2, sort: '-best' });
                expect(total).to.equal(6);
                expect(data.length).to.equal(2);
            });
        });
        it('Should update a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attributes = {
                    name: 'my super video updated',
                    category: 4,
                    licence: 2,
                    language: 'ar',
                    nsfw: false,
                    description: 'my super description updated',
                    commentsEnabled: false,
                    downloadEnabled: false,
                    tags: ['tagup1', 'tagup2']
                };
                yield server.videos.update({ id: videoId, attributes });
            });
        });
        it('Should filter by tags and category', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { data, total } = yield server.videos.list({ tagsAllOf: ['tagup1', 'tagup2'], categoryOneOf: [4] });
                    expect(total).to.equal(1);
                    expect(data[0].name).to.equal('my super video updated');
                }
                {
                    const { total } = yield server.videos.list({ tagsAllOf: ['tagup1', 'tagup2'], categoryOneOf: [3] });
                    expect(total).to.equal(0);
                }
            });
        });
        it('Should have the video updated', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const video = yield server.videos.get({ id: videoId });
                yield extra_utils_1.completeVideoCheck(server, video, updateCheckAttributes());
            });
        });
        it('Should update only the tags of a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attributes = {
                    tags: ['supertag', 'tag1', 'tag2']
                };
                yield server.videos.update({ id: videoId, attributes });
                const video = yield server.videos.get({ id: videoId });
                yield extra_utils_1.completeVideoCheck(server, video, Object.assign(updateCheckAttributes(), attributes));
            });
        });
        it('Should update only the description of a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attributes = {
                    description: 'hello everybody'
                };
                yield server.videos.update({ id: videoId, attributes });
                const video = yield server.videos.get({ id: videoId });
                const expectedAttributes = Object.assign(updateCheckAttributes(), { tags: ['supertag', 'tag1', 'tag2'] }, attributes);
                yield extra_utils_1.completeVideoCheck(server, video, expectedAttributes);
            });
        });
        it('Should like a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.rate({ id: videoId, rating: 'like' });
                const video = yield server.videos.get({ id: videoId });
                expect(video.likes).to.equal(1);
                expect(video.dislikes).to.equal(0);
            });
        });
        it('Should dislike the same video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.videos.rate({ id: videoId, rating: 'dislike' });
                const video = yield server.videos.get({ id: videoId });
                expect(video.likes).to.equal(0);
                expect(video.dislikes).to.equal(1);
            });
        });
        it('Should sort by originallyPublishedAt', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const now = new Date();
                    const attributes = { originallyPublishedAt: now.toISOString() };
                    yield server.videos.update({ id: videoId, attributes });
                    const { data } = yield server.videos.list({ sort: '-originallyPublishedAt' });
                    const names = data.map(v => v.name);
                    expect(names[0]).to.equal('my super video updated');
                    expect(names[1]).to.equal('video_short2.webm name');
                    expect(names[2]).to.equal('video_short1.webm name');
                    expect(names[3]).to.equal('video_short.webm name');
                    expect(names[4]).to.equal('video_short.ogv name');
                    expect(names[5]).to.equal('video_short.mp4 name');
                }
                {
                    const now = new Date();
                    const attributes = { originallyPublishedAt: now.toISOString() };
                    yield server.videos.update({ id: videoId2, attributes });
                    const { data } = yield server.videos.list({ sort: '-originallyPublishedAt' });
                    const names = data.map(v => v.name);
                    expect(names[0]).to.equal('video_short1.webm name');
                    expect(names[1]).to.equal('my super video updated');
                    expect(names[2]).to.equal('video_short2.webm name');
                    expect(names[3]).to.equal('video_short.webm name');
                    expect(names[4]).to.equal('video_short.ogv name');
                    expect(names[5]).to.equal('video_short.mp4 name');
                }
            });
        });
        after(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.cleanupTests([server]);
            });
        });
    }
    describe('Legacy upload', function () {
        runSuite('legacy');
    });
    describe('Resumable upload', function () {
        runSuite('resumable');
    });
});
