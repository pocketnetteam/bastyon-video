"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentMention = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const markdown_1 = require("@server/helpers/markdown");
const constants_1 = require("@server/initializers/constants");
const account_blocklist_1 = require("@server/models/account/account-blocklist");
const application_1 = require("@server/models/application/application");
const server_blocklist_1 = require("@server/models/server/server-blocklist");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const common_1 = require("../common");
class CommentMention extends common_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const extractedUsernames = this.payload.extractMentions();
            logger_1.logger.debug('Extracted %d username from comment %s.', extractedUsernames.length, this.payload.url, { usernames: extractedUsernames, text: this.payload.text });
            this.users = yield user_1.UserModel.listByUsernames(extractedUsernames);
            if (this.payload.Video.isOwned()) {
                const userException = yield user_1.UserModel.loadByVideoId(this.payload.videoId);
                this.users = this.users.filter(u => u.id !== userException.id);
            }
            this.users = this.users.filter(u => u.Account.id !== this.payload.accountId);
            if (this.users.length === 0)
                return;
            this.serverAccountId = (yield (0, application_1.getServerActor)()).Account.id;
            const sourceAccounts = this.users.map(u => u.Account.id).concat([this.serverAccountId]);
            this.accountMutedHash = yield account_blocklist_1.AccountBlocklistModel.isAccountMutedByMulti(sourceAccounts, this.payload.accountId);
            this.instanceMutedHash = yield server_blocklist_1.ServerBlocklistModel.isServerMutedByMulti(sourceAccounts, this.payload.Account.Actor.serverId);
        });
    }
    log() {
        logger_1.logger.info('Notifying %d users of new comment %s.', this.users.length, this.payload.url);
    }
    getSetting(user) {
        const accountId = user.Account.id;
        if (this.accountMutedHash[accountId] === true || this.instanceMutedHash[accountId] === true ||
            this.accountMutedHash[this.serverAccountId] === true || this.instanceMutedHash[this.serverAccountId] === true) {
            return 0;
        }
        return user.NotificationSetting.commentMention;
    }
    getTargetUsers() {
        return this.users;
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 11,
                userId: user.id,
                commentId: this.payload.id
            });
            notification.Comment = this.payload;
            return notification;
        });
    }
    createEmail(to) {
        const comment = this.payload;
        const accountName = comment.Account.getDisplayName();
        const video = comment.Video;
        const videoUrl = constants_1.WEBSERVER.URL + comment.Video.getWatchStaticPath();
        const commentUrl = constants_1.WEBSERVER.URL + comment.getCommentStaticPath();
        const commentHtml = (0, markdown_1.toSafeHtml)(comment.text);
        return {
            template: 'video-comment-mention',
            to,
            subject: 'Mention on video ' + video.name,
            locals: {
                comment,
                commentHtml,
                video,
                videoUrl,
                accountName,
                action: {
                    text: 'View comment',
                    url: commentUrl
                }
            }
        };
    }
}
exports.CommentMention = CommentMention;
