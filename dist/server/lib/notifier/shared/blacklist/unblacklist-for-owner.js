"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblacklistForOwner = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class UnblacklistForOwner extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.user = yield user_1.UserModel.loadByVideoId(this.payload.id);
        });
    }
    log() {
        logger_1.logger.info('Notifying user %s that its video %s has been unblacklisted.', this.user.username, this.payload.url);
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
                type: 5,
                userId: user.id,
                videoId: this.payload.id
            });
            notification.Video = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        const video = this.payload;
        const videoUrl = constants_1.WEBSERVER.URL + video.getWatchStaticPath();
        return {
            to,
            subject: `Video ${video.name} unblacklisted`,
            text: `Your video "${video.name}" (${videoUrl}) on ${config_1.CONFIG.INSTANCE.NAME} has been unblacklisted.`,
            locals: {
                title: 'Your video was unblacklisted'
            }
        };
    }
}
exports.UnblacklistForOwner = UnblacklistForOwner;
