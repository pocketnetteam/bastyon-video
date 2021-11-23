"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processActivityPubFollow = void 0;
const tslib_1 = require("tslib");
const url_1 = require("@server/lib/activitypub/url");
const core_utils_1 = require("../../../helpers/core-utils");
const database_utils_1 = require("../../../helpers/database-utils");
const logger_1 = require("../../../helpers/logger");
const constants_1 = require("../../../initializers/constants");
const database_1 = require("../../../initializers/database");
const actor_1 = require("../../../models/actor/actor");
const actor_follow_1 = require("../../../models/actor/actor-follow");
const actors_1 = require("../../activitypub/actors");
const send_1 = require("../../activitypub/send");
const notifier_1 = require("../../notifier");
function processActivityPubFollow(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        const host = payload.host;
        logger_1.logger.info('Processing ActivityPub follow in job %d.', job.id);
        let targetActor;
        if (!host || host === constants_1.WEBSERVER.HOST) {
            targetActor = yield actor_1.ActorModel.loadLocalByName(payload.name);
        }
        else {
            const sanitizedHost = (0, core_utils_1.sanitizeHost)(host, constants_1.REMOTE_SCHEME.HTTP);
            const actorUrl = yield (0, actors_1.loadActorUrlOrGetFromWebfinger)(payload.name + '@' + sanitizedHost);
            targetActor = yield (0, actors_1.getOrCreateAPActor)(actorUrl, 'all');
        }
        if (payload.assertIsChannel && !targetActor.VideoChannel) {
            logger_1.logger.warn('Do not follow %s@%s because it is not a channel.', payload.name, host);
            return;
        }
        const fromActor = yield actor_1.ActorModel.load(payload.followerActorId);
        return (0, database_utils_1.retryTransactionWrapper)(follow, fromActor, targetActor, payload.isAutoFollow);
    });
}
exports.processActivityPubFollow = processActivityPubFollow;
function follow(fromActor, targetActor, isAutoFollow = false) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (fromActor.id === targetActor.id) {
            throw new Error('Follower is the same as target actor.');
        }
        const state = !fromActor.serverId && !targetActor.serverId ? 'accepted' : 'pending';
        const actorFollow = yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [actorFollow] = yield actor_follow_1.ActorFollowModel.findOrCreate({
                where: {
                    actorId: fromActor.id,
                    targetActorId: targetActor.id
                },
                defaults: {
                    state,
                    url: (0, url_1.getLocalActorFollowActivityPubUrl)(fromActor, targetActor),
                    actorId: fromActor.id,
                    targetActorId: targetActor.id
                },
                transaction: t
            });
            actorFollow.ActorFollowing = targetActor;
            actorFollow.ActorFollower = fromActor;
            if (actorFollow.state !== 'accepted')
                (0, send_1.sendFollow)(actorFollow, t);
            return actorFollow;
        }));
        const followerFull = yield actor_1.ActorModel.loadFull(fromActor.id);
        const actorFollowFull = Object.assign(actorFollow, {
            ActorFollowing: targetActor,
            ActorFollower: followerFull
        });
        if (actorFollow.state === 'accepted')
            notifier_1.Notifier.Instance.notifyOfNewUserFollow(actorFollowFull);
        if (isAutoFollow === true)
            notifier_1.Notifier.Instance.notifyOfAutoInstanceFollowing(actorFollowFull);
        return actorFollow;
    });
}
