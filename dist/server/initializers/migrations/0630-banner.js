"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const Sequelize = (0, tslib_1.__importStar)(require("sequelize"));
function up(utils) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        {
            yield utils.sequelize.query(`ALTER TABLE "avatar" RENAME to "actorImage"`);
        }
        {
            const data = {
                type: Sequelize.INTEGER,
                defaultValue: null,
                allowNull: true
            };
            yield utils.queryInterface.addColumn('actorImage', 'type', data);
        }
        {
            yield utils.sequelize.query(`UPDATE "actorImage" SET "type" = 1`);
        }
        {
            const data = {
                type: Sequelize.INTEGER,
                defaultValue: null,
                allowNull: false
            };
            yield utils.queryInterface.changeColumn('actorImage', 'type', data);
        }
        {
            yield utils.sequelize.query(`ALTER TABLE "actor" ADD COLUMN "bannerId" INTEGER REFERENCES "actorImage" ("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        }
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
