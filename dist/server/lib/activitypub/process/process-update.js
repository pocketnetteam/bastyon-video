"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUpdateActivity = void 0;
const tslib_1 = require("tslib");
const redundancy_1 = require("@server/lib/redundancy");
const cache_file_1 = require("../../../helpers/custom-validators/activitypub/cache-file");
const videos_1 = require("../../../helpers/custom-validators/activitypub/videos");
const database_utils_1 = require("../../../helpers/database-utils");
const logger_1 = require("../../../helpers/logger");
const database_1 = require("../../../initializers/database");
const actor_1 = require("../../../models/actor/actor");
const updater_1 = require("../actors/updater");
const cache_file_2 = require("../cache-file");
const playlists_1 = require("../playlists");
const utils_1 = require("../send/utils");
const videos_2 = require("../videos");
function processUpdateActivity(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { activity, byActor } = options;
        const objectType = activity.object.type;
        if (objectType === 'Video') {
            return database_utils_1.retryTransactionWrapper(processUpdateVideo, activity);
        }
        if (objectType === 'Person' || objectType === 'Application' || objectType === 'Group') {
            const byActorFull = yield actor_1.ActorModel.loadByUrlAndPopulateAccountAndChannel(byActor.url);
            return database_utils_1.retryTransactionWrapper(processUpdateActor, byActorFull, activity);
        }
        if (objectType === 'CacheFile') {
            const byActorFull = yield actor_1.ActorModel.loadByUrlAndPopulateAccountAndChannel(byActor.url);
            return database_utils_1.retryTransactionWrapper(processUpdateCacheFile, byActorFull, activity);
        }
        if (objectType === 'Playlist') {
            return database_utils_1.retryTransactionWrapper(processUpdatePlaylist, byActor, activity);
        }
        return undefined;
    });
}
exports.processUpdateActivity = processUpdateActivity;
function processUpdateVideo(activity) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoObject = activity.object;
        if (videos_1.sanitizeAndCheckVideoTorrentObject(videoObject) === false) {
            logger_1.logger.debug('Video sent by update is not valid.', { videoObject });
            return undefined;
        }
        const { video, created } = yield videos_2.getOrCreateAPVideo({
            videoObject: videoObject.id,
            allowRefresh: false,
            fetchType: 'all'
        });
        if (created)
            return;
        const updater = new videos_2.APVideoUpdater(videoObject, video);
        return updater.update(activity.to);
    });
}
function processUpdateCacheFile(byActor, activity) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if ((yield redundancy_1.isRedundancyAccepted(activity, byActor)) !== true)
            return;
        const cacheFileObject = activity.object;
        if (!cache_file_1.isCacheFileObjectValid(cacheFileObject)) {
            logger_1.logger.debug('Cache file object sent by update is not valid.', { cacheFileObject });
            return undefined;
        }
        const { video } = yield videos_2.getOrCreateAPVideo({ videoObject: cacheFileObject.object });
        yield database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield cache_file_2.createOrUpdateCacheFile(cacheFileObject, video, byActor, t);
        }));
        if (video.isOwned()) {
            const exceptions = [byActor];
            yield utils_1.forwardVideoRelatedActivity(activity, undefined, exceptions, video);
        }
    });
}
function processUpdateActor(actor, activity) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const actorObject = activity.object;
        logger_1.logger.debug('Updating remote account "%s".', actorObject.url);
        const updater = new updater_1.APActorUpdater(actorObject, actor);
        return updater.update();
    });
}
function processUpdatePlaylist(byActor, activity) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const playlistObject = activity.object;
        const byAccount = byActor.Account;
        if (!byAccount)
            throw new Error('Cannot update video playlist with the non account actor ' + byActor.url);
        yield playlists_1.createOrUpdateVideoPlaylist(playlistObject, activity.to);
    });
}
