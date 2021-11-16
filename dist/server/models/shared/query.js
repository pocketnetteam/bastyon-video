"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesExist = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("@server/initializers/database");
function doesExist(query, bind) {
    const options = {
        type: sequelize_1.QueryTypes.SELECT,
        bind,
        raw: true
    };
    return database_1.sequelizeTypescript.query(query, options)
        .then(results => results.length === 1);
}
exports.doesExist = doesExist;
