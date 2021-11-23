"use strict";
var ThumbnailModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumbnailModel = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const sequelize_typescript_1 = require("sequelize-typescript");
const database_utils_1 = require("@server/helpers/database-utils");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const video_1 = require("./video");
const video_playlist_1 = require("./video-playlist");
let ThumbnailModel = ThumbnailModel_1 = class ThumbnailModel extends sequelize_typescript_1.Model {
    static removeOldFile(instance, options) {
        return (0, database_utils_1.afterCommitIfTransaction)(options.transaction, () => instance.removePreviousFilenameIfNeeded());
    }
    static removeFiles(instance) {
        logger_1.logger.info('Removing %s file %s.', ThumbnailModel_1.types[instance.type].label, instance.filename);
        instance.removeThumbnail()
            .catch(err => logger_1.logger.error('Cannot remove thumbnail file %s.', instance.filename, err));
    }
    static loadByFilename(filename, thumbnailType) {
        const query = {
            where: {
                filename,
                type: thumbnailType
            }
        };
        return ThumbnailModel_1.findOne(query);
    }
    static loadWithVideoByFilename(filename, thumbnailType) {
        const query = {
            where: {
                filename,
                type: thumbnailType
            },
            include: [
                {
                    model: video_1.VideoModel.unscoped(),
                    required: true
                }
            ]
        };
        return ThumbnailModel_1.findOne(query);
    }
    static buildPath(type, filename) {
        const directory = ThumbnailModel_1.types[type].directory;
        return (0, path_1.join)(directory, filename);
    }
    getFileUrl(video) {
        const staticPath = ThumbnailModel_1.types[this.type].staticPath + this.filename;
        if (video.isOwned())
            return constants_1.WEBSERVER.URL + staticPath;
        return this.fileUrl;
    }
    getPath() {
        return ThumbnailModel_1.buildPath(this.type, this.filename);
    }
    getPreviousPath() {
        return ThumbnailModel_1.buildPath(this.type, this.previousThumbnailFilename);
    }
    removeThumbnail() {
        return (0, fs_extra_1.remove)(this.getPath());
    }
    removePreviousFilenameIfNeeded() {
        if (!this.previousThumbnailFilename)
            return;
        const previousPath = this.getPreviousPath();
        (0, fs_extra_1.remove)(previousPath)
            .catch(err => logger_1.logger.error('Cannot remove previous thumbnail file %s.', previousPath, { err }));
        this.previousThumbnailFilename = undefined;
    }
};
ThumbnailModel.types = {
    [1]: {
        label: 'miniature',
        directory: config_1.CONFIG.STORAGE.THUMBNAILS_DIR,
        staticPath: constants_1.STATIC_PATHS.THUMBNAILS
    },
    [2]: {
        label: 'preview',
        directory: config_1.CONFIG.STORAGE.PREVIEWS_DIR,
        staticPath: constants_1.LAZY_STATIC_PATHS.PREVIEWS
    }
};
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], ThumbnailModel.prototype, "filename", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ThumbnailModel.prototype, "height", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ThumbnailModel.prototype, "width", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ThumbnailModel.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.COMMONS.URL.max)),
    (0, tslib_1.__metadata)("design:type", String)
], ThumbnailModel.prototype, "fileUrl", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], ThumbnailModel.prototype, "automaticallyGenerated", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_1.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ThumbnailModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_1.VideoModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_1.VideoModel)
], ThumbnailModel.prototype, "Video", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_playlist_1.VideoPlaylistModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ThumbnailModel.prototype, "videoPlaylistId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_playlist_1.VideoPlaylistModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_playlist_1.VideoPlaylistModel)
], ThumbnailModel.prototype, "VideoPlaylist", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], ThumbnailModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], ThumbnailModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.BeforeCreate,
    sequelize_typescript_1.BeforeUpdate,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [ThumbnailModel, Object]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], ThumbnailModel, "removeOldFile", null);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.AfterDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [ThumbnailModel]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], ThumbnailModel, "removeFiles", null);
ThumbnailModel = ThumbnailModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'thumbnail',
        indexes: [
            {
                fields: ['videoId']
            },
            {
                fields: ['videoPlaylistId'],
                unique: true
            },
            {
                fields: ['filename', 'type'],
                unique: true
            }
        ]
    })
], ThumbnailModel);
exports.ThumbnailModel = ThumbnailModel;
