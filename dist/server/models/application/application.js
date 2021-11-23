"use strict";
var ApplicationModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationModel = exports.getServerActor = void 0;
const tslib_1 = require("tslib");
const memoizee_1 = (0, tslib_1.__importDefault)(require("memoizee"));
const sequelize_typescript_1 = require("sequelize-typescript");
const account_1 = require("../account/account");
exports.getServerActor = (0, memoizee_1.default)(function () {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const application = yield ApplicationModel.load();
        if (!application)
            throw Error('Could not load Application from database.');
        const actor = application.Account.Actor;
        actor.Account = application.Account;
        return actor;
    });
}, { promise: true });
let ApplicationModel = ApplicationModel_1 = class ApplicationModel extends sequelize_typescript_1.Model {
    static countTotal() {
        return ApplicationModel_1.count();
    }
    static load() {
        return ApplicationModel_1.findOne();
    }
};
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.IsInt,
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ApplicationModel.prototype, "migrationVersion", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], ApplicationModel.prototype, "latestPeerTubeVersion", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => account_1.AccountModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", account_1.AccountModel)
], ApplicationModel.prototype, "Account", void 0);
ApplicationModel = ApplicationModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.DefaultScope)(() => ({
        include: [
            {
                model: account_1.AccountModel,
                required: true
            }
        ]
    })),
    (0, sequelize_typescript_1.Table)({
        tableName: 'application',
        timestamps: false
    })
], ApplicationModel);
exports.ApplicationModel = ApplicationModel;
