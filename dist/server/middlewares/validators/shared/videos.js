"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserCanManageVideo = exports.doesVideoFileOfVideoExist = exports.doesVideoExist = exports.doesVideoChannelOfAccountExist = void 0;
const tslib_1 = require("tslib");
const model_loaders_1 = require("@server/lib/model-loaders");
const video_channel_1 = require("@server/models/video/video-channel");
const video_file_1 = require("@server/models/video/video-file");
const models_1 = require("@shared/models");
function doesVideoExist(id, res, fetchType = 'all') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const userId = res.locals.oauth ? res.locals.oauth.token.User.id : undefined;
        const video = yield model_loaders_1.loadVideo(id, fetchType, userId);
        if (video === null) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video not found'
            });
            return false;
        }
        switch (fetchType) {
            case 'for-api':
                res.locals.videoAPI = video;
                break;
            case 'all':
                res.locals.videoAll = video;
                break;
            case 'only-immutable-attributes':
                res.locals.onlyImmutableVideo = video;
                break;
            case 'id':
                res.locals.videoId = video;
                break;
            case 'only-video':
                res.locals.onlyVideo = video;
                break;
        }
        return true;
    });
}
exports.doesVideoExist = doesVideoExist;
function doesVideoFileOfVideoExist(id, videoIdOrUUID, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!(yield video_file_1.VideoFileModel.doesVideoExistForVideoFile(id, videoIdOrUUID))) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'VideoFile matching Video not found'
            });
            return false;
        }
        return true;
    });
}
exports.doesVideoFileOfVideoExist = doesVideoFileOfVideoExist;
function doesVideoChannelOfAccountExist(channelId, user, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoChannel = yield video_channel_1.VideoChannelModel.loadAndPopulateAccount(channelId);
        if (videoChannel === null) {
            res.fail({ message: 'Unknown video "video channel" for this instance.' });
            return false;
        }
        if (user.hasRight(17) === true) {
            res.locals.videoChannel = videoChannel;
            return true;
        }
        if (videoChannel.Account.id !== user.Account.id) {
            res.fail({
                message: 'Unknown video "video channel" for this account.'
            });
            return false;
        }
        res.locals.videoChannel = videoChannel;
        return true;
    });
}
exports.doesVideoChannelOfAccountExist = doesVideoChannelOfAccountExist;
function checkUserCanManageVideo(user, video, right, res, onlyOwned = true) {
    if (onlyOwned && video.isOwned() === false) {
        res.fail({
            status: models_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot manage a video of another server.'
        });
        return false;
    }
    const account = video.VideoChannel.Account;
    if (user.hasRight(right) === false && account.userId !== user.id) {
        res.fail({
            status: models_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot manage a video of another user.'
        });
        return false;
    }
    return true;
}
exports.checkUserCanManageVideo = checkUserCanManageVideo;
