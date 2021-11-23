"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAutoBlacklistForModerators = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const video_channel_1 = require("@server/models/video/video-channel");
const abstract_notification_1 = require("../common/abstract-notification");
class NewAutoBlacklistForModerators extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.moderators = yield user_1.UserModel.listWithRight(12);
        });
    }
    log() {
        logger_1.logger.info('Notifying %s moderators of video auto-blacklist %s.', this.moderators.length, this.payload.Video.url);
    }
    getSetting(user) {
        return user.NotificationSetting.videoAutoBlacklistAsModerator;
    }
    getTargetUsers() {
        return this.moderators;
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 12,
                userId: user.id,
                videoBlacklistId: this.payload.id
            });
            notification.VideoBlacklist = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const videoAutoBlacklistUrl = constants_1.WEBSERVER.URL + '/admin/moderation/video-auto-blacklist/list';
            const videoUrl = constants_1.WEBSERVER.URL + this.payload.Video.getWatchStaticPath();
            const channel = yield video_channel_1.VideoChannelModel.loadAndPopulateAccount(this.payload.Video.channelId);
            return {
                template: 'video-auto-blacklist-new',
                to,
                subject: 'A new video is pending moderation',
                locals: {
                    channel: channel.toFormattedSummaryJSON(),
                    videoUrl,
                    videoName: this.payload.Video.name,
                    action: {
                        text: 'Review autoblacklist',
                        url: videoAutoBlacklistUrl
                    }
                }
            };
        });
    }
}
exports.NewAutoBlacklistForModerators = NewAutoBlacklistForModerators;
