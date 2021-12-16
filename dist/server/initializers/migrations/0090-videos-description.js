"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const Sequelize = tslib_1.__importStar(require("sequelize"));
function up(utils) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const q = utils.queryInterface;
        const data = {
            type: Sequelize.STRING(3000),
            allowNull: false
        };
        yield q.changeColumn('Videos', 'description', data);
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;