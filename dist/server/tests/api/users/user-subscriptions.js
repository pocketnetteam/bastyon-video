"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test users subscriptions', function () {
    let servers = [];
    const users = [];
    let video3UUID;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(3);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            {
                for (const server of servers) {
                    const user = { username: 'user' + server.serverNumber, password: 'password' };
                    yield server.users.create({ username: user.username, password: user.password });
                    const accessToken = yield server.login.getAccessToken(user);
                    users.push({ accessToken });
                    const videoName1 = 'video 1-' + server.serverNumber;
                    yield server.videos.upload({ token: accessToken, attributes: { name: videoName1 } });
                    const videoName2 = 'video 2-' + server.serverNumber;
                    yield server.videos.upload({ token: accessToken, attributes: { name: videoName2 } });
                }
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            command = servers[0].subscriptions;
        });
    });
    it('Should display videos of server 2 on server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total } = yield servers[0].videos.list();
            expect(total).to.equal(4);
        });
    });
    it('User of server 1 should follow user of server 3 and root of server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield command.add({ token: users[0].accessToken, targetUri: 'user3_channel@localhost:' + servers[2].port });
            yield command.add({ token: users[0].accessToken, targetUri: 'root_channel@localhost:' + servers[0].port });
            yield (0, extra_utils_1.waitJobs)(servers);
            const attributes = { name: 'video server 3 added after follow' };
            const { uuid } = yield servers[2].videos.upload({ token: users[2].accessToken, attributes });
            video3UUID = uuid;
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should not display videos of server 3 on server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.list();
            expect(total).to.equal(4);
            for (const video of data) {
                expect(video.name).to.not.contain('1-3');
                expect(video.name).to.not.contain('2-3');
                expect(video.name).to.not.contain('video server 3 added after follow');
            }
        });
    });
    it('Should list subscriptions', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield command.list();
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const body = yield command.list({ token: users[0].accessToken, sort: 'createdAt' });
                expect(body.total).to.equal(2);
                const subscriptions = body.data;
                expect(subscriptions).to.be.an('array');
                expect(subscriptions).to.have.lengthOf(2);
                expect(subscriptions[0].name).to.equal('user3_channel');
                expect(subscriptions[1].name).to.equal('root_channel');
            }
        });
    });
    it('Should get subscription', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const videoChannel = yield command.get({ token: users[0].accessToken, uri: 'user3_channel@localhost:' + servers[2].port });
                expect(videoChannel.name).to.equal('user3_channel');
                expect(videoChannel.host).to.equal('localhost:' + servers[2].port);
                expect(videoChannel.displayName).to.equal('Main user3 channel');
                expect(videoChannel.followingCount).to.equal(0);
                expect(videoChannel.followersCount).to.equal(1);
            }
            {
                const videoChannel = yield command.get({ token: users[0].accessToken, uri: 'root_channel@localhost:' + servers[0].port });
                expect(videoChannel.name).to.equal('root_channel');
                expect(videoChannel.host).to.equal('localhost:' + servers[0].port);
                expect(videoChannel.displayName).to.equal('Main root channel');
                expect(videoChannel.followingCount).to.equal(0);
                expect(videoChannel.followersCount).to.equal(1);
            }
        });
    });
    it('Should return the existing subscriptions', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const uris = [
                'user3_channel@localhost:' + servers[2].port,
                'root2_channel@localhost:' + servers[0].port,
                'root_channel@localhost:' + servers[0].port,
                'user3_channel@localhost:' + servers[0].port
            ];
            const body = yield command.exist({ token: users[0].accessToken, uris });
            expect(body['user3_channel@localhost:' + servers[2].port]).to.be.true;
            expect(body['root2_channel@localhost:' + servers[0].port]).to.be.false;
            expect(body['root_channel@localhost:' + servers[0].port]).to.be.true;
            expect(body['user3_channel@localhost:' + servers[0].port]).to.be.false;
        });
    });
    it('Should search among subscriptions', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield command.list({ token: users[0].accessToken, sort: '-createdAt', search: 'user3_channel' });
                expect(body.total).to.equal(1);
                expect(body.data).to.have.lengthOf(1);
            }
            {
                const body = yield command.list({ token: users[0].accessToken, sort: '-createdAt', search: 'toto' });
                expect(body.total).to.equal(0);
                expect(body.data).to.have.lengthOf(0);
            }
        });
    });
    it('Should list subscription videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield command.listVideos();
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const body = yield command.listVideos({ token: users[0].accessToken, sort: 'createdAt' });
                expect(body.total).to.equal(3);
                const videos = body.data;
                expect(videos).to.be.an('array');
                expect(videos).to.have.lengthOf(3);
                expect(videos[0].name).to.equal('video 1-3');
                expect(videos[1].name).to.equal('video 2-3');
                expect(videos[2].name).to.equal('video server 3 added after follow');
            }
        });
    });
    it('Should upload a video by root on server 1 and see it in the subscription videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            const videoName = 'video server 1 added after follow';
            yield servers[0].videos.upload({ attributes: { name: videoName } });
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const body = yield command.listVideos();
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const body = yield command.listVideos({ token: users[0].accessToken, sort: 'createdAt' });
                expect(body.total).to.equal(4);
                const videos = body.data;
                expect(videos).to.be.an('array');
                expect(videos).to.have.lengthOf(4);
                expect(videos[0].name).to.equal('video 1-3');
                expect(videos[1].name).to.equal('video 2-3');
                expect(videos[2].name).to.equal('video server 3 added after follow');
                expect(videos[3].name).to.equal('video server 1 added after follow');
            }
            {
                const { data, total } = yield servers[0].videos.list();
                expect(total).to.equal(5);
                for (const video of data) {
                    expect(video.name).to.not.contain('1-3');
                    expect(video.name).to.not.contain('2-3');
                    expect(video.name).to.not.contain('video server 3 added after follow');
                }
            }
        });
    });
    it('Should have server 1 follow server 3 and display server 3 videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].follows.follow({ hosts: [servers[2].url] });
            yield (0, extra_utils_1.waitJobs)(servers);
            const { data, total } = yield servers[0].videos.list();
            expect(total).to.equal(8);
            const names = ['1-3', '2-3', 'video server 3 added after follow'];
            for (const name of names) {
                const video = data.find(v => v.name.includes(name));
                expect(video).to.not.be.undefined;
            }
        });
    });
    it('Should remove follow server 1 -> server 3 and hide server 3 videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].follows.unfollow({ target: servers[2] });
            yield (0, extra_utils_1.waitJobs)(servers);
            const { total, data } = yield servers[0].videos.list();
            expect(total).to.equal(5);
            for (const video of data) {
                expect(video.name).to.not.contain('1-3');
                expect(video.name).to.not.contain('2-3');
                expect(video.name).to.not.contain('video server 3 added after follow');
            }
        });
    });
    it('Should still list subscription videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield command.listVideos();
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            }
            {
                const body = yield command.listVideos({ token: users[0].accessToken, sort: 'createdAt' });
                expect(body.total).to.equal(4);
                const videos = body.data;
                expect(videos).to.be.an('array');
                expect(videos).to.have.lengthOf(4);
                expect(videos[0].name).to.equal('video 1-3');
                expect(videos[1].name).to.equal('video 2-3');
                expect(videos[2].name).to.equal('video server 3 added after follow');
                expect(videos[3].name).to.equal('video server 1 added after follow');
            }
        });
    });
    it('Should update a video of server 3 and see the updated video on server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[2].videos.update({ id: video3UUID, attributes: { name: 'video server 3 added after follow updated' } });
            yield (0, extra_utils_1.waitJobs)(servers);
            const body = yield command.listVideos({ token: users[0].accessToken, sort: 'createdAt' });
            expect(body.data[2].name).to.equal('video server 3 added after follow updated');
        });
    });
    it('Should remove user of server 3 subscription', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield command.remove({ token: users[0].accessToken, uri: 'user3_channel@localhost:' + servers[2].port });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should not display its videos anymore', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield command.listVideos({ token: users[0].accessToken, sort: 'createdAt' });
            expect(body.total).to.equal(1);
            const videos = body.data;
            expect(videos).to.be.an('array');
            expect(videos).to.have.lengthOf(1);
            expect(videos[0].name).to.equal('video server 1 added after follow');
        });
    });
    it('Should remove the root subscription and not display the videos anymore', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield command.remove({ token: users[0].accessToken, uri: 'root_channel@localhost:' + servers[0].port });
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const body = yield command.list({ token: users[0].accessToken, sort: 'createdAt' });
                expect(body.total).to.equal(0);
                const videos = body.data;
                expect(videos).to.be.an('array');
                expect(videos).to.have.lengthOf(0);
            }
        });
    });
    it('Should correctly display public videos on server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { total, data } = yield servers[0].videos.list();
            expect(total).to.equal(5);
            for (const video of data) {
                expect(video.name).to.not.contain('1-3');
                expect(video.name).to.not.contain('2-3');
                expect(video.name).to.not.contain('video server 3 added after follow updated');
            }
        });
    });
    it('Should follow user of server 3 again', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield command.add({ token: users[0].accessToken, targetUri: 'user3_channel@localhost:' + servers[2].port });
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const body = yield command.listVideos({ token: users[0].accessToken, sort: 'createdAt' });
                expect(body.total).to.equal(3);
                const videos = body.data;
                expect(videos).to.be.an('array');
                expect(videos).to.have.lengthOf(3);
                expect(videos[0].name).to.equal('video 1-3');
                expect(videos[1].name).to.equal('video 2-3');
                expect(videos[2].name).to.equal('video server 3 added after follow updated');
            }
            {
                const { total, data } = yield servers[0].videos.list();
                expect(total).to.equal(5);
                for (const video of data) {
                    expect(video.name).to.not.contain('1-3');
                    expect(video.name).to.not.contain('2-3');
                    expect(video.name).to.not.contain('video server 3 added after follow updated');
                }
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
