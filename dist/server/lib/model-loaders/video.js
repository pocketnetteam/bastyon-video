"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadVideoByUrl = exports.loadVideo = void 0;
const video_1 = require("@server/models/video/video");
const hooks_1 = require("../plugins/hooks");
function loadVideo(id, fetchType, userId) {
    if (fetchType === 'for-api') {
        return hooks_1.Hooks.wrapPromiseFun(video_1.VideoModel.loadForGetAPI, { id, userId }, 'filter:api.video.get.result');
    }
    if (fetchType === 'all')
        return video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(id, undefined, userId);
    if (fetchType === 'only-immutable-attributes')
        return video_1.VideoModel.loadImmutableAttributes(id);
    if (fetchType === 'only-video')
        return video_1.VideoModel.load(id);
    if (fetchType === 'id' || fetchType === 'none')
        return video_1.VideoModel.loadOnlyId(id);
}
exports.loadVideo = loadVideo;
function loadVideoByUrl(url, fetchType) {
    if (fetchType === 'all')
        return video_1.VideoModel.loadByUrlAndPopulateAccount(url);
    if (fetchType === 'only-immutable-attributes')
        return video_1.VideoModel.loadByUrlImmutableAttributes(url);
    if (fetchType === 'only-video')
        return video_1.VideoModel.loadByUrl(url);
}
exports.loadVideoByUrl = loadVideoByUrl;
