"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAPObject = void 0;
const tslib_1 = require("tslib");
const playlists_1 = require("@server/lib/activitypub/playlists");
const videos_1 = require("@server/lib/activitypub/videos");
const model_loaders_1 = require("@server/lib/model-loaders");
const logger_1 = require("../../../helpers/logger");
const actor_1 = require("../../../models/actor/actor");
const video_playlist_1 = require("../../../models/video/video-playlist");
const actors_1 = require("../../activitypub/actors");
function refreshAPObject(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        logger_1.logger.info('Processing AP refresher in job %d for %s.', job.id, payload.url);
        if (payload.type === 'video')
            return refreshVideo(payload.url);
        if (payload.type === 'video-playlist')
            return refreshVideoPlaylist(payload.url);
        if (payload.type === 'actor')
            return refreshActor(payload.url);
    });
}
exports.refreshAPObject = refreshAPObject;
function refreshVideo(videoUrl) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const fetchType = 'all';
        const syncParam = { likes: true, dislikes: true, shares: true, comments: true, thumbnail: true };
        const videoFromDatabase = yield (0, model_loaders_1.loadVideoByUrl)(videoUrl, fetchType);
        if (videoFromDatabase) {
            const refreshOptions = {
                video: videoFromDatabase,
                fetchedType: fetchType,
                syncParam
            };
            yield (0, videos_1.refreshVideoIfNeeded)(refreshOptions);
        }
    });
}
function refreshActor(actorUrl) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const fetchType = 'all';
        const actor = yield actor_1.ActorModel.loadByUrlAndPopulateAccountAndChannel(actorUrl);
        if (actor) {
            yield (0, actors_1.refreshActorIfNeeded)({ actor, fetchedType: fetchType });
        }
    });
}
function refreshVideoPlaylist(playlistUrl) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const playlist = yield video_playlist_1.VideoPlaylistModel.loadByUrlAndPopulateAccount(playlistUrl);
        if (playlist) {
            yield (0, playlists_1.refreshVideoPlaylistIfNeeded)(playlist);
        }
    });
}
