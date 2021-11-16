"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshVideoPlaylistIfNeeded = exports.scheduleRefreshIfNeeded = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const job_queue_1 = require("@server/lib/job-queue");
const models_1 = require("@shared/models");
const create_update_1 = require("./create-update");
const shared_1 = require("./shared");
function scheduleRefreshIfNeeded(playlist) {
    if (!playlist.isOutdated())
        return;
    job_queue_1.JobQueue.Instance.createJob({ type: 'activitypub-refresher', payload: { type: 'video-playlist', url: playlist.url } });
}
exports.scheduleRefreshIfNeeded = scheduleRefreshIfNeeded;
function refreshVideoPlaylistIfNeeded(videoPlaylist) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!videoPlaylist.isOutdated())
            return videoPlaylist;
        const lTags = logger_1.loggerTagsFactory('ap', 'video-playlist', 'refresh', videoPlaylist.uuid, videoPlaylist.url);
        logger_1.logger.info('Refreshing playlist %s.', videoPlaylist.url, lTags());
        try {
            const { playlistObject } = yield shared_1.fetchRemoteVideoPlaylist(videoPlaylist.url);
            if (playlistObject === undefined) {
                logger_1.logger.warn('Cannot refresh remote playlist %s: invalid body.', videoPlaylist.url, lTags());
                yield videoPlaylist.setAsRefreshed();
                return videoPlaylist;
            }
            yield create_update_1.createOrUpdateVideoPlaylist(playlistObject);
            return videoPlaylist;
        }
        catch (err) {
            if (err.statusCode === models_1.HttpStatusCode.NOT_FOUND_404) {
                logger_1.logger.info('Cannot refresh not existing playlist %s. Deleting it.', videoPlaylist.url, lTags());
                yield videoPlaylist.destroy();
                return undefined;
            }
            logger_1.logger.warn('Cannot refresh video playlist %s.', videoPlaylist.url, Object.assign({ err }, lTags()));
            yield videoPlaylist.setAsRefreshed();
            return videoPlaylist;
        }
    });
}
exports.refreshVideoPlaylistIfNeeded = refreshVideoPlaylistIfNeeded;
