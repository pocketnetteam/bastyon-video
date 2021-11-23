"use strict";
var VideoViewModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoViewModel = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const video_1 = require("./video");
let VideoViewModel = VideoViewModel_1 = class VideoViewModel extends sequelize_typescript_1.Model {
    static removeOldRemoteViewsHistory(beforeDate) {
        const query = {
            where: {
                startDate: {
                    [sequelize_1.Op.lt]: beforeDate
                },
                videoId: {
                    [sequelize_1.Op.in]: (0, sequelize_1.literal)('(SELECT "id" FROM "video" WHERE "remote" IS TRUE)')
                }
            }
        };
        return VideoViewModel_1.destroy(query);
    }
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoViewModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    (0, tslib_1.__metadata)("design:type", Date)
], VideoViewModel.prototype, "startDate", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    (0, tslib_1.__metadata)("design:type", Date)
], VideoViewModel.prototype, "endDate", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoViewModel.prototype, "views", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_1.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoViewModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_1.VideoModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_1.VideoModel)
], VideoViewModel.prototype, "Video", void 0);
VideoViewModel = VideoViewModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'videoView',
        updatedAt: false,
        indexes: [
            {
                fields: ['videoId']
            },
            {
                fields: ['startDate']
            }
        ]
    })
], VideoViewModel);
exports.VideoViewModel = VideoViewModel;
