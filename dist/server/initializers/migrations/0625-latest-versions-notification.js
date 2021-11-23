"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
function up(utils) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        {
            yield utils.sequelize.query(`
      ALTER TABLE "userNotification"
      ADD COLUMN "applicationId" INTEGER REFERENCES "application" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      ADD COLUMN "pluginId" INTEGER REFERENCES "plugin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
        }
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
