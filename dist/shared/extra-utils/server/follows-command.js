"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsCommand = void 0;
const tslib_1 = require("tslib");
const core_utils_1 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class FollowsCommand extends shared_1.AbstractCommand {
    getFollowers(options) {
        const path = '/api/v1/server/followers';
        const query = core_utils_1.pick(options, ['start', 'count', 'sort', 'search', 'state', 'actorType']);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getFollowings(options = {}) {
        const path = '/api/v1/server/following';
        const query = core_utils_1.pick(options, ['start', 'count', 'sort', 'search', 'state', 'actorType']);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    follow(options) {
        const path = '/api/v1/server/following';
        const fields = {};
        if (options.hosts) {
            fields.hosts = options.hosts.map(f => f.replace(/^http:\/\//, ''));
        }
        if (options.handles) {
            fields.handles = options.handles;
        }
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path,
            fields, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    unfollow(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { target } = options;
            const handle = typeof target === 'string'
                ? target
                : target.host;
            const path = '/api/v1/server/following/' + handle;
            return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
        });
    }
    acceptFollower(options) {
        const path = '/api/v1/server/followers/' + options.follower + '/accept';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    rejectFollower(options) {
        const path = '/api/v1/server/followers/' + options.follower + '/reject';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    removeFollower(options) {
        const path = '/api/v1/server/followers/peertube@' + options.follower.host;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.FollowsCommand = FollowsCommand;
