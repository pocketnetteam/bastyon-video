"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processViewActivity = void 0;
const tslib_1 = require("tslib");
const videos_1 = require("../videos");
const utils_1 = require("../send/utils");
const redis_1 = require("../../redis");
const live_manager_1 = require("@server/lib/live/live-manager");
function processViewActivity(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { activity, byActor } = options;
        return processCreateView(activity, byActor);
    });
}
exports.processViewActivity = processViewActivity;
function processCreateView(activity, byActor) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoObject = activity.type === 'View'
            ? activity.object
            : activity.object.object;
        const { video } = yield (0, videos_1.getOrCreateAPVideo)({
            videoObject,
            fetchType: 'only-video',
            allowRefresh: false
        });
        if (!video.isLive) {
            yield redis_1.Redis.Instance.addVideoView(video.id);
        }
        if (video.isOwned()) {
            if (video.isLive) {
                live_manager_1.LiveManager.Instance.addViewTo(video.id);
                return;
            }
            const exceptions = [byActor];
            yield (0, utils_1.forwardVideoRelatedActivity)(activity, undefined, exceptions, video);
        }
    });
}
