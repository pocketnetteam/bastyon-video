"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCommentAbuseModel = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const video_comment_1 = require("../video/video-comment");
const abuse_1 = require("./abuse");
let VideoCommentAbuseModel = class VideoCommentAbuseModel extends sequelize_typescript_1.Model {
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoCommentAbuseModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoCommentAbuseModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => abuse_1.AbuseModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoCommentAbuseModel.prototype, "abuseId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => abuse_1.AbuseModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", abuse_1.AbuseModel)
], VideoCommentAbuseModel.prototype, "Abuse", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_comment_1.VideoCommentModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoCommentAbuseModel.prototype, "videoCommentId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_comment_1.VideoCommentModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'set null'
    }),
    (0, tslib_1.__metadata)("design:type", video_comment_1.VideoCommentModel)
], VideoCommentAbuseModel.prototype, "VideoComment", void 0);
VideoCommentAbuseModel = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'commentAbuse',
        indexes: [
            {
                fields: ['abuseId']
            },
            {
                fields: ['videoCommentId']
            }
        ]
    })
], VideoCommentAbuseModel);
exports.VideoCommentAbuseModel = VideoCommentAbuseModel;
