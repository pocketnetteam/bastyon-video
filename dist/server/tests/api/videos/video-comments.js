"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test video comments', function () {
    let server;
    let videoId;
    let videoUUID;
    let threadId;
    let replyToDeleteId;
    let userAccessTokenServer1;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            const { id, uuid } = yield server.videos.upload();
            videoUUID = uuid;
            videoId = id;
            yield server.users.updateMyAvatar({ fixture: 'avatar.png' });
            userAccessTokenServer1 = yield server.users.generateUserAndToken('user1');
            command = server.comments;
        });
    });
    describe('User comments', function () {
        it('Should not have threads on this video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.listThreads({ videoId: videoUUID });
                expect(body.total).to.equal(0);
                expect(body.totalNotDeletedComments).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(0);
            });
        });
        it('Should create a thread in this video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const text = 'my super first comment';
                const comment = yield command.createThread({ videoId: videoUUID, text });
                expect(comment.inReplyToCommentId).to.be.null;
                expect(comment.text).equal('my super first comment');
                expect(comment.videoId).to.equal(videoId);
                expect(comment.id).to.equal(comment.threadId);
                expect(comment.account.name).to.equal('root');
                expect(comment.account.host).to.equal('localhost:' + server.port);
                expect(comment.account.url).to.equal('http://localhost:' + server.port + '/accounts/root');
                expect(comment.totalReplies).to.equal(0);
                expect(comment.totalRepliesFromVideoAuthor).to.equal(0);
                expect(extra_utils_1.dateIsValid(comment.createdAt)).to.be.true;
                expect(extra_utils_1.dateIsValid(comment.updatedAt)).to.be.true;
            });
        });
        it('Should list threads of this video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.listThreads({ videoId: videoUUID });
                expect(body.total).to.equal(1);
                expect(body.totalNotDeletedComments).to.equal(1);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(1);
                const comment = body.data[0];
                expect(comment.inReplyToCommentId).to.be.null;
                expect(comment.text).equal('my super first comment');
                expect(comment.videoId).to.equal(videoId);
                expect(comment.id).to.equal(comment.threadId);
                expect(comment.account.name).to.equal('root');
                expect(comment.account.host).to.equal('localhost:' + server.port);
                yield extra_utils_1.testImage(server.url, 'avatar-resized', comment.account.avatar.path, '.png');
                expect(comment.totalReplies).to.equal(0);
                expect(comment.totalRepliesFromVideoAuthor).to.equal(0);
                expect(extra_utils_1.dateIsValid(comment.createdAt)).to.be.true;
                expect(extra_utils_1.dateIsValid(comment.updatedAt)).to.be.true;
                threadId = comment.threadId;
            });
        });
        it('Should get all the thread created', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.getThread({ videoId: videoUUID, threadId });
                const rootComment = body.comment;
                expect(rootComment.inReplyToCommentId).to.be.null;
                expect(rootComment.text).equal('my super first comment');
                expect(rootComment.videoId).to.equal(videoId);
                expect(extra_utils_1.dateIsValid(rootComment.createdAt)).to.be.true;
                expect(extra_utils_1.dateIsValid(rootComment.updatedAt)).to.be.true;
            });
        });
        it('Should create multiple replies in this thread', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const text1 = 'my super answer to thread 1';
                const created = yield command.addReply({ videoId, toCommentId: threadId, text: text1 });
                const childCommentId = created.id;
                const text2 = 'my super answer to answer of thread 1';
                yield command.addReply({ videoId, toCommentId: childCommentId, text: text2 });
                const text3 = 'my second answer to thread 1';
                yield command.addReply({ videoId, toCommentId: threadId, text: text3 });
            });
        });
        it('Should get correctly the replies', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const tree = yield command.getThread({ videoId: videoUUID, threadId });
                expect(tree.comment.text).equal('my super first comment');
                expect(tree.children).to.have.lengthOf(2);
                const firstChild = tree.children[0];
                expect(firstChild.comment.text).to.equal('my super answer to thread 1');
                expect(firstChild.children).to.have.lengthOf(1);
                const childOfFirstChild = firstChild.children[0];
                expect(childOfFirstChild.comment.text).to.equal('my super answer to answer of thread 1');
                expect(childOfFirstChild.children).to.have.lengthOf(0);
                const secondChild = tree.children[1];
                expect(secondChild.comment.text).to.equal('my second answer to thread 1');
                expect(secondChild.children).to.have.lengthOf(0);
                replyToDeleteId = secondChild.comment.id;
            });
        });
        it('Should create other threads', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const text1 = 'super thread 2';
                yield command.createThread({ videoId: videoUUID, text: text1 });
                const text2 = 'super thread 3';
                yield command.createThread({ videoId: videoUUID, text: text2 });
            });
        });
        it('Should list the threads', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield command.listThreads({ videoId: videoUUID, sort: 'createdAt' });
                expect(body.total).to.equal(3);
                expect(body.totalNotDeletedComments).to.equal(6);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(3);
                expect(body.data[0].text).to.equal('my super first comment');
                expect(body.data[0].totalReplies).to.equal(3);
                expect(body.data[1].text).to.equal('super thread 2');
                expect(body.data[1].totalReplies).to.equal(0);
                expect(body.data[2].text).to.equal('super thread 3');
                expect(body.data[2].totalReplies).to.equal(0);
            });
        });
        it('Should delete a reply', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.delete({ videoId, commentId: replyToDeleteId });
                {
                    const body = yield command.listThreads({ videoId: videoUUID, sort: 'createdAt' });
                    expect(body.total).to.equal(3);
                    expect(body.totalNotDeletedComments).to.equal(5);
                }
                {
                    const tree = yield command.getThread({ videoId: videoUUID, threadId });
                    expect(tree.comment.text).equal('my super first comment');
                    expect(tree.children).to.have.lengthOf(2);
                    const firstChild = tree.children[0];
                    expect(firstChild.comment.text).to.equal('my super answer to thread 1');
                    expect(firstChild.children).to.have.lengthOf(1);
                    const childOfFirstChild = firstChild.children[0];
                    expect(childOfFirstChild.comment.text).to.equal('my super answer to answer of thread 1');
                    expect(childOfFirstChild.children).to.have.lengthOf(0);
                    const deletedChildOfFirstChild = tree.children[1];
                    expect(deletedChildOfFirstChild.comment.text).to.equal('');
                    expect(deletedChildOfFirstChild.comment.isDeleted).to.be.true;
                    expect(deletedChildOfFirstChild.comment.deletedAt).to.not.be.null;
                    expect(deletedChildOfFirstChild.comment.account).to.be.null;
                    expect(deletedChildOfFirstChild.children).to.have.lengthOf(0);
                }
            });
        });
        it('Should delete a complete thread', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.delete({ videoId, commentId: threadId });
                const body = yield command.listThreads({ videoId: videoUUID, sort: 'createdAt' });
                expect(body.total).to.equal(3);
                expect(body.data).to.be.an('array');
                expect(body.data).to.have.lengthOf(3);
                expect(body.data[0].text).to.equal('');
                expect(body.data[0].isDeleted).to.be.true;
                expect(body.data[0].deletedAt).to.not.be.null;
                expect(body.data[0].account).to.be.null;
                expect(body.data[0].totalReplies).to.equal(2);
                expect(body.data[1].text).to.equal('super thread 2');
                expect(body.data[1].totalReplies).to.equal(0);
                expect(body.data[2].text).to.equal('super thread 3');
                expect(body.data[2].totalReplies).to.equal(0);
            });
        });
        it('Should count replies from the video author correctly', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield command.createThread({ videoId: videoUUID, text: 'my super first comment' });
                const { data } = yield command.listThreads({ videoId: videoUUID });
                const threadId2 = data[0].threadId;
                const text2 = 'a first answer to thread 4 by a third party';
                yield command.addReply({ token: userAccessTokenServer1, videoId, toCommentId: threadId2, text: text2 });
                const text3 = 'my second answer to thread 4';
                yield command.addReply({ videoId, toCommentId: threadId2, text: text3 });
                const tree = yield command.getThread({ videoId: videoUUID, threadId: threadId2 });
                expect(tree.comment.totalReplies).to.equal(tree.comment.totalRepliesFromVideoAuthor + 1);
            });
        });
    });
    describe('All instance comments', function () {
        it('Should list instance comments as admin', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { data } = yield command.listForAdmin({ start: 0, count: 1 });
                expect(data[0].text).to.equal('my second answer to thread 4');
            });
        });
        it('Should filter instance comments by isLocal', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield command.listForAdmin({ isLocal: false });
                expect(data).to.have.lengthOf(0);
                expect(total).to.equal(0);
            });
        });
        it('Should search instance comments by account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield command.listForAdmin({ searchAccount: 'user' });
                expect(data).to.have.lengthOf(1);
                expect(total).to.equal(1);
                expect(data[0].text).to.equal('a first answer to thread 4 by a third party');
            });
        });
        it('Should search instance comments by video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const { total, data } = yield command.listForAdmin({ searchVideo: 'video' });
                    expect(data).to.have.lengthOf(7);
                    expect(total).to.equal(7);
                }
                {
                    const { total, data } = yield command.listForAdmin({ searchVideo: 'hello' });
                    expect(data).to.have.lengthOf(0);
                    expect(total).to.equal(0);
                }
            });
        });
        it('Should search instance comments', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield command.listForAdmin({ search: 'super thread 3' });
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
                expect(data[0].text).to.equal('super thread 3');
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
