"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function checkAllVideos(server, token) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        {
            const { data } = yield server.videos.listWithToken({ token });
            expect(data).to.have.lengthOf(5);
        }
        {
            const { data } = yield server.videos.list();
            expect(data).to.have.lengthOf(5);
        }
    });
}
function checkAllComments(server, token, videoUUID) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { data } = yield server.comments.listThreads({ videoId: videoUUID, start: 0, count: 25, sort: '-createdAt', token });
        const threads = data.filter(t => t.isDeleted === false);
        expect(threads).to.have.lengthOf(2);
        for (const thread of threads) {
            const tree = yield server.comments.getThread({ videoId: videoUUID, threadId: thread.id, token });
            expect(tree.children).to.have.lengthOf(1);
        }
    });
}
function checkCommentNotification(mainServer, comment, check) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const command = comment.server.comments;
        const { threadId, createdAt } = yield command.createThread({ token: comment.token, videoId: comment.videoUUID, text: comment.text });
        yield extra_utils_1.waitJobs([mainServer, comment.server]);
        const { data } = yield mainServer.notifications.list({ start: 0, count: 30 });
        const commentNotifications = data.filter(n => n.comment && n.comment.video.uuid === comment.videoUUID && n.createdAt >= createdAt);
        if (check === 'presence')
            expect(commentNotifications).to.have.lengthOf(1);
        else
            expect(commentNotifications).to.have.lengthOf(0);
        yield command.delete({ token: comment.token, videoId: comment.videoUUID, commentId: threadId });
        yield extra_utils_1.waitJobs([mainServer, comment.server]);
    });
}
describe('Test blocklist', function () {
    let servers;
    let videoUUID1;
    let videoUUID2;
    let videoUUID3;
    let userToken1;
    let userModeratorToken;
    let userToken2;
    let command;
    let commentsCommand;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(3);
            yield extra_utils_1.setAccessTokensToServers(servers);
            command = servers[0].blocklist;
            commentsCommand = servers.map(s => s.comments);
            {
                const user = { username: 'user1', password: 'password' };
                yield servers[0].users.create({ username: user.username, password: user.password });
                userToken1 = yield servers[0].login.getAccessToken(user);
                yield servers[0].videos.upload({ token: userToken1, attributes: { name: 'video user 1' } });
            }
            {
                const user = { username: 'moderator', password: 'password' };
                yield servers[0].users.create({ username: user.username, password: user.password });
                userModeratorToken = yield servers[0].login.getAccessToken(user);
            }
            {
                const user = { username: 'user2', password: 'password' };
                yield servers[1].users.create({ username: user.username, password: user.password });
                userToken2 = yield servers[1].login.getAccessToken(user);
                yield servers[1].videos.upload({ token: userToken2, attributes: { name: 'video user 2' } });
            }
            {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video server 1' } });
                videoUUID1 = uuid;
            }
            {
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video server 2' } });
                videoUUID2 = uuid;
            }
            {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video 2 server 1' } });
                videoUUID3 = uuid;
            }
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield extra_utils_1.doubleFollow(servers[0], servers[2]);
            {
                const created = yield commentsCommand[0].createThread({ videoId: videoUUID1, text: 'comment root 1' });
                const reply = yield commentsCommand[0].addReply({
                    token: userToken1,
                    videoId: videoUUID1,
                    toCommentId: created.id,
                    text: 'comment user 1'
                });
                yield commentsCommand[0].addReply({ videoId: videoUUID1, toCommentId: reply.id, text: 'comment root 1' });
            }
            {
                const created = yield commentsCommand[0].createThread({ token: userToken1, videoId: videoUUID1, text: 'comment user 1' });
                yield commentsCommand[0].addReply({ videoId: videoUUID1, toCommentId: created.id, text: 'comment root 1' });
            }
            yield extra_utils_1.waitJobs(servers);
        });
    });
    describe('User blocklist', function () {
        describe('When managing account blocklist', function () {
            it('Should list all videos', function () {
                return checkAllVideos(servers[0], servers[0].accessToken);
            });
            it('Should list the comments', function () {
                return checkAllComments(servers[0], servers[0].accessToken, videoUUID1);
            });
            it('Should block a remote account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.addToMyBlocklist({ account: 'user2@localhost:' + servers[1].port });
                });
            });
            it('Should hide its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const { data } = yield servers[0].videos.listWithToken();
                    expect(data).to.have.lengthOf(4);
                    const v = data.find(v => v.name === 'video user 2');
                    expect(v).to.be.undefined;
                });
            });
            it('Should block a local account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.addToMyBlocklist({ account: 'user1' });
                });
            });
            it('Should hide its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const { data } = yield servers[0].videos.listWithToken();
                    expect(data).to.have.lengthOf(3);
                    const v = data.find(v => v.name === 'video user 1');
                    expect(v).to.be.undefined;
                });
            });
            it('Should hide its comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const { data } = yield commentsCommand[0].listThreads({
                        token: servers[0].accessToken,
                        videoId: videoUUID1,
                        start: 0,
                        count: 25,
                        sort: '-createdAt'
                    });
                    expect(data).to.have.lengthOf(1);
                    expect(data[0].totalReplies).to.equal(1);
                    const t = data.find(t => t.text === 'comment user 1');
                    expect(t).to.be.undefined;
                    for (const thread of data) {
                        const tree = yield commentsCommand[0].getThread({
                            videoId: videoUUID1,
                            threadId: thread.id,
                            token: servers[0].accessToken
                        });
                        expect(tree.children).to.have.lengthOf(0);
                    }
                });
            });
            it('Should not have notifications from blocked accounts', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(20000);
                    {
                        const comment = { server: servers[0], token: userToken1, videoUUID: videoUUID1, text: 'hidden comment' };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                    {
                        const comment = {
                            server: servers[0],
                            token: userToken1,
                            videoUUID: videoUUID2,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                });
            });
            it('Should list all the videos with another user', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return checkAllVideos(servers[0], userToken1);
                });
            });
            it('Should list blocked accounts', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    {
                        const body = yield command.listMyAccountBlocklist({ start: 0, count: 1, sort: 'createdAt' });
                        expect(body.total).to.equal(2);
                        const block = body.data[0];
                        expect(block.byAccount.displayName).to.equal('root');
                        expect(block.byAccount.name).to.equal('root');
                        expect(block.blockedAccount.displayName).to.equal('user2');
                        expect(block.blockedAccount.name).to.equal('user2');
                        expect(block.blockedAccount.host).to.equal('localhost:' + servers[1].port);
                    }
                    {
                        const body = yield command.listMyAccountBlocklist({ start: 1, count: 2, sort: 'createdAt' });
                        expect(body.total).to.equal(2);
                        const block = body.data[0];
                        expect(block.byAccount.displayName).to.equal('root');
                        expect(block.byAccount.name).to.equal('root');
                        expect(block.blockedAccount.displayName).to.equal('user1');
                        expect(block.blockedAccount.name).to.equal('user1');
                        expect(block.blockedAccount.host).to.equal('localhost:' + servers[0].port);
                    }
                });
            });
            it('Should not allow a remote blocked user to comment my videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(60000);
                    {
                        yield commentsCommand[1].createThread({ token: userToken2, videoId: videoUUID3, text: 'comment user 2' });
                        yield extra_utils_1.waitJobs(servers);
                        yield commentsCommand[0].createThread({ token: servers[0].accessToken, videoId: videoUUID3, text: 'uploader' });
                        yield extra_utils_1.waitJobs(servers);
                        const commentId = yield commentsCommand[1].findCommentId({ videoId: videoUUID3, text: 'uploader' });
                        const message = 'reply by user 2';
                        const reply = yield commentsCommand[1].addReply({ token: userToken2, videoId: videoUUID3, toCommentId: commentId, text: message });
                        yield commentsCommand[1].addReply({ videoId: videoUUID3, toCommentId: reply.id, text: 'another reply' });
                        yield extra_utils_1.waitJobs(servers);
                    }
                    {
                        const { data } = yield commentsCommand[1].listThreads({ videoId: videoUUID3, count: 25, sort: '-createdAt' });
                        expect(data).to.have.lengthOf(2);
                        expect(data[0].text).to.equal('uploader');
                        expect(data[1].text).to.equal('comment user 2');
                        const tree = yield commentsCommand[1].getThread({ videoId: videoUUID3, threadId: data[0].id });
                        expect(tree.children).to.have.lengthOf(1);
                        expect(tree.children[0].comment.text).to.equal('reply by user 2');
                        expect(tree.children[0].children).to.have.lengthOf(1);
                        expect(tree.children[0].children[0].comment.text).to.equal('another reply');
                    }
                    for (const server of [servers[0], servers[2]]) {
                        const { data } = yield server.comments.listThreads({ videoId: videoUUID3, count: 25, sort: '-createdAt' });
                        expect(data).to.have.lengthOf(1);
                        expect(data[0].text).to.equal('uploader');
                        const tree = yield server.comments.getThread({ videoId: videoUUID3, threadId: data[0].id });
                        if (server.serverNumber === 1)
                            expect(tree.children).to.have.lengthOf(0);
                        else
                            expect(tree.children).to.have.lengthOf(1);
                    }
                });
            });
            it('Should unblock the remote account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.removeFromMyBlocklist({ account: 'user2@localhost:' + servers[1].port });
                });
            });
            it('Should display its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const { data } = yield servers[0].videos.listWithToken();
                    expect(data).to.have.lengthOf(4);
                    const v = data.find(v => v.name === 'video user 2');
                    expect(v).not.to.be.undefined;
                });
            });
            it('Should display its comments on my video', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const server of servers) {
                        const { data } = yield server.comments.listThreads({ videoId: videoUUID3, count: 25, sort: '-createdAt' });
                        if (server.serverNumber === 3) {
                            expect(data).to.have.lengthOf(1);
                            continue;
                        }
                        expect(data).to.have.lengthOf(2);
                        expect(data[0].text).to.equal('uploader');
                        expect(data[1].text).to.equal('comment user 2');
                        const tree = yield server.comments.getThread({ videoId: videoUUID3, threadId: data[0].id });
                        expect(tree.children).to.have.lengthOf(1);
                        expect(tree.children[0].comment.text).to.equal('reply by user 2');
                        expect(tree.children[0].children).to.have.lengthOf(1);
                        expect(tree.children[0].children[0].comment.text).to.equal('another reply');
                    }
                });
            });
            it('Should unblock the local account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.removeFromMyBlocklist({ account: 'user1' });
                });
            });
            it('Should display its comments', function () {
                return checkAllComments(servers[0], servers[0].accessToken, videoUUID1);
            });
            it('Should have a notification from a non blocked account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(20000);
                    {
                        const comment = { server: servers[1], token: userToken2, videoUUID: videoUUID1, text: 'displayed comment' };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                    {
                        const comment = {
                            server: servers[0],
                            token: userToken1,
                            videoUUID: videoUUID2,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                });
            });
        });
        describe('When managing server blocklist', function () {
            it('Should list all videos', function () {
                return checkAllVideos(servers[0], servers[0].accessToken);
            });
            it('Should list the comments', function () {
                return checkAllComments(servers[0], servers[0].accessToken, videoUUID1);
            });
            it('Should block a remote server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.addToMyBlocklist({ server: 'localhost:' + servers[1].port });
                });
            });
            it('Should hide its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const { data } = yield servers[0].videos.listWithToken();
                    expect(data).to.have.lengthOf(3);
                    const v1 = data.find(v => v.name === 'video user 2');
                    const v2 = data.find(v => v.name === 'video server 2');
                    expect(v1).to.be.undefined;
                    expect(v2).to.be.undefined;
                });
            });
            it('Should list all the videos with another user', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return checkAllVideos(servers[0], userToken1);
                });
            });
            it('Should hide its comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(10000);
                    const { id } = yield commentsCommand[1].createThread({ token: userToken2, videoId: videoUUID1, text: 'hidden comment 2' });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkAllComments(servers[0], servers[0].accessToken, videoUUID1);
                    yield commentsCommand[1].delete({ token: userToken2, videoId: videoUUID1, commentId: id });
                });
            });
            it('Should not have notifications from blocked server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(20000);
                    {
                        const comment = { server: servers[1], token: userToken2, videoUUID: videoUUID1, text: 'hidden comment' };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                    {
                        const comment = {
                            server: servers[1],
                            token: userToken2,
                            videoUUID: videoUUID1,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                });
            });
            it('Should list blocked servers', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const body = yield command.listMyServerBlocklist({ start: 0, count: 1, sort: 'createdAt' });
                    expect(body.total).to.equal(1);
                    const block = body.data[0];
                    expect(block.byAccount.displayName).to.equal('root');
                    expect(block.byAccount.name).to.equal('root');
                    expect(block.blockedServer.host).to.equal('localhost:' + servers[1].port);
                });
            });
            it('Should unblock the remote server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.removeFromMyBlocklist({ server: 'localhost:' + servers[1].port });
                });
            });
            it('Should display its videos', function () {
                return checkAllVideos(servers[0], servers[0].accessToken);
            });
            it('Should display its comments', function () {
                return checkAllComments(servers[0], servers[0].accessToken, videoUUID1);
            });
            it('Should have notification from unblocked server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(20000);
                    {
                        const comment = { server: servers[1], token: userToken2, videoUUID: videoUUID1, text: 'displayed comment' };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                    {
                        const comment = {
                            server: servers[1],
                            token: userToken2,
                            videoUUID: videoUUID1,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                });
            });
        });
    });
    describe('Server blocklist', function () {
        describe('When managing account blocklist', function () {
            it('Should list all videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllVideos(servers[0], token);
                    }
                });
            });
            it('Should list the comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllComments(servers[0], token, videoUUID1);
                    }
                });
            });
            it('Should block a remote account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.addToServerBlocklist({ account: 'user2@localhost:' + servers[1].port });
                });
            });
            it('Should hide its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        const { data } = yield servers[0].videos.listWithToken({ token });
                        expect(data).to.have.lengthOf(4);
                        const v = data.find(v => v.name === 'video user 2');
                        expect(v).to.be.undefined;
                    }
                });
            });
            it('Should block a local account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.addToServerBlocklist({ account: 'user1' });
                });
            });
            it('Should hide its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        const { data } = yield servers[0].videos.listWithToken({ token });
                        expect(data).to.have.lengthOf(3);
                        const v = data.find(v => v.name === 'video user 1');
                        expect(v).to.be.undefined;
                    }
                });
            });
            it('Should hide its comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        const { data } = yield commentsCommand[0].listThreads({ videoId: videoUUID1, count: 20, sort: '-createdAt', token });
                        const threads = data.filter(t => t.isDeleted === false);
                        expect(threads).to.have.lengthOf(1);
                        expect(threads[0].totalReplies).to.equal(1);
                        const t = threads.find(t => t.text === 'comment user 1');
                        expect(t).to.be.undefined;
                        for (const thread of threads) {
                            const tree = yield commentsCommand[0].getThread({ videoId: videoUUID1, threadId: thread.id, token });
                            expect(tree.children).to.have.lengthOf(0);
                        }
                    }
                });
            });
            it('Should not have notification from blocked accounts by instance', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(20000);
                    {
                        const comment = { server: servers[0], token: userToken1, videoUUID: videoUUID1, text: 'hidden comment' };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                    {
                        const comment = {
                            server: servers[1],
                            token: userToken2,
                            videoUUID: videoUUID1,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                });
            });
            it('Should list blocked accounts', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    {
                        const body = yield command.listServerAccountBlocklist({ start: 0, count: 1, sort: 'createdAt' });
                        expect(body.total).to.equal(2);
                        const block = body.data[0];
                        expect(block.byAccount.displayName).to.equal('peertube');
                        expect(block.byAccount.name).to.equal('peertube');
                        expect(block.blockedAccount.displayName).to.equal('user2');
                        expect(block.blockedAccount.name).to.equal('user2');
                        expect(block.blockedAccount.host).to.equal('localhost:' + servers[1].port);
                    }
                    {
                        const body = yield command.listServerAccountBlocklist({ start: 1, count: 2, sort: 'createdAt' });
                        expect(body.total).to.equal(2);
                        const block = body.data[0];
                        expect(block.byAccount.displayName).to.equal('peertube');
                        expect(block.byAccount.name).to.equal('peertube');
                        expect(block.blockedAccount.displayName).to.equal('user1');
                        expect(block.blockedAccount.name).to.equal('user1');
                        expect(block.blockedAccount.host).to.equal('localhost:' + servers[0].port);
                    }
                });
            });
            it('Should unblock the remote account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.removeFromServerBlocklist({ account: 'user2@localhost:' + servers[1].port });
                });
            });
            it('Should display its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        const { data } = yield servers[0].videos.listWithToken({ token });
                        expect(data).to.have.lengthOf(4);
                        const v = data.find(v => v.name === 'video user 2');
                        expect(v).not.to.be.undefined;
                    }
                });
            });
            it('Should unblock the local account', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.removeFromServerBlocklist({ account: 'user1' });
                });
            });
            it('Should display its comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllComments(servers[0], token, videoUUID1);
                    }
                });
            });
            it('Should have notifications from unblocked accounts', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(20000);
                    {
                        const comment = { server: servers[0], token: userToken1, videoUUID: videoUUID1, text: 'displayed comment' };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                    {
                        const comment = {
                            server: servers[1],
                            token: userToken2,
                            videoUUID: videoUUID1,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                });
            });
        });
        describe('When managing server blocklist', function () {
            it('Should list all videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllVideos(servers[0], token);
                    }
                });
            });
            it('Should list the comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllComments(servers[0], token, videoUUID1);
                    }
                });
            });
            it('Should block a remote server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.addToServerBlocklist({ server: 'localhost:' + servers[1].port });
                });
            });
            it('Should hide its videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        const requests = [
                            servers[0].videos.list(),
                            servers[0].videos.listWithToken({ token })
                        ];
                        for (const req of requests) {
                            const { data } = yield req;
                            expect(data).to.have.lengthOf(3);
                            const v1 = data.find(v => v.name === 'video user 2');
                            const v2 = data.find(v => v.name === 'video server 2');
                            expect(v1).to.be.undefined;
                            expect(v2).to.be.undefined;
                        }
                    }
                });
            });
            it('Should hide its comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(10000);
                    const { id } = yield commentsCommand[1].createThread({ token: userToken2, videoId: videoUUID1, text: 'hidden comment 2' });
                    yield extra_utils_1.waitJobs(servers);
                    yield checkAllComments(servers[0], servers[0].accessToken, videoUUID1);
                    yield commentsCommand[1].delete({ token: userToken2, videoId: videoUUID1, commentId: id });
                });
            });
            it('Should not have notification from blocked instances by instance', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(50000);
                    {
                        const comment = { server: servers[1], token: userToken2, videoUUID: videoUUID1, text: 'hidden comment' };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                    {
                        const comment = {
                            server: servers[1],
                            token: userToken2,
                            videoUUID: videoUUID1,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'absence');
                    }
                    {
                        const now = new Date();
                        yield servers[1].follows.unfollow({ target: servers[0] });
                        yield extra_utils_1.waitJobs(servers);
                        yield servers[1].follows.follow({ hosts: [servers[0].host] });
                        yield extra_utils_1.waitJobs(servers);
                        const { data } = yield servers[0].notifications.list({ start: 0, count: 30 });
                        const commentNotifications = data.filter(n => {
                            return n.type === 13 && n.createdAt >= now.toISOString();
                        });
                        expect(commentNotifications).to.have.lengthOf(0);
                    }
                });
            });
            it('Should list blocked servers', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const body = yield command.listServerServerBlocklist({ start: 0, count: 1, sort: 'createdAt' });
                    expect(body.total).to.equal(1);
                    const block = body.data[0];
                    expect(block.byAccount.displayName).to.equal('peertube');
                    expect(block.byAccount.name).to.equal('peertube');
                    expect(block.blockedServer.host).to.equal('localhost:' + servers[1].port);
                });
            });
            it('Should unblock the remote server', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield command.removeFromServerBlocklist({ server: 'localhost:' + servers[1].port });
                });
            });
            it('Should list all videos', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllVideos(servers[0], token);
                    }
                });
            });
            it('Should list the comments', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    for (const token of [userModeratorToken, servers[0].accessToken]) {
                        yield checkAllComments(servers[0], token, videoUUID1);
                    }
                });
            });
            it('Should have notification from unblocked instances', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.timeout(50000);
                    {
                        const comment = { server: servers[1], token: userToken2, videoUUID: videoUUID1, text: 'displayed comment' };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                    {
                        const comment = {
                            server: servers[1],
                            token: userToken2,
                            videoUUID: videoUUID1,
                            text: 'hello @root@localhost:' + servers[0].port
                        };
                        yield checkCommentNotification(servers[0], comment, 'presence');
                    }
                    {
                        const now = new Date();
                        yield servers[1].follows.unfollow({ target: servers[0] });
                        yield extra_utils_1.waitJobs(servers);
                        yield servers[1].follows.follow({ hosts: [servers[0].host] });
                        yield extra_utils_1.waitJobs(servers);
                        const { data } = yield servers[0].notifications.list({ start: 0, count: 30 });
                        const commentNotifications = data.filter(n => {
                            return n.type === 13 && n.createdAt >= now.toISOString();
                        });
                        expect(commentNotifications).to.have.lengthOf(1);
                    }
                });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
