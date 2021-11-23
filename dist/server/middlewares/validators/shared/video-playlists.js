"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesVideoPlaylistExist = void 0;
const tslib_1 = require("tslib");
const video_playlist_1 = require("@server/models/video/video-playlist");
const models_1 = require("@shared/models");
function doesVideoPlaylistExist(id, res, fetchType = 'summary') {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (fetchType === 'summary') {
            const videoPlaylist = yield video_playlist_1.VideoPlaylistModel.loadWithAccountAndChannelSummary(id, undefined);
            res.locals.videoPlaylistSummary = videoPlaylist;
            return handleVideoPlaylist(videoPlaylist, res);
        }
        const videoPlaylist = yield video_playlist_1.VideoPlaylistModel.loadWithAccountAndChannel(id, undefined);
        res.locals.videoPlaylistFull = videoPlaylist;
        return handleVideoPlaylist(videoPlaylist, res);
    });
}
exports.doesVideoPlaylistExist = doesVideoPlaylistExist;
function handleVideoPlaylist(videoPlaylist, res) {
    if (!videoPlaylist) {
        res.fail({
            status: models_1.HttpStatusCode.NOT_FOUND_404,
            message: 'Video playlist not found'
        });
        return false;
    }
    return true;
}
