"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoTagModel = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const tag_1 = require("./tag");
const video_1 = require("./video");
let VideoTagModel = class VideoTagModel extends sequelize_typescript_1.Model {
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoTagModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoTagModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_1.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoTagModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => tag_1.TagModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoTagModel.prototype, "tagId", void 0);
VideoTagModel = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'videoTag',
        indexes: [
            {
                fields: ['videoId']
            },
            {
                fields: ['tagId']
            }
        ]
    })
], VideoTagModel);
exports.VideoTagModel = VideoTagModel;
