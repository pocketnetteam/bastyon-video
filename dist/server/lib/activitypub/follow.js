"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteNameAndHost = exports.autoFollowBackIfNeeded = void 0;
const tslib_1 = require("tslib");
const application_1 = require("@server/models/application/application");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const server_1 = require("../../models/server/server");
const job_queue_1 = require("../job-queue");
function autoFollowBackIfNeeded(actorFollow, transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!config_1.CONFIG.FOLLOWINGS.INSTANCE.AUTO_FOLLOW_BACK.ENABLED)
            return;
        const follower = actorFollow.ActorFollower;
        if (follower.type === 'Application' && follower.preferredUsername === constants_1.SERVER_ACTOR_NAME) {
            logger_1.logger.info('Auto follow back %s.', follower.url);
            const me = yield application_1.getServerActor();
            const server = yield server_1.ServerModel.load(follower.serverId, transaction);
            const host = server.host;
            const payload = {
                host,
                name: constants_1.SERVER_ACTOR_NAME,
                followerActorId: me.id,
                isAutoFollow: true
            };
            job_queue_1.JobQueue.Instance.createJob({ type: 'activitypub-follow', payload });
        }
    });
}
exports.autoFollowBackIfNeeded = autoFollowBackIfNeeded;
function getRemoteNameAndHost(handleOrHost) {
    let name = constants_1.SERVER_ACTOR_NAME;
    let host = handleOrHost;
    const splitted = handleOrHost.split('@');
    if (splitted.length === 2) {
        name = splitted[0];
        host = splitted[1];
    }
    return { name, host };
}
exports.getRemoteNameAndHost = getRemoteNameAndHost;
