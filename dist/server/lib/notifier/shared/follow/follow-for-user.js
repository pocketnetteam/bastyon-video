"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowForUser = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const blocklist_1 = require("@server/lib/blocklist");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class FollowForUser extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.followType = 'channel';
            this.user = yield user_1.UserModel.loadByChannelActorId(this.actorFollow.ActorFollowing.id);
            if (!this.user) {
                this.user = yield user_1.UserModel.loadByAccountActorId(this.actorFollow.ActorFollowing.id);
                this.followType = 'account';
            }
        });
    }
    isDisabled() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.payload.ActorFollowing.isOwned() === false)
                return true;
            const followerAccount = this.actorFollow.ActorFollower.Account;
            const followerAccountWithActor = Object.assign(followerAccount, { Actor: this.actorFollow.ActorFollower });
            return blocklist_1.isBlockedByServerOrAccount(followerAccountWithActor, this.user.Account);
        });
    }
    log() {
        logger_1.logger.info('Notifying user %s of new follower: %s.', this.user.username, this.actorFollow.ActorFollower.Account.getDisplayName());
    }
    getSetting(user) {
        return user.NotificationSetting.newFollow;
    }
    getTargetUsers() {
        if (!this.user)
            return [];
        return [this.user];
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 10,
                userId: user.id,
                actorFollowId: this.actorFollow.id
            });
            notification.ActorFollow = this.actorFollow;
            return notification;
        });
    }
    createEmail(to) {
        const following = this.actorFollow.ActorFollowing;
        const follower = this.actorFollow.ActorFollower;
        const followingName = (following.VideoChannel || following.Account).getDisplayName();
        return {
            template: 'follower-on-channel',
            to,
            subject: `New follower on your channel ${followingName}`,
            locals: {
                followerName: follower.Account.getDisplayName(),
                followerUrl: follower.url,
                followingName,
                followingUrl: following.url,
                followType: this.followType
            }
        };
    }
    get actorFollow() {
        return this.payload;
    }
}
exports.FollowForUser = FollowForUser;
