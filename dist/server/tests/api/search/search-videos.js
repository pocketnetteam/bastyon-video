"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test videos search', function () {
    let server;
    let remoteServer;
    let startDate;
    let videoUUID;
    let videoShortUUID;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const servers = yield Promise.all([
                extra_utils_1.createSingleServer(1),
                extra_utils_1.createSingleServer(2)
            ]);
            server = servers[0];
            remoteServer = servers[1];
            yield extra_utils_1.setAccessTokensToServers([server, remoteServer]);
            yield extra_utils_1.setDefaultVideoChannel([server, remoteServer]);
            {
                const attributes1 = {
                    name: '1111 2222 3333',
                    fixture: '60fps_720p_small.mp4',
                    category: 1,
                    licence: 1,
                    nsfw: false,
                    language: 'fr'
                };
                yield server.videos.upload({ attributes: attributes1 });
                const attributes2 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 2', fixture: 'video_short.mp4' });
                yield server.videos.upload({ attributes: attributes2 });
                {
                    const attributes3 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 3', language: undefined });
                    const { id, uuid, shortUUID } = yield server.videos.upload({ attributes: attributes3 });
                    videoUUID = uuid;
                    videoShortUUID = shortUUID;
                    yield server.captions.add({
                        language: 'en',
                        videoId: id,
                        fixture: 'subtitle-good2.vtt',
                        mimeType: 'application/octet-stream'
                    });
                    yield server.captions.add({
                        language: 'aa',
                        videoId: id,
                        fixture: 'subtitle-good2.vtt',
                        mimeType: 'application/octet-stream'
                    });
                }
                const attributes4 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 4', language: 'pl', nsfw: true });
                yield server.videos.upload({ attributes: attributes4 });
                yield extra_utils_1.wait(1000);
                startDate = new Date().toISOString();
                const attributes5 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 5', licence: 2, language: undefined });
                yield server.videos.upload({ attributes: attributes5 });
                const attributes6 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 6', tags: ['t1', 't2'] });
                yield server.videos.upload({ attributes: attributes6 });
                const attributes7 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 7', originallyPublishedAt: '2019-02-12T09:58:08.286Z' });
                yield server.videos.upload({ attributes: attributes7 });
                const attributes8 = Object.assign(Object.assign({}, attributes1), { name: attributes1.name + ' - 8', licence: 4 });
                yield server.videos.upload({ attributes: attributes8 });
            }
            {
                const attributes = {
                    name: '3333 4444 5555',
                    fixture: 'video_short.mp4',
                    category: 2,
                    licence: 2,
                    language: 'en'
                };
                yield server.videos.upload({ attributes: attributes });
                yield server.videos.upload({ attributes: Object.assign(Object.assign({}, attributes), { name: attributes.name + ' duplicate' }) });
            }
            {
                const attributes = {
                    name: '6666 7777 8888',
                    fixture: 'video_short.mp4',
                    category: 3,
                    licence: 3,
                    language: 'pl'
                };
                yield server.videos.upload({ attributes: attributes });
            }
            {
                const attributes1 = {
                    name: '9999',
                    tags: ['aaaa', 'bbbb', 'cccc'],
                    category: 1
                };
                yield server.videos.upload({ attributes: attributes1 });
                yield server.videos.upload({ attributes: Object.assign(Object.assign({}, attributes1), { category: 2 }) });
                yield server.videos.upload({ attributes: Object.assign(Object.assign({}, attributes1), { tags: ['cccc', 'dddd'] }) });
                yield server.videos.upload({ attributes: Object.assign(Object.assign({}, attributes1), { tags: ['eeee', 'ffff'] }) });
            }
            {
                const attributes1 = {
                    name: 'aaaa 2',
                    category: 1
                };
                yield server.videos.upload({ attributes: attributes1 });
                yield server.videos.upload({ attributes: Object.assign(Object.assign({}, attributes1), { category: 2 }) });
            }
            {
                yield remoteServer.videos.upload({ attributes: { name: 'remote video 1' } });
                yield remoteServer.videos.upload({ attributes: { name: 'remote video 2' } });
            }
            yield extra_utils_1.doubleFollow(server, remoteServer);
            command = server.search;
        });
    });
    it('Should make a simple search and not have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.searchVideos({ search: 'abc' });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should make a simple search and have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = yield command.searchVideos({ search: '4444 5555 duplicate' });
            expect(body.total).to.equal(2);
            const videos = body.data;
            expect(videos).to.have.lengthOf(2);
            expect(videos[0].name).to.equal('3333 4444 5555 duplicate');
            expect(videos[1].name).to.equal('3333 4444 5555');
        });
    });
    it('Should make a search on tags too, and have results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = {
                search: 'aaaa',
                categoryOneOf: [1]
            };
            const body = yield command.advancedVideoSearch({ search });
            expect(body.total).to.equal(2);
            const videos = body.data;
            expect(videos).to.have.lengthOf(2);
            expect(videos[0].name).to.equal('aaaa 2');
            expect(videos[1].name).to.equal('9999');
        });
    });
    it('Should filter on tags without a search', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = {
                tagsAllOf: ['bbbb']
            };
            const body = yield command.advancedVideoSearch({ search });
            expect(body.total).to.equal(2);
            const videos = body.data;
            expect(videos).to.have.lengthOf(2);
            expect(videos[0].name).to.equal('9999');
            expect(videos[1].name).to.equal('9999');
        });
    });
    it('Should filter on category without a search', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = {
                categoryOneOf: [3]
            };
            const body = yield command.advancedVideoSearch({ search: search });
            expect(body.total).to.equal(1);
            const videos = body.data;
            expect(videos).to.have.lengthOf(1);
            expect(videos[0].name).to.equal('6666 7777 8888');
        });
    });
    it('Should search by tags (one of)', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '9999',
                categoryOneOf: [1],
                tagsOneOf: ['aAaa', 'ffff']
            };
            {
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(2);
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { tagsOneOf: ['blabla'] }) });
                expect(body.total).to.equal(0);
            }
        });
    });
    it('Should search by tags (all of)', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '9999',
                categoryOneOf: [1],
                tagsAllOf: ['CCcc']
            };
            {
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(2);
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { tagsAllOf: ['blAbla'] }) });
                expect(body.total).to.equal(0);
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { tagsAllOf: ['bbbb', 'CCCC'] }) });
                expect(body.total).to.equal(1);
            }
        });
    });
    it('Should search by category', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '6666',
                categoryOneOf: [3]
            };
            {
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('6666 7777 8888');
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { categoryOneOf: [2] }) });
                expect(body.total).to.equal(0);
            }
        });
    });
    it('Should search by licence', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '4444 5555',
                licenceOneOf: [2]
            };
            {
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(2);
                expect(body.data[0].name).to.equal('3333 4444 5555');
                expect(body.data[1].name).to.equal('3333 4444 5555 duplicate');
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { licenceOneOf: [3] }) });
                expect(body.total).to.equal(0);
            }
        });
    });
    it('Should search by languages', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '1111 2222 3333',
                languageOneOf: ['pl', 'en']
            };
            {
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(2);
                expect(body.data[0].name).to.equal('1111 2222 3333 - 3');
                expect(body.data[1].name).to.equal('1111 2222 3333 - 4');
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { languageOneOf: ['pl', 'en', '_unknown'] }) });
                expect(body.total).to.equal(3);
                expect(body.data[0].name).to.equal('1111 2222 3333 - 3');
                expect(body.data[1].name).to.equal('1111 2222 3333 - 4');
                expect(body.data[2].name).to.equal('1111 2222 3333 - 5');
            }
            {
                const body = yield command.advancedVideoSearch({ search: Object.assign(Object.assign({}, query), { languageOneOf: ['eo'] }) });
                expect(body.total).to.equal(0);
            }
        });
    });
    it('Should search by start date', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '1111 2222 3333',
                startDate
            };
            const body = yield command.advancedVideoSearch({ search: query });
            expect(body.total).to.equal(4);
            const videos = body.data;
            expect(videos[0].name).to.equal('1111 2222 3333 - 5');
            expect(videos[1].name).to.equal('1111 2222 3333 - 6');
            expect(videos[2].name).to.equal('1111 2222 3333 - 7');
            expect(videos[3].name).to.equal('1111 2222 3333 - 8');
        });
    });
    it('Should make an advanced search', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '1111 2222 3333',
                languageOneOf: ['pl', 'fr'],
                durationMax: 4,
                nsfw: 'false',
                licenceOneOf: [1, 4]
            };
            const body = yield command.advancedVideoSearch({ search: query });
            expect(body.total).to.equal(4);
            const videos = body.data;
            expect(videos[0].name).to.equal('1111 2222 3333');
            expect(videos[1].name).to.equal('1111 2222 3333 - 6');
            expect(videos[2].name).to.equal('1111 2222 3333 - 7');
            expect(videos[3].name).to.equal('1111 2222 3333 - 8');
        });
    });
    it('Should make an advanced search and sort results', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '1111 2222 3333',
                languageOneOf: ['pl', 'fr'],
                durationMax: 4,
                nsfw: 'false',
                licenceOneOf: [1, 4],
                sort: '-name'
            };
            const body = yield command.advancedVideoSearch({ search: query });
            expect(body.total).to.equal(4);
            const videos = body.data;
            expect(videos[0].name).to.equal('1111 2222 3333 - 8');
            expect(videos[1].name).to.equal('1111 2222 3333 - 7');
            expect(videos[2].name).to.equal('1111 2222 3333 - 6');
            expect(videos[3].name).to.equal('1111 2222 3333');
        });
    });
    it('Should make an advanced search and only show the first result', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '1111 2222 3333',
                languageOneOf: ['pl', 'fr'],
                durationMax: 4,
                nsfw: 'false',
                licenceOneOf: [1, 4],
                sort: '-name',
                start: 0,
                count: 1
            };
            const body = yield command.advancedVideoSearch({ search: query });
            expect(body.total).to.equal(4);
            const videos = body.data;
            expect(videos[0].name).to.equal('1111 2222 3333 - 8');
        });
    });
    it('Should make an advanced search and only show the last result', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const query = {
                search: '1111 2222 3333',
                languageOneOf: ['pl', 'fr'],
                durationMax: 4,
                nsfw: 'false',
                licenceOneOf: [1, 4],
                sort: '-name',
                start: 3,
                count: 1
            };
            const body = yield command.advancedVideoSearch({ search: query });
            expect(body.total).to.equal(4);
            const videos = body.data;
            expect(videos[0].name).to.equal('1111 2222 3333');
        });
    });
    it('Should search on originally published date', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const baseQuery = {
                search: '1111 2222 3333',
                languageOneOf: ['pl', 'fr'],
                durationMax: 4,
                nsfw: 'false',
                licenceOneOf: [1, 4]
            };
            {
                const query = Object.assign(Object.assign({}, baseQuery), { originallyPublishedStartDate: '2019-02-11T09:58:08.286Z' });
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('1111 2222 3333 - 7');
            }
            {
                const query = Object.assign(Object.assign({}, baseQuery), { originallyPublishedEndDate: '2019-03-11T09:58:08.286Z' });
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('1111 2222 3333 - 7');
            }
            {
                const query = Object.assign(Object.assign({}, baseQuery), { originallyPublishedEndDate: '2019-01-11T09:58:08.286Z' });
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(0);
            }
            {
                const query = Object.assign(Object.assign({}, baseQuery), { originallyPublishedStartDate: '2019-03-11T09:58:08.286Z' });
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(0);
            }
            {
                const query = Object.assign(Object.assign({}, baseQuery), { originallyPublishedStartDate: '2019-01-11T09:58:08.286Z', originallyPublishedEndDate: '2019-01-10T09:58:08.286Z' });
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(0);
            }
            {
                const query = Object.assign(Object.assign({}, baseQuery), { originallyPublishedStartDate: '2019-01-11T09:58:08.286Z', originallyPublishedEndDate: '2019-04-11T09:58:08.286Z' });
                const body = yield command.advancedVideoSearch({ search: query });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('1111 2222 3333 - 7');
            }
        });
    });
    it('Should search by UUID', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const search = videoUUID;
            const body = yield command.advancedVideoSearch({ search: { search } });
            expect(body.total).to.equal(1);
            expect(body.data[0].name).to.equal('1111 2222 3333 - 3');
        });
    });
    it('Should filter by UUIDs', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const uuid of [videoUUID, videoShortUUID]) {
                const body = yield command.advancedVideoSearch({ search: { uuids: [uuid] } });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('1111 2222 3333 - 3');
            }
            {
                const body = yield command.advancedVideoSearch({ search: { uuids: ['dfd70b83-639f-4980-94af-304a56ab4b35'] } });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should search by host', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            {
                const body = yield command.advancedVideoSearch({ search: { search: '6666 7777 8888', host: server.host } });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('6666 7777 8888');
            }
            {
                const body = yield command.advancedVideoSearch({ search: { search: '1111', host: 'example.com' } });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const body = yield command.advancedVideoSearch({ search: { search: 'remote', host: remoteServer.host } });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                expect(body.data[0].name).to.equal('remote video 1');
                expect(body.data[1].name).to.equal('remote video 2');
            }
        });
    });
    it('Should search by live', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            {
                const newConfig = {
                    search: {
                        searchIndex: { enabled: false }
                    },
                    live: { enabled: true }
                };
                yield server.config.updateCustomSubConfig({ newConfig });
            }
            {
                const body = yield command.advancedVideoSearch({ search: { isLive: true } });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const liveCommand = server.live;
                const liveAttributes = { name: 'live', privacy: 1, channelId: server.store.channel.id };
                const live = yield liveCommand.create({ fields: liveAttributes });
                const ffmpegCommand = yield liveCommand.sendRTMPStreamInVideo({ videoId: live.id });
                yield liveCommand.waitUntilPublished({ videoId: live.id });
                const body = yield command.advancedVideoSearch({ search: { isLive: true } });
                expect(body.total).to.equal(1);
                expect(body.data[0].name).to.equal('live');
                yield extra_utils_1.stopFfmpeg(ffmpegCommand);
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
