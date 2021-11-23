"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshActorIfNeeded = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const promise_cache_1 = require("@server/helpers/promise-cache");
const actor_1 = require("@server/models/actor/actor");
const models_1 = require("@shared/models");
const shared_1 = require("./shared");
const updater_1 = require("./updater");
const webfinger_1 = require("./webfinger");
const promiseCache = new promise_cache_1.PromiseCache(doRefresh, (options) => options.actor.url);
function refreshActorIfNeeded(options) {
    const actorArg = options.actor;
    if (!actorArg.isOutdated())
        return Promise.resolve({ actor: actorArg, refreshed: false });
    return promiseCache.run(options);
}
exports.refreshActorIfNeeded = refreshActorIfNeeded;
function doRefresh(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { actor: actorArg, fetchedType } = options;
        const actor = fetchedType === 'all'
            ? actorArg
            : yield actor_1.ActorModel.loadByUrlAndPopulateAccountAndChannel(actorArg.url);
        const lTags = (0, logger_1.loggerTagsFactory)('ap', 'actor', 'refresh', actor.url);
        logger_1.logger.info('Refreshing actor %s.', actor.url, lTags());
        try {
            const actorUrl = yield getActorUrl(actor);
            const { actorObject } = yield (0, shared_1.fetchRemoteActor)(actorUrl);
            if (actorObject === undefined) {
                logger_1.logger.warn('Cannot fetch remote actor in refresh actor.');
                return { actor, refreshed: false };
            }
            const updater = new updater_1.APActorUpdater(actorObject, actor);
            yield updater.update();
            return { refreshed: true, actor };
        }
        catch (err) {
            if (err.statusCode === models_1.HttpStatusCode.NOT_FOUND_404) {
                logger_1.logger.info('Deleting actor %s because there is a 404 in refresh actor.', actor.url, lTags());
                actor.Account
                    ? yield actor.Account.destroy()
                    : yield actor.VideoChannel.destroy();
                return { actor: undefined, refreshed: false };
            }
            logger_1.logger.warn('Cannot refresh actor %s.', actor.url, Object.assign({ err }, lTags()));
            return { actor, refreshed: false };
        }
    });
}
function getActorUrl(actor) {
    return (0, webfinger_1.getUrlFromWebfinger)(actor.preferredUsername + '@' + actor.getHost())
        .catch(err => {
        logger_1.logger.warn('Cannot get actor URL from webfinger, keeping the old one.', err);
        return actor.url;
    });
}
