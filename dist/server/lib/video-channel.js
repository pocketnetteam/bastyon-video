"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.federateAllVideosOfChannel = exports.createLocalVideoChannel = void 0;
const tslib_1 = require("tslib");
const video_1 = require("../models/video/video");
const video_channel_1 = require("../models/video/video-channel");
const url_1 = require("./activitypub/url");
const videos_1 = require("./activitypub/videos");
const local_actor_1 = require("./local-actor");
function createLocalVideoChannel(videoChannelInfo, account, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const url = (0, url_1.getLocalVideoChannelActivityPubUrl)(videoChannelInfo.name);
        const actorInstance = (0, local_actor_1.buildActorInstance)('Group', url, videoChannelInfo.name);
        const actorInstanceCreated = yield actorInstance.save({ transaction: t });
        const videoChannelData = {
            name: videoChannelInfo.displayName,
            description: videoChannelInfo.description,
            support: videoChannelInfo.support,
            accountId: account.id,
            actorId: actorInstanceCreated.id
        };
        const videoChannel = new video_channel_1.VideoChannelModel(videoChannelData);
        const options = { transaction: t };
        const videoChannelCreated = yield videoChannel.save(options);
        videoChannelCreated.Actor = actorInstanceCreated;
        return videoChannelCreated;
    });
}
exports.createLocalVideoChannel = createLocalVideoChannel;
function federateAllVideosOfChannel(videoChannel) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoIds = yield video_1.VideoModel.getAllIdsFromChannel(videoChannel);
        for (const videoId of videoIds) {
            const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(videoId);
            yield (0, videos_1.federateVideoIfNeeded)(video, false);
        }
    });
}
exports.federateAllVideosOfChannel = federateAllVideosOfChannel;
