"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test handle downs', function () {
    let servers = [];
    let threadIdServer1;
    let threadIdServer2;
    let commentIdServer1;
    let commentIdServer2;
    let missedVideo1;
    let missedVideo2;
    let unlistedVideo;
    const videoIdsServer1 = [];
    const videoAttributes = {
        name: 'my super name for server 1',
        category: 5,
        licence: 4,
        language: 'ja',
        nsfw: true,
        privacy: 1,
        description: 'my super description for server 1',
        support: 'my super support text for server 1',
        tags: ['tag1p1', 'tag2p1'],
        fixture: 'video_short1.webm'
    };
    const unlistedVideoAttributes = Object.assign(Object.assign({}, videoAttributes), { privacy: 2 });
    let checkAttributes;
    let unlistedCheckAttributes;
    let commentCommands;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(3);
            commentCommands = servers.map(s => s.comments);
            checkAttributes = {
                name: 'my super name for server 1',
                category: 5,
                licence: 4,
                language: 'ja',
                nsfw: true,
                description: 'my super description for server 1',
                support: 'my super support text for server 1',
                account: {
                    name: 'root',
                    host: 'localhost:' + servers[0].port
                },
                isLocal: false,
                duration: 10,
                tags: ['tag1p1', 'tag2p1'],
                privacy: 1,
                commentsEnabled: true,
                downloadEnabled: true,
                channel: {
                    name: 'root_channel',
                    displayName: 'Main root channel',
                    description: '',
                    isLocal: false
                },
                fixture: 'video_short1.webm',
                files: [
                    {
                        resolution: 720,
                        size: 572456
                    }
                ]
            };
            unlistedCheckAttributes = Object.assign(Object.assign({}, checkAttributes), { privacy: 2 });
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
        });
    });
    it('Should remove followers that are often down', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(240000);
            yield servers[1].follows.follow({ hosts: [servers[0].url] });
            yield servers[2].follows.follow({ hosts: [servers[0].url] });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield servers[0].videos.upload({ attributes: videoAttributes });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { data } = yield server.videos.list();
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(1);
            }
            yield (0, extra_utils_1.killallServers)([servers[1]]);
            for (let i = 0; i < 10; i++) {
                yield servers[0].videos.upload({ attributes: videoAttributes });
            }
            yield (0, extra_utils_1.waitJobs)([servers[0], servers[2]]);
            yield (0, extra_utils_1.killallServers)([servers[2]]);
            missedVideo1 = yield servers[0].videos.upload({ attributes: videoAttributes });
            missedVideo2 = yield servers[0].videos.upload({ attributes: videoAttributes });
            unlistedVideo = yield servers[0].videos.upload({ attributes: unlistedVideoAttributes });
            {
                const text = 'thread 1';
                let comment = yield commentCommands[0].createThread({ videoId: missedVideo2.uuid, text });
                threadIdServer1 = comment.id;
                comment = yield commentCommands[0].addReply({ videoId: missedVideo2.uuid, toCommentId: comment.id, text: 'comment 1-1' });
                const created = yield commentCommands[0].addReply({ videoId: missedVideo2.uuid, toCommentId: comment.id, text: 'comment 1-2' });
                commentIdServer1 = created.id;
            }
            yield (0, extra_utils_1.waitJobs)(servers[0]);
            yield (0, extra_utils_1.wait)(11000);
            const body = yield servers[0].follows.getFollowers({ start: 0, count: 2, sort: 'createdAt' });
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(1);
            expect(body.data[0].follower.host).to.equal('localhost:' + servers[2].port);
        });
    });
    it('Should not have pending/processing jobs anymore', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const states = ['waiting', 'active'];
            for (const state of states) {
                const body = yield servers[0].jobs.list({
                    state: state,
                    start: 0,
                    count: 50,
                    sort: '-createdAt'
                });
                expect(body.data).to.have.length(0);
            }
        });
    });
    it('Should re-follow server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(35000);
            yield servers[1].run();
            yield servers[2].run();
            yield servers[1].follows.unfollow({ target: servers[0] });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield servers[1].follows.follow({ hosts: [servers[0].url] });
            yield (0, extra_utils_1.waitJobs)(servers);
            const body = yield servers[0].follows.getFollowers({ start: 0, count: 2, sort: 'createdAt' });
            expect(body.data).to.be.an('array');
            expect(body.data).to.have.lengthOf(2);
        });
    });
    it('Should send an update to server 3, and automatically fetch the video', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            {
                const { data } = yield servers[2].videos.list();
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(11);
            }
            yield servers[0].videos.update({ id: missedVideo1.uuid });
            yield servers[0].videos.update({ id: unlistedVideo.uuid });
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const { data } = yield servers[2].videos.list();
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(12);
            }
            const video = yield servers[2].videos.get({ id: unlistedVideo.uuid });
            yield (0, extra_utils_1.completeVideoCheck)(servers[2], video, unlistedCheckAttributes);
        });
    });
    it('Should send comments on a video to server 3, and automatically fetch the video', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(25000);
            yield commentCommands[0].addReply({ videoId: missedVideo2.uuid, toCommentId: commentIdServer1, text: 'comment 1-3' });
            yield (0, extra_utils_1.waitJobs)(servers);
            yield servers[2].videos.get({ id: missedVideo2.uuid });
            {
                const { data } = yield servers[2].comments.listThreads({ videoId: missedVideo2.uuid });
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(1);
                threadIdServer2 = data[0].id;
                const tree = yield servers[2].comments.getThread({ videoId: missedVideo2.uuid, threadId: threadIdServer2 });
                expect(tree.comment.text).equal('thread 1');
                expect(tree.children).to.have.lengthOf(1);
                const firstChild = tree.children[0];
                expect(firstChild.comment.text).to.equal('comment 1-1');
                expect(firstChild.children).to.have.lengthOf(1);
                const childOfFirstChild = firstChild.children[0];
                expect(childOfFirstChild.comment.text).to.equal('comment 1-2');
                expect(childOfFirstChild.children).to.have.lengthOf(1);
                const childOfChildFirstChild = childOfFirstChild.children[0];
                expect(childOfChildFirstChild.comment.text).to.equal('comment 1-3');
                expect(childOfChildFirstChild.children).to.have.lengthOf(0);
                commentIdServer2 = childOfChildFirstChild.comment.id;
            }
        });
    });
    it('Should correctly reply to the comment', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(15000);
            yield servers[2].comments.addReply({ videoId: missedVideo2.uuid, toCommentId: commentIdServer2, text: 'comment 1-4' });
            yield (0, extra_utils_1.waitJobs)(servers);
            const tree = yield commentCommands[0].getThread({ videoId: missedVideo2.uuid, threadId: threadIdServer1 });
            expect(tree.comment.text).equal('thread 1');
            expect(tree.children).to.have.lengthOf(1);
            const firstChild = tree.children[0];
            expect(firstChild.comment.text).to.equal('comment 1-1');
            expect(firstChild.children).to.have.lengthOf(1);
            const childOfFirstChild = firstChild.children[0];
            expect(childOfFirstChild.comment.text).to.equal('comment 1-2');
            expect(childOfFirstChild.children).to.have.lengthOf(1);
            const childOfChildFirstChild = childOfFirstChild.children[0];
            expect(childOfChildFirstChild.comment.text).to.equal('comment 1-3');
            expect(childOfChildFirstChild.children).to.have.lengthOf(1);
            const childOfChildOfChildOfFirstChild = childOfChildFirstChild.children[0];
            expect(childOfChildOfChildOfFirstChild.comment.text).to.equal('comment 1-4');
            expect(childOfChildOfChildOfFirstChild.children).to.have.lengthOf(0);
        });
    });
    it('Should upload many videos on server 1', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            for (let i = 0; i < 10; i++) {
                const uuid = (yield servers[0].videos.quickUpload({ name: 'video ' + i })).uuid;
                videoIdsServer1.push(uuid);
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const id of videoIdsServer1) {
                yield servers[1].videos.get({ id });
            }
            yield (0, extra_utils_1.waitJobs)(servers);
            yield servers[1].sql.setActorFollowScores(20);
            yield (0, extra_utils_1.wait)(11000);
            yield servers[1].videos.get({ id: videoIdsServer1[0] });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should remove followings that are down', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield (0, extra_utils_1.killallServers)([servers[0]]);
            yield (0, extra_utils_1.wait)(11000);
            for (let i = 0; i < 5; i++) {
                try {
                    yield servers[1].videos.get({ id: videoIdsServer1[i] });
                    yield (0, extra_utils_1.waitJobs)([servers[1]]);
                    yield (0, extra_utils_1.wait)(1500);
                }
                catch (_a) { }
            }
            for (const id of videoIdsServer1) {
                yield servers[1].videos.get({ id, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
