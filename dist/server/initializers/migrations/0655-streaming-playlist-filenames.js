"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const Sequelize = tslib_1.__importStar(require("sequelize"));
function up(utils) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        {
            for (const column of ['playlistUrl', 'segmentsSha256Url']) {
                const data = {
                    type: Sequelize.STRING,
                    allowNull: true,
                    defaultValue: null
                };
                yield utils.queryInterface.changeColumn('videoStreamingPlaylist', column, data);
            }
        }
        {
            yield utils.sequelize.query(`UPDATE "videoStreamingPlaylist" SET "playlistUrl" = NULL, "segmentsSha256Url" = NULL ` +
                `WHERE "videoId" IN (SELECT id FROM video WHERE remote IS FALSE)`);
        }
        {
            for (const column of ['playlistFilename', 'segmentsSha256Filename']) {
                const data = {
                    type: Sequelize.STRING,
                    allowNull: true,
                    defaultValue: null
                };
                yield utils.queryInterface.addColumn('videoStreamingPlaylist', column, data);
            }
        }
        {
            yield utils.sequelize.query(`UPDATE "videoStreamingPlaylist" SET "playlistFilename" = 'master.m3u8', "segmentsSha256Filename" = 'segments-sha256.json'`);
        }
        {
            for (const column of ['playlistFilename', 'segmentsSha256Filename']) {
                const data = {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: null
                };
                yield utils.queryInterface.changeColumn('videoStreamingPlaylist', column, data);
            }
        }
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
