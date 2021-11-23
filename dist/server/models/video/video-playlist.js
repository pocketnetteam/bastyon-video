"use strict";
var VideoPlaylistModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPlaylistModel = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("@server/helpers/uuid");
const core_utils_1 = require("@shared/core-utils");
const activitypub_1 = require("../../helpers/activitypub");
const misc_1 = require("../../helpers/custom-validators/activitypub/misc");
const video_playlists_1 = require("../../helpers/custom-validators/video-playlists");
const constants_1 = require("../../initializers/constants");
const account_1 = require("../account/account");
const actor_1 = require("../actor/actor");
const shared_1 = require("../shared");
const utils_1 = require("../utils");
const thumbnail_1 = require("./thumbnail");
const video_channel_1 = require("./video-channel");
const video_playlist_element_1 = require("./video-playlist-element");
var ScopeNames;
(function (ScopeNames) {
    ScopeNames["AVAILABLE_FOR_LIST"] = "AVAILABLE_FOR_LIST";
    ScopeNames["WITH_VIDEOS_LENGTH"] = "WITH_VIDEOS_LENGTH";
    ScopeNames["WITH_ACCOUNT_AND_CHANNEL_SUMMARY"] = "WITH_ACCOUNT_AND_CHANNEL_SUMMARY";
    ScopeNames["WITH_ACCOUNT"] = "WITH_ACCOUNT";
    ScopeNames["WITH_THUMBNAIL"] = "WITH_THUMBNAIL";
    ScopeNames["WITH_ACCOUNT_AND_CHANNEL"] = "WITH_ACCOUNT_AND_CHANNEL";
})(ScopeNames || (ScopeNames = {}));
function getVideoLengthSelect() {
    return 'SELECT COUNT("id") FROM "videoPlaylistElement" WHERE "videoPlaylistId" = "VideoPlaylistModel"."id"';
}
let VideoPlaylistModel = VideoPlaylistModel_1 = class VideoPlaylistModel extends sequelize_typescript_1.Model {
    static listForApi(options) {
        const query = {
            offset: options.start,
            limit: options.count,
            order: (0, utils_1.getPlaylistSort)(options.sort)
        };
        const scopes = [
            {
                method: [
                    ScopeNames.AVAILABLE_FOR_LIST,
                    Object.assign(Object.assign({}, (0, core_utils_1.pick)(options, ['type', 'followerActorId', 'accountId', 'videoChannelId', 'listMyPlaylists', 'search', 'host', 'uuids'])), { withVideos: options.withVideos || false })
                ]
            },
            ScopeNames.WITH_VIDEOS_LENGTH,
            ScopeNames.WITH_THUMBNAIL
        ];
        return VideoPlaylistModel_1
            .scope(scopes)
            .findAndCountAll(query)
            .then(({ rows, count }) => {
            return { total: count, data: rows };
        });
    }
    static searchForApi(options) {
        return VideoPlaylistModel_1.listForApi(Object.assign(Object.assign({}, options), { type: 1, listMyPlaylists: false, withVideos: true }));
    }
    static listPublicUrlsOfForAP(options, start, count) {
        const where = {
            privacy: 1
        };
        if (options.account) {
            Object.assign(where, { ownerAccountId: options.account.id });
        }
        if (options.channel) {
            Object.assign(where, { videoChannelId: options.channel.id });
        }
        const query = {
            attributes: ['url'],
            offset: start,
            limit: count,
            where
        };
        return VideoPlaylistModel_1.findAndCountAll(query)
            .then(({ rows, count }) => {
            return { total: count, data: rows.map(p => p.url) };
        });
    }
    static listPlaylistIdsOf(accountId, videoIds) {
        const query = {
            attributes: ['id'],
            where: {
                ownerAccountId: accountId
            },
            include: [
                {
                    attributes: ['id', 'videoId', 'startTimestamp', 'stopTimestamp'],
                    model: video_playlist_element_1.VideoPlaylistElementModel.unscoped(),
                    where: {
                        videoId: {
                            [sequelize_1.Op.in]: videoIds
                        }
                    },
                    required: true
                }
            ]
        };
        return VideoPlaylistModel_1.findAll(query);
    }
    static doesPlaylistExist(url) {
        const query = {
            attributes: ['id'],
            where: {
                url
            }
        };
        return VideoPlaylistModel_1
            .findOne(query)
            .then(e => !!e);
    }
    static loadWithAccountAndChannelSummary(id, transaction) {
        const where = (0, utils_1.buildWhereIdOrUUID)(id);
        const query = {
            where,
            transaction
        };
        return VideoPlaylistModel_1
            .scope([ScopeNames.WITH_ACCOUNT_AND_CHANNEL_SUMMARY, ScopeNames.WITH_VIDEOS_LENGTH, ScopeNames.WITH_THUMBNAIL])
            .findOne(query);
    }
    static loadWithAccountAndChannel(id, transaction) {
        const where = (0, utils_1.buildWhereIdOrUUID)(id);
        const query = {
            where,
            transaction
        };
        return VideoPlaylistModel_1
            .scope([ScopeNames.WITH_ACCOUNT_AND_CHANNEL, ScopeNames.WITH_VIDEOS_LENGTH, ScopeNames.WITH_THUMBNAIL])
            .findOne(query);
    }
    static loadByUrlAndPopulateAccount(url) {
        const query = {
            where: {
                url
            }
        };
        return VideoPlaylistModel_1.scope([ScopeNames.WITH_ACCOUNT, ScopeNames.WITH_THUMBNAIL]).findOne(query);
    }
    static loadByUrlWithAccountAndChannelSummary(url) {
        const query = {
            where: {
                url
            }
        };
        return VideoPlaylistModel_1
            .scope([ScopeNames.WITH_ACCOUNT_AND_CHANNEL_SUMMARY, ScopeNames.WITH_VIDEOS_LENGTH, ScopeNames.WITH_THUMBNAIL])
            .findOne(query);
    }
    static getPrivacyLabel(privacy) {
        return constants_1.VIDEO_PLAYLIST_PRIVACIES[privacy] || 'Unknown';
    }
    static getTypeLabel(type) {
        return constants_1.VIDEO_PLAYLIST_TYPES[type] || 'Unknown';
    }
    static resetPlaylistsOfChannel(videoChannelId, transaction) {
        const query = {
            where: {
                videoChannelId
            },
            transaction
        };
        return VideoPlaylistModel_1.update({ privacy: 3, videoChannelId: null }, query);
    }
    setAndSaveThumbnail(thumbnail, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            thumbnail.videoPlaylistId = this.id;
            this.Thumbnail = yield thumbnail.save({ transaction: t });
        });
    }
    hasThumbnail() {
        return !!this.Thumbnail;
    }
    hasGeneratedThumbnail() {
        return this.hasThumbnail() && this.Thumbnail.automaticallyGenerated === true;
    }
    generateThumbnailName() {
        const extension = '.jpg';
        return 'playlist-' + (0, uuid_1.buildUUID)() + extension;
    }
    getThumbnailUrl() {
        if (!this.hasThumbnail())
            return null;
        return constants_1.WEBSERVER.URL + constants_1.STATIC_PATHS.THUMBNAILS + this.Thumbnail.filename;
    }
    getThumbnailStaticPath() {
        if (!this.hasThumbnail())
            return null;
        return (0, path_1.join)(constants_1.STATIC_PATHS.THUMBNAILS, this.Thumbnail.filename);
    }
    getWatchStaticPath() {
        return (0, core_utils_1.buildPlaylistWatchPath)({ shortUUID: (0, uuid_1.uuidToShort)(this.uuid) });
    }
    getEmbedStaticPath() {
        return (0, core_utils_1.buildPlaylistEmbedPath)(this);
    }
    static getStats() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const totalLocalPlaylists = yield VideoPlaylistModel_1.count({
                include: [
                    {
                        model: account_1.AccountModel,
                        required: true,
                        include: [
                            {
                                model: actor_1.ActorModel,
                                required: true,
                                where: {
                                    serverId: null
                                }
                            }
                        ]
                    }
                ],
                where: {
                    privacy: 1
                }
            });
            return {
                totalLocalPlaylists
            };
        });
    }
    setAsRefreshed() {
        return (0, shared_1.setAsUpdated)('videoPlaylist', this.id);
    }
    setVideosLength(videosLength) {
        this.set('videosLength', videosLength, { raw: true });
    }
    isOwned() {
        return this.OwnerAccount.isOwned();
    }
    isOutdated() {
        if (this.isOwned())
            return false;
        return (0, utils_1.isOutdated)(this, constants_1.ACTIVITY_PUB.VIDEO_PLAYLIST_REFRESH_INTERVAL);
    }
    toFormattedJSON() {
        return {
            id: this.id,
            uuid: this.uuid,
            shortUUID: (0, uuid_1.uuidToShort)(this.uuid),
            isLocal: this.isOwned(),
            url: this.url,
            displayName: this.name,
            description: this.description,
            privacy: {
                id: this.privacy,
                label: VideoPlaylistModel_1.getPrivacyLabel(this.privacy)
            },
            thumbnailPath: this.getThumbnailStaticPath(),
            embedPath: this.getEmbedStaticPath(),
            type: {
                id: this.type,
                label: VideoPlaylistModel_1.getTypeLabel(this.type)
            },
            videosLength: this.get('videosLength'),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            ownerAccount: this.OwnerAccount.toFormattedSummaryJSON(),
            videoChannel: this.VideoChannel
                ? this.VideoChannel.toFormattedSummaryJSON()
                : null
        };
    }
    toActivityPubObject(page, t) {
        const handler = (start, count) => {
            return video_playlist_element_1.VideoPlaylistElementModel.listUrlsOfForAP(this.id, start, count, t);
        };
        let icon;
        if (this.hasThumbnail()) {
            icon = {
                type: 'Image',
                url: this.getThumbnailUrl(),
                mediaType: 'image/jpeg',
                width: constants_1.THUMBNAILS_SIZE.width,
                height: constants_1.THUMBNAILS_SIZE.height
            };
        }
        return (0, activitypub_1.activityPubCollectionPagination)(this.url, handler, page)
            .then(o => {
            return Object.assign(o, {
                type: 'Playlist',
                name: this.name,
                content: this.description,
                uuid: this.uuid,
                published: this.createdAt.toISOString(),
                updated: this.updatedAt.toISOString(),
                attributedTo: this.VideoChannel ? [this.VideoChannel.Actor.url] : [],
                icon
            });
        });
    }
};
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoPlaylistModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoPlaylistModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoPlaylistName', value => (0, utils_1.throwIfNotValid)(value, video_playlists_1.isVideoPlaylistNameValid, 'name')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoPlaylistModel.prototype, "name", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Is)('VideoPlaylistDescription', value => (0, utils_1.throwIfNotValid)(value, video_playlists_1.isVideoPlaylistDescriptionValid, 'description', true)),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEO_PLAYLISTS.DESCRIPTION.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoPlaylistModel.prototype, "description", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoPlaylistPrivacy', value => (0, utils_1.throwIfNotValid)(value, video_playlists_1.isVideoPlaylistPrivacyValid, 'privacy')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoPlaylistModel.prototype, "privacy", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoPlaylistUrl', value => (0, utils_1.throwIfNotValid)(value, misc_1.isActivityPubUrlValid, 'url')),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEO_PLAYLISTS.URL.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoPlaylistModel.prototype, "url", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.IsUUID)(4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    (0, tslib_1.__metadata)("design:type", String)
], VideoPlaylistModel.prototype, "uuid", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoPlaylistModel.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => account_1.AccountModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoPlaylistModel.prototype, "ownerAccountId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => account_1.AccountModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", account_1.AccountModel)
], VideoPlaylistModel.prototype, "OwnerAccount", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_channel_1.VideoChannelModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoPlaylistModel.prototype, "videoChannelId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_channel_1.VideoChannelModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_channel_1.VideoChannelModel)
], VideoPlaylistModel.prototype, "VideoChannel", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_playlist_element_1.VideoPlaylistElementModel, {
        foreignKey: {
            name: 'videoPlaylistId',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoPlaylistModel.prototype, "VideoPlaylistElements", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => thumbnail_1.ThumbnailModel, {
        foreignKey: {
            name: 'videoPlaylistId',
            allowNull: true
        },
        onDelete: 'CASCADE',
        hooks: true
    }),
    (0, tslib_1.__metadata)("design:type", thumbnail_1.ThumbnailModel)
], VideoPlaylistModel.prototype, "Thumbnail", void 0);
VideoPlaylistModel = VideoPlaylistModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Scopes)(() => ({
        [ScopeNames.WITH_THUMBNAIL]: {
            include: [
                {
                    model: thumbnail_1.ThumbnailModel,
                    required: false
                }
            ]
        },
        [ScopeNames.WITH_VIDEOS_LENGTH]: {
            attributes: {
                include: [
                    [
                        (0, sequelize_1.literal)(`(${getVideoLengthSelect()})`),
                        'videosLength'
                    ]
                ]
            }
        },
        [ScopeNames.WITH_ACCOUNT]: {
            include: [
                {
                    model: account_1.AccountModel,
                    required: true
                }
            ]
        },
        [ScopeNames.WITH_ACCOUNT_AND_CHANNEL_SUMMARY]: {
            include: [
                {
                    model: account_1.AccountModel.scope(account_1.ScopeNames.SUMMARY),
                    required: true
                },
                {
                    model: video_channel_1.VideoChannelModel.scope(video_channel_1.ScopeNames.SUMMARY),
                    required: false
                }
            ]
        },
        [ScopeNames.WITH_ACCOUNT_AND_CHANNEL]: {
            include: [
                {
                    model: account_1.AccountModel,
                    required: true
                },
                {
                    model: video_channel_1.VideoChannelModel,
                    required: false
                }
            ]
        },
        [ScopeNames.AVAILABLE_FOR_LIST]: (options) => {
            const whereAnd = [];
            const whereServer = options.host && options.host !== constants_1.WEBSERVER.HOST
                ? { host: options.host }
                : undefined;
            let whereActor = {};
            if (options.host === constants_1.WEBSERVER.HOST) {
                whereActor = {
                    [sequelize_1.Op.and]: [{ serverId: null }]
                };
            }
            if (options.listMyPlaylists !== true) {
                whereAnd.push({
                    privacy: 1
                });
                const whereActorOr = [
                    {
                        serverId: null
                    }
                ];
                if (options.followerActorId) {
                    const inQueryInstanceFollow = (0, utils_1.buildServerIdsFollowedBy)(options.followerActorId);
                    whereActorOr.push({
                        serverId: {
                            [sequelize_1.Op.in]: (0, sequelize_1.literal)(inQueryInstanceFollow)
                        }
                    });
                }
                Object.assign(whereActor, { [sequelize_1.Op.or]: whereActorOr });
            }
            if (options.accountId) {
                whereAnd.push({
                    ownerAccountId: options.accountId
                });
            }
            if (options.videoChannelId) {
                whereAnd.push({
                    videoChannelId: options.videoChannelId
                });
            }
            if (options.type) {
                whereAnd.push({
                    type: options.type
                });
            }
            if (options.uuids) {
                whereAnd.push({
                    uuid: {
                        [sequelize_1.Op.in]: options.uuids
                    }
                });
            }
            if (options.withVideos === true) {
                whereAnd.push((0, sequelize_1.literal)(`(${getVideoLengthSelect()}) != 0`));
            }
            let attributesInclude = [(0, sequelize_1.literal)('0 as similarity')];
            if (options.search) {
                const escapedSearch = VideoPlaylistModel_1.sequelize.escape(options.search);
                const escapedLikeSearch = VideoPlaylistModel_1.sequelize.escape('%' + options.search + '%');
                attributesInclude = [(0, utils_1.createSimilarityAttribute)('VideoPlaylistModel.name', options.search)];
                whereAnd.push({
                    [sequelize_1.Op.or]: [
                        sequelize_1.Sequelize.literal('lower(immutable_unaccent("VideoPlaylistModel"."name")) % lower(immutable_unaccent(' + escapedSearch + '))'),
                        sequelize_1.Sequelize.literal('lower(immutable_unaccent("VideoPlaylistModel"."name")) LIKE lower(immutable_unaccent(' + escapedLikeSearch + '))')
                    ]
                });
            }
            const where = {
                [sequelize_1.Op.and]: whereAnd
            };
            return {
                attributes: {
                    include: attributesInclude
                },
                where,
                include: [
                    {
                        model: account_1.AccountModel.scope({
                            method: [account_1.ScopeNames.SUMMARY, { whereActor, whereServer }]
                        }),
                        required: true
                    },
                    {
                        model: video_channel_1.VideoChannelModel.scope(video_channel_1.ScopeNames.SUMMARY),
                        required: false
                    }
                ]
            };
        }
    })),
    (0, sequelize_typescript_1.Table)({
        tableName: 'videoPlaylist',
        indexes: [
            (0, utils_1.buildTrigramSearchIndex)('video_playlist_name_trigram', 'name'),
            {
                fields: ['ownerAccountId']
            },
            {
                fields: ['videoChannelId']
            },
            {
                fields: ['url'],
                unique: true
            }
        ]
    })
], VideoPlaylistModel);
exports.VideoPlaylistModel = VideoPlaylistModel;
