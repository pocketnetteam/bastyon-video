"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbuseStateChangeForReporter = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const url_1 = require("@server/lib/activitypub/url");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class AbuseStateChangeForReporter extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const reporter = this.abuse.ReporterAccount;
            if (reporter.isOwned() !== true)
                return;
            this.user = yield user_1.UserModel.loadByAccountActorId(this.abuse.ReporterAccount.actorId);
        });
    }
    log() {
        logger_1.logger.info('Notifying reporter of abuse % of state change.', url_1.getAbuseTargetUrl(this.abuse));
    }
    getSetting(user) {
        return user.NotificationSetting.abuseStateChange;
    }
    getTargetUsers() {
        if (!this.user)
            return [];
        return [this.user];
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 15,
                userId: user.id,
                abuseId: this.abuse.id
            });
            notification.Abuse = this.abuse;
            return notification;
        });
    }
    createEmail(to) {
        const text = this.abuse.state === 3
            ? 'Report #' + this.abuse.id + ' has been accepted'
            : 'Report #' + this.abuse.id + ' has been rejected';
        const abuseUrl = constants_1.WEBSERVER.URL + '/my-account/abuses?search=%23' + this.abuse.id;
        const action = {
            text,
            url: abuseUrl
        };
        return {
            template: 'abuse-state-change',
            to,
            subject: text,
            locals: {
                action,
                abuseId: this.abuse.id,
                abuseUrl,
                isAccepted: this.abuse.state === 3
            }
        };
    }
    get abuse() {
        return this.payload;
    }
}
exports.AbuseStateChangeForReporter = AbuseStateChangeForReporter;
