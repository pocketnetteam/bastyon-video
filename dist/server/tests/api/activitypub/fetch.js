"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test ActivityPub fetcher', function () {
    let servers;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            servers = yield extra_utils_1.createMultipleServers(3);
            yield extra_utils_1.setAccessTokensToServers(servers);
            const user = { username: 'user1', password: 'password' };
            for (const server of servers) {
                yield server.users.create({ username: user.username, password: user.password });
            }
            const userAccessToken = yield servers[0].login.getAccessToken(user);
            yield servers[0].videos.upload({ attributes: { name: 'video root' } });
            const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'bad video root' } });
            yield servers[0].videos.upload({ token: userAccessToken, attributes: { name: 'video user' } });
            {
                const to = 'http://localhost:' + servers[0].port + '/accounts/user1';
                const value = 'http://localhost:' + servers[1].port + '/accounts/user1';
                yield servers[0].sql.setActorField(to, 'url', value);
            }
            {
                const value = 'http://localhost:' + servers[2].port + '/videos/watch/' + uuid;
                yield servers[0].sql.setVideoField(uuid, 'url', value);
            }
        });
    });
    it('Should add only the video with a valid actor URL', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            yield extra_utils_1.waitJobs(servers);
            {
                const { total, data } = yield servers[0].videos.list({ sort: 'createdAt' });
                expect(total).to.equal(3);
                expect(data[0].name).to.equal('video root');
                expect(data[1].name).to.equal('bad video root');
                expect(data[2].name).to.equal('video user');
            }
            {
                const { total, data } = yield servers[1].videos.list({ sort: 'createdAt' });
                expect(total).to.equal(1);
                expect(data[0].name).to.equal('video root');
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
