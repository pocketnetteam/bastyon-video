"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test users with multiple servers', function () {
    let servers = [];
    let user;
    let userId;
    let videoUUID;
    let userAccessToken;
    let userAvatarFilename;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(3);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield extra_utils_1.doubleFollow(servers[0], servers[2]);
            yield extra_utils_1.doubleFollow(servers[1], servers[2]);
            yield servers[0].videos.upload();
            {
                const username = 'user1';
                const created = yield servers[0].users.create({ username });
                userId = created.id;
                userAccessToken = yield servers[0].login.getAccessToken(username);
            }
            {
                const { uuid } = yield servers[0].videos.upload({ token: userAccessToken });
                videoUUID = uuid;
                yield extra_utils_1.waitJobs(servers);
                yield extra_utils_1.saveVideoInServers(servers, videoUUID);
            }
        });
    });
    it('Should be able to update my display name', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield servers[0].users.updateMe({ displayName: 'my super display name' });
            user = yield servers[0].users.getMyInfo();
            expect(user.account.displayName).to.equal('my super display name');
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should be able to update my description', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield servers[0].users.updateMe({ description: 'my super description updated' });
            user = yield servers[0].users.getMyInfo();
            expect(user.account.displayName).to.equal('my super display name');
            expect(user.account.description).to.equal('my super description updated');
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should be able to update my avatar', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const fixture = 'avatar2.png';
            yield servers[0].users.updateMyAvatar({ fixture });
            user = yield servers[0].users.getMyInfo();
            userAvatarFilename = user.account.avatar.path;
            yield extra_utils_1.testImage(servers[0].url, 'avatar2-resized', userAvatarFilename, '.png');
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should have updated my profile on other servers too', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let createdAt;
            for (const server of servers) {
                const body = yield server.accounts.list({ sort: '-createdAt' });
                const resList = body.data.find(a => a.name === 'root' && a.host === 'localhost:' + servers[0].port);
                expect(resList).not.to.be.undefined;
                const account = yield server.accounts.get({ accountName: resList.name + '@' + resList.host });
                if (!createdAt)
                    createdAt = account.createdAt;
                expect(account.name).to.equal('root');
                expect(account.host).to.equal('localhost:' + servers[0].port);
                expect(account.displayName).to.equal('my super display name');
                expect(account.description).to.equal('my super description updated');
                expect(createdAt).to.equal(account.createdAt);
                if (server.serverNumber === 1) {
                    expect(account.userId).to.be.a('number');
                }
                else {
                    expect(account.userId).to.be.undefined;
                }
                yield extra_utils_1.testImage(server.url, 'avatar2-resized', account.avatar.path, '.png');
            }
        });
    });
    it('Should list account videos', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                const { total, data } = yield server.videos.listByAccount({ handle: 'user1@localhost:' + servers[0].port });
                expect(total).to.equal(1);
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(1);
                expect(data[0].uuid).to.equal(videoUUID);
            }
        });
    });
    it('Should search through account videos', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const created = yield servers[0].videos.upload({ token: userAccessToken, attributes: { name: 'Kami no chikara' } });
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const { total, data } = yield server.videos.listByAccount({ handle: 'user1@localhost:' + servers[0].port, search: 'Kami' });
                expect(total).to.equal(1);
                expect(data).to.be.an('array');
                expect(data).to.have.lengthOf(1);
                expect(data[0].uuid).to.equal(created.uuid);
            }
        });
    });
    it('Should remove the user', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            for (const server of servers) {
                const body = yield server.accounts.list({ sort: '-createdAt' });
                const accountDeleted = body.data.find(a => a.name === 'user1' && a.host === 'localhost:' + servers[0].port);
                expect(accountDeleted).not.to.be.undefined;
                const { data } = yield server.channels.list();
                const videoChannelDeleted = data.find(a => a.displayName === 'Main user1 channel' && a.host === 'localhost:' + servers[0].port);
                expect(videoChannelDeleted).not.to.be.undefined;
            }
            yield servers[0].users.remove({ userId });
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const body = yield server.accounts.list({ sort: '-createdAt' });
                const accountDeleted = body.data.find(a => a.name === 'user1' && a.host === 'localhost:' + servers[0].port);
                expect(accountDeleted).to.be.undefined;
                const { data } = yield server.channels.list();
                const videoChannelDeleted = data.find(a => a.name === 'Main user1 channel' && a.host === 'localhost:' + servers[0].port);
                expect(videoChannelDeleted).to.be.undefined;
            }
        });
    });
    it('Should not have actor files', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const server of servers) {
            yield extra_utils_1.checkActorFilesWereRemoved(userAvatarFilename, server.internalServerNumber);
        }
    }));
    it('Should not have video files', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const server of servers) {
            yield extra_utils_1.checkVideoFilesWereRemoved({ server, video: server.store.videoDetails });
        }
    }));
    it('Should have an empty tmp directory', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                yield extra_utils_1.checkTmpIsEmpty(server);
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
