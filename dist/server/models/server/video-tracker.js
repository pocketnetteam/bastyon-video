"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoTrackerModel = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const video_1 = require("../video/video");
const tracker_1 = require("./tracker");
let VideoTrackerModel = class VideoTrackerModel extends sequelize_typescript_1.Model {
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoTrackerModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoTrackerModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_1.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoTrackerModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => tracker_1.TrackerModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoTrackerModel.prototype, "trackerId", void 0);
VideoTrackerModel = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'videoTracker',
        indexes: [
            {
                fields: ['videoId']
            },
            {
                fields: ['trackerId']
            }
        ]
    })
], VideoTrackerModel);
exports.VideoTrackerModel = VideoTrackerModel;
