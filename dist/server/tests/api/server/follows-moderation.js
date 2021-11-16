"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function checkServer1And2HasFollowers(servers, state = 'accepted') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fns = [
            servers[0].follows.getFollowings.bind(servers[0].follows),
            servers[1].follows.getFollowers.bind(servers[1].follows)
        ];
        for (const fn of fns) {
            const body = yield fn({ start: 0, count: 5, sort: 'createdAt' });
            expect(body.total).to.equal(1);
            const follow = body.data[0];
            expect(follow.state).to.equal(state);
            expect(follow.follower.url).to.equal('http://localhost:' + servers[0].port + '/accounts/peertube');
            expect(follow.following.url).to.equal('http://localhost:' + servers[1].port + '/accounts/peertube');
        }
    });
}
function checkNoFollowers(servers) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fns = [
            servers[0].follows.getFollowings.bind(servers[0].follows),
            servers[1].follows.getFollowers.bind(servers[1].follows)
        ];
        for (const fn of fns) {
            const body = yield fn({ start: 0, count: 5, sort: 'createdAt' });
            expect(body.total).to.equal(0);
        }
    });
}
describe('Test follows moderation', function () {
    let servers = [];
    let commands;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield extra_utils_1.createMultipleServers(3);
            yield extra_utils_1.setAccessTokensToServers(servers);
            commands = servers.map(s => s.follows);
        });
    });
    it('Should have server 1 following server 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield commands[0].follow({ hosts: [servers[1].url] });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should have correct follows', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield checkServer1And2HasFollowers(servers);
        });
    });
    it('Should remove follower on server 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield commands[1].removeFollower({ follower: servers[0] });
            yield extra_utils_1.waitJobs(servers);
        });
    });
    it('Should not not have follows anymore', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield checkNoFollowers(servers);
        });
    });
    it('Should disable followers on server 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const subConfig = {
                followers: {
                    instance: {
                        enabled: false,
                        manualApproval: false
                    }
                }
            };
            yield servers[1].config.updateCustomSubConfig({ newConfig: subConfig });
            yield commands[0].follow({ hosts: [servers[1].url] });
            yield extra_utils_1.waitJobs(servers);
            yield checkNoFollowers(servers);
        });
    });
    it('Should re enable followers on server 2', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            const subConfig = {
                followers: {
                    instance: {
                        enabled: true,
                        manualApproval: false
                    }
                }
            };
            yield servers[1].config.updateCustomSubConfig({ newConfig: subConfig });
            yield commands[0].follow({ hosts: [servers[1].url] });
            yield extra_utils_1.waitJobs(servers);
            yield checkServer1And2HasFollowers(servers);
        });
    });
    it('Should manually approve followers', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield commands[1].removeFollower({ follower: servers[0] });
            yield extra_utils_1.waitJobs(servers);
            const subConfig = {
                followers: {
                    instance: {
                        enabled: true,
                        manualApproval: true
                    }
                }
            };
            yield servers[1].config.updateCustomSubConfig({ newConfig: subConfig });
            yield servers[2].config.updateCustomSubConfig({ newConfig: subConfig });
            yield commands[0].follow({ hosts: [servers[1].url] });
            yield extra_utils_1.waitJobs(servers);
            yield checkServer1And2HasFollowers(servers, 'pending');
        });
    });
    it('Should accept a follower', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield commands[1].acceptFollower({ follower: 'peertube@localhost:' + servers[0].port });
            yield extra_utils_1.waitJobs(servers);
            yield checkServer1And2HasFollowers(servers);
        });
    });
    it('Should reject another follower', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            yield commands[0].follow({ hosts: [servers[2].url] });
            yield extra_utils_1.waitJobs(servers);
            {
                const body = yield commands[0].getFollowings({ start: 0, count: 5, sort: 'createdAt' });
                expect(body.total).to.equal(2);
            }
            {
                const body = yield commands[1].getFollowers({ start: 0, count: 5, sort: 'createdAt' });
                expect(body.total).to.equal(1);
            }
            {
                const body = yield commands[2].getFollowers({ start: 0, count: 5, sort: 'createdAt' });
                expect(body.total).to.equal(1);
            }
            yield commands[2].rejectFollower({ follower: 'peertube@localhost:' + servers[0].port });
            yield extra_utils_1.waitJobs(servers);
            yield checkServer1And2HasFollowers(servers);
            {
                const body = yield commands[2].getFollowers({ start: 0, count: 5, sort: 'createdAt' });
                expect(body.total).to.equal(0);
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests(servers);
        });
    });
});
