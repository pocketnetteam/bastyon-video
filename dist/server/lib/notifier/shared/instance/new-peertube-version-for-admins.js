"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewPeerTubeVersionForAdmins = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class NewPeerTubeVersionForAdmins extends abstract_notification_1.AbstractNotification {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.admins = yield user_1.UserModel.listWithRight(4);
        });
    }
    log() {
        logger_1.logger.info('Notifying %s admins of new PeerTube version %s.', this.admins.length, this.payload.latestVersion);
    }
    getSetting(user) {
        return user.NotificationSetting.newPeerTubeVersion;
    }
    getTargetUsers() {
        return this.admins;
    }
    createNotification(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 18,
                userId: user.id,
                applicationId: this.payload.application.id
            });
            notification.Application = this.payload.application;
            return notification;
        });
    }
    createEmail(to) {
        return {
            to,
            template: 'peertube-version-new',
            subject: `A new PeerTube version is available: ${this.payload.latestVersion}`,
            locals: {
                latestVersion: this.payload.latestVersion
            }
        };
    }
}
exports.NewPeerTubeVersionForAdmins = NewPeerTubeVersionForAdmins;
