"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesVideoChannelNameWithHostExist = exports.doesVideoChannelIdExist = exports.doesLocalVideoChannelNameExist = void 0;
const tslib_1 = require("tslib");
const video_channel_1 = require("@server/models/video/video-channel");
const models_1 = require("@shared/models");
function doesLocalVideoChannelNameExist(name, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoChannel = yield video_channel_1.VideoChannelModel.loadLocalByNameAndPopulateAccount(name);
        return processVideoChannelExist(videoChannel, res);
    });
}
exports.doesLocalVideoChannelNameExist = doesLocalVideoChannelNameExist;
function doesVideoChannelIdExist(id, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoChannel = yield video_channel_1.VideoChannelModel.loadAndPopulateAccount(+id);
        return processVideoChannelExist(videoChannel, res);
    });
}
exports.doesVideoChannelIdExist = doesVideoChannelIdExist;
function doesVideoChannelNameWithHostExist(nameWithDomain, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoChannel = yield video_channel_1.VideoChannelModel.loadByNameWithHostAndPopulateAccount(nameWithDomain);
        return processVideoChannelExist(videoChannel, res);
    });
}
exports.doesVideoChannelNameWithHostExist = doesVideoChannelNameWithHostExist;
function processVideoChannelExist(videoChannel, res) {
    if (!videoChannel) {
        res.fail({
            status: models_1.HttpStatusCode.NOT_FOUND_404,
            message: 'Video channel not found'
        });
        return false;
    }
    res.locals.videoChannel = videoChannel;
    return true;
}
