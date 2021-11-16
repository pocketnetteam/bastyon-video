"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLCommand = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const abstract_command_1 = require("../shared/abstract-command");
class SQLCommand extends abstract_command_1.AbstractCommand {
    deleteAll(table) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.DELETE };
        return seq.query(`DELETE FROM "${table}"`, options);
    }
    getCount(table) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const seq = this.getSequelize();
            const options = { type: sequelize_1.QueryTypes.SELECT };
            const [{ total }] = yield seq.query(`SELECT COUNT(*) as total FROM "${table}"`, options);
            if (total === null)
                return 0;
            return parseInt(total, 10);
        });
    }
    setActorField(to, field, value) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(`UPDATE actor SET "${field}" = '${value}' WHERE url = '${to}'`, options);
    }
    setVideoField(uuid, field, value) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(`UPDATE video SET "${field}" = '${value}' WHERE uuid = '${uuid}'`, options);
    }
    setPlaylistField(uuid, field, value) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(`UPDATE "videoPlaylist" SET "${field}" = '${value}' WHERE uuid = '${uuid}'`, options);
    }
    countVideoViewsOf(uuid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const seq = this.getSequelize();
            const query = 'SELECT SUM("videoView"."views") AS "total" FROM "videoView" ' +
                `INNER JOIN "video" ON "video"."id" = "videoView"."videoId" WHERE "video"."uuid" = '${uuid}'`;
            const options = { type: sequelize_1.QueryTypes.SELECT };
            const [{ total }] = yield seq.query(query, options);
            if (!total)
                return 0;
            return parseInt(total + '', 10);
        });
    }
    getActorImage(filename) {
        return this.selectQuery(`SELECT * FROM "actorImage" WHERE filename = '${filename}'`)
            .then(rows => rows[0]);
    }
    selectQuery(query) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.SELECT };
        return seq.query(query, options);
    }
    updateQuery(query) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(query, options);
    }
    setPluginField(pluginName, field, value) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(`UPDATE "plugin" SET "${field}" = '${value}' WHERE "name" = '${pluginName}'`, options);
    }
    setPluginVersion(pluginName, newVersion) {
        return this.setPluginField(pluginName, 'version', newVersion);
    }
    setPluginLatestVersion(pluginName, newVersion) {
        return this.setPluginField(pluginName, 'latestVersion', newVersion);
    }
    setActorFollowScores(newScore) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(`UPDATE "actorFollow" SET "score" = ${newScore}`, options);
    }
    setTokenField(accessToken, field, value) {
        const seq = this.getSequelize();
        const options = { type: sequelize_1.QueryTypes.UPDATE };
        return seq.query(`UPDATE "oAuthToken" SET "${field}" = '${value}' WHERE "accessToken" = '${accessToken}'`, options);
    }
    cleanup() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.sequelize)
                return;
            yield this.sequelize.close();
            this.sequelize = undefined;
        });
    }
    getSequelize() {
        if (this.sequelize)
            return this.sequelize;
        const dbname = 'peertube_test' + this.server.internalServerNumber;
        const username = 'peertube';
        const password = 'peertube';
        const host = 'localhost';
        const port = 5432;
        this.sequelize = new sequelize_1.Sequelize(dbname, username, password, {
            dialect: 'postgres',
            host,
            port,
            logging: false
        });
        return this.sequelize;
    }
}
exports.SQLCommand = SQLCommand;
