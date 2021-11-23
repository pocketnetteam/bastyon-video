"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRemoteActor = exports.fetchActorFollowsCount = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const actor_1 = require("@server/helpers/custom-validators/activitypub/actor");
const logger_1 = require("@server/helpers/logger");
const requests_1 = require("@server/helpers/requests");
function fetchRemoteActor(actorUrl) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Fetching remote actor %s.', actorUrl);
        const { body, statusCode } = yield (0, requests_1.doJSONRequest)(actorUrl, { activityPub: true });
        if ((0, actor_1.sanitizeAndCheckActorObject)(body) === false) {
            logger_1.logger.debug('Remote actor JSON is not valid.', { actorJSON: body });
            return { actorObject: undefined, statusCode: statusCode };
        }
        if ((0, activitypub_1.checkUrlsSameHost)(body.id, actorUrl) !== true) {
            logger_1.logger.warn('Actor url %s has not the same host than its AP id %s', actorUrl, body.id);
            return { actorObject: undefined, statusCode: statusCode };
        }
        return {
            statusCode,
            actorObject: body
        };
    });
}
exports.fetchRemoteActor = fetchRemoteActor;
function fetchActorFollowsCount(actorObject) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const followersCount = yield fetchActorTotalItems(actorObject.followers);
        const followingCount = yield fetchActorTotalItems(actorObject.following);
        return { followersCount, followingCount };
    });
}
exports.fetchActorFollowsCount = fetchActorFollowsCount;
function fetchActorTotalItems(url) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        try {
            const { body } = yield (0, requests_1.doJSONRequest)(url, { activityPub: true });
            return body.totalItems || 0;
        }
        catch (err) {
            logger_1.logger.warn('Cannot fetch remote actor count %s.', url, { err });
            return 0;
        }
    });
}
