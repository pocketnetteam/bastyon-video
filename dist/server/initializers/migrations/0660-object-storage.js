"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const Sequelize = (0, tslib_1.__importStar)(require("sequelize"));
function up(utils) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        {
            const query = `
    CREATE TABLE IF NOT EXISTS "videoJobInfo" (
      "id" serial,
      "pendingMove" INTEGER NOT NULL,
      "pendingTranscode" INTEGER NOT NULL,
      "videoId" serial UNIQUE NOT NULL REFERENCES "video" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "createdAt" timestamp WITH time zone NOT NULL,
      "updatedAt" timestamp WITH time zone NOT NULL,
      PRIMARY KEY ("id")
    );
    `;
            yield utils.sequelize.query(query);
        }
        {
            yield utils.queryInterface.addColumn('videoFile', 'storage', {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
            });
            yield utils.queryInterface.changeColumn('videoFile', 'storage', { type: Sequelize.INTEGER, allowNull: false, defaultValue: null });
        }
        {
            yield utils.queryInterface.addColumn('videoStreamingPlaylist', 'storage', {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
            });
            yield utils.queryInterface.changeColumn('videoStreamingPlaylist', 'storage', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: null
            });
        }
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
