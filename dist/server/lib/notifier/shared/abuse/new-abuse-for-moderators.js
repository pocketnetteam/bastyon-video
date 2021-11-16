"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAbuseForModerators = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const url_1 = require("@server/lib/activitypub/url");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class NewAbuseForModerators extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.moderators = yield user_1.UserModel.listWithRight(6);
        });
    }
    log() {
        logger_1.logger.info('Notifying %s user/moderators of new abuse %s.', this.moderators.length, url_1.getAbuseTargetUrl(this.payload.abuseInstance));
    }
    getSetting(user) {
        return user.NotificationSetting.abuseAsModerator;
    }
    getTargetUsers() {
        return this.moderators;
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 3,
                userId: user.id,
                abuseId: this.payload.abuseInstance.id
            });
            notification.Abuse = this.payload.abuseInstance;
            return notification;
        });
    }
    createEmail(to) {
        const abuseInstance = this.payload.abuseInstance;
        if (abuseInstance.VideoAbuse)
            return this.createVideoAbuseEmail(to);
        if (abuseInstance.VideoCommentAbuse)
            return this.createCommentAbuseEmail(to);
        return this.createAccountAbuseEmail(to);
    }
    createVideoAbuseEmail(to) {
        const video = this.payload.abuseInstance.VideoAbuse.Video;
        const videoUrl = constants_1.WEBSERVER.URL + video.getWatchStaticPath();
        return {
            template: 'video-abuse-new',
            to,
            subject: `New video abuse report from ${this.payload.reporter}`,
            locals: {
                videoUrl,
                isLocal: video.remote === false,
                videoCreatedAt: new Date(video.createdAt).toLocaleString(),
                videoPublishedAt: new Date(video.publishedAt).toLocaleString(),
                videoName: video.name,
                reason: this.payload.abuse.reason,
                videoChannel: this.payload.abuse.video.channel,
                reporter: this.payload.reporter,
                action: this.buildEmailAction()
            }
        };
    }
    createCommentAbuseEmail(to) {
        const comment = this.payload.abuseInstance.VideoCommentAbuse.VideoComment;
        const commentUrl = constants_1.WEBSERVER.URL + comment.Video.getWatchStaticPath() + ';threadId=' + comment.getThreadId();
        return {
            template: 'video-comment-abuse-new',
            to,
            subject: `New comment abuse report from ${this.payload.reporter}`,
            locals: {
                commentUrl,
                videoName: comment.Video.name,
                isLocal: comment.isOwned(),
                commentCreatedAt: new Date(comment.createdAt).toLocaleString(),
                reason: this.payload.abuse.reason,
                flaggedAccount: this.payload.abuseInstance.FlaggedAccount.getDisplayName(),
                reporter: this.payload.reporter,
                action: this.buildEmailAction()
            }
        };
    }
    createAccountAbuseEmail(to) {
        const account = this.payload.abuseInstance.FlaggedAccount;
        const accountUrl = account.getClientUrl();
        return {
            template: 'account-abuse-new',
            to,
            subject: `New account abuse report from ${this.payload.reporter}`,
            locals: {
                accountUrl,
                accountDisplayName: account.getDisplayName(),
                isLocal: account.isOwned(),
                reason: this.payload.abuse.reason,
                reporter: this.payload.reporter,
                action: this.buildEmailAction()
            }
        };
    }
    buildEmailAction() {
        return {
            text: 'View report #' + this.payload.abuseInstance.id,
            url: constants_1.WEBSERVER.URL + '/admin/moderation/abuses/list?search=%23' + this.payload.abuseInstance.id
        };
    }
}
exports.NewAbuseForModerators = NewAbuseForModerators;
