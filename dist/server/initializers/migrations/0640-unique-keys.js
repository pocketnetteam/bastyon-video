"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
function up(utils) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        {
            yield utils.sequelize.query('DELETE FROM "actor" v1 USING (SELECT MIN(id) as id, "preferredUsername", "serverId" FROM "actor" ' +
                'GROUP BY "preferredUsername", "serverId" HAVING COUNT(*) > 1 AND "serverId" IS NOT NULL) v2 ' +
                'WHERE v1."preferredUsername" = v2."preferredUsername" AND v1."serverId" = v2."serverId" AND v1.id <> v2.id');
        }
        {
            yield utils.sequelize.query('DELETE FROM "actor" v1 USING (SELECT MIN(id) as id, "url" FROM "actor" GROUP BY "url" HAVING COUNT(*) > 1) v2 ' +
                'WHERE v1."url" = v2."url" AND v1.id <> v2.id');
        }
        {
            yield utils.sequelize.query('DELETE FROM "tag" v1 USING (SELECT MIN(id) as id, "name" FROM "tag" GROUP BY "name" HAVING COUNT(*) > 1) v2 ' +
                'WHERE v1."name" = v2."name" AND v1.id <> v2.id');
        }
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
