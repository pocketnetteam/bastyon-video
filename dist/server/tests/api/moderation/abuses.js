"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test abuses', function () {
    let servers = [];
    let abuseServer1;
    let abuseServer2;
    let commands;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(50000);
            servers = yield extra_utils_1.createMultipleServers(2);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            commands = servers.map(s => s.abuses);
        });
    });
    describe('Video abuses', function () {
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                {
                    const attributes = {
                        name: 'my super name for server 1',
                        description: 'my super description for server 1'
                    };
                    yield servers[0].videos.upload({ attributes });
                }
                {
                    const attributes = {
                        name: 'my super name for server 2',
                        description: 'my super description for server 2'
                    };
                    yield servers[1].videos.upload({ attributes });
                }
                yield extra_utils_1.waitJobs(servers);
                const { data } = yield servers[0].videos.list();
                expect(data.length).to.equal(2);
                servers[0].store.videoCreated = data.find(video => video.name === 'my super name for server 1');
                servers[1].store.videoCreated = data.find(video => video.name === 'my super name for server 2');
            });
        });
        it('Should not have abuses', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield commands[0].getAdminList();
                expect(body.total).to.equal(0);
                expect(body.data).to.be.an('array');
                expect(body.data.length).to.equal(0);
            });
        });
        it('Should report abuse on a local video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                const reason = 'my super bad reason';
                yield commands[0].report({ videoId: servers[0].store.videoCreated.id, reason });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should have 1 video abuses on server 1 and 0 on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(1);
                    expect(body.data).to.be.an('array');
                    expect(body.data.length).to.equal(1);
                    const abuse = body.data[0];
                    expect(abuse.reason).to.equal('my super bad reason');
                    expect(abuse.reporterAccount.name).to.equal('root');
                    expect(abuse.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse.video.id).to.equal(servers[0].store.videoCreated.id);
                    expect(abuse.video.channel).to.exist;
                    expect(abuse.comment).to.be.null;
                    expect(abuse.flaggedAccount.name).to.equal('root');
                    expect(abuse.flaggedAccount.host).to.equal(servers[0].host);
                    expect(abuse.video.countReports).to.equal(1);
                    expect(abuse.video.nthReport).to.equal(1);
                    expect(abuse.countReportsForReporter).to.equal(1);
                    expect(abuse.countReportsForReportee).to.equal(1);
                }
                {
                    const body = yield commands[1].getAdminList();
                    expect(body.total).to.equal(0);
                    expect(body.data).to.be.an('array');
                    expect(body.data.length).to.equal(0);
                }
            });
        });
        it('Should report abuse on a remote video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const reason = 'my super bad reason 2';
                const videoId = yield servers[0].videos.getId({ uuid: servers[1].store.videoCreated.uuid });
                yield commands[0].report({ videoId, reason });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should have 2 video abuses on server 1 and 1 on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(2);
                    expect(body.data.length).to.equal(2);
                    const abuse1 = body.data[0];
                    expect(abuse1.reason).to.equal('my super bad reason');
                    expect(abuse1.reporterAccount.name).to.equal('root');
                    expect(abuse1.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse1.video.id).to.equal(servers[0].store.videoCreated.id);
                    expect(abuse1.video.countReports).to.equal(1);
                    expect(abuse1.video.nthReport).to.equal(1);
                    expect(abuse1.comment).to.be.null;
                    expect(abuse1.flaggedAccount.name).to.equal('root');
                    expect(abuse1.flaggedAccount.host).to.equal(servers[0].host);
                    expect(abuse1.state.id).to.equal(1);
                    expect(abuse1.state.label).to.equal('Pending');
                    expect(abuse1.moderationComment).to.be.null;
                    const abuse2 = body.data[1];
                    expect(abuse2.reason).to.equal('my super bad reason 2');
                    expect(abuse2.reporterAccount.name).to.equal('root');
                    expect(abuse2.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse2.video.id).to.equal(servers[1].store.videoCreated.id);
                    expect(abuse2.comment).to.be.null;
                    expect(abuse2.flaggedAccount.name).to.equal('root');
                    expect(abuse2.flaggedAccount.host).to.equal(servers[1].host);
                    expect(abuse2.state.id).to.equal(1);
                    expect(abuse2.state.label).to.equal('Pending');
                    expect(abuse2.moderationComment).to.be.null;
                }
                {
                    const body = yield commands[1].getAdminList();
                    expect(body.total).to.equal(1);
                    expect(body.data.length).to.equal(1);
                    abuseServer2 = body.data[0];
                    expect(abuseServer2.reason).to.equal('my super bad reason 2');
                    expect(abuseServer2.reporterAccount.name).to.equal('root');
                    expect(abuseServer2.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuseServer2.flaggedAccount.name).to.equal('root');
                    expect(abuseServer2.flaggedAccount.host).to.equal(servers[1].host);
                    expect(abuseServer2.state.id).to.equal(1);
                    expect(abuseServer2.state.label).to.equal('Pending');
                    expect(abuseServer2.moderationComment).to.be.null;
                }
            });
        });
        it('Should hide video abuses from blocked accounts', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                {
                    const videoId = yield servers[1].videos.getId({ uuid: servers[0].store.videoCreated.uuid });
                    yield commands[1].report({ videoId, reason: 'will mute this' });
                    yield extra_utils_1.waitJobs(servers);
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(3);
                }
                const accountToBlock = 'root@' + servers[1].host;
                {
                    yield servers[0].blocklist.addToServerBlocklist({ account: accountToBlock });
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(2);
                    const abuse = body.data.find(a => a.reason === 'will mute this');
                    expect(abuse).to.be.undefined;
                }
                {
                    yield servers[0].blocklist.removeFromServerBlocklist({ account: accountToBlock });
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(3);
                }
            });
        });
        it('Should hide video abuses from blocked servers', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const serverToBlock = servers[1].host;
                {
                    yield servers[0].blocklist.addToServerBlocklist({ server: serverToBlock });
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(2);
                    const abuse = body.data.find(a => a.reason === 'will mute this');
                    expect(abuse).to.be.undefined;
                }
                {
                    yield servers[0].blocklist.removeFromServerBlocklist({ server: serverToBlock });
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(3);
                }
            });
        });
        it('Should keep the video abuse when deleting the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[1].videos.remove({ id: abuseServer2.video.uuid });
                yield extra_utils_1.waitJobs(servers);
                const body = yield commands[1].getAdminList();
                expect(body.total).to.equal(2, "wrong number of videos returned");
                expect(body.data).to.have.lengthOf(2, "wrong number of videos returned");
                const abuse = body.data[0];
                expect(abuse.id).to.equal(abuseServer2.id, "wrong origin server id for first video");
                expect(abuse.video.id).to.equal(abuseServer2.video.id, "wrong video id");
                expect(abuse.video.channel).to.exist;
                expect(abuse.video.deleted).to.be.true;
            });
        });
        it('Should include counts of reports from reporter and reportee', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const user = { username: 'user2', password: 'password' };
                yield servers[0].users.create(Object.assign({}, user));
                const userAccessToken = yield servers[0].login.getAccessToken(user);
                const attributes = {
                    name: 'my second super name for server 1',
                    description: 'my second super description for server 1'
                };
                const { id } = yield servers[0].videos.upload({ token: userAccessToken, attributes });
                const video3Id = id;
                const reason3 = 'my super bad reason 3';
                yield commands[0].report({ videoId: video3Id, reason: reason3 });
                const reason4 = 'my super bad reason 4';
                yield commands[0].report({ token: userAccessToken, videoId: servers[0].store.videoCreated.id, reason: reason4 });
                {
                    const body = yield commands[0].getAdminList();
                    const abuses = body.data;
                    const abuseVideo3 = body.data.find(a => a.video.id === video3Id);
                    expect(abuseVideo3).to.not.be.undefined;
                    expect(abuseVideo3.video.countReports).to.equal(1, "wrong reports count for video 3");
                    expect(abuseVideo3.video.nthReport).to.equal(1, "wrong report position in report list for video 3");
                    expect(abuseVideo3.countReportsForReportee).to.equal(1, "wrong reports count for reporter on video 3 abuse");
                    expect(abuseVideo3.countReportsForReporter).to.equal(3, "wrong reports count for reportee on video 3 abuse");
                    const abuseServer1 = abuses.find(a => a.video.id === servers[0].store.videoCreated.id);
                    expect(abuseServer1.countReportsForReportee).to.equal(3, "wrong reports count for reporter on video 1 abuse");
                }
            });
        });
        it('Should list predefined reasons as well as timestamps for the reported video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const reason5 = 'my super bad reason 5';
                const predefinedReasons5 = ['violentOrRepulsive', 'captions'];
                const createRes = yield commands[0].report({
                    videoId: servers[0].store.videoCreated.id,
                    reason: reason5,
                    predefinedReasons: predefinedReasons5,
                    startAt: 1,
                    endAt: 5
                });
                const body = yield commands[0].getAdminList();
                {
                    const abuse = body.data.find(a => a.id === createRes.abuse.id);
                    expect(abuse.reason).to.equals(reason5);
                    expect(abuse.predefinedReasons).to.deep.equals(predefinedReasons5, "predefined reasons do not match the one reported");
                    expect(abuse.video.startAt).to.equal(1, "starting timestamp doesn't match the one reported");
                    expect(abuse.video.endAt).to.equal(5, "ending timestamp doesn't match the one reported");
                }
            });
        });
        it('Should delete the video abuse', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield commands[1].delete({ abuseId: abuseServer2.id });
                yield extra_utils_1.waitJobs(servers);
                {
                    const body = yield commands[1].getAdminList();
                    expect(body.total).to.equal(1);
                    expect(body.data.length).to.equal(1);
                    expect(body.data[0].id).to.not.equal(abuseServer2.id);
                }
                {
                    const body = yield commands[0].getAdminList();
                    expect(body.total).to.equal(6);
                }
            });
        });
        it('Should list and filter video abuses', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                function list(query) {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const body = yield commands[0].getAdminList(query);
                        return body.data;
                    });
                }
                expect(yield list({ id: 56 })).to.have.lengthOf(0);
                expect(yield list({ id: 1 })).to.have.lengthOf(1);
                expect(yield list({ search: 'my super name for server 1' })).to.have.lengthOf(4);
                expect(yield list({ search: 'aaaaaaaaaaaaaaaaaaaaaaaaaa' })).to.have.lengthOf(0);
                expect(yield list({ searchVideo: 'my second super name for server 1' })).to.have.lengthOf(1);
                expect(yield list({ searchVideoChannel: 'root' })).to.have.lengthOf(4);
                expect(yield list({ searchVideoChannel: 'aaaa' })).to.have.lengthOf(0);
                expect(yield list({ searchReporter: 'user2' })).to.have.lengthOf(1);
                expect(yield list({ searchReporter: 'root' })).to.have.lengthOf(5);
                expect(yield list({ searchReportee: 'root' })).to.have.lengthOf(5);
                expect(yield list({ searchReportee: 'aaaa' })).to.have.lengthOf(0);
                expect(yield list({ videoIs: 'deleted' })).to.have.lengthOf(1);
                expect(yield list({ videoIs: 'blacklisted' })).to.have.lengthOf(0);
                expect(yield list({ state: 3 })).to.have.lengthOf(0);
                expect(yield list({ state: 1 })).to.have.lengthOf(6);
                expect(yield list({ predefinedReason: 'violentOrRepulsive' })).to.have.lengthOf(1);
                expect(yield list({ predefinedReason: 'serverRules' })).to.have.lengthOf(0);
            });
        });
    });
    describe('Comment abuses', function () {
        function getComment(server, videoIdArg) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const videoId = typeof videoIdArg === 'string'
                    ? yield server.videos.getId({ uuid: videoIdArg })
                    : videoIdArg;
                const { data } = yield server.comments.listThreads({ videoId });
                return data[0];
            });
        }
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                servers[0].store.videoCreated = yield servers[0].videos.quickUpload({ name: 'server 1' });
                servers[1].store.videoCreated = yield servers[1].videos.quickUpload({ name: 'server 2' });
                yield servers[0].comments.createThread({ videoId: servers[0].store.videoCreated.id, text: 'comment server 1' });
                yield servers[1].comments.createThread({ videoId: servers[1].store.videoCreated.id, text: 'comment server 2' });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should report abuse on a comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                const comment = yield getComment(servers[0], servers[0].store.videoCreated.id);
                const reason = 'it is a bad comment';
                yield commands[0].report({ commentId: comment.id, reason });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should have 1 comment abuse on server 1 and 0 on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const comment = yield getComment(servers[0], servers[0].store.videoCreated.id);
                    const body = yield commands[0].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(1);
                    expect(body.data).to.have.lengthOf(1);
                    const abuse = body.data[0];
                    expect(abuse.reason).to.equal('it is a bad comment');
                    expect(abuse.reporterAccount.name).to.equal('root');
                    expect(abuse.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse.video).to.be.null;
                    expect(abuse.comment.deleted).to.be.false;
                    expect(abuse.comment.id).to.equal(comment.id);
                    expect(abuse.comment.text).to.equal(comment.text);
                    expect(abuse.comment.video.name).to.equal('server 1');
                    expect(abuse.comment.video.id).to.equal(servers[0].store.videoCreated.id);
                    expect(abuse.comment.video.uuid).to.equal(servers[0].store.videoCreated.uuid);
                    expect(abuse.countReportsForReporter).to.equal(5);
                    expect(abuse.countReportsForReportee).to.equal(5);
                }
                {
                    const body = yield commands[1].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(0);
                    expect(body.data.length).to.equal(0);
                }
            });
        });
        it('Should report abuse on a remote comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const comment = yield getComment(servers[0], servers[1].store.videoCreated.uuid);
                const reason = 'it is a really bad comment';
                yield commands[0].report({ commentId: comment.id, reason });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should have 2 comment abuses on server 1 and 1 on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const commentServer2 = yield getComment(servers[0], servers[1].store.videoCreated.id);
                {
                    const body = yield commands[0].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(2);
                    expect(body.data.length).to.equal(2);
                    const abuse = body.data[0];
                    expect(abuse.reason).to.equal('it is a bad comment');
                    expect(abuse.countReportsForReporter).to.equal(6);
                    expect(abuse.countReportsForReportee).to.equal(5);
                    const abuse2 = body.data[1];
                    expect(abuse2.reason).to.equal('it is a really bad comment');
                    expect(abuse2.reporterAccount.name).to.equal('root');
                    expect(abuse2.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse2.video).to.be.null;
                    expect(abuse2.comment.deleted).to.be.false;
                    expect(abuse2.comment.id).to.equal(commentServer2.id);
                    expect(abuse2.comment.text).to.equal(commentServer2.text);
                    expect(abuse2.comment.video.name).to.equal('server 2');
                    expect(abuse2.comment.video.uuid).to.equal(servers[1].store.videoCreated.uuid);
                    expect(abuse2.state.id).to.equal(1);
                    expect(abuse2.state.label).to.equal('Pending');
                    expect(abuse2.moderationComment).to.be.null;
                    expect(abuse2.countReportsForReporter).to.equal(6);
                    expect(abuse2.countReportsForReportee).to.equal(2);
                }
                {
                    const body = yield commands[1].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(1);
                    expect(body.data.length).to.equal(1);
                    abuseServer2 = body.data[0];
                    expect(abuseServer2.reason).to.equal('it is a really bad comment');
                    expect(abuseServer2.reporterAccount.name).to.equal('root');
                    expect(abuseServer2.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuseServer2.state.id).to.equal(1);
                    expect(abuseServer2.state.label).to.equal('Pending');
                    expect(abuseServer2.moderationComment).to.be.null;
                    expect(abuseServer2.countReportsForReporter).to.equal(1);
                    expect(abuseServer2.countReportsForReportee).to.equal(1);
                }
            });
        });
        it('Should keep the comment abuse when deleting the comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const commentServer2 = yield getComment(servers[0], servers[1].store.videoCreated.id);
                yield servers[0].comments.delete({ videoId: servers[1].store.videoCreated.uuid, commentId: commentServer2.id });
                yield extra_utils_1.waitJobs(servers);
                const body = yield commands[0].getAdminList({ filter: 'comment' });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                const abuse = body.data.find(a => { var _a; return ((_a = a.comment) === null || _a === void 0 ? void 0 : _a.id) === commentServer2.id; });
                expect(abuse).to.not.be.undefined;
                expect(abuse.comment.text).to.be.empty;
                expect(abuse.comment.video.name).to.equal('server 2');
                expect(abuse.comment.deleted).to.be.true;
            });
        });
        it('Should delete the comment abuse', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield commands[1].delete({ abuseId: abuseServer2.id });
                yield extra_utils_1.waitJobs(servers);
                {
                    const body = yield commands[1].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(0);
                    expect(body.data.length).to.equal(0);
                }
                {
                    const body = yield commands[0].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(2);
                }
            });
        });
        it('Should list and filter video abuses', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const body = yield commands[0].getAdminList({ filter: 'comment', searchReportee: 'foo' });
                    expect(body.total).to.equal(0);
                }
                {
                    const body = yield commands[0].getAdminList({ filter: 'comment', searchReportee: 'ot' });
                    expect(body.total).to.equal(2);
                }
                {
                    const body = yield commands[0].getAdminList({ filter: 'comment', start: 1, count: 1, sort: 'createdAt' });
                    expect(body.data).to.have.lengthOf(1);
                    expect(body.data[0].comment.text).to.be.empty;
                }
                {
                    const body = yield commands[0].getAdminList({ filter: 'comment', start: 1, count: 1, sort: '-createdAt' });
                    expect(body.data).to.have.lengthOf(1);
                    expect(body.data[0].comment.text).to.equal('comment server 1');
                }
            });
        });
    });
    describe('Account abuses', function () {
        function getAccountFromServer(server, targetName, targetServer) {
            return server.accounts.get({ accountName: targetName + '@' + targetServer.host });
        }
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(50000);
                yield servers[0].users.create({ username: 'user_1', password: 'donald' });
                const token = yield servers[1].users.generateUserAndToken('user_2');
                yield servers[1].videos.upload({ token, attributes: { name: 'super video' } });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should report abuse on an account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                const account = yield getAccountFromServer(servers[0], 'user_1', servers[0]);
                const reason = 'it is a bad account';
                yield commands[0].report({ accountId: account.id, reason });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should have 1 account abuse on server 1 and 0 on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const body = yield commands[0].getAdminList({ filter: 'account' });
                    expect(body.total).to.equal(1);
                    expect(body.data).to.have.lengthOf(1);
                    const abuse = body.data[0];
                    expect(abuse.reason).to.equal('it is a bad account');
                    expect(abuse.reporterAccount.name).to.equal('root');
                    expect(abuse.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse.video).to.be.null;
                    expect(abuse.comment).to.be.null;
                    expect(abuse.flaggedAccount.name).to.equal('user_1');
                    expect(abuse.flaggedAccount.host).to.equal(servers[0].host);
                }
                {
                    const body = yield commands[1].getAdminList({ filter: 'comment' });
                    expect(body.total).to.equal(0);
                    expect(body.data.length).to.equal(0);
                }
            });
        });
        it('Should report abuse on a remote account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const account = yield getAccountFromServer(servers[0], 'user_2', servers[1]);
                const reason = 'it is a really bad account';
                yield commands[0].report({ accountId: account.id, reason });
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should have 2 comment abuses on server 1 and 1 on server 2', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const body = yield commands[0].getAdminList({ filter: 'account' });
                    expect(body.total).to.equal(2);
                    expect(body.data.length).to.equal(2);
                    const abuse = body.data[0];
                    expect(abuse.reason).to.equal('it is a bad account');
                    const abuse2 = body.data[1];
                    expect(abuse2.reason).to.equal('it is a really bad account');
                    expect(abuse2.reporterAccount.name).to.equal('root');
                    expect(abuse2.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuse2.video).to.be.null;
                    expect(abuse2.comment).to.be.null;
                    expect(abuse2.state.id).to.equal(1);
                    expect(abuse2.state.label).to.equal('Pending');
                    expect(abuse2.moderationComment).to.be.null;
                }
                {
                    const body = yield commands[1].getAdminList({ filter: 'account' });
                    expect(body.total).to.equal(1);
                    expect(body.data.length).to.equal(1);
                    abuseServer2 = body.data[0];
                    expect(abuseServer2.reason).to.equal('it is a really bad account');
                    expect(abuseServer2.reporterAccount.name).to.equal('root');
                    expect(abuseServer2.reporterAccount.host).to.equal(servers[0].host);
                    expect(abuseServer2.state.id).to.equal(1);
                    expect(abuseServer2.state.label).to.equal('Pending');
                    expect(abuseServer2.moderationComment).to.be.null;
                }
            });
        });
        it('Should keep the account abuse when deleting the account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const account = yield getAccountFromServer(servers[1], 'user_2', servers[1]);
                yield servers[1].users.remove({ userId: account.userId });
                yield extra_utils_1.waitJobs(servers);
                const body = yield commands[0].getAdminList({ filter: 'account' });
                expect(body.total).to.equal(2);
                expect(body.data).to.have.lengthOf(2);
                const abuse = body.data.find(a => a.reason === 'it is a really bad account');
                expect(abuse).to.not.be.undefined;
            });
        });
        it('Should delete the account abuse', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield commands[1].delete({ abuseId: abuseServer2.id });
                yield extra_utils_1.waitJobs(servers);
                {
                    const body = yield commands[1].getAdminList({ filter: 'account' });
                    expect(body.total).to.equal(0);
                    expect(body.data.length).to.equal(0);
                }
                {
                    const body = yield commands[0].getAdminList({ filter: 'account' });
                    expect(body.total).to.equal(2);
                    abuseServer1 = body.data[0];
                }
            });
        });
    });
    describe('Common actions on abuses', function () {
        it('Should update the state of an abuse', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield commands[0].update({ abuseId: abuseServer1.id, body: { state: 2 } });
                const body = yield commands[0].getAdminList({ id: abuseServer1.id });
                expect(body.data[0].state.id).to.equal(2);
            });
        });
        it('Should add a moderation comment', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield commands[0].update({ abuseId: abuseServer1.id, body: { state: 3, moderationComment: 'Valid' } });
                const body = yield commands[0].getAdminList({ id: abuseServer1.id });
                expect(body.data[0].state.id).to.equal(3);
                expect(body.data[0].moderationComment).to.equal('Valid');
            });
        });
    });
    describe('My abuses', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let abuseId1;
            let userAccessToken;
            before(function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    userAccessToken = yield servers[0].users.generateUserAndToken('user_42');
                    yield commands[0].report({ token: userAccessToken, videoId: servers[0].store.videoCreated.id, reason: 'user reason 1' });
                    const videoId = yield servers[0].videos.getId({ uuid: servers[1].store.videoCreated.uuid });
                    yield commands[0].report({ token: userAccessToken, videoId, reason: 'user reason 2' });
                });
            });
            it('Should correctly list my abuses', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    {
                        const body = yield commands[0].getUserList({ token: userAccessToken, start: 0, count: 5, sort: 'createdAt' });
                        expect(body.total).to.equal(2);
                        const abuses = body.data;
                        expect(abuses[0].reason).to.equal('user reason 1');
                        expect(abuses[1].reason).to.equal('user reason 2');
                        abuseId1 = abuses[0].id;
                    }
                    {
                        const body = yield commands[0].getUserList({ token: userAccessToken, start: 1, count: 1, sort: 'createdAt' });
                        expect(body.total).to.equal(2);
                        const abuses = body.data;
                        expect(abuses[0].reason).to.equal('user reason 2');
                    }
                    {
                        const body = yield commands[0].getUserList({ token: userAccessToken, start: 1, count: 1, sort: '-createdAt' });
                        expect(body.total).to.equal(2);
                        const abuses = body.data;
                        expect(abuses[0].reason).to.equal('user reason 1');
                    }
                });
            });
            it('Should correctly filter my abuses by id', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const body = yield commands[0].getUserList({ token: userAccessToken, id: abuseId1 });
                    expect(body.total).to.equal(1);
                    const abuses = body.data;
                    expect(abuses[0].reason).to.equal('user reason 1');
                });
            });
            it('Should correctly filter my abuses by search', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const body = yield commands[0].getUserList({ token: userAccessToken, search: 'server 2' });
                    expect(body.total).to.equal(1);
                    const abuses = body.data;
                    expect(abuses[0].reason).to.equal('user reason 2');
                });
            });
            it('Should correctly filter my abuses by state', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield commands[0].update({ abuseId: abuseId1, body: { state: 2 } });
                    const body = yield commands[0].getUserList({ token: userAccessToken, state: 2 });
                    expect(body.total).to.equal(1);
                    const abuses = body.data;
                    expect(abuses[0].reason).to.equal('user reason 1');
                });
            });
        });
    });
    describe('Abuse messages', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let abuseId;
            let userToken;
            let abuseMessageUserId;
            let abuseMessageModerationId;
            before(function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    userToken = yield servers[0].users.generateUserAndToken('user_43');
                    const body = yield commands[0].report({ token: userToken, videoId: servers[0].store.videoCreated.id, reason: 'user 43 reason 1' });
                    abuseId = body.abuse.id;
                });
            });
            it('Should create some messages on the abuse', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield commands[0].addMessage({ token: userToken, abuseId, message: 'message 1' });
                    yield commands[0].addMessage({ abuseId, message: 'message 2' });
                    yield commands[0].addMessage({ abuseId, message: 'message 3' });
                    yield commands[0].addMessage({ token: userToken, abuseId, message: 'message 4' });
                });
            });
            it('Should have the correct messages count when listing abuses', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const results = yield Promise.all([
                        commands[0].getAdminList({ start: 0, count: 50 }),
                        commands[0].getUserList({ token: userToken, start: 0, count: 50 })
                    ]);
                    for (const body of results) {
                        const abuses = body.data;
                        const abuse = abuses.find(a => a.id === abuseId);
                        expect(abuse.countMessages).to.equal(4);
                    }
                });
            });
            it('Should correctly list messages of this abuse', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const results = yield Promise.all([
                        commands[0].listMessages({ abuseId }),
                        commands[0].listMessages({ token: userToken, abuseId })
                    ]);
                    for (const body of results) {
                        expect(body.total).to.equal(4);
                        const abuseMessages = body.data;
                        expect(abuseMessages[0].message).to.equal('message 1');
                        expect(abuseMessages[0].byModerator).to.be.false;
                        expect(abuseMessages[0].account.name).to.equal('user_43');
                        abuseMessageUserId = abuseMessages[0].id;
                        expect(abuseMessages[1].message).to.equal('message 2');
                        expect(abuseMessages[1].byModerator).to.be.true;
                        expect(abuseMessages[1].account.name).to.equal('root');
                        expect(abuseMessages[2].message).to.equal('message 3');
                        expect(abuseMessages[2].byModerator).to.be.true;
                        expect(abuseMessages[2].account.name).to.equal('root');
                        abuseMessageModerationId = abuseMessages[2].id;
                        expect(abuseMessages[3].message).to.equal('message 4');
                        expect(abuseMessages[3].byModerator).to.be.false;
                        expect(abuseMessages[3].account.name).to.equal('user_43');
                    }
                });
            });
            it('Should delete messages', function () {
                return tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield commands[0].deleteMessage({ abuseId, messageId: abuseMessageModerationId });
                    yield commands[0].deleteMessage({ token: userToken, abuseId, messageId: abuseMessageUserId });
                    const results = yield Promise.all([
                        commands[0].listMessages({ abuseId }),
                        commands[0].listMessages({ token: userToken, abuseId })
                    ]);
                    for (const body of results) {
                        expect(body.total).to.equal(2);
                        const abuseMessages = body.data;
                        expect(abuseMessages[0].message).to.equal('message 2');
                        expect(abuseMessages[1].message).to.equal('message 4');
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
