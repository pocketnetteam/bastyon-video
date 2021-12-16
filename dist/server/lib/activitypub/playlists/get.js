"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAPVideoPlaylist = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const video_playlist_1 = require("@server/models/video/video-playlist");
const create_update_1 = require("./create-update");
const refresh_1 = require("./refresh");
const shared_1 = require("./shared");
function getOrCreateAPVideoPlaylist(playlistObjectArg) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const playlistUrl = activitypub_1.getAPId(playlistObjectArg);
        const playlistFromDatabase = yield video_playlist_1.VideoPlaylistModel.loadByUrlWithAccountAndChannelSummary(playlistUrl);
        if (playlistFromDatabase) {
            refresh_1.scheduleRefreshIfNeeded(playlistFromDatabase);
            return playlistFromDatabase;
        }
        const { playlistObject } = yield shared_1.fetchRemoteVideoPlaylist(playlistUrl);
        if (!playlistObject)
            throw new Error('Cannot fetch remote playlist with url: ' + playlistUrl);
        if (playlistObject.id !== playlistUrl)
            return getOrCreateAPVideoPlaylist(playlistObject);
        const playlistCreated = yield create_update_1.createOrUpdateVideoPlaylist(playlistObject);
        return playlistCreated;
    });
}
exports.getOrCreateAPVideoPlaylist = getOrCreateAPVideoPlaylist;
