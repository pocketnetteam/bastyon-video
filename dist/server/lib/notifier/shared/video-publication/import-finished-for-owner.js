"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportFinishedForOwner = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class ImportFinishedForOwner extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.user = yield user_1.UserModel.loadByVideoImportId(this.videoImport.id);
        });
    }
    log() {
        logger_1.logger.info('Notifying user %s its video import %s is finished.', this.user.username, this.videoImport.getTargetIdentifier());
    }
    getSetting(user) {
        return user.NotificationSetting.myVideoImportFinished;
    }
    getTargetUsers() {
        if (!this.user)
            return [];
        return [this.user];
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: this.payload.success
                    ? 7
                    : 8,
                userId: user.id,
                videoImportId: this.videoImport.id
            });
            notification.VideoImport = this.videoImport;
            return notification;
        });
    }
    createEmail(to) {
        if (this.payload.success)
            return this.createSuccessEmail(to);
        return this.createFailEmail(to);
    }
    createSuccessEmail(to) {
        const videoUrl = constants_1.WEBSERVER.URL + this.videoImport.Video.getWatchStaticPath();
        return {
            to,
            subject: `Your video import ${this.videoImport.getTargetIdentifier()} is complete`,
            text: `Your video "${this.videoImport.getTargetIdentifier()}" just finished importing.`,
            locals: {
                title: 'Import complete',
                action: {
                    text: 'View video',
                    url: videoUrl
                }
            }
        };
    }
    createFailEmail(to) {
        const importUrl = constants_1.WEBSERVER.URL + '/my-library/video-imports';
        const text = `Your video import "${this.videoImport.getTargetIdentifier()}" encountered an error.` +
            '\n\n' +
            `See your videos import dashboard for more information: <a href="${importUrl}">${importUrl}</a>.`;
        return {
            to,
            subject: `Your video import "${this.videoImport.getTargetIdentifier()}" encountered an error`,
            text,
            locals: {
                title: 'Import failed',
                action: {
                    text: 'Review imports',
                    url: importUrl
                }
            }
        };
    }
    get videoImport() {
        return this.payload.videoImport;
    }
}
exports.ImportFinishedForOwner = ImportFinishedForOwner;
