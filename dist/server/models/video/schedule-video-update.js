"use strict";
var ScheduleVideoUpdateModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleVideoUpdateModel = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const video_1 = require("./video");
let ScheduleVideoUpdateModel = ScheduleVideoUpdateModel_1 = class ScheduleVideoUpdateModel extends sequelize_typescript_1.Model {
    static areVideosToUpdate() {
        const query = {
            logging: false,
            attributes: ['id'],
            where: {
                updateAt: {
                    [sequelize_1.Op.lte]: new Date()
                }
            }
        };
        return ScheduleVideoUpdateModel_1.findOne(query)
            .then(res => !!res);
    }
    static listVideosToUpdate(transaction) {
        const query = {
            where: {
                updateAt: {
                    [sequelize_1.Op.lte]: new Date()
                }
            },
            transaction
        };
        return ScheduleVideoUpdateModel_1.findAll(query);
    }
    static deleteByVideoId(videoId, t) {
        const query = {
            where: {
                videoId
            },
            transaction: t
        };
        return ScheduleVideoUpdateModel_1.destroy(query);
    }
    toFormattedJSON() {
        return {
            updateAt: this.updateAt,
            privacy: this.privacy || undefined
        };
    }
};
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Date)
], ScheduleVideoUpdateModel.prototype, "updateAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ScheduleVideoUpdateModel.prototype, "privacy", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], ScheduleVideoUpdateModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], ScheduleVideoUpdateModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_1.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ScheduleVideoUpdateModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_1.VideoModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", video_1.VideoModel)
], ScheduleVideoUpdateModel.prototype, "Video", void 0);
ScheduleVideoUpdateModel = ScheduleVideoUpdateModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'scheduleVideoUpdate',
        indexes: [
            {
                fields: ['videoId'],
                unique: true
            },
            {
                fields: ['updateAt']
            }
        ]
    })
], ScheduleVideoUpdateModel);
exports.ScheduleVideoUpdateModel = ScheduleVideoUpdateModel;
