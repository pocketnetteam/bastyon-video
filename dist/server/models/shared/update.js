"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAsUpdated = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("@server/initializers/database");
function setAsUpdated(table, id, transaction) {
    return database_1.sequelizeTypescript.query(`UPDATE "${table}" SET "updatedAt" = :updatedAt WHERE id = :id`, {
        replacements: { table, id, updatedAt: new Date() },
        type: sequelize_1.QueryTypes.UPDATE,
        transaction
    });
}
exports.setAsUpdated = setAsUpdated;
