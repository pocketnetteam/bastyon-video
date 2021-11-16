"use strict";
var VideoJobInfoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoJobInfoModel = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const video_1 = require("./video");
let VideoJobInfoModel = VideoJobInfoModel_1 = class VideoJobInfoModel extends sequelize_typescript_1.Model {
    static load(videoId, transaction) {
        const where = {
            videoId
        };
        return VideoJobInfoModel_1.findOne({ where, transaction });
    }
    static increaseOrCreate(videoUUID, column) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const options = { type: sequelize_1.QueryTypes.SELECT, bind: { videoUUID } };
            const [{ pendingMove }] = yield VideoJobInfoModel_1.sequelize.query(`
    INSERT INTO "videoJobInfo" ("videoId", "${column}", "createdAt", "updatedAt")
    SELECT
      "video"."id" AS "videoId", 1, NOW(), NOW()
    FROM
      "video"
    WHERE
      "video"."uuid" = $videoUUID
    ON CONFLICT ("videoId") DO UPDATE
    SET
      "${column}" = "videoJobInfo"."${column}" + 1,
      "updatedAt" = NOW()
    RETURNING
      "${column}"
    `, options);
            return pendingMove;
        });
    }
    static decrease(videoUUID, column) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const options = { type: sequelize_1.QueryTypes.SELECT, bind: { videoUUID } };
            const [{ pendingMove }] = yield VideoJobInfoModel_1.sequelize.query(`
    UPDATE
      "videoJobInfo"
    SET
      "${column}" = "videoJobInfo"."${column}" - 1,
      "updatedAt" = NOW()
    FROM "video"
    WHERE
      "video"."id" = "videoJobInfo"."videoId" AND "video"."uuid" = $videoUUID
    RETURNING
      "${column}";
    `, options);
            return pendingMove;
        });
    }
};
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Date)
], VideoJobInfoModel.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Date)
], VideoJobInfoModel.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.IsInt,
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], VideoJobInfoModel.prototype, "pendingMove", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.IsInt,
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], VideoJobInfoModel.prototype, "pendingTranscode", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.ForeignKey(() => video_1.VideoModel),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], VideoJobInfoModel.prototype, "videoId", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.BelongsTo(() => video_1.VideoModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    tslib_1.__metadata("design:type", video_1.VideoModel)
], VideoJobInfoModel.prototype, "Video", void 0);
VideoJobInfoModel = VideoJobInfoModel_1 = tslib_1.__decorate([
    sequelize_typescript_1.Table({
        tableName: 'videoJobInfo',
        indexes: [
            {
                fields: ['videoId'],
                where: {
                    videoId: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            }
        ]
    })
], VideoJobInfoModel);
exports.VideoJobInfoModel = VideoJobInfoModel;
