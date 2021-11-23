"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unblacklistVideo = exports.blacklistVideo = exports.autoBlacklistVideoIfNeeded = void 0;
const tslib_1 = require("tslib");
const database_utils_1 = require("@server/helpers/database-utils");
const database_1 = require("@server/initializers/database");
const logger_1 = require("../helpers/logger");
const config_1 = require("../initializers/config");
const video_blacklist_1 = require("../models/video/video-blacklist");
const send_1 = require("./activitypub/send");
const videos_1 = require("./activitypub/videos");
const live_manager_1 = require("./live/live-manager");
const notifier_1 = require("./notifier");
const hooks_1 = require("./plugins/hooks");
const lTags = (0, logger_1.loggerTagsFactory)('blacklist');
function autoBlacklistVideoIfNeeded(parameters) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { video, user, isRemote, isNew, notify = true, transaction } = parameters;
        const doAutoBlacklist = yield hooks_1.Hooks.wrapFun(autoBlacklistNeeded, { video, user, isRemote, isNew }, 'filter:video.auto-blacklist.result');
        if (!doAutoBlacklist)
            return false;
        const videoBlacklistToCreate = {
            videoId: video.id,
            unfederated: true,
            reason: 'Auto-blacklisted. Moderator review required.',
            type: 2
        };
        const [videoBlacklist] = yield video_blacklist_1.VideoBlacklistModel.findOrCreate({
            where: {
                videoId: video.id
            },
            defaults: videoBlacklistToCreate,
            transaction
        });
        video.VideoBlacklist = videoBlacklist;
        videoBlacklist.Video = video;
        if (notify) {
            (0, database_utils_1.afterCommitIfTransaction)(transaction, () => {
                notifier_1.Notifier.Instance.notifyOnVideoAutoBlacklist(videoBlacklist);
            });
        }
        logger_1.logger.info('Video %s auto-blacklisted.', video.uuid, lTags(video.uuid));
        return true;
    });
}
exports.autoBlacklistVideoIfNeeded = autoBlacklistVideoIfNeeded;
function blacklistVideo(videoInstance, options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const blacklist = yield video_blacklist_1.VideoBlacklistModel.create({
            videoId: videoInstance.id,
            unfederated: options.unfederate === true,
            reason: options.reason,
            type: 1
        });
        blacklist.Video = videoInstance;
        if (options.unfederate === true) {
            yield (0, send_1.sendDeleteVideo)(videoInstance, undefined);
        }
        if (videoInstance.isLive) {
            live_manager_1.LiveManager.Instance.stopSessionOf(videoInstance.id);
        }
        notifier_1.Notifier.Instance.notifyOnVideoBlacklist(blacklist);
    });
}
exports.blacklistVideo = blacklistVideo;
function unblacklistVideo(videoBlacklist, video) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoBlacklistType = yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const unfederated = videoBlacklist.unfederated;
            const videoBlacklistType = videoBlacklist.type;
            yield videoBlacklist.destroy({ transaction: t });
            video.VideoBlacklist = undefined;
            if (unfederated === true) {
                yield (0, videos_1.federateVideoIfNeeded)(video, true, t);
            }
            return videoBlacklistType;
        }));
        notifier_1.Notifier.Instance.notifyOnVideoUnblacklist(video);
        if (videoBlacklistType === 2) {
            notifier_1.Notifier.Instance.notifyOnVideoPublishedAfterRemovedFromAutoBlacklist(video);
            delete video.VideoBlacklist;
            notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(video);
        }
    });
}
exports.unblacklistVideo = unblacklistVideo;
function autoBlacklistNeeded(parameters) {
    const { user, video, isRemote, isNew } = parameters;
    if (video.VideoBlacklist)
        return false;
    if (!config_1.CONFIG.AUTO_BLACKLIST.VIDEOS.OF_USERS.ENABLED || !user)
        return false;
    if (isRemote || isNew === false)
        return false;
    if (user.hasRight(12) || user.hasAdminFlag(1))
        return false;
    return true;
}
