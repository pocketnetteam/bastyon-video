"use strict";
var VideoChannelModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoChannelModel = exports.ScopeNames = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const core_utils_1 = require("@shared/core-utils");
const video_channels_1 = require("../../helpers/custom-validators/video-channels");
const constants_1 = require("../../initializers/constants");
const send_1 = require("../../lib/activitypub/send");
const account_1 = require("../account/account");
const actor_1 = require("../actor/actor");
const actor_follow_1 = require("../actor/actor-follow");
const actor_image_1 = require("../actor/actor-image");
const server_1 = require("../server/server");
const shared_1 = require("../shared");
const utils_1 = require("../utils");
const video_1 = require("./video");
const video_playlist_1 = require("./video-playlist");
var ScopeNames;
(function (ScopeNames) {
    ScopeNames["FOR_API"] = "FOR_API";
    ScopeNames["SUMMARY"] = "SUMMARY";
    ScopeNames["WITH_ACCOUNT"] = "WITH_ACCOUNT";
    ScopeNames["WITH_ACTOR"] = "WITH_ACTOR";
    ScopeNames["WITH_ACTOR_BANNER"] = "WITH_ACTOR_BANNER";
    ScopeNames["WITH_VIDEOS"] = "WITH_VIDEOS";
    ScopeNames["WITH_STATS"] = "WITH_STATS";
})(ScopeNames = exports.ScopeNames || (exports.ScopeNames = {}));
let VideoChannelModel = VideoChannelModel_1 = class VideoChannelModel extends sequelize_typescript_1.Model {
    static sendDeleteIfOwned(instance, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!instance.Actor) {
                instance.Actor = yield instance.$get('Actor', { transaction: options.transaction });
            }
            yield actor_follow_1.ActorFollowModel.removeFollowsOf(instance.Actor.id, options.transaction);
            if (instance.Actor.isOwned()) {
                return send_1.sendDeleteActor(instance.Actor, options.transaction);
            }
            return undefined;
        });
    }
    static countByAccount(accountId) {
        const query = {
            where: {
                accountId
            }
        };
        return VideoChannelModel_1.count(query);
    }
    static getStats() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            function getActiveVideoChannels(days) {
                const options = {
                    type: sequelize_1.QueryTypes.SELECT,
                    raw: true
                };
                const query = `
SELECT          COUNT(DISTINCT("VideoChannelModel"."id")) AS "count"
FROM            "videoChannel"                            AS "VideoChannelModel"
INNER JOIN      "video"                                   AS "Videos"
ON              "VideoChannelModel"."id" = "Videos"."channelId"
AND             ("Videos"."publishedAt" > Now() - interval '${days}d')
INNER JOIN      "account" AS "Account"
ON              "VideoChannelModel"."accountId" = "Account"."id"
INNER JOIN      "actor" AS "Account->Actor"
ON              "Account"."actorId" = "Account->Actor"."id"
AND             "Account->Actor"."serverId" IS NULL
LEFT OUTER JOIN "server" AS "Account->Actor->Server"
ON              "Account->Actor"."serverId" = "Account->Actor->Server"."id"`;
                return VideoChannelModel_1.sequelize.query(query, options)
                    .then(r => parseInt(r[0].count, 10));
            }
            const totalLocalVideoChannels = yield VideoChannelModel_1.count();
            const totalLocalDailyActiveVideoChannels = yield getActiveVideoChannels(1);
            const totalLocalWeeklyActiveVideoChannels = yield getActiveVideoChannels(7);
            const totalLocalMonthlyActiveVideoChannels = yield getActiveVideoChannels(30);
            const totalHalfYearActiveVideoChannels = yield getActiveVideoChannels(180);
            return {
                totalLocalVideoChannels,
                totalLocalDailyActiveVideoChannels,
                totalLocalWeeklyActiveVideoChannels,
                totalLocalMonthlyActiveVideoChannels,
                totalHalfYearActiveVideoChannels
            };
        });
    }
    static listLocalsForSitemap(sort) {
        const query = {
            attributes: [],
            offset: 0,
            order: utils_1.getSort(sort),
            include: [
                {
                    attributes: ['preferredUsername', 'serverId'],
                    model: actor_1.ActorModel.unscoped(),
                    where: {
                        serverId: null
                    }
                }
            ]
        };
        return VideoChannelModel_1
            .unscoped()
            .findAll(query);
    }
    static listForApi(parameters) {
        const { actorId } = parameters;
        const query = {
            offset: parameters.start,
            limit: parameters.count,
            order: utils_1.getSort(parameters.sort)
        };
        return VideoChannelModel_1
            .scope({
            method: [ScopeNames.FOR_API, { actorId }]
        })
            .findAndCountAll(query)
            .then(({ rows, count }) => {
            return { total: count, data: rows };
        });
    }
    static searchForApi(options) {
        let attributesInclude = [sequelize_1.literal('0 as similarity')];
        let where;
        if (options.search) {
            const escapedSearch = VideoChannelModel_1.sequelize.escape(options.search);
            const escapedLikeSearch = VideoChannelModel_1.sequelize.escape('%' + options.search + '%');
            attributesInclude = [utils_1.createSimilarityAttribute('VideoChannelModel.name', options.search)];
            where = {
                [sequelize_1.Op.or]: [
                    sequelize_typescript_1.Sequelize.literal('lower(immutable_unaccent("VideoChannelModel"."name")) % lower(immutable_unaccent(' + escapedSearch + '))'),
                    sequelize_typescript_1.Sequelize.literal('lower(immutable_unaccent("VideoChannelModel"."name")) LIKE lower(immutable_unaccent(' + escapedLikeSearch + '))')
                ]
            };
        }
        const query = {
            attributes: {
                include: attributesInclude
            },
            offset: options.start,
            limit: options.count,
            order: utils_1.getSort(options.sort),
            where
        };
        return VideoChannelModel_1
            .scope({
            method: [ScopeNames.FOR_API, core_utils_1.pick(options, ['actorId', 'host', 'handles'])]
        })
            .findAndCountAll(query)
            .then(({ rows, count }) => {
            return { total: count, data: rows };
        });
    }
    static listByAccount(options) {
        const escapedSearch = video_1.VideoModel.sequelize.escape(options.search);
        const escapedLikeSearch = video_1.VideoModel.sequelize.escape('%' + options.search + '%');
        const where = options.search
            ? {
                [sequelize_1.Op.or]: [
                    sequelize_typescript_1.Sequelize.literal('lower(immutable_unaccent("VideoChannelModel"."name")) % lower(immutable_unaccent(' + escapedSearch + '))'),
                    sequelize_typescript_1.Sequelize.literal('lower(immutable_unaccent("VideoChannelModel"."name")) LIKE lower(immutable_unaccent(' + escapedLikeSearch + '))')
                ]
            }
            : null;
        const query = {
            offset: options.start,
            limit: options.count,
            order: utils_1.getSort(options.sort),
            include: [
                {
                    model: account_1.AccountModel,
                    where: {
                        id: options.accountId
                    },
                    required: true
                }
            ],
            where
        };
        const scopes = [ScopeNames.WITH_ACTOR_BANNER];
        if (options.withStats === true) {
            scopes.push({
                method: [ScopeNames.WITH_STATS, { daysPrior: 30 }]
            });
        }
        return VideoChannelModel_1
            .scope(scopes)
            .findAndCountAll(query)
            .then(({ rows, count }) => {
            return { total: count, data: rows };
        });
    }
    static loadAndPopulateAccount(id, transaction) {
        return VideoChannelModel_1.unscoped()
            .scope([ScopeNames.WITH_ACTOR_BANNER, ScopeNames.WITH_ACCOUNT])
            .findByPk(id, { transaction });
    }
    static loadByUrlAndPopulateAccount(url) {
        const query = {
            include: [
                {
                    model: actor_1.ActorModel,
                    required: true,
                    where: {
                        url
                    },
                    include: [
                        {
                            model: actor_image_1.ActorImageModel,
                            required: false,
                            as: 'Banner'
                        }
                    ]
                }
            ]
        };
        return VideoChannelModel_1
            .scope([ScopeNames.WITH_ACCOUNT])
            .findOne(query);
    }
    static loadByNameWithHostAndPopulateAccount(nameWithHost) {
        const [name, host] = nameWithHost.split('@');
        if (!host || host === constants_1.WEBSERVER.HOST)
            return VideoChannelModel_1.loadLocalByNameAndPopulateAccount(name);
        return VideoChannelModel_1.loadByNameAndHostAndPopulateAccount(name, host);
    }
    static loadLocalByNameAndPopulateAccount(name) {
        const query = {
            include: [
                {
                    model: actor_1.ActorModel,
                    required: true,
                    where: {
                        preferredUsername: name,
                        serverId: null
                    },
                    include: [
                        {
                            model: actor_image_1.ActorImageModel,
                            required: false,
                            as: 'Banner'
                        }
                    ]
                }
            ]
        };
        return VideoChannelModel_1.unscoped()
            .scope([ScopeNames.WITH_ACCOUNT])
            .findOne(query);
    }
    static loadByNameAndHostAndPopulateAccount(name, host) {
        const query = {
            include: [
                {
                    model: actor_1.ActorModel,
                    required: true,
                    where: {
                        preferredUsername: name
                    },
                    include: [
                        {
                            model: server_1.ServerModel,
                            required: true,
                            where: { host }
                        },
                        {
                            model: actor_image_1.ActorImageModel,
                            required: false,
                            as: 'Banner'
                        }
                    ]
                }
            ]
        };
        return VideoChannelModel_1.unscoped()
            .scope([ScopeNames.WITH_ACCOUNT])
            .findOne(query);
    }
    toFormattedSummaryJSON() {
        const actor = this.Actor.toFormattedSummaryJSON();
        return {
            id: this.id,
            name: actor.name,
            displayName: this.getDisplayName(),
            url: actor.url,
            host: actor.host,
            avatar: actor.avatar
        };
    }
    toFormattedJSON() {
        const viewsPerDayString = this.get('viewsPerDay');
        const videosCount = this.get('videosCount');
        let viewsPerDay;
        if (viewsPerDayString) {
            viewsPerDay = viewsPerDayString.split(',')
                .map(v => {
                const [dateString, amount] = v.split('|');
                return {
                    date: new Date(dateString),
                    views: +amount
                };
            });
        }
        const actor = this.Actor.toFormattedJSON();
        const videoChannel = {
            id: this.id,
            displayName: this.getDisplayName(),
            description: this.description,
            support: this.support,
            isLocal: this.Actor.isOwned(),
            updatedAt: this.updatedAt,
            ownerAccount: undefined,
            videosCount,
            viewsPerDay
        };
        if (this.Account)
            videoChannel.ownerAccount = this.Account.toFormattedJSON();
        return Object.assign(actor, videoChannel);
    }
    toActivityPubObject() {
        const obj = this.Actor.toActivityPubObject(this.name);
        return Object.assign(obj, {
            summary: this.description,
            support: this.support,
            attributedTo: [
                {
                    type: 'Person',
                    id: this.Account.Actor.url
                }
            ]
        });
    }
    getLocalUrl() {
        return constants_1.WEBSERVER.URL + `/video-channels/` + this.Actor.preferredUsername;
    }
    getDisplayName() {
        return this.name;
    }
    isOutdated() {
        return this.Actor.isOutdated();
    }
    setAsUpdated(transaction) {
        return shared_1.setAsUpdated('videoChannel', this.id, transaction);
    }
};
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Is('VideoChannelName', value => utils_1.throwIfNotValid(value, video_channels_1.isVideoChannelDisplayNameValid, 'name')),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", String)
], VideoChannelModel.prototype, "name", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Is('VideoChannelDescription', value => utils_1.throwIfNotValid(value, video_channels_1.isVideoChannelDescriptionValid, 'description', true)),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEO_CHANNELS.DESCRIPTION.max)),
    tslib_1.__metadata("design:type", String)
], VideoChannelModel.prototype, "description", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Default(null),
    sequelize_typescript_1.Is('VideoChannelSupport', value => utils_1.throwIfNotValid(value, video_channels_1.isVideoChannelSupportValid, 'support', true)),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEO_CHANNELS.SUPPORT.max)),
    tslib_1.__metadata("design:type", String)
], VideoChannelModel.prototype, "support", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    tslib_1.__metadata("design:type", Date)
], VideoChannelModel.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    tslib_1.__metadata("design:type", Date)
], VideoChannelModel.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.ForeignKey(() => actor_1.ActorModel),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], VideoChannelModel.prototype, "actorId", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.BelongsTo(() => actor_1.ActorModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    tslib_1.__metadata("design:type", actor_1.ActorModel)
], VideoChannelModel.prototype, "Actor", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.ForeignKey(() => account_1.AccountModel),
    sequelize_typescript_1.Column,
    tslib_1.__metadata("design:type", Number)
], VideoChannelModel.prototype, "accountId", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.BelongsTo(() => account_1.AccountModel, {
        foreignKey: {
            allowNull: false
        }
    }),
    tslib_1.__metadata("design:type", account_1.AccountModel)
], VideoChannelModel.prototype, "Account", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.HasMany(() => video_1.VideoModel, {
        foreignKey: {
            name: 'channelId',
            allowNull: false
        },
        onDelete: 'CASCADE',
        hooks: true
    }),
    tslib_1.__metadata("design:type", Array)
], VideoChannelModel.prototype, "Videos", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.HasMany(() => video_playlist_1.VideoPlaylistModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE',
        hooks: true
    }),
    tslib_1.__metadata("design:type", Array)
], VideoChannelModel.prototype, "VideoPlaylists", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.BeforeDestroy,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [VideoChannelModel, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], VideoChannelModel, "sendDeleteIfOwned", null);
VideoChannelModel = VideoChannelModel_1 = tslib_1.__decorate([
    sequelize_typescript_1.DefaultScope(() => ({
        include: [
            {
                model: actor_1.ActorModel,
                required: true
            }
        ]
    })),
    sequelize_typescript_1.Scopes(() => ({
        [ScopeNames.FOR_API]: (options) => {
            const inQueryInstanceFollow = utils_1.buildServerIdsFollowedBy(options.actorId);
            const whereActorAnd = [
                {
                    [sequelize_1.Op.or]: [
                        {
                            serverId: null
                        },
                        {
                            serverId: {
                                [sequelize_1.Op.in]: sequelize_typescript_1.Sequelize.literal(inQueryInstanceFollow)
                            }
                        }
                    ]
                }
            ];
            let serverRequired = false;
            let whereServer;
            if (options.host && options.host !== constants_1.WEBSERVER.HOST) {
                serverRequired = true;
                whereServer = { host: options.host };
            }
            if (options.host === constants_1.WEBSERVER.HOST) {
                whereActorAnd.push({
                    serverId: null
                });
            }
            let rootWhere;
            if (options.handles) {
                const or = [];
                for (const handle of options.handles || []) {
                    const [preferredUsername, host] = handle.split('@');
                    if (!host || host === constants_1.WEBSERVER.HOST) {
                        or.push({
                            '$Actor.preferredUsername$': preferredUsername,
                            '$Actor.serverId$': null
                        });
                    }
                    else {
                        or.push({
                            '$Actor.preferredUsername$': preferredUsername,
                            '$Actor.Server.host$': host
                        });
                    }
                }
                rootWhere = {
                    [sequelize_1.Op.or]: or
                };
            }
            return {
                where: rootWhere,
                include: [
                    {
                        attributes: {
                            exclude: actor_1.unusedActorAttributesForAPI
                        },
                        model: actor_1.ActorModel,
                        where: {
                            [sequelize_1.Op.and]: whereActorAnd
                        },
                        include: [
                            {
                                model: server_1.ServerModel,
                                required: serverRequired,
                                where: whereServer
                            },
                            {
                                model: actor_image_1.ActorImageModel,
                                as: 'Avatar',
                                required: false
                            },
                            {
                                model: actor_image_1.ActorImageModel,
                                as: 'Banner',
                                required: false
                            }
                        ]
                    },
                    {
                        model: account_1.AccountModel,
                        required: true,
                        include: [
                            {
                                attributes: {
                                    exclude: actor_1.unusedActorAttributesForAPI
                                },
                                model: actor_1.ActorModel,
                                required: true
                            }
                        ]
                    }
                ]
            };
        },
        [ScopeNames.SUMMARY]: (options = {}) => {
            var _a;
            const include = [
                {
                    attributes: ['id', 'preferredUsername', 'url', 'serverId', 'avatarId'],
                    model: actor_1.ActorModel.unscoped(),
                    required: (_a = options.actorRequired) !== null && _a !== void 0 ? _a : true,
                    include: [
                        {
                            attributes: ['host'],
                            model: server_1.ServerModel.unscoped(),
                            required: false
                        },
                        {
                            model: actor_image_1.ActorImageModel.unscoped(),
                            as: 'Avatar',
                            required: false
                        }
                    ]
                }
            ];
            const base = {
                attributes: ['id', 'name', 'description', 'actorId']
            };
            if (options.withAccount === true) {
                include.push({
                    model: account_1.AccountModel.scope({
                        method: [account_1.ScopeNames.SUMMARY, { withAccountBlockerIds: options.withAccountBlockerIds }]
                    }),
                    required: true
                });
            }
            base.include = include;
            return base;
        },
        [ScopeNames.WITH_ACCOUNT]: {
            include: [
                {
                    model: account_1.AccountModel,
                    required: true
                }
            ]
        },
        [ScopeNames.WITH_ACTOR]: {
            include: [
                actor_1.ActorModel
            ]
        },
        [ScopeNames.WITH_ACTOR_BANNER]: {
            include: [
                {
                    model: actor_1.ActorModel,
                    include: [
                        {
                            model: actor_image_1.ActorImageModel,
                            required: false,
                            as: 'Banner'
                        }
                    ]
                }
            ]
        },
        [ScopeNames.WITH_VIDEOS]: {
            include: [
                video_1.VideoModel
            ]
        },
        [ScopeNames.WITH_STATS]: (options = { daysPrior: 30 }) => {
            const daysPrior = parseInt(options.daysPrior + '', 10);
            return {
                attributes: {
                    include: [
                        [
                            sequelize_1.literal('(SELECT COUNT(*) FROM "video" WHERE "channelId" = "VideoChannelModel"."id")'),
                            'videosCount'
                        ],
                        [
                            sequelize_1.literal('(' +
                                `SELECT string_agg(concat_ws('|', t.day, t.views), ',') ` +
                                'FROM ( ' +
                                'WITH ' +
                                'days AS ( ' +
                                `SELECT generate_series(date_trunc('day', now()) - '${daysPrior} day'::interval, ` +
                                `date_trunc('day', now()), '1 day'::interval) AS day ` +
                                ') ' +
                                'SELECT days.day AS day, COALESCE(SUM("videoView".views), 0) AS views ' +
                                'FROM days ' +
                                'LEFT JOIN (' +
                                '"videoView" INNER JOIN "video" ON "videoView"."videoId" = "video"."id" ' +
                                'AND "video"."channelId" = "VideoChannelModel"."id"' +
                                `) ON date_trunc('day', "videoView"."startDate") = date_trunc('day', days.day) ` +
                                'GROUP BY day ' +
                                'ORDER BY day ' +
                                ') t' +
                                ')'),
                            'viewsPerDay'
                        ]
                    ]
                }
            };
        }
    })),
    sequelize_typescript_1.Table({
        tableName: 'videoChannel',
        indexes: [
            utils_1.buildTrigramSearchIndex('video_channel_name_trigram', 'name'),
            {
                fields: ['accountId']
            },
            {
                fields: ['actorId']
            }
        ]
    })
], VideoChannelModel);
exports.VideoChannelModel = VideoChannelModel;
