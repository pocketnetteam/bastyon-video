"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowForInstance = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const blocklist_1 = require("@server/lib/blocklist");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class FollowForInstance extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.admins = yield user_1.UserModel.listWithRight(2);
        });
    }
    isDisabled() {
        const follower = Object.assign(this.actorFollow.ActorFollower.Account, { Actor: this.actorFollow.ActorFollower });
        return (0, blocklist_1.isBlockedByServerOrAccount)(follower);
    }
    log() {
        logger_1.logger.info('Notifying %d administrators of new instance follower: %s.', this.admins.length, this.actorFollow.ActorFollower.url);
    }
    getSetting(user) {
        return user.NotificationSetting.newInstanceFollower;
    }
    getTargetUsers() {
        return this.admins;
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 13,
                userId: user.id,
                actorFollowId: this.actorFollow.id
            });
            notification.ActorFollow = this.actorFollow;
            return notification;
        });
    }
    createEmail(to) {
        const awaitingApproval = this.actorFollow.state === 'pending'
            ? ' awaiting manual approval.'
            : '';
        return {
            to,
            subject: 'New instance follower',
            text: `Your instance has a new follower: ${this.actorFollow.ActorFollower.url}${awaitingApproval}.`,
            locals: {
                title: 'New instance follower',
                action: {
                    text: 'Review followers',
                    url: constants_1.WEBSERVER.URL + '/admin/follows/followers-list'
                }
            }
        };
    }
    get actorFollow() {
        return this.payload;
    }
}
exports.FollowForInstance = FollowForInstance;
