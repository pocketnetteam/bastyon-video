"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationForModerators = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class RegistrationForModerators extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.moderators = yield user_1.UserModel.listWithRight(1);
        });
    }
    log() {
        logger_1.logger.info('Notifying %s moderators of new user registration of %s.', this.moderators.length, this.payload.username);
    }
    getSetting(user) {
        return user.NotificationSetting.newUserRegistration;
    }
    getTargetUsers() {
        return this.moderators;
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 9,
                userId: user.id,
                accountId: this.payload.Account.id
            });
            notification.Account = this.payload.Account;
            return notification;
        });
    }
    createEmail(to) {
        return {
            template: 'user-registered',
            to,
            subject: `a new user registered on ${config_1.CONFIG.INSTANCE.NAME}: ${this.payload.username}`,
            locals: {
                user: this.payload
            }
        };
    }
}
exports.RegistrationForModerators = RegistrationForModerators;
