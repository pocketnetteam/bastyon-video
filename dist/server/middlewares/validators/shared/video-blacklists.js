"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesVideoBlacklistExist = void 0;
const tslib_1 = require("tslib");
const video_blacklist_1 = require("@server/models/video/video-blacklist");
const models_1 = require("@shared/models");
function doesVideoBlacklistExist(videoId, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoBlacklist = yield video_blacklist_1.VideoBlacklistModel.loadByVideoId(videoId);
        if (videoBlacklist === null) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Blacklisted video not found'
            });
            return false;
        }
        res.locals.videoBlacklist = videoBlacklist;
        return true;
    });
}
exports.doesVideoBlacklistExist = doesVideoBlacklistExist;
