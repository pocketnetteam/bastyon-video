"use strict";
var ImageModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageModel = void 0;
const tslib_1 = require("tslib");
const memoizee_1 = tslib_1.__importDefault(require("memoizee"));
const sequelize_typescript_1 = require("sequelize-typescript");
const shared_1 = require("../shared");
const constants_1 = require("../../initializers/constants");
const path_1 = require("path");
const config_1 = require("@server/initializers/config");
const webtorrent_1 = require("@server/helpers/webtorrent");
const parse_torrent_1 = tslib_1.__importDefault(require("parse-torrent"));
const fs_extra_1 = require("fs-extra");
let ImageModel = ImageModel_1 = class ImageModel extends sequelize_typescript_1.Model {
    static doesInfohashExist(infoHash) {
        const query = 'SELECT 1 FROM "image" WHERE "infoHash" = $infoHash LIMIT 1';
        return shared_1.doesExist(query, { infoHash });
    }
    static getImageStaticUrl(imageId, imageName, webServUrl = constants_1.WEBSERVER.URL) {
        return webServUrl.replace('http:', 'https:') + path_1.join(constants_1.STATIC_PATHS.IMAGES, imageId, imageName);
    }
    static getTorrentStaticUrl(imageId, webServUrl = constants_1.WEBSERVER.URL) {
        return webServUrl.replace('http:', 'https:') + path_1.join(constants_1.STATIC_PATHS.TORRENTS, imageId + '.torrent');
    }
    static getImageStaticPath(imageId, imageName) {
        return path_1.join(config_1.CONFIG.STORAGE.IMAGES_DIR, imageId, imageName);
    }
    static getTorrentStaticPath(imageId) {
        return path_1.join(config_1.CONFIG.STORAGE.TORRENTS_DIR, imageId + '.torrent');
    }
    static generateTorrentForImage(imageId, destFolder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const torrentArgs = {
                name: imageId,
                createdBy: 'PeerTube',
                announceList: [
                    [constants_1.WEBSERVER.WS + '://' + constants_1.WEBSERVER.HOSTNAME + ':' + constants_1.WEBSERVER.PORT + '/tracker/socket'],
                    [constants_1.WEBSERVER.URL + '/tracker/announce']
                ],
                urlList: [
                    constants_1.WEBSERVER.URL + constants_1.STATIC_PATHS.IMAGES_WEBSEED
                ]
            };
            const torrentContent = yield webtorrent_1.createTorrentPromise(destFolder, torrentArgs);
            const torrentPath = ImageModel_1.getTorrentStaticPath(imageId);
            const parsedTorrent = parse_torrent_1.default(torrentContent);
            yield fs_extra_1.writeFile(torrentPath, torrentContent);
            return parsedTorrent.infoHash;
        });
    }
};
ImageModel.doesInfohashExistCached = memoizee_1.default(ImageModel_1.doesInfohashExist, {
    promise: true,
    max: constants_1.MEMOIZE_LENGTH.INFO_HASH_EXISTS,
    maxAge: constants_1.MEMOIZE_TTL.INFO_HASH_EXISTS
});
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "id", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Date)
], ImageModel.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "originalname", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "filename", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "thumbnailname", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], ImageModel.prototype, "size", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "mimetype", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "extname", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], ImageModel.prototype, "infoHash", void 0);
ImageModel = ImageModel_1 = tslib_1.__decorate([
    sequelize_typescript_1.Table({
        tableName: 'image',
        indexes: [
            { fields: ['id'], unique: true },
            { fields: ['createdAt'] },
            { fields: ['originalname'] },
            { fields: ['filename'] },
            { fields: ['thumbnailname'] },
            { fields: ['size'] },
            { fields: ['mimetype'] },
            { fields: ['extname'] },
            { fields: ['infoHash'] }
        ]
    })
], ImageModel);
exports.ImageModel = ImageModel;
