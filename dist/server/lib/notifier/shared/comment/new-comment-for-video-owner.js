"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewCommentForVideoOwner = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const markdown_1 = require("@server/helpers/markdown");
const constants_1 = require("@server/initializers/constants");
const blocklist_1 = require("@server/lib/blocklist");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class NewCommentForVideoOwner extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.user = yield user_1.UserModel.loadByVideoId(this.payload.videoId);
        });
    }
    log() {
        logger_1.logger.info('Notifying owner of a video %s of new comment %s.', this.user.username, this.payload.url);
    }
    isDisabled() {
        if (this.payload.Video.isOwned() === false)
            return true;
        if (!this.user || this.payload.Account.userId === this.user.id)
            return true;
        return (0, blocklist_1.isBlockedByServerOrAccount)(this.payload.Account, this.user.Account);
    }
    getSetting(user) {
        return user.NotificationSetting.newCommentOnMyVideo;
    }
    getTargetUsers() {
        if (!this.user)
            return [];
        return [this.user];
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 2,
                userId: user.id,
                commentId: this.payload.id
            });
            notification.Comment = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        const video = this.payload.Video;
        const videoUrl = constants_1.WEBSERVER.URL + this.payload.Video.getWatchStaticPath();
        const commentUrl = constants_1.WEBSERVER.URL + this.payload.getCommentStaticPath();
        const commentHtml = (0, markdown_1.toSafeHtml)(this.payload.text);
        return {
            template: 'video-comment-new',
            to,
            subject: 'New comment on your video ' + video.name,
            locals: {
                accountName: this.payload.Account.getDisplayName(),
                accountUrl: this.payload.Account.Actor.url,
                comment: this.payload,
                commentHtml,
                video,
                videoUrl,
                action: {
                    text: 'View comment',
                    url: commentUrl
                }
            }
        };
    }
}
exports.NewCommentForVideoOwner = NewCommentForVideoOwner;
