"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test bulk actions', function () {
    const commentsUser3 = [];
    let servers = [];
    let user1Token;
    let user2Token;
    let user3Token;
    let bulkCommand;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            {
                const user = { username: 'user1', password: 'password' };
                yield servers[0].users.create({ username: user.username, password: user.password });
                user1Token = yield servers[0].login.getAccessToken(user);
            }
            {
                const user = { username: 'user2', password: 'password' };
                yield servers[0].users.create({ username: user.username, password: user.password });
                user2Token = yield servers[0].login.getAccessToken(user);
            }
            {
                const user = { username: 'user3', password: 'password' };
                yield servers[1].users.create({ username: user.username, password: user.password });
                user3Token = yield servers[1].login.getAccessToken(user);
            }
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            bulkCommand = new extra_utils_1.BulkCommand(servers[0]);
        });
    });
    describe('Bulk remove comments', function () {
        function checkInstanceCommentsRemoved() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const { data } = yield servers[0].videos.list();
                    for (const video of data) {
                        const { data } = yield servers[0].comments.listThreads({ videoId: video.id });
                        const comment = data.find(c => c.text === 'comment by user 3');
                        expect(comment).to.not.exist;
                    }
                }
                {
                    const { data } = yield servers[1].videos.list();
                    for (const video of data) {
                        const { data } = yield servers[1].comments.listThreads({ videoId: video.id });
                        const comment = data.find(c => c.text === 'comment by user 3');
                        if (video.account.host === 'localhost:' + servers[0].port) {
                            expect(comment).to.not.exist;
                        }
                        else {
                            expect(comment).to.exist;
                        }
                    }
                }
            });
        }
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield servers[0].videos.upload({ attributes: { name: 'video 1 server 1' } });
                yield servers[0].videos.upload({ attributes: { name: 'video 2 server 1' } });
                yield servers[0].videos.upload({ token: user1Token, attributes: { name: 'video 3 server 1' } });
                yield servers[1].videos.upload({ attributes: { name: 'video 1 server 2' } });
                yield (0, extra_utils_1.waitJobs)(servers);
                {
                    const { data } = yield servers[0].videos.list();
                    for (const video of data) {
                        yield servers[0].comments.createThread({ videoId: video.id, text: 'comment by root server 1' });
                        yield servers[0].comments.createThread({ token: user1Token, videoId: video.id, text: 'comment by user 1' });
                        yield servers[0].comments.createThread({ token: user2Token, videoId: video.id, text: 'comment by user 2' });
                    }
                }
                {
                    const { data } = yield servers[1].videos.list();
                    for (const video of data) {
                        yield servers[1].comments.createThread({ videoId: video.id, text: 'comment by root server 2' });
                        const comment = yield servers[1].comments.createThread({ token: user3Token, videoId: video.id, text: 'comment by user 3' });
                        commentsUser3.push({ videoId: video.id, commentId: comment.id });
                    }
                }
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should delete comments of an account on my videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield bulkCommand.removeCommentsOf({
                    token: user1Token,
                    attributes: {
                        accountName: 'user2',
                        scope: 'my-videos'
                    }
                });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    const { data } = yield server.videos.list();
                    for (const video of data) {
                        const { data } = yield server.comments.listThreads({ videoId: video.id });
                        const comment = data.find(c => c.text === 'comment by user 2');
                        if (video.name === 'video 3 server 1')
                            expect(comment).to.not.exist;
                        else
                            expect(comment).to.exist;
                    }
                }
            });
        });
        it('Should delete comments of an account on the instance', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield bulkCommand.removeCommentsOf({
                    attributes: {
                        accountName: 'user3@localhost:' + servers[1].port,
                        scope: 'instance'
                    }
                });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkInstanceCommentsRemoved();
            });
        });
        it('Should not re create the comment on video update', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                for (const obj of commentsUser3) {
                    yield servers[1].comments.addReply({
                        token: user3Token,
                        videoId: obj.videoId,
                        toCommentId: obj.commentId,
                        text: 'comment by user 3 bis'
                    });
                }
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkInstanceCommentsRemoved();
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
