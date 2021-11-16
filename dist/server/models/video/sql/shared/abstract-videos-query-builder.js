"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractVideosQueryBuilder = void 0;
const sequelize_1 = require("sequelize");
class AbstractVideosQueryBuilder {
    constructor() {
        this.replacements = {};
    }
    runQuery(options = {}) {
        const queryOptions = {
            transaction: options.transaction,
            logging: options.logging,
            replacements: this.replacements,
            type: sequelize_1.QueryTypes.SELECT,
            nest: false
        };
        return this.sequelize.query(this.query, queryOptions);
    }
}
exports.AbstractVideosQueryBuilder = AbstractVideosQueryBuilder;
