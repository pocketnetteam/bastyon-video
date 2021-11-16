"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test video blacklist', function () {
    let servers = [];
    let videoId;
    let command;
    function blacklistVideosOnServer(server) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield server.videos.list();
            for (const video of data) {
                yield server.blacklist.add({ videoId: video.id, reason: 'super reason' });
            }
        });
    }
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield servers[1].videos.upload({ attributes: { name: 'My 1st video', description: 'A video on server 2' } });
            yield servers[1].videos.upload({ attributes: { name: 'My 2nd video', description: 'A video on server 2' } });
            yield extra_utils_1.waitJobs(servers);
            command = servers[0].blacklist;
            yield blacklistVideosOnServer(servers[0]);
        });
    });
    describe('When listing/searching videos', function () {
        it('Should not have the video blacklisted in videos list/search on server 1', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { total, data } = yield servers[0].videos.list();
                    expect(total).to.equal(0);
                    expect(data).to.be.an('array');
                    expect(data.length).to.equal(0);
                }
                {
                    const body = yield servers[0].search.searchVideos({ search: 'video' });
                    expect(body.total).to.equal(0);
                    expect(body.data).to.be.an('array');
                    expect(body.data.length).to.equal(0);
                }
            });
        });
        it('Should have the blacklisted video in videos list/search on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { total, data } = yield servers[1].videos.list();
                    expect(total).to.equal(2);
                    expect(data).to.be.an('array');
                    expect(data.length).to.equal(2);
                }
                {
                    const body = yield servers[1].search.searchVideos({ search: 'video' });
                    expect(body.total).to.equal(2);
                    expect(body.data).to.be.an('array');
                    expect(body.data.length).to.equal(2);
                }
            });
        });
    });
    describe('When listing manually blacklisted videos', function () {
        it('Should display all the blacklisted videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list();
                expect(body.total).to.equal(2);
                const blacklistedVideos = body.data;
                expect(blacklistedVideos).to.be.an('array');
                expect(blacklistedVideos.length).to.equal(2);
                for (const blacklistedVideo of blacklistedVideos) {
                    expect(blacklistedVideo.reason).to.equal('super reason');
                    videoId = blacklistedVideo.video.id;
                }
            });
        });
        it('Should display all the blacklisted videos when applying manual type filter', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ type: 1 });
                expect(body.total).to.equal(2);
                const blacklistedVideos = body.data;
                expect(blacklistedVideos).to.be.an('array');
                expect(blacklistedVideos.length).to.equal(2);
            });
        });
        it('Should display nothing when applying automatic type filter', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ type: 2 });
                expect(body.total).to.equal(0);
                const blacklistedVideos = body.data;
                expect(blacklistedVideos).to.be.an('array');
                expect(blacklistedVideos.length).to.equal(0);
            });
        });
        it('Should get the correct sort when sorting by descending id', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ sort: '-id' });
                expect(body.total).to.equal(2);
                const blacklistedVideos = body.data;
                expect(blacklistedVideos).to.be.an('array');
                expect(blacklistedVideos.length).to.equal(2);
                const result = lodash_1.orderBy(body.data, ['id'], ['desc']);
                expect(blacklistedVideos).to.deep.equal(result);
            });
        });
        it('Should get the correct sort when sorting by descending video name', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ sort: '-name' });
                expect(body.total).to.equal(2);
                const blacklistedVideos = body.data;
                expect(blacklistedVideos).to.be.an('array');
                expect(blacklistedVideos.length).to.equal(2);
                const result = lodash_1.orderBy(body.data, ['name'], ['desc']);
                expect(blacklistedVideos).to.deep.equal(result);
            });
        });
        it('Should get the correct sort when sorting by ascending creation date', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ sort: 'createdAt' });
                expect(body.total).to.equal(2);
                const blacklistedVideos = body.data;
                expect(blacklistedVideos).to.be.an('array');
                expect(blacklistedVideos.length).to.equal(2);
                const result = lodash_1.orderBy(body.data, ['createdAt']);
                expect(blacklistedVideos).to.deep.equal(result);
            });
        });
    });
    describe('When updating blacklisted videos', function () {
        it('Should change the reason', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.update({ videoId, reason: 'my super reason updated' });
                const body = yield command.list({ sort: '-name' });
                const video = body.data.find(b => b.video.id === videoId);
                expect(video.reason).to.equal('my super reason updated');
            });
        });
    });
    describe('When listing my videos', function () {
        it('Should display blacklisted videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield blacklistVideosOnServer(servers[1]);
                const { total, data } = yield servers[1].videos.listMyVideos();
                expect(total).to.equal(2);
                expect(data).to.have.lengthOf(2);
                for (const video of data) {
                    expect(video.blacklisted).to.be.true;
                    expect(video.blacklistedReason).to.equal('super reason');
                }
            });
        });
    });
    describe('When removing a blacklisted video', function () {
        let videoToRemove;
        let blacklist = [];
        it('Should not have any video in videos list on server 1', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield servers[0].videos.list();
                expect(total).to.equal(0);
                expect(data).to.be.an('array');
                expect(data.length).to.equal(0);
            });
        });
        it('Should remove a video from the blacklist on server 1', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ sort: '-name' });
                videoToRemove = body.data[0];
                blacklist = body.data.slice(1);
                yield command.remove({ videoId: videoToRemove.video.id });
            });
        });
        it('Should have the ex-blacklisted video in videos list on server 1', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield servers[0].videos.list();
                expect(total).to.equal(1);
                expect(data).to.be.an('array');
                expect(data.length).to.equal(1);
                expect(data[0].name).to.equal(videoToRemove.video.name);
                expect(data[0].id).to.equal(videoToRemove.video.id);
            });
        });
        it('Should not have the ex-blacklisted video in videos blacklist list on server 1', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ sort: '-name' });
                expect(body.total).to.equal(1);
                const videos = body.data;
                expect(videos).to.be.an('array');
                expect(videos.length).to.equal(1);
                expect(videos).to.deep.equal(blacklist);
            });
        });
    });
    describe('When blacklisting local videos', function () {
        let video3UUID;
        let video4UUID;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                {
                    const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'Video 3' } });
                    video3UUID = uuid;
                }
                {
                    const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'Video 4' } });
                    video4UUID = uuid;
                }
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should blacklist video 3 and keep it federated', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield command.add({ videoId: video3UUID, reason: 'super reason', unfederate: false });
                yield extra_utils_1.waitJobs(servers);
                {
                    const { data } = yield servers[0].videos.list();
                    expect(data.find(v => v.uuid === video3UUID)).to.be.undefined;
                }
                {
                    const { data } = yield servers[1].videos.list();
                    expect(data.find(v => v.uuid === video3UUID)).to.not.be.undefined;
                }
            });
        });
        it('Should unfederate the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield command.add({ videoId: video4UUID, reason: 'super reason', unfederate: true });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    expect(data.find(v => v.uuid === video4UUID)).to.be.undefined;
                }
            });
        });
        it('Should have the video unfederated even after an Update AP message', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].videos.update({ id: video4UUID, attributes: { description: 'super description' } });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    expect(data.find(v => v.uuid === video4UUID)).to.be.undefined;
                }
            });
        });
        it('Should have the correct video blacklist unfederate attribute', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.list({ sort: 'createdAt' });
                const blacklistedVideos = body.data;
                const video3Blacklisted = blacklistedVideos.find(b => b.video.uuid === video3UUID);
                const video4Blacklisted = blacklistedVideos.find(b => b.video.uuid === video4UUID);
                expect(video3Blacklisted.unfederated).to.be.false;
                expect(video4Blacklisted.unfederated).to.be.true;
            });
        });
        it('Should remove the video from blacklist and refederate the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield command.remove({ videoId: video4UUID });
                yield extra_utils_1.waitJobs(servers);
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    expect(data.find(v => v.uuid === video4UUID)).to.not.be.undefined;
                }
            });
        });
    });
    describe('When auto blacklist videos', function () {
        let userWithoutFlag;
        let userWithFlag;
        let channelOfUserWithoutFlag;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield extra_utils_1.killallServers([servers[0]]);
                const config = {
                    auto_blacklist: {
                        videos: {
                            of_users: {
                                enabled: true
                            }
                        }
                    }
                };
                yield servers[0].run(config);
                {
                    const user = { username: 'user_without_flag', password: 'password' };
                    yield servers[0].users.create({
                        username: user.username,
                        adminFlags: 0,
                        password: user.password,
                        role: models_1.UserRole.USER
                    });
                    userWithoutFlag = yield servers[0].login.getAccessToken(user);
                    const { videoChannels } = yield servers[0].users.getMyInfo({ token: userWithoutFlag });
                    channelOfUserWithoutFlag = videoChannels[0].id;
                }
                {
                    const user = { username: 'user_with_flag', password: 'password' };
                    yield servers[0].users.create({
                        username: user.username,
                        adminFlags: 1,
                        password: user.password,
                        role: models_1.UserRole.USER
                    });
                    userWithFlag = yield servers[0].login.getAccessToken(user);
                }
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should auto blacklist a video on upload', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield servers[0].videos.upload({ token: userWithoutFlag, attributes: { name: 'blacklisted' } });
                const body = yield command.list({ type: 2 });
                expect(body.total).to.equal(1);
                expect(body.data[0].video.name).to.equal('blacklisted');
            });
        });
        it('Should auto blacklist a video on URL import', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                const attributes = {
                    targetUrl: extra_utils_1.FIXTURE_URLS.goodVideo,
                    name: 'URL import',
                    channelId: channelOfUserWithoutFlag
                };
                yield servers[0].imports.importVideo({ token: userWithoutFlag, attributes });
                const body = yield command.list({ sort: 'createdAt', type: 2 });
                expect(body.total).to.equal(2);
                expect(body.data[1].video.name).to.equal('URL import');
            });
        });
        it('Should auto blacklist a video on torrent import', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attributes = {
                    magnetUri: extra_utils_1.FIXTURE_URLS.magnet,
                    name: 'Torrent import',
                    channelId: channelOfUserWithoutFlag
                };
                yield servers[0].imports.importVideo({ token: userWithoutFlag, attributes });
                const body = yield command.list({ sort: 'createdAt', type: 2 });
                expect(body.total).to.equal(3);
                expect(body.data[2].video.name).to.equal('Torrent import');
            });
        });
        it('Should not auto blacklist a video on upload if the user has the bypass blacklist flag', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield servers[0].videos.upload({ token: userWithFlag, attributes: { name: 'not blacklisted' } });
                const body = yield command.list({ type: 2 });
                expect(body.total).to.equal(3);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
