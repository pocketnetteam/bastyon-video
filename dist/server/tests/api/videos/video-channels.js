"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const path_1 = require("path");
const constants_1 = require("@server/initializers/constants");
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function findChannel(server, channelId) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = yield server.channels.list({ sort: '-name' });
        return body.data.find(c => c.id === channelId);
    });
}
describe('Test video channels', function () {
    let servers;
    let userInfo;
    let secondVideoChannelId;
    let totoChannel;
    let videoUUID;
    let accountName;
    const avatarPaths = {};
    const bannerPaths = {};
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should have one video channel (created with root)', () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = yield servers[0].channels.list({ start: 0, count: 2 });
        expect(body.total).to.equal(1);
        expect(body.data).to.be.an('array');
        expect(body.data).to.have.lengthOf(1);
    }));
    it('Should create another video channel', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            {
                const videoChannel = {
                    name: 'second_video_channel',
                    displayName: 'second video channel',
                    description: 'super video channel description',
                    support: 'super video channel support text'
                };
                const created = yield servers[0].channels.create({ attributes: videoChannel });
                secondVideoChannelId = created.id;
            }
            {
                const attributes = { name: 'my video name', channelId: secondVideoChannelId, support: 'video support field' };
                const { uuid } = yield servers[0].videos.upload({ attributes });
                videoUUID = uuid;
            }
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should have two video channels when getting my information', () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        userInfo = yield servers[0].users.getMyInfo();
        expect(userInfo.videoChannels).to.be.an('array');
        expect(userInfo.videoChannels).to.have.lengthOf(2);
        const videoChannels = userInfo.videoChannels;
        expect(videoChannels[0].name).to.equal('root_channel');
        expect(videoChannels[0].displayName).to.equal('Main root channel');
        expect(videoChannels[1].name).to.equal('second_video_channel');
        expect(videoChannels[1].displayName).to.equal('second video channel');
        expect(videoChannels[1].description).to.equal('super video channel description');
        expect(videoChannels[1].support).to.equal('super video channel support text');
        accountName = userInfo.account.name + '@' + userInfo.account.host;
    }));
    it('Should have two video channels when getting account channels on server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield servers[0].channels.listByAccount({ accountName });
            expect(body.total).to.equal(2);
            const videoChannels = body.data;
            expect(videoChannels).to.be.an('array');
            expect(videoChannels).to.have.lengthOf(2);
            expect(videoChannels[0].name).to.equal('root_channel');
            expect(videoChannels[0].displayName).to.equal('Main root channel');
            expect(videoChannels[1].name).to.equal('second_video_channel');
            expect(videoChannels[1].displayName).to.equal('second video channel');
            expect(videoChannels[1].description).to.equal('super video channel description');
            expect(videoChannels[1].support).to.equal('super video channel support text');
        });
    });
    it('Should paginate and sort account channels', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield servers[0].channels.listByAccount({
                    accountName,
                    start: 0,
                    count: 1,
                    sort: 'createdAt'
                });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(1);
                const videoChannel = body.data[0];
                expect(videoChannel.name).to.equal('root_channel');
            }
            {
                const body = yield servers[0].channels.listByAccount({
                    accountName,
                    start: 0,
                    count: 1,
                    sort: '-createdAt'
                });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('second_video_channel');
            }
            {
                const body = yield servers[0].channels.listByAccount({
                    accountName,
                    start: 1,
                    count: 1,
                    sort: '-createdAt'
                });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('root_channel');
            }
        });
    });
    it('Should have one video channel when getting account channels on server 2', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield servers[1].channels.listByAccount({ accountName });
            expect(body.total).to.equal(1);
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(1);
            const videoChannel = body.data[0];
            expect(videoChannel.name).to.equal('second_video_channel');
            expect(videoChannel.displayName).to.equal('second video channel');
            expect(videoChannel.description).to.equal('super video channel description');
            expect(videoChannel.support).to.equal('super video channel support text');
        });
    });
    it('Should list video channels', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield servers[0].channels.list({ start: 1, count: 1, sort: '-name' });
            expect(body.total).to.equal(2);
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(1);
            expect(body.data[0].name).to.equal('root_channel');
            expect(body.data[0].displayName).to.equal('Main root channel');
        });
    });
    it('Should update video channel', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            const videoChannelAttributes = {
                displayName: 'video channel updated',
                description: 'video channel description updated',
                support: 'support updated'
            };
            yield servers[0].channels.update({ channelName: 'second_video_channel', attributes: videoChannelAttributes });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should have video channel updated', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const body = yield server.channels.list({ start: 0, count: 1, sort: '-name' });
                expect(body.total).to.equal(2);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                expect(body.data[0].name).to.equal('second_video_channel');
                expect(body.data[0].displayName).to.equal('video channel updated');
                expect(body.data[0].description).to.equal('video channel description updated');
                expect(body.data[0].support).to.equal('support updated');
            }
        });
    });
    it('Should not have updated the video support field', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                expect(video.support).to.equal('video support field');
            }
        });
    });
    it('Should update the channel support field and update videos too', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(35000);
            const videoChannelAttributes = {
                support: 'video channel support text updated',
                bulkVideosSupportUpdate: true
            };
            yield servers[0].channels.update({ channelName: 'second_video_channel', attributes: videoChannelAttributes });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const video = yield server.videos.get({ id: videoUUID });
                expect(video.support).to.equal(videoChannelAttributes.support);
            }
        });
    });
    it('Should update video channel avatar', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            const fixture = 'avatar.png';
            yield servers[0].channels.updateImage({
                channelName: 'second_video_channel',
                fixture,
                type: 'avatar'
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const videoChannel = yield findChannel(server, secondVideoChannelId);
                avatarPaths[server.port] = videoChannel.avatar.path;
                yield (0, extra_utils_1.testImage)(server.url, 'avatar-resized', avatarPaths[server.port], '.png');
                yield (0, extra_utils_1.testFileExistsOrNot)(server, 'avatars', (0, path_1.basename)(avatarPaths[server.port]), true);
                const row = yield server.sql.getActorImage((0, path_1.basename)(avatarPaths[server.port]));
                expect(row.height).to.equal(constants_1.ACTOR_IMAGES_SIZE.AVATARS.height);
                expect(row.width).to.equal(constants_1.ACTOR_IMAGES_SIZE.AVATARS.width);
            }
        });
    });
    it('Should update video channel banner', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            const fixture = 'banner.jpg';
            yield servers[0].channels.updateImage({
                channelName: 'second_video_channel',
                fixture,
                type: 'banner'
            });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const videoChannel = yield server.channels.get({ channelName: 'second_video_channel@' + servers[0].host });
                bannerPaths[server.port] = videoChannel.banner.path;
                yield (0, extra_utils_1.testImage)(server.url, 'banner-resized', bannerPaths[server.port]);
                yield (0, extra_utils_1.testFileExistsOrNot)(server, 'avatars', (0, path_1.basename)(bannerPaths[server.port]), true);
                const row = yield server.sql.getActorImage((0, path_1.basename)(bannerPaths[server.port]));
                expect(row.height).to.equal(constants_1.ACTOR_IMAGES_SIZE.BANNERS.height);
                expect(row.width).to.equal(constants_1.ACTOR_IMAGES_SIZE.BANNERS.width);
            }
        });
    });
    it('Should delete the video channel avatar', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield servers[0].channels.deleteImage({ channelName: 'second_video_channel', type: 'avatar' });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const videoChannel = yield findChannel(server, secondVideoChannelId);
                yield (0, extra_utils_1.testFileExistsOrNot)(server, 'avatars', (0, path_1.basename)(avatarPaths[server.port]), false);
                expect(videoChannel.avatar).to.be.null;
            }
        });
    });
    it('Should delete the video channel banner', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield servers[0].channels.deleteImage({ channelName: 'second_video_channel', type: 'banner' });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const videoChannel = yield findChannel(server, secondVideoChannelId);
                yield (0, extra_utils_1.testFileExistsOrNot)(server, 'avatars', (0, path_1.basename)(bannerPaths[server.port]), false);
                expect(videoChannel.banner).to.be.null;
            }
        });
    });
    it('Should list the second video channel videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            for (const server of servers) {
                const channelURI = 'second_video_channel@localhost:' + servers[0].port;
                const { total, data } = yield server.videos.listByChannel({ handle: channelURI });
                expect(total).to.equal(1);
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(1);
                expect(data[0].name).to.equal('my video name');
            }
        });
    });
    it('Should change the video channel of a video', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield servers[0].videos.update({ id: videoUUID, attributes: { channelId: servers[0].store.channel.id } });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should list the first video channel videos', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            for (const server of servers) {
                {
                    const secondChannelURI = 'second_video_channel@localhost:' + servers[0].port;
                    const { total } = yield server.videos.listByChannel({ handle: secondChannelURI });
                    expect(total).to.equal(0);
                }
                {
                    const channelURI = 'root_channel@localhost:' + servers[0].port;
                    const { total, data } = yield server.videos.listByChannel({ handle: channelURI });
                    expect(total).to.equal(1);
                    expect(data).to.be.an('array');
                    expect(data).to.have.lengthOf(1);
                    expect(data[0].name).to.equal('my video name');
                }
            }
        });
    });
    it('Should delete video channel', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].channels.delete({ channelName: 'second_video_channel' });
        });
    });
    it('Should have video channel deleted', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield servers[0].channels.list({ start: 0, count: 10 });
            expect(body.total).to.equal(1);
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(1);
            expect(body.data[0].displayName).to.equal('Main root channel');
        });
    });
    it('Should create the main channel with an uuid if there is a conflict', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const videoChannel = { name: 'toto_channel', displayName: 'My toto channel' };
                const created = yield servers[0].channels.create({ attributes: videoChannel });
                totoChannel = created.id;
            }
            {
                yield servers[0].users.create({ username: 'toto', password: 'password' });
                const accessToken = yield servers[0].login.getAccessToken({ username: 'toto', password: 'password' });
                const { videoChannels } = yield servers[0].users.getMyInfo({ token: accessToken });
                const videoChannel = videoChannels[0];
                expect(videoChannel.name).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
            }
        });
    });
    it('Should report correct channel views per days', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            {
                const { data } = yield servers[0].channels.listByAccount({ accountName, withStats: true });
                for (const channel of data) {
                    expect(channel).to.haveOwnProperty('viewsPerDay');
                    expect(channel.viewsPerDay).to.have.length(30 + 1);
                    for (const v of channel.viewsPerDay) {
                        expect(v.date).to.be.an('string');
                        expect(v.views).to.equal(0);
                    }
                }
            }
            {
                yield servers[0].videos.view({ id: videoUUID, xForwardedFor: '0.0.0.1,127.0.0.1' });
                yield servers[0].videos.view({ id: videoUUID, xForwardedFor: '0.0.0.2,127.0.0.1' });
                yield (0, extra_utils_1.wait)(8000);
                const { data } = yield servers[0].channels.listByAccount({ accountName, withStats: true });
                const channelWithView = data.find(channel => channel.id === servers[0].store.channel.id);
                expect(channelWithView.viewsPerDay.slice(-1)[0].views).to.equal(2);
            }
        });
    });
    it('Should report correct videos count', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { data } = yield servers[0].channels.listByAccount({ accountName, withStats: true });
            const totoChannel = data.find(c => c.name === 'toto_channel');
            const rootChannel = data.find(c => c.name === 'root_channel');
            expect(rootChannel.videosCount).to.equal(1);
            expect(totoChannel.videosCount).to.equal(0);
        });
    });
    it('Should search among account video channels', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield servers[0].channels.listByAccount({ accountName, search: 'root' });
                expect(body.total).to.equal(1);
                const channels = body.data;
                expect(channels).to.have.lengthOf(1);
            }
            {
                const body = yield servers[0].channels.listByAccount({ accountName, search: 'does not exist' });
                expect(body.total).to.equal(0);
                const channels = body.data;
                expect(channels).to.have.lengthOf(0);
            }
        });
    });
    it('Should list channels by updatedAt desc if a video has been uploaded', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield servers[0].videos.upload({ attributes: { channelId: totoChannel } });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { data } = yield server.channels.listByAccount({ accountName, sort: '-updatedAt' });
                expect(data[0].name).to.equal('toto_channel');
                expect(data[1].name).to.equal('root_channel');
            }
            yield servers[0].videos.upload({ attributes: { channelId: servers[0].store.channel.id } });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { data } = yield server.channels.listByAccount({ accountName, sort: '-updatedAt' });
                expect(data[0].name).to.equal('root_channel');
                expect(data[1].name).to.equal('toto_channel');
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
