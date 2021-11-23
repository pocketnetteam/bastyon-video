"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewPluginVersionForAdmins = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const user_1 = require("@server/models/user/user");
const user_notification_1 = require("@server/models/user/user-notification");
const abstract_notification_1 = require("../common/abstract-notification");
class NewPluginVersionForAdmins extends abstract_notification_1.AbstractNotification {
    prepare() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.admins = yield user_1.UserModel.listWithRight(4);
        });
    }
    log() {
        logger_1.logger.info('Notifying %s admins of new PeerTube version %s.', this.admins.length, this.payload.latestVersion);
    }
    getSetting(user) {
        return user.NotificationSetting.newPluginVersion;
    }
    getTargetUsers() {
        return this.admins;
    }
    createNotification(user) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const notification = yield user_notification_1.UserNotificationModel.create({
                type: 17,
                userId: user.id,
                pluginId: this.plugin.id
            });
            notification.Plugin = this.plugin;
            return notification;
        });
    }
    createEmail(to) {
        const pluginUrl = constants_1.WEBSERVER.URL + '/admin/plugins/list-installed?pluginType=' + this.plugin.type;
        return {
            to,
            template: 'plugin-version-new',
            subject: `A new plugin/theme version is available: ${this.plugin.name}@${this.plugin.latestVersion}`,
            locals: {
                pluginName: this.plugin.name,
                latestVersion: this.plugin.latestVersion,
                pluginUrl
            }
        };
    }
    get plugin() {
        return this.payload;
    }
}
exports.NewPluginVersionForAdmins = NewPluginVersionForAdmins;
