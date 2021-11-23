"use strict";
var ActorFollowModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorFollowModel = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const misc_1 = require("@server/helpers/custom-validators/activitypub/misc");
const application_1 = require("@server/models/application/application");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const account_1 = require("../account/account");
const server_1 = require("../server/server");
const query_1 = require("../shared/query");
const utils_1 = require("../utils");
const video_channel_1 = require("../video/video-channel");
const actor_1 = require("./actor");
let ActorFollowModel = ActorFollowModel_1 = class ActorFollowModel extends sequelize_typescript_1.Model {
    static incrementFollowerAndFollowingCount(instance, options) {
        if (instance.state !== 'accepted')
            return undefined;
        return Promise.all([
            actor_1.ActorModel.rebuildFollowsCount(instance.actorId, 'following', options.transaction),
            actor_1.ActorModel.rebuildFollowsCount(instance.targetActorId, 'followers', options.transaction)
        ]);
    }
    static decrementFollowerAndFollowingCount(instance, options) {
        return Promise.all([
            actor_1.ActorModel.rebuildFollowsCount(instance.actorId, 'following', options.transaction),
            actor_1.ActorModel.rebuildFollowsCount(instance.targetActorId, 'followers', options.transaction)
        ]);
    }
    static removeFollowsOf(actorId, t) {
        const query = {
            where: {
                [sequelize_1.Op.or]: [
                    {
                        actorId
                    },
                    {
                        targetActorId: actorId
                    }
                ]
            },
            transaction: t
        };
        return ActorFollowModel_1.destroy(query);
    }
    static removeBadActorFollows() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const actorFollows = yield ActorFollowModel_1.listBadActorFollows();
            const actorFollowsRemovePromises = actorFollows.map(actorFollow => actorFollow.destroy());
            yield Promise.all(actorFollowsRemovePromises);
            const numberOfActorFollowsRemoved = actorFollows.length;
            if (numberOfActorFollowsRemoved)
                logger_1.logger.info('Removed bad %d actor follows.', numberOfActorFollowsRemoved);
        });
    }
    static isFollowedBy(actorId, followerActorId) {
        const query = 'SELECT 1 FROM "actorFollow" WHERE "actorId" = $followerActorId AND "targetActorId" = $actorId LIMIT 1';
        return (0, query_1.doesExist)(query, { actorId, followerActorId });
    }
    static loadByActorAndTarget(actorId, targetActorId, t) {
        const query = {
            where: {
                actorId,
                targetActorId: targetActorId
            },
            include: [
                {
                    model: actor_1.ActorModel,
                    required: true,
                    as: 'ActorFollower'
                },
                {
                    model: actor_1.ActorModel,
                    required: true,
                    as: 'ActorFollowing'
                }
            ],
            transaction: t
        };
        return ActorFollowModel_1.findOne(query);
    }
    static loadByActorAndTargetNameAndHostForAPI(actorId, targetName, targetHost, t) {
        const actorFollowingPartInclude = {
            model: actor_1.ActorModel,
            required: true,
            as: 'ActorFollowing',
            where: {
                preferredUsername: targetName
            },
            include: [
                {
                    model: video_channel_1.VideoChannelModel.unscoped(),
                    required: false
                }
            ]
        };
        if (targetHost === null) {
            actorFollowingPartInclude.where['serverId'] = null;
        }
        else {
            actorFollowingPartInclude.include.push({
                model: server_1.ServerModel,
                required: true,
                where: {
                    host: targetHost
                }
            });
        }
        const query = {
            where: {
                actorId
            },
            include: [
                actorFollowingPartInclude,
                {
                    model: actor_1.ActorModel,
                    required: true,
                    as: 'ActorFollower'
                }
            ],
            transaction: t
        };
        return ActorFollowModel_1.findOne(query);
    }
    static listSubscribedIn(actorId, targets) {
        const whereTab = targets
            .map(t => {
            if (t.host) {
                return {
                    [sequelize_1.Op.and]: [
                        {
                            $preferredUsername$: t.name
                        },
                        {
                            $host$: t.host
                        }
                    ]
                };
            }
            return {
                [sequelize_1.Op.and]: [
                    {
                        $preferredUsername$: t.name
                    },
                    {
                        $serverId$: null
                    }
                ]
            };
        });
        const query = {
            attributes: ['id'],
            where: {
                [sequelize_1.Op.and]: [
                    {
                        [sequelize_1.Op.or]: whereTab
                    },
                    {
                        actorId
                    }
                ]
            },
            include: [
                {
                    attributes: ['preferredUsername'],
                    model: actor_1.ActorModel.unscoped(),
                    required: true,
                    as: 'ActorFollowing',
                    include: [
                        {
                            attributes: ['host'],
                            model: server_1.ServerModel.unscoped(),
                            required: false
                        }
                    ]
                }
            ]
        };
        return ActorFollowModel_1.findAll(query);
    }
    static listFollowingForApi(options) {
        const { id, start, count, sort, search, state, actorType } = options;
        const followWhere = state ? { state } : {};
        const followingWhere = {};
        if (search) {
            Object.assign(followWhere, {
                [sequelize_1.Op.or]: [
                    (0, utils_1.searchAttribute)(options.search, '$ActorFollowing.preferredUsername$'),
                    (0, utils_1.searchAttribute)(options.search, '$ActorFollowing.Server.host$')
                ]
            });
        }
        if (actorType) {
            Object.assign(followingWhere, { type: actorType });
        }
        const query = {
            distinct: true,
            offset: start,
            limit: count,
            order: (0, utils_1.getFollowsSort)(sort),
            where: followWhere,
            include: [
                {
                    model: actor_1.ActorModel,
                    required: true,
                    as: 'ActorFollower',
                    where: {
                        id
                    }
                },
                {
                    model: actor_1.ActorModel,
                    as: 'ActorFollowing',
                    required: true,
                    where: followingWhere,
                    include: [
                        {
                            model: server_1.ServerModel,
                            required: true
                        }
                    ]
                }
            ]
        };
        return ActorFollowModel_1.findAndCountAll(query)
            .then(({ rows, count }) => {
            return {
                data: rows,
                total: count
            };
        });
    }
    static listFollowersForApi(options) {
        const { actorId, start, count, sort, search, state, actorType } = options;
        const followWhere = state ? { state } : {};
        const followerWhere = {};
        if (search) {
            Object.assign(followWhere, {
                [sequelize_1.Op.or]: [
                    (0, utils_1.searchAttribute)(search, '$ActorFollower.preferredUsername$'),
                    (0, utils_1.searchAttribute)(search, '$ActorFollower.Server.host$')
                ]
            });
        }
        if (actorType) {
            Object.assign(followerWhere, { type: actorType });
        }
        const query = {
            distinct: true,
            offset: start,
            limit: count,
            order: (0, utils_1.getFollowsSort)(sort),
            where: followWhere,
            include: [
                {
                    model: actor_1.ActorModel,
                    required: true,
                    as: 'ActorFollower',
                    where: followerWhere,
                    include: [
                        {
                            model: server_1.ServerModel,
                            required: true
                        }
                    ]
                },
                {
                    model: actor_1.ActorModel,
                    as: 'ActorFollowing',
                    required: true,
                    where: {
                        id: actorId
                    }
                }
            ]
        };
        return ActorFollowModel_1.findAndCountAll(query)
            .then(({ rows, count }) => {
            return {
                data: rows,
                total: count
            };
        });
    }
    static listSubscriptionsForApi(options) {
        const { actorId, start, count, sort } = options;
        const where = {
            actorId: actorId
        };
        if (options.search) {
            Object.assign(where, {
                [sequelize_1.Op.or]: [
                    (0, utils_1.searchAttribute)(options.search, '$ActorFollowing.preferredUsername$'),
                    (0, utils_1.searchAttribute)(options.search, '$ActorFollowing.VideoChannel.name$')
                ]
            });
        }
        const query = {
            attributes: [],
            distinct: true,
            offset: start,
            limit: count,
            order: (0, utils_1.getSort)(sort),
            where,
            include: [
                {
                    attributes: ['id'],
                    model: actor_1.ActorModel.unscoped(),
                    as: 'ActorFollowing',
                    required: true,
                    include: [
                        {
                            model: video_channel_1.VideoChannelModel.unscoped(),
                            required: true,
                            include: [
                                {
                                    attributes: {
                                        exclude: actor_1.unusedActorAttributesForAPI
                                    },
                                    model: actor_1.ActorModel,
                                    required: true
                                },
                                {
                                    model: account_1.AccountModel.unscoped(),
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
                        }
                    ]
                }
            ]
        };
        return ActorFollowModel_1.findAndCountAll(query)
            .then(({ rows, count }) => {
            return {
                data: rows.map(r => r.ActorFollowing.VideoChannel),
                total: count
            };
        });
    }
    static keepUnfollowedInstance(hosts) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const followerId = (yield (0, application_1.getServerActor)()).id;
            const query = {
                attributes: ['id'],
                where: {
                    actorId: followerId
                },
                include: [
                    {
                        attributes: ['id'],
                        model: actor_1.ActorModel.unscoped(),
                        required: true,
                        as: 'ActorFollowing',
                        where: {
                            preferredUsername: constants_1.SERVER_ACTOR_NAME
                        },
                        include: [
                            {
                                attributes: ['host'],
                                model: server_1.ServerModel.unscoped(),
                                required: true,
                                where: {
                                    host: {
                                        [sequelize_1.Op.in]: hosts
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            const res = yield ActorFollowModel_1.findAll(query);
            const followedHosts = res.map(row => row.ActorFollowing.Server.host);
            return (0, lodash_1.difference)(hosts, followedHosts);
        });
    }
    static listAcceptedFollowerUrlsForAP(actorIds, t, start, count) {
        return ActorFollowModel_1.createListAcceptedFollowForApiQuery('followers', actorIds, t, start, count);
    }
    static listAcceptedFollowerSharedInboxUrls(actorIds, t) {
        return ActorFollowModel_1.createListAcceptedFollowForApiQuery('followers', actorIds, t, undefined, undefined, 'sharedInboxUrl', true);
    }
    static listAcceptedFollowingUrlsForApi(actorIds, t, start, count) {
        return ActorFollowModel_1.createListAcceptedFollowForApiQuery('following', actorIds, t, start, count);
    }
    static getStats() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const serverActor = yield (0, application_1.getServerActor)();
            const totalInstanceFollowing = yield ActorFollowModel_1.count({
                where: {
                    actorId: serverActor.id
                }
            });
            const totalInstanceFollowers = yield ActorFollowModel_1.count({
                where: {
                    targetActorId: serverActor.id
                }
            });
            return {
                totalInstanceFollowing,
                totalInstanceFollowers
            };
        });
    }
    static updateScore(inboxUrl, value, t) {
        const query = `UPDATE "actorFollow" SET "score" = LEAST("score" + ${value}, ${constants_1.ACTOR_FOLLOW_SCORE.MAX}) ` +
            'WHERE id IN (' +
            'SELECT "actorFollow"."id" FROM "actorFollow" ' +
            'INNER JOIN "actor" ON "actor"."id" = "actorFollow"."actorId" ' +
            `WHERE "actor"."inboxUrl" = '${inboxUrl}' OR "actor"."sharedInboxUrl" = '${inboxUrl}'` +
            ')';
        const options = {
            type: sequelize_1.QueryTypes.BULKUPDATE,
            transaction: t
        };
        return ActorFollowModel_1.sequelize.query(query, options);
    }
    static updateScoreByFollowingServers(serverIds, value, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (serverIds.length === 0)
                return;
            const me = yield (0, application_1.getServerActor)();
            const serverIdsString = (0, utils_1.createSafeIn)(ActorFollowModel_1.sequelize, serverIds);
            const query = `UPDATE "actorFollow" SET "score" = LEAST("score" + ${value}, ${constants_1.ACTOR_FOLLOW_SCORE.MAX}) ` +
                'WHERE id IN (' +
                'SELECT "actorFollow"."id" FROM "actorFollow" ' +
                'INNER JOIN "actor" ON "actor"."id" = "actorFollow"."targetActorId" ' +
                `WHERE "actorFollow"."actorId" = ${me.Account.actorId} ` +
                `AND "actor"."serverId" IN (${serverIdsString})` +
                ')';
            const options = {
                type: sequelize_1.QueryTypes.BULKUPDATE,
                transaction: t
            };
            return ActorFollowModel_1.sequelize.query(query, options);
        });
    }
    static createListAcceptedFollowForApiQuery(type, actorIds, t, start, count, columnUrl = 'url', distinct = false) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let firstJoin;
            let secondJoin;
            if (type === 'followers') {
                firstJoin = 'targetActorId';
                secondJoin = 'actorId';
            }
            else {
                firstJoin = 'actorId';
                secondJoin = 'targetActorId';
            }
            const selections = [];
            if (distinct === true)
                selections.push(`DISTINCT("Follows"."${columnUrl}") AS "selectionUrl"`);
            else
                selections.push(`"Follows"."${columnUrl}" AS "selectionUrl"`);
            selections.push('COUNT(*) AS "total"');
            const tasks = [];
            for (const selection of selections) {
                let query = 'SELECT ' + selection + ' FROM "actor" ' +
                    'INNER JOIN "actorFollow" ON "actorFollow"."' + firstJoin + '" = "actor"."id" ' +
                    'INNER JOIN "actor" AS "Follows" ON "actorFollow"."' + secondJoin + '" = "Follows"."id" ' +
                    `WHERE "actor"."id" = ANY ($actorIds) AND "actorFollow"."state" = 'accepted' AND "Follows"."${columnUrl}" IS NOT NULL `;
                if (count !== undefined)
                    query += 'LIMIT ' + count;
                if (start !== undefined)
                    query += ' OFFSET ' + start;
                const options = {
                    bind: { actorIds },
                    type: sequelize_1.QueryTypes.SELECT,
                    transaction: t
                };
                tasks.push(ActorFollowModel_1.sequelize.query(query, options));
            }
            const [followers, [dataTotal]] = yield Promise.all(tasks);
            const urls = followers.map(f => f.selectionUrl);
            return {
                data: urls,
                total: dataTotal ? parseInt(dataTotal.total, 10) : 0
            };
        });
    }
    static listBadActorFollows() {
        const query = {
            where: {
                score: {
                    [sequelize_1.Op.lte]: 0
                }
            },
            logging: false
        };
        return ActorFollowModel_1.findAll(query);
    }
    toFormattedJSON() {
        const follower = this.ActorFollower.toFormattedJSON();
        const following = this.ActorFollowing.toFormattedJSON();
        return {
            id: this.id,
            follower,
            following,
            score: this.score,
            state: this.state,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...(0, lodash_1.values)(constants_1.FOLLOW_STATES))),
    (0, tslib_1.__metadata)("design:type", String)
], ActorFollowModel.prototype, "state", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(constants_1.ACTOR_FOLLOW_SCORE.BASE),
    sequelize_typescript_1.IsInt,
    (0, sequelize_typescript_1.Max)(constants_1.ACTOR_FOLLOW_SCORE.MAX),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ActorFollowModel.prototype, "score", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Is)('ActorFollowUrl', value => (0, utils_1.throwIfNotValid)(value, misc_1.isActivityPubUrlValid, 'url')),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.COMMONS.URL.max)),
    (0, tslib_1.__metadata)("design:type", String)
], ActorFollowModel.prototype, "url", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], ActorFollowModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], ActorFollowModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => actor_1.ActorModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ActorFollowModel.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => actor_1.ActorModel, {
        foreignKey: {
            name: 'actorId',
            allowNull: false
        },
        as: 'ActorFollower',
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", actor_1.ActorModel)
], ActorFollowModel.prototype, "ActorFollower", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => actor_1.ActorModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], ActorFollowModel.prototype, "targetActorId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => actor_1.ActorModel, {
        foreignKey: {
            name: 'targetActorId',
            allowNull: false
        },
        as: 'ActorFollowing',
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", actor_1.ActorModel)
], ActorFollowModel.prototype, "ActorFollowing", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.AfterCreate,
    sequelize_typescript_1.AfterUpdate,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [ActorFollowModel, Object]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], ActorFollowModel, "incrementFollowerAndFollowingCount", null);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.AfterDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [ActorFollowModel, Object]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], ActorFollowModel, "decrementFollowerAndFollowingCount", null);
ActorFollowModel = ActorFollowModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'actorFollow',
        indexes: [
            {
                fields: ['actorId']
            },
            {
                fields: ['targetActorId']
            },
            {
                fields: ['actorId', 'targetActorId'],
                unique: true
            },
            {
                fields: ['score']
            },
            {
                fields: ['url'],
                unique: true
            }
        ]
    })
], ActorFollowModel);
exports.ActorFollowModel = ActorFollowModel;
