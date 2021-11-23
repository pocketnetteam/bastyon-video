"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAPActor = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const database_utils_1 = require("@server/helpers/database-utils");
const logger_1 = require("@server/helpers/logger");
const job_queue_1 = require("@server/lib/job-queue");
const model_loaders_1 = require("@server/lib/model-loaders");
const refresh_1 = require("./refresh");
const shared_1 = require("./shared");
function getOrCreateAPActor(activityActor, fetchType = 'association-ids', recurseIfNeeded = true, updateCollections = false) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const actorUrl = (0, activitypub_1.getAPId)(activityActor);
        let actor = yield loadActorFromDB(actorUrl, fetchType);
        let created = false;
        let accountPlaylistsUrl;
        if (!actor) {
            const { actorObject } = yield (0, shared_1.fetchRemoteActor)(actorUrl);
            if (actorObject === undefined)
                throw new Error('Cannot fetch remote actor ' + actorUrl);
            if (actorObject.id !== actorUrl)
                return getOrCreateAPActor(actorObject, 'all', recurseIfNeeded, updateCollections);
            let ownerActor;
            if (recurseIfNeeded === true && actorObject.type === 'Group') {
                ownerActor = yield getOrCreateAPOwner(actorObject, actorUrl);
            }
            const creator = new shared_1.APActorCreator(actorObject, ownerActor);
            actor = yield (0, database_utils_1.retryTransactionWrapper)(creator.create.bind(creator));
            created = true;
            accountPlaylistsUrl = actorObject.playlists;
        }
        if (actor.Account)
            actor.Account.Actor = actor;
        if (actor.VideoChannel)
            actor.VideoChannel.Actor = actor;
        const { actor: actorRefreshed, refreshed } = yield (0, refresh_1.refreshActorIfNeeded)({ actor, fetchedType: fetchType });
        if (!actorRefreshed)
            throw new Error('Actor ' + actor.url + ' does not exist anymore.');
        yield scheduleOutboxFetchIfNeeded(actor, created, refreshed, updateCollections);
        yield schedulePlaylistFetchIfNeeded(actor, created, accountPlaylistsUrl);
        return actorRefreshed;
    });
}
exports.getOrCreateAPActor = getOrCreateAPActor;
function loadActorFromDB(actorUrl, fetchType) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let actor = yield (0, model_loaders_1.loadActorByUrl)(actorUrl, fetchType);
        if (actor && (!actor.Account && !actor.VideoChannel)) {
            yield actor.destroy();
            actor = null;
        }
        return actor;
    });
}
function getOrCreateAPOwner(actorObject, actorUrl) {
    const accountAttributedTo = actorObject.attributedTo.find(a => a.type === 'Person');
    if (!accountAttributedTo)
        throw new Error('Cannot find account attributed to video channel ' + actorUrl);
    if ((0, activitypub_1.checkUrlsSameHost)(accountAttributedTo.id, actorUrl) !== true) {
        throw new Error(`Account attributed to ${accountAttributedTo.id} does not have the same host than actor url ${actorUrl}`);
    }
    try {
        const recurseIfNeeded = false;
        return getOrCreateAPActor(accountAttributedTo.id, 'all', recurseIfNeeded);
    }
    catch (err) {
        logger_1.logger.error('Cannot get or create account attributed to video channel ' + actorUrl);
        throw new Error(err);
    }
}
function scheduleOutboxFetchIfNeeded(actor, created, refreshed, updateCollections) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if ((created === true || refreshed === true) && updateCollections === true) {
            const payload = { uri: actor.outboxUrl, type: 'activity' };
            yield job_queue_1.JobQueue.Instance.createJobWithPromise({ type: 'activitypub-http-fetcher', payload });
        }
    });
}
function schedulePlaylistFetchIfNeeded(actor, created, accountPlaylistsUrl) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (created === true && actor.Account && accountPlaylistsUrl) {
            const payload = { uri: accountPlaylistsUrl, type: 'account-playlists' };
            yield job_queue_1.JobQueue.Instance.createJobWithPromise({ type: 'activitypub-http-fetcher', payload });
        }
    });
}
