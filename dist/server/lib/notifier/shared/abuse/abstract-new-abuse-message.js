"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNewAbuseMessage = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("@server/initializers/constants");
const account_1 = require("@server/models/account/account");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class AbstractNewAbuseMessage extends abstract_notification_1.AbstractNotification {
    loadMessageAccount() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.messageAccount = yield account_1.AccountModel.load(this.message.accountId);
        });
    }
    getSetting(user) {
        return user.NotificationSetting.abuseNewMessage;
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 16,
                userId: user.id,
                abuseId: this.abuse.id
            });
            notification.Abuse = this.abuse;
            return notification;
        });
    }
    createEmailFor(to, target) {
        const text = 'New message on report #' + this.abuse.id;
        const abuseUrl = target === 'moderator'
            ? constants_1.WEBSERVER.URL + '/admin/moderation/abuses/list?search=%23' + this.abuse.id
            : constants_1.WEBSERVER.URL + '/my-account/abuses?search=%23' + this.abuse.id;
        const action = {
            text,
            url: abuseUrl
        };
        return {
            template: 'abuse-new-message',
            to,
            subject: text,
            locals: {
                abuseId: this.abuse.id,
                abuseUrl: action.url,
                messageAccountName: this.messageAccount.getDisplayName(),
                messageText: this.message.message,
                action
            }
        };
    }
    get abuse() {
        return this.payload.abuse;
    }
    get message() {
        return this.payload.message;
    }
}
exports.AbstractNewAbuseMessage = AbstractNewAbuseMessage;
