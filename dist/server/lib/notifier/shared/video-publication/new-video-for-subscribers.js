"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewVideoForSubscribers = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class NewVideoForSubscribers extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.users = yield user_1.UserModel.listUserSubscribersOf(this.payload.VideoChannel.actorId);
        });
    }
    log() {
        logger_1.logger.info('Notifying %d users of new video %s.', this.users.length, this.payload.url);
    }
    isDisabled() {
        return this.payload.privacy !== 1 || this.payload.state !== 1 || this.payload.isBlacklisted();
    }
    getSetting(user) {
        return user.NotificationSetting.newVideoFromSubscription;
    }
    getTargetUsers() {
        return this.users;
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 1,
                userId: user.id,
                videoId: this.payload.id
            });
            notification.Video = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        const channelName = this.payload.VideoChannel.getDisplayName();
        const videoUrl = constants_1.WEBSERVER.URL + this.payload.getWatchStaticPath();
        return {
            to,
            subject: channelName + ' just published a new video',
            text: `Your subscription ${channelName} just published a new video: "${this.payload.name}".`,
            locals: {
                title: 'New content ',
                action: {
                    text: 'View video',
                    url: videoUrl
                }
            }
        };
    }
}
exports.NewVideoForSubscribers = NewVideoForSubscribers;
