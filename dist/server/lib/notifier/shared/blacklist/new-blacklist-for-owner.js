"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewBlacklistForOwner = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class NewBlacklistForOwner extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.user = yield user_1.UserModel.loadByVideoId(this.payload.videoId);
        });
    }
    log() {
        logger_1.logger.info('Notifying user %s that its video %s has been blacklisted.', this.user.username, this.payload.Video.url);
    }
    getSetting(user) {
        return user.NotificationSetting.blacklistOnMyVideo;
    }
    getTargetUsers() {
        if (!this.user)
            return [];
        return [this.user];
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 4,
                userId: user.id,
                videoBlacklistId: this.payload.id
            });
            notification.VideoBlacklist = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        const videoName = this.payload.Video.name;
        const videoUrl = constants_1.WEBSERVER.URL + this.payload.Video.getWatchStaticPath();
        const reasonString = this.payload.reason ? ` for the following reason: ${this.payload.reason}` : '';
        const blockedString = `Your video ${videoName} (${videoUrl} on ${config_1.CONFIG.INSTANCE.NAME} has been blacklisted${reasonString}.`;
        return {
            to,
            subject: `Video ${videoName} blacklisted`,
            text: blockedString,
            locals: {
                title: 'Your video was blacklisted'
            }
        };
    }
}
exports.NewBlacklistForOwner = NewBlacklistForOwner;
