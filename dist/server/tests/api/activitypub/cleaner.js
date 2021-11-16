"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test AP cleaner', function () {
    let servers = [];
    let videoUUID1;
    let videoUUID2;
    let videoUUID3;
    let videoUUIDs;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const config = {
                federation: {
                    videos: { cleanup_remote_interactions: true }
                }
            };
            servers = yield extra_utils_1.createMultipleServers(3, config);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield Promise.all([
                extra_utils_1.doubleFollow(servers[0], servers[1]),
                extra_utils_1.doubleFollow(servers[1], servers[2]),
                extra_utils_1.doubleFollow(servers[0], servers[2])
            ]);
            videoUUID1 = (yield servers[0].videos.quickUpload({ name: 'server 1' })).uuid;
            videoUUID2 = (yield servers[1].videos.quickUpload({ name: 'server 2' })).uuid;
            videoUUID3 = (yield servers[2].videos.quickUpload({ name: 'server 3' })).uuid;
            videoUUIDs = [videoUUID1, videoUUID2, videoUUID3];
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                for (const uuid of videoUUIDs) {
                    yield server.videos.rate({ id: uuid, rating: 'like' });
                    yield server.comments.createThread({ videoId: uuid, text: 'comment' });
                }
            }
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should have the correct likes', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                for (const uuid of videoUUIDs) {
                    const video = yield server.videos.get({ id: uuid });
                    expect(video.likes).to.equal(3);
                    expect(video.dislikes).to.equal(0);
                }
            }
        });
    });
    it('Should destroy server 3 internal likes and correctly clean them', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield servers[2].sql.deleteAll('accountVideoRate');
            for (const uuid of videoUUIDs) {
                yield servers[2].sql.setVideoField(uuid, 'likes', '0');
            }
            yield extra_utils_1.wait(5000);
            yield extra_utils_1.waitJobs(servers);
            {
                const video = yield servers[0].videos.get({ id: videoUUID1 });
                expect(video.likes).to.equal(2);
                expect(video.dislikes).to.equal(0);
            }
            {
                const video = yield servers[0].videos.get({ id: videoUUID2 });
                expect(video.likes).to.equal(3);
                expect(video.dislikes).to.equal(0);
            }
        });
    });
    it('Should update rates to dislikes', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            for (const server of servers) {
                for (const uuid of videoUUIDs) {
                    yield server.videos.rate({ id: uuid, rating: 'dislike' });
                }
            }
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                for (const uuid of videoUUIDs) {
                    const video = yield server.videos.get({ id: uuid });
                    expect(video.likes).to.equal(0);
                    expect(video.dislikes).to.equal(3);
                }
            }
        });
    });
    it('Should destroy server 3 internal dislikes and correctly clean them', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield servers[2].sql.deleteAll('accountVideoRate');
            for (const uuid of videoUUIDs) {
                yield servers[2].sql.setVideoField(uuid, 'dislikes', '0');
            }
            yield extra_utils_1.wait(5000);
            yield extra_utils_1.waitJobs(servers);
            {
                const video = yield servers[0].videos.get({ id: videoUUID1 });
                expect(video.likes).to.equal(0);
                expect(video.dislikes).to.equal(2);
            }
            {
                const video = yield servers[0].videos.get({ id: videoUUID2 });
                expect(video.likes).to.equal(0);
                expect(video.dislikes).to.equal(3);
            }
        });
    });
    it('Should destroy server 3 internal shares and correctly clean them', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            const preCount = yield servers[0].sql.getCount('videoShare');
            expect(preCount).to.equal(6);
            yield servers[2].sql.deleteAll('videoShare');
            yield extra_utils_1.wait(5000);
            yield extra_utils_1.waitJobs(servers);
            const postCount = yield servers[0].sql.getCount('videoShare');
            expect(postCount).to.equal(6);
        });
    });
    it('Should destroy server 3 internal comments and correctly clean them', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            {
                const { total } = yield servers[0].comments.listThreads({ videoId: videoUUID1 });
                expect(total).to.equal(3);
            }
            yield servers[2].sql.deleteAll('videoComment');
            yield extra_utils_1.wait(5000);
            yield extra_utils_1.waitJobs(servers);
            {
                const { total } = yield servers[0].comments.listThreads({ videoId: videoUUID1 });
                expect(total).to.equal(2);
            }
        });
    });
    it('Should correctly update rate URLs', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            function check(like, ofServerUrl, urlSuffix, remote) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const query = `SELECT "videoId", "accountVideoRate".url FROM "accountVideoRate" ` +
                        `INNER JOIN video ON "accountVideoRate"."videoId" = video.id AND remote IS ${remote} WHERE "accountVideoRate"."url" LIKE '${like}'`;
                    const res = yield servers[0].sql.selectQuery(query);
                    for (const rate of res) {
                        const matcher = new RegExp(`^${ofServerUrl}/accounts/root/dislikes/\\d+${urlSuffix}$`);
                        expect(rate.url).to.match(matcher);
                    }
                });
            }
            function checkLocal() {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const startsWith = 'http://' + servers[0].host + '%';
                    yield check(startsWith, servers[0].url, '', 'false');
                    yield check(startsWith, servers[0].url, '', 'true');
                });
            }
            function checkRemote(suffix) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const startsWith = 'http://' + servers[1].host + '%';
                    yield check(startsWith, servers[1].url, suffix, 'false');
                    yield check(startsWith, servers[1].url, '', 'true');
                });
            }
            yield checkLocal();
            yield checkRemote('');
            {
                const query = `UPDATE "accountVideoRate" SET url = url || 'stan'`;
                yield servers[1].sql.updateQuery(query);
                yield extra_utils_1.wait(5000);
                yield extra_utils_1.waitJobs(servers);
            }
            yield checkLocal();
            yield checkRemote('stan');
        });
    });
    it('Should correctly update comment URLs', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            function check(like, ofServerUrl, urlSuffix, remote) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const query = `SELECT "videoId", "videoComment".url, uuid as "videoUUID" FROM "videoComment" ` +
                        `INNER JOIN video ON "videoComment"."videoId" = video.id AND remote IS ${remote} WHERE "videoComment"."url" LIKE '${like}'`;
                    const res = yield servers[0].sql.selectQuery(query);
                    for (const comment of res) {
                        const matcher = new RegExp(`${ofServerUrl}/videos/watch/${comment.videoUUID}/comments/\\d+${urlSuffix}`);
                        expect(comment.url).to.match(matcher);
                    }
                });
            }
            function checkLocal() {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const startsWith = 'http://' + servers[0].host + '%';
                    yield check(startsWith, servers[0].url, '', 'false');
                    yield check(startsWith, servers[0].url, '', 'true');
                });
            }
            function checkRemote(suffix) {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const startsWith = 'http://' + servers[1].host + '%';
                    yield check(startsWith, servers[1].url, suffix, 'false');
                    yield check(startsWith, servers[1].url, '', 'true');
                });
            }
            {
                const query = `UPDATE "videoComment" SET url = url || 'kyle'`;
                yield servers[1].sql.updateQuery(query);
                yield extra_utils_1.wait(5000);
                yield extra_utils_1.waitJobs(servers);
            }
            yield checkLocal();
            yield checkRemote('kyle');
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
