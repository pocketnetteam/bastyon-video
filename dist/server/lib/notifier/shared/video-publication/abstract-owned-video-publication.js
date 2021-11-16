"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractOwnedVideoPublication = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class AbstractOwnedVideoPublication extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.user = yield user_1.UserModel.loadByVideoId(this.payload.id);
        });
    }
    log() {
        logger_1.logger.info('Notifying user %s of the publication of its video %s.', this.user.username, this.payload.url);
    }
    getSetting(user) {
        return user.NotificationSetting.myVideoPublished;
    }
    getTargetUsers() {
        if (!this.user)
            return [];
        return [this.user];
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 6,
                userId: user.id,
                videoId: this.payload.id
            });
            notification.Video = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        const videoUrl = constants_1.WEBSERVER.URL + this.payload.getWatchStaticPath();
        return {
            to,
            subject: `Your video ${this.payload.name} has been published`,
            text: `Your video "${this.payload.name}" has been published.`,
            locals: {
                title: 'You video is live',
                action: {
                    text: 'View video',
                    url: videoUrl
                }
            }
        };
    }
}
exports.AbstractOwnedVideoPublication = AbstractOwnedVideoPublication;
