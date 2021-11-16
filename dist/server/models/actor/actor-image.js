"use strict";
var ActorImageModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorImageModel = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const sequelize_typescript_1 = require("sequelize-typescript");
const misc_1 = require("../../helpers/custom-validators/activitypub/misc");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const utils_1 = require("../utils");
let ActorImageModel = ActorImageModel_1 = class ActorImageModel extends sequelize_typescript_1.Model {
    static removeFilesAndSendDelete(instance) {
        logger_1.logger.info('Removing actor image file %s.', instance.filename);
        instance.removeImage()
            .catch(err => logger_1.logger.error('Cannot remove actor image file %s.', instance.filename, err));
    }
    static loadByName(filename) {
        const query = {
            where: {
                filename
            }
        };
        return ActorImageModel_1.findOne(query);
    }
    toFormattedJSON() {
        return {
            path: this.getStaticPath(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    getStaticPath() {
        if (this.type === 1) {
            return path_1.join(constants_1.LAZY_STATIC_PATHS.AVATARS, this.filename);
        }
        return path_1.join(constants_1.LAZY_STATIC_PATHS.BANNERS, this.filename);
    }
    getPath() {
        return path_1.join(config_1.CONFIG.STORAGE.ACTOR_IMAGES, this.filename);
    }
    removeImage() {
        const imagePath = path_1.join(config_1.CONFIG.STORAGE.ACTOR_IMAGES, this.filename);
        return fs_extra_1.remove(imagePath);
    }
    isOwned() {
        return !this.fileUrl;
    }
};
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ActorImageModel.prototype, "filename", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], ActorImageModel.prototype, "height", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], ActorImageModel.prototype, "width", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Is('ActorImageFileUrl', value => utils_1.throwIfNotValid(value, misc_1.isActivityPubUrlValid, 'fileUrl', true)),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ActorImageModel.prototype, "fileUrl", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Boolean)
], ActorImageModel.prototype, "onDisk", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], ActorImageModel.prototype, "type", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Date)
], ActorImageModel.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Date)
], ActorImageModel.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AfterDestroy,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ActorImageModel]),
    tslib_1.__metadata("design:returntype", void 0)
], ActorImageModel, "removeFilesAndSendDelete", null);
ActorImageModel = ActorImageModel_1 = tslib_1.__decorate([
    sequelize_typescript_1.Table({
        tableName: 'actorImage',
        indexes: [
            {
                fields: ['filename'],
                unique: true
            }
        ]
    })
], ActorImageModel);
exports.ActorImageModel = ActorImageModel;
