"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test stats (excluding redundancy)', function () {
    let servers = [];
    let channelId;
    const user = {
        username: 'user1',
        password: 'super_password'
    };
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield (0, extra_utils_1.createMultipleServers)(3);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            yield servers[0].users.create({ username: user.username, password: user.password });
            const { uuid } = yield servers[0].videos.upload({ attributes: { fixture: 'video_short.webm' } });
            yield servers[0].comments.createThread({ videoId: uuid, text: 'comment' });
            yield servers[0].videos.view({ id: uuid });
            yield (0, extra_utils_1.wait)(8000);
            yield servers[2].follows.follow({ hosts: [servers[0].url] });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should have the correct stats on instance 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const data = yield servers[0].stats.get();
            expect(data.totalLocalVideoComments).to.equal(1);
            expect(data.totalLocalVideos).to.equal(1);
            expect(data.totalLocalVideoViews).to.equal(1);
            expect(data.totalLocalVideoFilesSize).to.equal(218910);
            expect(data.totalUsers).to.equal(2);
            expect(data.totalVideoComments).to.equal(1);
            expect(data.totalVideos).to.equal(1);
            expect(data.totalInstanceFollowers).to.equal(2);
            expect(data.totalInstanceFollowing).to.equal(1);
            expect(data.totalLocalPlaylists).to.equal(0);
        });
    });
    it('Should have the correct stats on instance 2', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const data = yield servers[1].stats.get();
            expect(data.totalLocalVideoComments).to.equal(0);
            expect(data.totalLocalVideos).to.equal(0);
            expect(data.totalLocalVideoViews).to.equal(0);
            expect(data.totalLocalVideoFilesSize).to.equal(0);
            expect(data.totalUsers).to.equal(1);
            expect(data.totalVideoComments).to.equal(1);
            expect(data.totalVideos).to.equal(1);
            expect(data.totalInstanceFollowers).to.equal(1);
            expect(data.totalInstanceFollowing).to.equal(1);
            expect(data.totalLocalPlaylists).to.equal(0);
        });
    });
    it('Should have the correct stats on instance 3', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const data = yield servers[2].stats.get();
            expect(data.totalLocalVideoComments).to.equal(0);
            expect(data.totalLocalVideos).to.equal(0);
            expect(data.totalLocalVideoViews).to.equal(0);
            expect(data.totalUsers).to.equal(1);
            expect(data.totalVideoComments).to.equal(1);
            expect(data.totalVideos).to.equal(1);
            expect(data.totalInstanceFollowing).to.equal(1);
            expect(data.totalInstanceFollowers).to.equal(0);
            expect(data.totalLocalPlaylists).to.equal(0);
        });
    });
    it('Should have the correct total videos stats after an unfollow', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield servers[2].follows.unfollow({ target: servers[0] });
            yield (0, extra_utils_1.waitJobs)(servers);
            const data = yield servers[2].stats.get();
            expect(data.totalVideos).to.equal(0);
        });
    });
    it('Should have the correct active user stats', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const server = servers[0];
            {
                const data = yield server.stats.get();
                expect(data.totalDailyActiveUsers).to.equal(1);
                expect(data.totalWeeklyActiveUsers).to.equal(1);
                expect(data.totalMonthlyActiveUsers).to.equal(1);
            }
            {
                yield server.login.getAccessToken(user);
                const data = yield server.stats.get();
                expect(data.totalDailyActiveUsers).to.equal(2);
                expect(data.totalWeeklyActiveUsers).to.equal(2);
                expect(data.totalMonthlyActiveUsers).to.equal(2);
            }
        });
    });
    it('Should have the correct active channel stats', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const server = servers[0];
            {
                const data = yield server.stats.get();
                expect(data.totalLocalDailyActiveVideoChannels).to.equal(1);
                expect(data.totalLocalWeeklyActiveVideoChannels).to.equal(1);
                expect(data.totalLocalMonthlyActiveVideoChannels).to.equal(1);
            }
            {
                const attributes = {
                    name: 'stats_channel',
                    displayName: 'My stats channel'
                };
                const created = yield server.channels.create({ attributes });
                channelId = created.id;
                const data = yield server.stats.get();
                expect(data.totalLocalDailyActiveVideoChannels).to.equal(1);
                expect(data.totalLocalWeeklyActiveVideoChannels).to.equal(1);
                expect(data.totalLocalMonthlyActiveVideoChannels).to.equal(1);
            }
            {
                yield server.videos.upload({ attributes: { fixture: 'video_short.webm', channelId } });
                const data = yield server.stats.get();
                expect(data.totalLocalDailyActiveVideoChannels).to.equal(2);
                expect(data.totalLocalWeeklyActiveVideoChannels).to.equal(2);
                expect(data.totalLocalMonthlyActiveVideoChannels).to.equal(2);
            }
        });
    });
    it('Should have the correct playlist stats', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const server = servers[0];
            {
                const data = yield server.stats.get();
                expect(data.totalLocalPlaylists).to.equal(0);
            }
            {
                yield server.playlists.create({
                    attributes: {
                        displayName: 'playlist for count',
                        privacy: 1,
                        videoChannelId: channelId
                    }
                });
                const data = yield server.stats.get();
                expect(data.totalLocalPlaylists).to.equal(1);
            }
        });
    });
    it('Should correctly count video file sizes if transcoding is enabled', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    transcoding: {
                        enabled: true,
                        webtorrent: {
                            enabled: true
                        },
                        hls: {
                            enabled: true
                        },
                        resolutions: {
                            '0p': false,
                            '240p': false,
                            '360p': false,
                            '480p': false,
                            '720p': false,
                            '1080p': false,
                            '1440p': false,
                            '2160p': false
                        }
                    }
                }
            });
            yield servers[0].videos.upload({ attributes: { name: 'video', fixture: 'video_short.webm' } });
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const data = yield servers[1].stats.get();
                expect(data.totalLocalVideoFilesSize).to.equal(0);
            }
            {
                const data = yield servers[0].stats.get();
                expect(data.totalLocalVideoFilesSize).to.be.greaterThan(500000);
                expect(data.totalLocalVideoFilesSize).to.be.lessThan(600000);
            }
        });
    });
    it('Should have the correct AP stats', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    transcoding: {
                        enabled: false
                    }
                }
            });
            const first = yield servers[1].stats.get();
            for (let i = 0; i < 10; i++) {
                yield servers[0].videos.upload({ attributes: { name: 'video' } });
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            yield (0, extra_utils_1.wait)(6000);
            const second = yield servers[1].stats.get();
            expect(second.totalActivityPubMessagesProcessed).to.be.greaterThan(first.totalActivityPubMessagesProcessed);
            const apTypes = [
                'Create', 'Update', 'Delete', 'Follow', 'Accept', 'Announce', 'Undo', 'Like', 'Reject', 'View', 'Dislike', 'Flag'
            ];
            const processed = apTypes.reduce((previous, type) => previous + second['totalActivityPub' + type + 'MessagesSuccesses'], 0);
            expect(second.totalActivityPubMessagesProcessed).to.equal(processed);
            expect(second.totalActivityPubMessagesSuccesses).to.equal(processed);
            expect(second.totalActivityPubMessagesErrors).to.equal(0);
            for (const apType of apTypes) {
                expect(second['totalActivityPub' + apType + 'MessagesErrors']).to.equal(0);
            }
            yield (0, extra_utils_1.wait)(6000);
            const third = yield servers[1].stats.get();
            expect(third.totalActivityPubMessagesWaiting).to.equal(0);
            expect(third.activityPubMessagesProcessedPerSecond).to.be.lessThan(second.activityPubMessagesProcessedPerSecond);
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
