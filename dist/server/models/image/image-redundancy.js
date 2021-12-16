"use strict";
var ImageRedundancyModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRedundancyModel = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const path_1 = require("path");
const config_1 = require("@server/initializers/config");
let ImageRedundancyModel = ImageRedundancyModel_1 = class ImageRedundancyModel extends sequelize_typescript_1.Model {
    static getImageRedundancyForActor(actorUrl) {
        const query = {
            where: {
                actorUrl: actorUrl
            },
            defaults: {
                fromDate: new Date(0)
            }
        };
        return ImageRedundancyModel_1.findOrCreate(query);
    }
    static getImagesFromDate(imageRedundancy) {
        const url = new URL(path_1.join(imageRedundancy.actorUrl, 'api/v1/images'));
        url.search = new URLSearchParams({
            order: '-createdAt',
            limit: config_1.CONFIG.REDUNDANCY.IMAGES.NB_IMAGES_PER_REQ.toString(),
            createdAt: imageRedundancy.fromDate.toISOString()
        }).toString();
        return node_fetch_1.default(url);
    }
};
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageRedundancyModel.prototype, "actorUrl", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], ImageRedundancyModel.prototype, "fromDate", void 0);
ImageRedundancyModel = ImageRedundancyModel_1 = tslib_1.__decorate([
    sequelize_typescript_1.Table({
        tableName: 'imageRedundancy',
        indexes: [
            { fields: ['actorUrl'] },
            { fields: ['fromDate'] }
        ]
    })
], ImageRedundancyModel);
exports.ImageRedundancyModel = ImageRedundancyModel;
