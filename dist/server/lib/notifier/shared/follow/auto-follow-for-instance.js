"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoFollowForInstance = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class AutoFollowForInstance extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.admins = yield user_1.UserModel.listWithRight(2);
        });
    }
    log() {
        logger_1.logger.info('Notifying %d administrators of auto instance following: %s.', this.admins.length, this.actorFollow.ActorFollowing.url);
    }
    getSetting(user) {
        return user.NotificationSetting.autoInstanceFollowing;
    }
    getTargetUsers() {
        return this.admins;
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 14,
                userId: user.id,
                actorFollowId: this.actorFollow.id
            });
            notification.ActorFollow = this.actorFollow;
            return notification;
        });
    }
    createEmail(to) {
        const instanceUrl = this.actorFollow.ActorFollowing.url;
        return {
            to,
            subject: 'Auto instance following',
            text: `Your instance automatically followed a new instance: <a href="${instanceUrl}">${instanceUrl}</a>.`
        };
    }
    get actorFollow() {
        return this.payload;
    }
}
exports.AutoFollowForInstance = AutoFollowForInstance;
