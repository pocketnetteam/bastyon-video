"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test comments notifications', function () {
    let servers = [];
    let userToken;
    let userNotifications = [];
    let emails = [];
    const commentText = '**hello** <a href="https://joinpeertube.org">world</a>, <h1>what do you think about peertube?</h1>';
    const expectedHtml = '<strong style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">hello</strong> ' +
        '<a href="https://joinpeertube.org" target="_blank" rel="noopener noreferrer" style="-ms-text-size-adjust: 100%; ' +
        '-webkit-text-size-adjust: 100%; text-decoration: none; color: #f2690d;">world</a>, </p>what do you think about peertube?';
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const res = yield extra_utils_1.prepareNotificationsTest(2);
            emails = res.emails;
            userToken = res.userAccessToken;
            servers = res.servers;
            userNotifications = res.userNotifications;
        });
    });
    describe('Comment on my video notifications', function () {
        let baseParams;
        before(() => {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: userNotifications,
                token: userToken
            };
        });
        it('Should not send a new comment notification after a comment on another video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                const created = yield servers[0].comments.createThread({ videoId: uuid, text: 'comment' });
                const commentId = created.id;
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, checkType: 'absence' }));
            });
        });
        it('Should not send a new comment notification if I comment my own video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                const created = yield servers[0].comments.createThread({ token: userToken, videoId: uuid, text: 'comment' });
                const commentId = created.id;
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, checkType: 'absence' }));
            });
        });
        it('Should not send a new comment notification if the account is muted', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield servers[0].blocklist.addToMyBlocklist({ token: userToken, account: 'root' });
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                const created = yield servers[0].comments.createThread({ videoId: uuid, text: 'comment' });
                const commentId = created.id;
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, checkType: 'absence' }));
                yield servers[0].blocklist.removeFromMyBlocklist({ token: userToken, account: 'root' });
            });
        });
        it('Should send a new comment notification after a local comment on my video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                const created = yield servers[0].comments.createThread({ videoId: uuid, text: 'comment' });
                const commentId = created.id;
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, checkType: 'presence' }));
            });
        });
        it('Should send a new comment notification after a remote comment on my video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                yield extra_utils_1.waitJobs(servers);
                yield servers[1].comments.createThread({ videoId: uuid, text: 'comment' });
                yield extra_utils_1.waitJobs(servers);
                const { data } = yield servers[0].comments.listThreads({ videoId: uuid });
                expect(data).to.have.lengthOf(1);
                const commentId = data[0].id;
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, checkType: 'presence' }));
            });
        });
        it('Should send a new comment notification after a local reply on my video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                const { id: threadId } = yield servers[0].comments.createThread({ videoId: uuid, text: 'comment' });
                const { id: commentId } = yield servers[0].comments.addReply({ videoId: uuid, toCommentId: threadId, text: 'reply' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId, commentId, checkType: 'presence' }));
            });
        });
        it('Should send a new comment notification after a remote reply on my video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                yield extra_utils_1.waitJobs(servers);
                {
                    const created = yield servers[1].comments.createThread({ videoId: uuid, text: 'comment' });
                    const threadId = created.id;
                    yield servers[1].comments.addReply({ videoId: uuid, toCommentId: threadId, text: 'reply' });
                }
                yield extra_utils_1.waitJobs(servers);
                const { data } = yield servers[0].comments.listThreads({ videoId: uuid });
                expect(data).to.have.lengthOf(1);
                const threadId = data[0].id;
                const tree = yield servers[0].comments.getThread({ videoId: uuid, threadId });
                expect(tree.children).to.have.lengthOf(1);
                const commentId = tree.children[0].comment.id;
                yield extra_utils_1.checkNewCommentOnMyVideo(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId, commentId, checkType: 'presence' }));
            });
        });
        it('Should convert markdown in comment to html', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'cool video' } });
                yield servers[0].comments.createThread({ videoId: uuid, text: commentText });
                yield extra_utils_1.waitJobs(servers);
                const latestEmail = emails[emails.length - 1];
                expect(latestEmail['html']).to.contain(expectedHtml);
            });
        });
    });
    describe('Mention notifications', function () {
        let baseParams;
        const byAccountDisplayName = 'super root name';
        before(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            baseParams = {
                server: servers[0],
                emails,
                socketNotifications: userNotifications,
                token: userToken
            };
            yield servers[0].users.updateMe({ displayName: 'super root name' });
            yield servers[1].users.updateMe({ displayName: 'super root 2 name' });
        }));
        it('Should not send a new mention comment notification if I mention the video owner', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ token: userToken, attributes: { name: 'super video' } });
                const { id: commentId } = yield servers[0].comments.createThread({ videoId: uuid, text: '@user_1 hello' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, byAccountDisplayName, checkType: 'absence' }));
            });
        });
        it('Should not send a new mention comment notification if I mention myself', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                const { id: commentId } = yield servers[0].comments.createThread({ token: userToken, videoId: uuid, text: '@user_1 hello' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, byAccountDisplayName, checkType: 'absence' }));
            });
        });
        it('Should not send a new mention notification if the account is muted', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].blocklist.addToMyBlocklist({ token: userToken, account: 'root' });
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                const { id: commentId } = yield servers[0].comments.createThread({ videoId: uuid, text: '@user_1 hello' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId: commentId, commentId, byAccountDisplayName, checkType: 'absence' }));
                yield servers[0].blocklist.removeFromMyBlocklist({ token: userToken, account: 'root' });
            });
        });
        it('Should not send a new mention notification if the remote account mention a local account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                yield extra_utils_1.waitJobs(servers);
                const { id: threadId } = yield servers[1].comments.createThread({ videoId: uuid, text: '@user_1 hello' });
                yield extra_utils_1.waitJobs(servers);
                const byAccountDisplayName = 'super root 2 name';
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId, commentId: threadId, byAccountDisplayName, checkType: 'absence' }));
            });
        });
        it('Should send a new mention notification after local comments', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                const { id: threadId } = yield servers[0].comments.createThread({ videoId: uuid, text: '@user_1 hellotext:  1' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, threadId, commentId: threadId, byAccountDisplayName, checkType: 'presence' }));
                const { id: commentId } = yield servers[0].comments.addReply({ videoId: uuid, toCommentId: threadId, text: 'hello 2 @user_1' });
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, commentId, threadId, byAccountDisplayName, checkType: 'presence' }));
            });
        });
        it('Should send a new mention notification after remote comments', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const { uuid, shortUUID } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                yield extra_utils_1.waitJobs(servers);
                const text1 = `hello @user_1@localhost:${servers[0].port} 1`;
                const { id: server2ThreadId } = yield servers[1].comments.createThread({ videoId: uuid, text: text1 });
                yield extra_utils_1.waitJobs(servers);
                const { data } = yield servers[0].comments.listThreads({ videoId: uuid });
                expect(data).to.have.lengthOf(1);
                const byAccountDisplayName = 'super root 2 name';
                const threadId = data[0].id;
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, commentId: threadId, threadId, byAccountDisplayName, checkType: 'presence' }));
                const text2 = `@user_1@localhost:${servers[0].port} hello 2 @root@localhost:${servers[0].port}`;
                yield servers[1].comments.addReply({ videoId: uuid, toCommentId: server2ThreadId, text: text2 });
                yield extra_utils_1.waitJobs(servers);
                const tree = yield servers[0].comments.getThread({ videoId: uuid, threadId });
                expect(tree.children).to.have.lengthOf(1);
                const commentId = tree.children[0].comment.id;
                yield extra_utils_1.checkCommentMention(Object.assign(Object.assign({}, baseParams), { shortUUID, commentId, threadId, byAccountDisplayName, checkType: 'presence' }));
            });
        });
        it('Should convert markdown in comment to html', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'super video' } });
                const { id: threadId } = yield servers[0].comments.createThread({ videoId: uuid, text: '@user_1 hello 1' });
                yield servers[0].comments.addReply({ videoId: uuid, toCommentId: threadId, text: '@user_1 ' + commentText });
                yield extra_utils_1.waitJobs(servers);
                const latestEmail = emails[emails.length - 1];
                expect(latestEmail['html']).to.contain(expectedHtml);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
