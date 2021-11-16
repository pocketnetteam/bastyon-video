"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const Sequelize = tslib_1.__importStar(require("sequelize"));
function up(utils) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        {
            const notificationSettingColumns = ['newPeerTubeVersion', 'newPluginVersion'];
            for (const column of notificationSettingColumns) {
                const data = {
                    type: Sequelize.INTEGER,
                    defaultValue: null,
                    allowNull: true
                };
                yield utils.queryInterface.addColumn('userNotificationSetting', column, data);
            }
            {
                const query = 'UPDATE "userNotificationSetting" SET "newPeerTubeVersion" = 3, "newPluginVersion" = 1';
                yield utils.sequelize.query(query);
            }
            for (const column of notificationSettingColumns) {
                const data = {
                    type: Sequelize.INTEGER,
                    defaultValue: null,
                    allowNull: false
                };
                yield utils.queryInterface.changeColumn('userNotificationSetting', column, data);
            }
        }
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
