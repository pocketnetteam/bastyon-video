"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
function checkFollow(follower, following, exists) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        {
            const body = yield following.follows.getFollowers({ start: 0, count: 5, sort: '-createdAt' });
            const follow = body.data.find(f => f.follower.host === follower.host && f.state === 'accepted');
            if (exists === true)
                expect(follow).to.exist;
            else
                expect(follow).to.be.undefined;
        }
        {
            const body = yield follower.follows.getFollowings({ start: 0, count: 5, sort: '-createdAt' });
            const follow = body.data.find(f => f.following.host === following.host && f.state === 'accepted');
            if (exists === true)
                expect(follow).to.exist;
            else
                expect(follow).to.be.undefined;
        }
    });
}
function server1Follows2(servers) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield servers[0].follows.follow({ hosts: [servers[1].host] });
        yield (0, extra_utils_1.waitJobs)(servers);
    });
}
function resetFollows(servers) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        try {
            yield servers[0].follows.unfollow({ target: servers[1] });
            yield servers[1].follows.unfollow({ target: servers[0] });
        }
        catch (_a) {
        }
        yield (0, extra_utils_1.waitJobs)(servers);
        yield checkFollow(servers[0], servers[1], false);
        yield checkFollow(servers[1], servers[0], false);
    });
}
describe('Test auto follows', function () {
    let servers = [];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(3);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
        });
    });
    describe('Auto follow back', function () {
        it('Should not auto follow back if the option is not enabled', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(15000);
                yield server1Follows2(servers);
                yield checkFollow(servers[0], servers[1], true);
                yield checkFollow(servers[1], servers[0], false);
                yield resetFollows(servers);
            });
        });
        it('Should auto follow back on auto accept if the option is enabled', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(15000);
                const config = {
                    followings: {
                        instance: {
                            autoFollowBack: { enabled: true }
                        }
                    }
                };
                yield servers[1].config.updateCustomSubConfig({ newConfig: config });
                yield server1Follows2(servers);
                yield checkFollow(servers[0], servers[1], true);
                yield checkFollow(servers[1], servers[0], true);
                yield resetFollows(servers);
            });
        });
        it('Should wait the acceptation before auto follow back', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                const config = {
                    followings: {
                        instance: {
                            autoFollowBack: { enabled: true }
                        }
                    },
                    followers: {
                        instance: {
                            manualApproval: true
                        }
                    }
                };
                yield servers[1].config.updateCustomSubConfig({ newConfig: config });
                yield server1Follows2(servers);
                yield checkFollow(servers[0], servers[1], false);
                yield checkFollow(servers[1], servers[0], false);
                yield servers[1].follows.acceptFollower({ follower: 'peertube@' + servers[0].host });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkFollow(servers[0], servers[1], true);
                yield checkFollow(servers[1], servers[0], true);
                yield resetFollows(servers);
                config.followings.instance.autoFollowBack.enabled = false;
                config.followers.instance.manualApproval = false;
                yield servers[1].config.updateCustomSubConfig({ newConfig: config });
            });
        });
    });
    describe('Auto follow index', function () {
        const instanceIndexServer = new extra_utils_1.MockInstancesIndex();
        let port;
        before(() => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            port = yield instanceIndexServer.initialize();
        }));
        it('Should not auto follow index if the option is not enabled', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield (0, extra_utils_1.wait)(5000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkFollow(servers[0], servers[1], false);
                yield checkFollow(servers[1], servers[0], false);
            });
        });
        it('Should auto follow the index', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                instanceIndexServer.addInstance(servers[1].host);
                const config = {
                    followings: {
                        instance: {
                            autoFollowIndex: {
                                indexUrl: `http://localhost:${port}/api/v1/instances/hosts`,
                                enabled: true
                            }
                        }
                    }
                };
                yield servers[0].config.updateCustomSubConfig({ newConfig: config });
                yield (0, extra_utils_1.wait)(5000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkFollow(servers[0], servers[1], true);
                yield resetFollows(servers);
            });
        });
        it('Should follow new added instances in the index but not old ones', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                instanceIndexServer.addInstance(servers[2].host);
                yield (0, extra_utils_1.wait)(5000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield checkFollow(servers[0], servers[1], false);
                yield checkFollow(servers[0], servers[2], true);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
