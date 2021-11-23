"use strict";
var VideoModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModel = exports.ScopeNames = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = (0, tslib_1.__importDefault)(require("bluebird"));
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const express_utils_1 = require("@server/helpers/express-utils");
const uuid_1 = require("@server/helpers/uuid");
const video_1 = require("@server/helpers/video");
const live_manager_1 = require("@server/lib/live/live-manager");
const object_storage_1 = require("@server/lib/object-storage");
const paths_1 = require("@server/lib/paths");
const video_path_manager_1 = require("@server/lib/video-path-manager");
const application_1 = require("@server/models/application/application");
const model_cache_1 = require("@server/models/model-cache");
const core_utils_1 = require("@shared/core-utils");
const core_utils_2 = require("../../helpers/core-utils");
const misc_1 = require("../../helpers/custom-validators/activitypub/misc");
const misc_2 = require("../../helpers/custom-validators/misc");
const videos_1 = require("../../helpers/custom-validators/videos");
const ffprobe_utils_1 = require("../../helpers/ffprobe-utils");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const send_1 = require("../../lib/activitypub/send");
const video_abuse_1 = require("../abuse/video-abuse");
const account_1 = require("../account/account");
const account_video_rate_1 = require("../account/account-video-rate");
const actor_1 = require("../actor/actor");
const actor_image_1 = require("../actor/actor-image");
const video_redundancy_1 = require("../redundancy/video-redundancy");
const server_1 = require("../server/server");
const tracker_1 = require("../server/tracker");
const video_tracker_1 = require("../server/video-tracker");
const shared_1 = require("../shared");
const user_1 = require("../user/user");
const user_video_history_1 = require("../user/user-video-history");
const utils_1 = require("../utils");
const video_format_utils_1 = require("./formatter/video-format-utils");
const schedule_video_update_1 = require("./schedule-video-update");
const video_model_get_query_builder_1 = require("./sql/video-model-get-query-builder");
const videos_id_list_query_builder_1 = require("./sql/videos-id-list-query-builder");
const videos_model_list_query_builder_1 = require("./sql/videos-model-list-query-builder");
const tag_1 = require("./tag");
const thumbnail_1 = require("./thumbnail");
const video_blacklist_1 = require("./video-blacklist");
const video_caption_1 = require("./video-caption");
const video_channel_1 = require("./video-channel");
const video_comment_1 = require("./video-comment");
const video_file_1 = require("./video-file");
const video_import_1 = require("./video-import");
const video_job_info_1 = require("./video-job-info");
const video_live_1 = require("./video-live");
const video_playlist_element_1 = require("./video-playlist-element");
const video_share_1 = require("./video-share");
const video_streaming_playlist_1 = require("./video-streaming-playlist");
const video_tag_1 = require("./video-tag");
const video_view_1 = require("./video-view");
var ScopeNames;
(function (ScopeNames) {
    ScopeNames["FOR_API"] = "FOR_API";
    ScopeNames["WITH_ACCOUNT_DETAILS"] = "WITH_ACCOUNT_DETAILS";
    ScopeNames["WITH_TAGS"] = "WITH_TAGS";
    ScopeNames["WITH_WEBTORRENT_FILES"] = "WITH_WEBTORRENT_FILES";
    ScopeNames["WITH_SCHEDULED_UPDATE"] = "WITH_SCHEDULED_UPDATE";
    ScopeNames["WITH_BLACKLISTED"] = "WITH_BLACKLISTED";
    ScopeNames["WITH_STREAMING_PLAYLISTS"] = "WITH_STREAMING_PLAYLISTS";
    ScopeNames["WITH_IMMUTABLE_ATTRIBUTES"] = "WITH_IMMUTABLE_ATTRIBUTES";
    ScopeNames["WITH_USER_HISTORY"] = "WITH_USER_HISTORY";
    ScopeNames["WITH_THUMBNAILS"] = "WITH_THUMBNAILS";
})(ScopeNames = exports.ScopeNames || (exports.ScopeNames = {}));
let VideoModel = VideoModel_1 = class VideoModel extends sequelize_typescript_1.Model {
    static sendDelete(instance, options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!instance.isOwned())
                return undefined;
            if (!instance.VideoChannel) {
                instance.VideoChannel = (yield instance.$get('VideoChannel', {
                    include: [
                        actor_1.ActorModel,
                        account_1.AccountModel
                    ],
                    transaction: options.transaction
                }));
            }
            return (0, send_1.sendDeleteVideo)(instance, options.transaction);
        });
    }
    static removeFiles(instance, options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const tasks = [];
            logger_1.logger.info('Removing files of video %s.', instance.url);
            if (instance.isOwned()) {
                if (!Array.isArray(instance.VideoFiles)) {
                    instance.VideoFiles = yield instance.$get('VideoFiles', { transaction: options.transaction });
                }
                instance.VideoFiles.forEach(file => {
                    tasks.push(instance.removeFileAndTorrent(file));
                });
                if (!Array.isArray(instance.VideoStreamingPlaylists)) {
                    instance.VideoStreamingPlaylists = yield instance.$get('VideoStreamingPlaylists', { transaction: options.transaction });
                }
                for (const p of instance.VideoStreamingPlaylists) {
                    tasks.push(instance.removeStreamingPlaylistFiles(p));
                }
            }
            Promise.all(tasks)
                .catch(err => {
                logger_1.logger.error('Some errors when removing files of video %s in before destroy hook.', instance.uuid, { err });
            });
            return undefined;
        });
    }
    static stopLiveIfNeeded(instance) {
        if (!instance.isLive)
            return;
        logger_1.logger.info('Stopping live of video %s after video deletion.', instance.uuid);
        live_manager_1.LiveManager.Instance.stopSessionOf(instance.id);
    }
    static invalidateCache(instance) {
        model_cache_1.ModelCache.Instance.invalidateCache('video', instance.id);
    }
    static saveEssentialDataToAbuses(instance, options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const tasks = [];
            if (!Array.isArray(instance.VideoAbuses)) {
                instance.VideoAbuses = yield instance.$get('VideoAbuses', { transaction: options.transaction });
                if (instance.VideoAbuses.length === 0)
                    return undefined;
            }
            logger_1.logger.info('Saving video abuses details of video %s.', instance.url);
            if (!instance.Trackers)
                instance.Trackers = yield instance.$get('Trackers', { transaction: options.transaction });
            const details = instance.toFormattedDetailsJSON();
            for (const abuse of instance.VideoAbuses) {
                abuse.deletedVideo = details;
                tasks.push(abuse.save({ transaction: options.transaction }));
            }
            yield Promise.all(tasks);
        });
    }
    static listLocal() {
        const query = {
            where: {
                remote: false
            }
        };
        return VideoModel_1.findAll(query);
    }
    static listAllAndSharedByActorForOutbox(actorId, start, count) {
        function getRawQuery(select) {
            const queryVideo = 'SELECT ' + select + ' FROM "video" AS "Video" ' +
                'INNER JOIN "videoChannel" AS "VideoChannel" ON "VideoChannel"."id" = "Video"."channelId" ' +
                'INNER JOIN "account" AS "Account" ON "Account"."id" = "VideoChannel"."accountId" ' +
                'WHERE "Account"."actorId" = ' + actorId;
            const queryVideoShare = 'SELECT ' + select + ' FROM "videoShare" AS "VideoShare" ' +
                'INNER JOIN "video" AS "Video" ON "Video"."id" = "VideoShare"."videoId" ' +
                'WHERE "VideoShare"."actorId" = ' + actorId;
            return `(${queryVideo}) UNION (${queryVideoShare})`;
        }
        const rawQuery = getRawQuery('"Video"."id"');
        const rawCountQuery = getRawQuery('COUNT("Video"."id") as "total"');
        const query = {
            distinct: true,
            offset: start,
            limit: count,
            order: (0, utils_1.getVideoSort)('-createdAt', ['Tags', 'name', 'ASC']),
            where: {
                id: {
                    [sequelize_1.Op.in]: sequelize_1.Sequelize.literal('(' + rawQuery + ')')
                },
                [sequelize_1.Op.or]: (0, video_1.getPrivaciesForFederation)()
            },
            include: [
                {
                    attributes: ['filename', 'language', 'fileUrl'],
                    model: video_caption_1.VideoCaptionModel.unscoped(),
                    required: false
                },
                {
                    attributes: ['id', 'url'],
                    model: video_share_1.VideoShareModel.unscoped(),
                    required: false,
                    where: {
                        [sequelize_1.Op.and]: [
                            {
                                id: {
                                    [sequelize_1.Op.not]: null
                                }
                            },
                            {
                                actorId
                            }
                        ]
                    },
                    include: [
                        {
                            attributes: ['id', 'url'],
                            model: actor_1.ActorModel.unscoped()
                        }
                    ]
                },
                {
                    model: video_channel_1.VideoChannelModel.unscoped(),
                    required: true,
                    include: [
                        {
                            attributes: ['name'],
                            model: account_1.AccountModel.unscoped(),
                            required: true,
                            include: [
                                {
                                    attributes: ['id', 'url', 'followersUrl'],
                                    model: actor_1.ActorModel.unscoped(),
                                    required: true
                                }
                            ]
                        },
                        {
                            attributes: ['id', 'url', 'followersUrl'],
                            model: actor_1.ActorModel.unscoped(),
                            required: true
                        }
                    ]
                },
                {
                    model: video_streaming_playlist_1.VideoStreamingPlaylistModel.unscoped(),
                    required: false,
                    include: [
                        {
                            model: video_file_1.VideoFileModel,
                            required: false
                        }
                    ]
                },
                video_live_1.VideoLiveModel.unscoped(),
                video_file_1.VideoFileModel,
                tag_1.TagModel
            ]
        };
        return bluebird_1.default.all([
            VideoModel_1.scope(ScopeNames.WITH_THUMBNAILS).findAll(query),
            VideoModel_1.sequelize.query(rawCountQuery, { type: sequelize_1.QueryTypes.SELECT })
        ]).then(([rows, totals]) => {
            let totalVideos = 0;
            let totalVideoShares = 0;
            if (totals[0])
                totalVideos = parseInt(totals[0].total, 10);
            if (totals[1])
                totalVideoShares = parseInt(totals[1].total, 10);
            const total = totalVideos + totalVideoShares;
            return {
                data: rows,
                total: total
            };
        });
    }
    static listPublishedLiveUUIDs() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const options = {
                attributes: ['uuid'],
                where: {
                    isLive: true,
                    remote: false,
                    state: 1
                }
            };
            const result = yield VideoModel_1.findAll(options);
            return result.map(v => v.uuid);
        });
    }
    static meVideoViews(username, startDate) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const startDateWhere = startDate ? `AND "video"."createdAt" > '${startDate}'` : null;
            const videoViewsQuery = `SELECT SUM("video"."views")
                                  FROM "account"
                                  JOIN "videoChannel" on "videoChannel"."accountId" = "account"."id"
                                  JOIN "video" on "video"."channelId" = "videoChannel"."id"
                                  WHERE "account"."name" = '${username}' ${startDateWhere || ''};
                                `;
            return yield VideoModel_1.sequelize.query(videoViewsQuery, { type: sequelize_1.QueryTypes.SELECT, nest: true })
                .then(rows => { var _a; return (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.sum; });
        });
    }
    static listUserVideosForApi(options) {
        const { start, count, sort, search, isLive } = options;
        function buildBaseQuery() {
            const where = {};
            if (search) {
                where.name = {
                    [sequelize_1.Op.iLike]: '%' + search + '%'
                };
            }
            if (isLive) {
                where.isLive = isLive;
            }
            const baseQuery = {
                offset: start,
                limit: count,
                where,
                order: (0, utils_1.getVideoSort)(sort),
                include: [
                    {
                        model: video_channel_1.VideoChannelModel,
                        required: true,
                        include: [
                            {
                                model: account_1.AccountModel,
                                where: {
                                    name: options.user.username
                                },
                                required: true
                            }
                        ]
                    }
                ]
            };
            return baseQuery;
        }
        const countQuery = buildBaseQuery();
        const findQuery = buildBaseQuery();
        const findScopes = [
            ScopeNames.WITH_SCHEDULED_UPDATE,
            ScopeNames.WITH_BLACKLISTED,
            ScopeNames.WITH_THUMBNAILS
        ];
        return Promise.all([
            VideoModel_1.count(countQuery),
            VideoModel_1.scope(findScopes).findAll(findQuery)
        ]).then(([count, rows]) => {
            return {
                data: rows,
                total: count
            };
        });
    }
    static listForApi(options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if ((options.filter === 'all-local' || options.filter === 'all') && !options.user.hasRight(20)) {
                throw new Error('Try to filter all-local but no user has not the see all videos right');
            }
            const trendingDays = options.sort.endsWith('trending')
                ? config_1.CONFIG.TRENDING.VIDEOS.INTERVAL_DAYS
                : undefined;
            let trendingAlgorithm;
            if (options.sort.endsWith('hot'))
                trendingAlgorithm = 'hot';
            if (options.sort.endsWith('best'))
                trendingAlgorithm = 'best';
            const serverActor = yield (0, application_1.getServerActor)();
            const followerActorId = options.followerActorId !== undefined
                ? options.followerActorId
                : serverActor.id;
            const queryOptions = Object.assign(Object.assign({}, (0, core_utils_1.pick)(options, [
                'start',
                'count',
                'sort',
                'nsfw',
                'isLive',
                'categoryOneOf',
                'licenceOneOf',
                'languageOneOf',
                'tagsOneOf',
                'tagsAllOf',
                'filter',
                'withFiles',
                'accountId',
                'videoChannelId',
                'videoPlaylistId',
                'includeLocalVideos',
                'user',
                'historyOfUser',
                'search'
            ])), { followerActorId, serverAccountId: serverActor.Account.id, trendingDays,
                trendingAlgorithm });
            return VideoModel_1.getAvailableForApi(queryOptions, options.countVideos);
        });
    }
    static searchAndPopulateAccountAndServer(options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const serverActor = yield (0, application_1.getServerActor)();
            const queryOptions = Object.assign(Object.assign({}, (0, core_utils_1.pick)(options, [
                'includeLocalVideos',
                'nsfw',
                'isLive',
                'categoryOneOf',
                'licenceOneOf',
                'languageOneOf',
                'tagsOneOf',
                'tagsAllOf',
                'user',
                'filter',
                'host',
                'start',
                'count',
                'sort',
                'startDate',
                'endDate',
                'originallyPublishedStartDate',
                'originallyPublishedEndDate',
                'durationMin',
                'durationMax',
                'uuids',
                'search'
            ])), { followerActorId: serverActor.id, serverAccountId: serverActor.Account.id });
            return VideoModel_1.getAvailableForApi(queryOptions);
        });
    }
    static countLocalLives() {
        const options = {
            where: {
                remote: false,
                isLive: true,
                state: {
                    [sequelize_1.Op.ne]: 5
                }
            }
        };
        return VideoModel_1.count(options);
    }
    static countVideosUploadedByUserSince(userId, since) {
        const options = {
            include: [
                {
                    model: video_channel_1.VideoChannelModel.unscoped(),
                    required: true,
                    include: [
                        {
                            model: account_1.AccountModel.unscoped(),
                            required: true,
                            include: [
                                {
                                    model: user_1.UserModel.unscoped(),
                                    required: true,
                                    where: {
                                        id: userId
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: since
                }
            }
        };
        return VideoModel_1.unscoped().count(options);
    }
    static countLivesOfAccount(accountId) {
        const options = {
            where: {
                remote: false,
                isLive: true,
                state: {
                    [sequelize_1.Op.ne]: 5
                }
            },
            include: [
                {
                    required: true,
                    model: video_channel_1.VideoChannelModel.unscoped(),
                    where: {
                        accountId
                    }
                }
            ]
        };
        return VideoModel_1.count(options);
    }
    static load(id, transaction) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ id, transaction, type: 'thumbnails' });
    }
    static loadWithBlacklist(id, transaction) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ id, transaction, type: 'thumbnails-blacklist' });
    }
    static loadImmutableAttributes(id, t) {
        const fun = () => {
            const query = {
                where: (0, utils_1.buildWhereIdOrUUID)(id),
                transaction: t
            };
            return VideoModel_1.scope(ScopeNames.WITH_IMMUTABLE_ATTRIBUTES).findOne(query);
        };
        return model_cache_1.ModelCache.Instance.doCache({
            cacheType: 'load-video-immutable-id',
            key: '' + id,
            deleteKey: 'video',
            fun
        });
    }
    static loadByUrlImmutableAttributes(url, transaction) {
        const fun = () => {
            const query = {
                where: {
                    url
                },
                transaction
            };
            return VideoModel_1.scope(ScopeNames.WITH_IMMUTABLE_ATTRIBUTES).findOne(query);
        };
        return model_cache_1.ModelCache.Instance.doCache({
            cacheType: 'load-video-immutable-url',
            key: url,
            deleteKey: 'video',
            fun
        });
    }
    static loadOnlyId(id, transaction) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ id, transaction, type: 'id' });
    }
    static loadWithFiles(id, transaction, logging) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ id, transaction, type: 'all-files', logging });
    }
    static loadByUrl(url, transaction) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ url, transaction, type: 'thumbnails' });
    }
    static loadByUrlAndPopulateAccount(url, transaction) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ url, transaction, type: 'account-blacklist-files' });
    }
    static loadAndPopulateAccountAndServerAndTags(id, t, userId) {
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ id, transaction: t, type: 'full-light', userId });
    }
    static loadForGetAPI(parameters) {
        const { id, transaction, userId } = parameters;
        const queryBuilder = new video_model_get_query_builder_1.VideosModelGetQueryBuilder(VideoModel_1.sequelize);
        return queryBuilder.queryVideo({ id, transaction, type: 'api', userId });
    }
    static getStats() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const totalLocalVideos = yield VideoModel_1.count({
                where: {
                    remote: false
                }
            });
            let totalLocalVideoViews = yield VideoModel_1.sum('views', {
                where: {
                    remote: false
                }
            });
            if (!totalLocalVideoViews)
                totalLocalVideoViews = 0;
            const { total: totalVideos } = yield VideoModel_1.listForApi({
                start: 0,
                count: 0,
                sort: '-publishedAt',
                nsfw: (0, express_utils_1.buildNSFWFilter)(),
                includeLocalVideos: true,
                withFiles: false
            });
            return {
                totalLocalVideos,
                totalLocalVideoViews,
                totalVideos
            };
        });
    }
    static incrementViews(id, views) {
        return VideoModel_1.increment('views', {
            by: views,
            where: {
                id
            }
        });
    }
    static updateRatesOf(videoId, type, t) {
        const field = type === 'like'
            ? 'likes'
            : 'dislikes';
        const rawQuery = `UPDATE "video" SET "${field}" = ` +
            '(' +
            'SELECT COUNT(id) FROM "accountVideoRate" WHERE "accountVideoRate"."videoId" = "video"."id" AND type = :rateType' +
            ') ' +
            'WHERE "video"."id" = :videoId';
        return account_video_rate_1.AccountVideoRateModel.sequelize.query(rawQuery, {
            transaction: t,
            replacements: { videoId, rateType: type },
            type: sequelize_1.QueryTypes.UPDATE
        });
    }
    static checkVideoHasInstanceFollow(videoId, followerActorId) {
        const query = 'SELECT 1 FROM "videoShare" ' +
            'INNER JOIN "actorFollow" ON "actorFollow"."targetActorId" = "videoShare"."actorId" ' +
            'WHERE "actorFollow"."actorId" = $followerActorId AND "actorFollow"."state" = \'accepted\' AND "videoShare"."videoId" = $videoId ' +
            'LIMIT 1';
        const options = {
            type: sequelize_1.QueryTypes.SELECT,
            bind: { followerActorId, videoId },
            raw: true
        };
        return VideoModel_1.sequelize.query(query, options)
            .then(results => results.length === 1);
    }
    static bulkUpdateSupportField(ofChannel, t) {
        const options = {
            where: {
                channelId: ofChannel.id
            },
            transaction: t
        };
        return VideoModel_1.update({ support: ofChannel.support }, options);
    }
    static getAllIdsFromChannel(videoChannel) {
        const query = {
            attributes: ['id'],
            where: {
                channelId: videoChannel.id
            }
        };
        return VideoModel_1.findAll(query)
            .then(videos => videos.map(v => v.id));
    }
    static getRandomFieldSamples(field, threshold, count) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const serverActor = yield (0, application_1.getServerActor)();
            const followerActorId = serverActor.id;
            const queryOptions = {
                attributes: [`"${field}"`],
                group: `GROUP BY "${field}"`,
                having: `HAVING COUNT("${field}") >= ${threshold}`,
                start: 0,
                sort: 'random',
                count,
                serverAccountId: serverActor.Account.id,
                followerActorId,
                includeLocalVideos: true
            };
            const queryBuilder = new videos_id_list_query_builder_1.VideosIdListQueryBuilder(VideoModel_1.sequelize);
            return queryBuilder.queryVideoIds(queryOptions)
                .then(rows => rows.map(r => r[field]));
        });
    }
    static buildTrendingQuery(trendingDays) {
        return {
            attributes: [],
            subQuery: false,
            model: video_view_1.VideoViewModel,
            required: false,
            where: {
                startDate: {
                    [sequelize_1.Op.gte]: new Date(new Date().getTime() - (24 * 3600 * 1000) * trendingDays)
                }
            }
        };
    }
    static getAvailableForApi(options, countVideos = true) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            function getCount() {
                if (countVideos !== true)
                    return Promise.resolve(undefined);
                const countOptions = Object.assign({}, options, { isCount: true });
                const queryBuilder = new videos_id_list_query_builder_1.VideosIdListQueryBuilder(VideoModel_1.sequelize);
                return queryBuilder.countVideoIds(countOptions);
            }
            function getModels() {
                if (options.count === 0)
                    return Promise.resolve([]);
                const queryBuilder = new videos_model_list_query_builder_1.VideosModelListQueryBuilder(VideoModel_1.sequelize);
                return queryBuilder.queryVideos(options);
            }
            const [count, rows] = yield Promise.all([getCount(), getModels()]);
            return {
                data: rows,
                total: count
            };
        });
    }
    isBlacklisted() {
        return !!this.VideoBlacklist;
    }
    isBlocked() {
        var _a;
        return ((_a = this.VideoChannel.Account.Actor.Server) === null || _a === void 0 ? void 0 : _a.isBlocked()) || this.VideoChannel.Account.isBlocked();
    }
    getQualityFileBy(fun) {
        if (Array.isArray(this.VideoFiles) && this.VideoFiles.length !== 0) {
            const file = fun(this.VideoFiles, file => file.resolution);
            return Object.assign(file, { Video: this });
        }
        if (Array.isArray(this.VideoStreamingPlaylists) && this.VideoStreamingPlaylists.length !== 0) {
            const streamingPlaylistWithVideo = Object.assign(this.VideoStreamingPlaylists[0], { Video: this });
            const file = fun(streamingPlaylistWithVideo.VideoFiles, file => file.resolution);
            return Object.assign(file, { VideoStreamingPlaylist: streamingPlaylistWithVideo });
        }
        return undefined;
    }
    getMaxQualityFile() {
        return this.getQualityFileBy(lodash_1.maxBy);
    }
    getMinQualityFile() {
        return this.getQualityFileBy(lodash_1.minBy);
    }
    getWebTorrentFile(resolution) {
        if (Array.isArray(this.VideoFiles) === false)
            return undefined;
        const file = this.VideoFiles.find(f => f.resolution === resolution);
        if (!file)
            return undefined;
        return Object.assign(file, { Video: this });
    }
    hasWebTorrentFiles() {
        return Array.isArray(this.VideoFiles) === true && this.VideoFiles.length !== 0;
    }
    addAndSaveThumbnail(thumbnail, transaction) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            thumbnail.videoId = this.id;
            const savedThumbnail = yield thumbnail.save({ transaction });
            if (Array.isArray(this.Thumbnails) === false)
                this.Thumbnails = [];
            if (this.Thumbnails.find(t => t.id === savedThumbnail.id))
                return;
            this.Thumbnails.push(savedThumbnail);
        });
    }
    getMiniature() {
        if (Array.isArray(this.Thumbnails) === false)
            return undefined;
        return this.Thumbnails.find(t => t.type === 1);
    }
    hasPreview() {
        return !!this.getPreview();
    }
    getPreview() {
        if (Array.isArray(this.Thumbnails) === false)
            return undefined;
        return this.Thumbnails.find(t => t.type === 2);
    }
    isOwned() {
        return this.remote === false;
    }
    getWatchStaticPath() {
        return (0, core_utils_1.buildVideoWatchPath)({ shortUUID: (0, uuid_1.uuidToShort)(this.uuid) });
    }
    getEmbedStaticPath() {
        return (0, core_utils_1.buildVideoEmbedPath)(this);
    }
    getMiniatureStaticPath() {
        const thumbnail = this.getMiniature();
        if (!thumbnail)
            return null;
        return (0, path_1.join)(constants_1.STATIC_PATHS.THUMBNAILS, thumbnail.filename);
    }
    getPreviewStaticPath() {
        const preview = this.getPreview();
        if (!preview)
            return null;
        return (0, path_1.join)(constants_1.LAZY_STATIC_PATHS.PREVIEWS, preview.filename);
    }
    toFormattedJSON(options) {
        return (0, video_format_utils_1.videoModelToFormattedJSON)(this, options);
    }
    toFormattedDetailsJSON() {
        return (0, video_format_utils_1.videoModelToFormattedDetailsJSON)(this);
    }
    getFormattedVideoFilesJSON(includeMagnet = true) {
        let files = [];
        if (Array.isArray(this.VideoFiles)) {
            const result = (0, video_format_utils_1.videoFilesModelToFormattedJSON)(this, this.VideoFiles, includeMagnet);
            files = files.concat(result);
        }
        for (const p of (this.VideoStreamingPlaylists || [])) {
            const result = (0, video_format_utils_1.videoFilesModelToFormattedJSON)(this, p.VideoFiles, includeMagnet);
            files = files.concat(result);
        }
        return files;
    }
    toActivityPubObject() {
        return (0, video_format_utils_1.videoModelToActivityPubObject)(this);
    }
    getTruncatedDescription() {
        if (!this.description)
            return null;
        const maxLength = constants_1.CONSTRAINTS_FIELDS.VIDEOS.TRUNCATED_DESCRIPTION.max;
        return (0, core_utils_2.peertubeTruncate)(this.description, { length: maxLength });
    }
    getMaxQualityResolution() {
        const file = this.getMaxQualityFile();
        const videoOrPlaylist = file.getVideoOrStreamingPlaylist();
        return video_path_manager_1.VideoPathManager.Instance.makeAvailableVideoFile(videoOrPlaylist, file, originalFilePath => {
            return (0, ffprobe_utils_1.getVideoFileResolution)(originalFilePath);
        });
    }
    getDescriptionAPIPath() {
        return `/api/${constants_1.API_VERSION}/videos/${this.uuid}/description`;
    }
    getHLSPlaylist() {
        if (!this.VideoStreamingPlaylists)
            return undefined;
        const playlist = this.VideoStreamingPlaylists.find(p => p.type === 1);
        playlist.Video = this;
        return playlist;
    }
    setHLSPlaylist(playlist) {
        const toAdd = [playlist];
        if (Array.isArray(this.VideoStreamingPlaylists) === false || this.VideoStreamingPlaylists.length === 0) {
            this.VideoStreamingPlaylists = toAdd;
            return;
        }
        this.VideoStreamingPlaylists = this.VideoStreamingPlaylists
            .filter(s => s.type !== 1)
            .concat(toAdd);
    }
    removeFileAndTorrent(videoFile, isRedundancy = false) {
        const filePath = isRedundancy
            ? video_path_manager_1.VideoPathManager.Instance.getFSRedundancyVideoFilePath(this, videoFile)
            : video_path_manager_1.VideoPathManager.Instance.getFSVideoFileOutputPath(this, videoFile);
        const promises = [(0, fs_extra_1.remove)(filePath)];
        if (!isRedundancy)
            promises.push(videoFile.removeTorrent());
        if (videoFile.storage === 1) {
            promises.push((0, object_storage_1.removeWebTorrentObjectStorage)(videoFile));
        }
        return Promise.all(promises);
    }
    removeStreamingPlaylistFiles(streamingPlaylist, isRedundancy = false) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const directoryPath = isRedundancy
                ? (0, paths_1.getHLSRedundancyDirectory)(this)
                : (0, paths_1.getHLSDirectory)(this);
            yield (0, fs_extra_1.remove)(directoryPath);
            if (isRedundancy !== true) {
                const streamingPlaylistWithFiles = streamingPlaylist;
                streamingPlaylistWithFiles.Video = this;
                if (!Array.isArray(streamingPlaylistWithFiles.VideoFiles)) {
                    streamingPlaylistWithFiles.VideoFiles = yield streamingPlaylistWithFiles.$get('VideoFiles');
                }
                yield Promise.all(streamingPlaylistWithFiles.VideoFiles.map(file => file.removeTorrent()));
                if (streamingPlaylist.storage === 1) {
                    yield (0, object_storage_1.removeHLSObjectStorage)(streamingPlaylist, this);
                }
            }
        });
    }
    isOutdated() {
        if (this.isOwned())
            return false;
        return (0, utils_1.isOutdated)(this, constants_1.ACTIVITY_PUB.VIDEO_REFRESH_INTERVAL);
    }
    hasPrivacyForFederation() {
        return (0, video_1.isPrivacyForFederation)(this.privacy);
    }
    hasStateForFederation() {
        return (0, video_1.isStateForFederation)(this.state);
    }
    isNewVideo(newPrivacy) {
        return this.hasPrivacyForFederation() === false && (0, video_1.isPrivacyForFederation)(newPrivacy) === true;
    }
    setAsRefreshed() {
        return (0, shared_1.setAsUpdated)('video', this.id);
    }
    requiresAuth() {
        return this.privacy === 3 || this.privacy === 4 || !!this.VideoBlacklist;
    }
    setPrivacy(newPrivacy) {
        if (this.privacy === 3 && newPrivacy !== 3) {
            this.publishedAt = new Date();
        }
        this.privacy = newPrivacy;
    }
    isConfidential() {
        return this.privacy === 3 ||
            this.privacy === 2 ||
            this.privacy === 4;
    }
    setNewState(newState, isNewVideo, transaction) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.state === newState)
                throw new Error('Cannot use same state ' + newState);
            this.state = newState;
            if (this.state === 1 && isNewVideo) {
                this.publishedAt = new Date();
            }
            yield this.save({ transaction });
        });
    }
    getBandwidthBits(videoFile) {
        return Math.ceil((videoFile.size * 8) / this.duration);
    }
    getTrackerUrls() {
        if (this.isOwned()) {
            return [
                constants_1.WEBSERVER.URL + '/tracker/announce',
                constants_1.WEBSERVER.WS + '://' + constants_1.WEBSERVER.HOSTNAME + ':' + constants_1.WEBSERVER.PORT + '/tracker/socket'
            ];
        }
        return this.Trackers.map(t => t.url);
    }
};
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.IsUUID)(4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    (0, tslib_1.__metadata)("design:type", String)
], VideoModel.prototype, "uuid", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoName', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoNameValid, 'name')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoModel.prototype, "name", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "category", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "licence", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEOS.LANGUAGE.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoModel.prototype, "language", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoPrivacy', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoPrivacyValid, 'privacy')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "privacy", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoNSFW', value => (0, utils_1.throwIfNotValid)(value, misc_2.isBooleanValid, 'NSFW boolean')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], VideoModel.prototype, "nsfw", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.Is)('VideoDescription', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoDescriptionValid, 'description', true)),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEOS.DESCRIPTION.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoModel.prototype, "description", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.Is)('VideoSupport', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoSupportValid, 'support', true)),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEOS.SUPPORT.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoModel.prototype, "support", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoDuration', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoDurationValid, 'duration')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "duration", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.IsInt,
    (0, sequelize_typescript_1.Min)(0),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "views", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.IsInt,
    (0, sequelize_typescript_1.Min)(0),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "likes", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.IsInt,
    (0, sequelize_typescript_1.Min)(0),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "dislikes", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], VideoModel.prototype, "remote", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], VideoModel.prototype, "isLive", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoUrl', value => (0, utils_1.throwIfNotValid)(value, misc_1.isActivityPubUrlValid, 'url')),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEOS.URL.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoModel.prototype, "url", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], VideoModel.prototype, "commentsEnabled", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], VideoModel.prototype, "downloadEnabled", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Boolean)
], VideoModel.prototype, "waitTranscoding", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.Is)('VideoState', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoStateValid, 'state')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "state", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoModel.prototype, "publishedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    (0, tslib_1.__metadata)("design:type", Date)
], VideoModel.prototype, "originallyPublishedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "aspectRatio", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_channel_1.VideoChannelModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoModel.prototype, "channelId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_channel_1.VideoChannelModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", video_channel_1.VideoChannelModel)
], VideoModel.prototype, "VideoChannel", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsToMany)(() => tag_1.TagModel, {
        foreignKey: 'videoId',
        through: () => video_tag_1.VideoTagModel,
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "Tags", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsToMany)(() => tracker_1.TrackerModel, {
        foreignKey: 'videoId',
        through: () => video_tracker_1.VideoTrackerModel,
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "Trackers", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => thumbnail_1.ThumbnailModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: true
        },
        hooks: true,
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "Thumbnails", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_playlist_element_1.VideoPlaylistElementModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: true
        },
        onDelete: 'set null'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoPlaylistElements", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_abuse_1.VideoAbuseModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: true
        },
        onDelete: 'set null'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoAbuses", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_file_1.VideoFileModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: true
        },
        hooks: true,
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoFiles", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_streaming_playlist_1.VideoStreamingPlaylistModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        hooks: true,
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoStreamingPlaylists", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_share_1.VideoShareModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoShares", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => account_video_rate_1.AccountVideoRateModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "AccountVideoRates", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_comment_1.VideoCommentModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade',
        hooks: true
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoComments", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_view_1.VideoViewModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoViews", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => user_video_history_1.UserVideoHistoryModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "UserVideoHistories", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => schedule_video_update_1.ScheduleVideoUpdateModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", schedule_video_update_1.ScheduleVideoUpdateModel)
], VideoModel.prototype, "ScheduleVideoUpdate", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => video_blacklist_1.VideoBlacklistModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", video_blacklist_1.VideoBlacklistModel)
], VideoModel.prototype, "VideoBlacklist", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => video_live_1.VideoLiveModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", video_live_1.VideoLiveModel)
], VideoModel.prototype, "VideoLive", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => video_import_1.VideoImportModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: true
        },
        onDelete: 'set null'
    }),
    (0, tslib_1.__metadata)("design:type", video_import_1.VideoImportModel)
], VideoModel.prototype, "VideoImport", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_caption_1.VideoCaptionModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade',
        hooks: true,
        ['separate']: true
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoModel.prototype, "VideoCaptions", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasOne)(() => video_job_info_1.VideoJobInfoModel, {
        foreignKey: {
            name: 'videoId',
            allowNull: false
        },
        onDelete: 'cascade'
    }),
    (0, tslib_1.__metadata)("design:type", video_job_info_1.VideoJobInfoModel)
], VideoModel.prototype, "VideoJobInfo", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.BeforeDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object, Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], VideoModel, "sendDelete", null);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.BeforeDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [VideoModel, Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], VideoModel, "removeFiles", null);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.BeforeDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [VideoModel]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], VideoModel, "stopLiveIfNeeded", null);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.BeforeDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [VideoModel]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], VideoModel, "invalidateCache", null);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.BeforeDestroy,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [VideoModel, Object]),
    (0, tslib_1.__metadata)("design:returntype", Promise)
], VideoModel, "saveEssentialDataToAbuses", null);
VideoModel = VideoModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Scopes)(() => ({
        [ScopeNames.WITH_IMMUTABLE_ATTRIBUTES]: {
            attributes: ['id', 'url', 'uuid', 'remote']
        },
        [ScopeNames.FOR_API]: (options) => {
            const include = [
                {
                    model: video_channel_1.VideoChannelModel.scope({
                        method: [
                            video_channel_1.ScopeNames.SUMMARY, {
                                withAccount: true,
                                withAccountBlockerIds: options.withAccountBlockerIds
                            }
                        ]
                    }),
                    required: true
                },
                {
                    attributes: ['type', 'filename'],
                    model: thumbnail_1.ThumbnailModel,
                    required: false
                }
            ];
            const query = {};
            if (options.ids) {
                query.where = {
                    id: {
                        [sequelize_1.Op.in]: options.ids
                    }
                };
            }
            if (options.videoPlaylistId) {
                include.push({
                    model: video_playlist_element_1.VideoPlaylistElementModel.unscoped(),
                    required: true,
                    where: {
                        videoPlaylistId: options.videoPlaylistId
                    }
                });
            }
            query.include = include;
            return query;
        },
        [ScopeNames.WITH_THUMBNAILS]: {
            include: [
                {
                    model: thumbnail_1.ThumbnailModel,
                    required: false
                }
            ]
        },
        [ScopeNames.WITH_ACCOUNT_DETAILS]: {
            include: [
                {
                    model: video_channel_1.VideoChannelModel.unscoped(),
                    required: true,
                    include: [
                        {
                            attributes: {
                                exclude: ['privateKey', 'publicKey']
                            },
                            model: actor_1.ActorModel.unscoped(),
                            required: true,
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
                        },
                        {
                            model: account_1.AccountModel.unscoped(),
                            required: true,
                            include: [
                                {
                                    model: actor_1.ActorModel.unscoped(),
                                    attributes: {
                                        exclude: ['privateKey', 'publicKey']
                                    },
                                    required: true,
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
                            ]
                        }
                    ]
                }
            ]
        },
        [ScopeNames.WITH_TAGS]: {
            include: [tag_1.TagModel]
        },
        [ScopeNames.WITH_BLACKLISTED]: {
            include: [
                {
                    attributes: ['id', 'reason', 'unfederated'],
                    model: video_blacklist_1.VideoBlacklistModel,
                    required: false
                }
            ]
        },
        [ScopeNames.WITH_WEBTORRENT_FILES]: (withRedundancies = false) => {
            let subInclude = [];
            if (withRedundancies === true) {
                subInclude = [
                    {
                        attributes: ['fileUrl'],
                        model: video_redundancy_1.VideoRedundancyModel.unscoped(),
                        required: false
                    }
                ];
            }
            return {
                include: [
                    {
                        model: video_file_1.VideoFileModel,
                        separate: true,
                        required: false,
                        include: subInclude
                    }
                ]
            };
        },
        [ScopeNames.WITH_STREAMING_PLAYLISTS]: (withRedundancies = false) => {
            const subInclude = [
                {
                    model: video_file_1.VideoFileModel,
                    required: false
                }
            ];
            if (withRedundancies === true) {
                subInclude.push({
                    attributes: ['fileUrl'],
                    model: video_redundancy_1.VideoRedundancyModel.unscoped(),
                    required: false
                });
            }
            return {
                include: [
                    {
                        model: video_streaming_playlist_1.VideoStreamingPlaylistModel.unscoped(),
                        required: false,
                        separate: true,
                        include: subInclude
                    }
                ]
            };
        },
        [ScopeNames.WITH_SCHEDULED_UPDATE]: {
            include: [
                {
                    model: schedule_video_update_1.ScheduleVideoUpdateModel.unscoped(),
                    required: false
                }
            ]
        },
        [ScopeNames.WITH_USER_HISTORY]: (userId) => {
            return {
                include: [
                    {
                        attributes: ['currentTime'],
                        model: user_video_history_1.UserVideoHistoryModel.unscoped(),
                        required: false,
                        where: {
                            userId
                        }
                    }
                ]
            };
        }
    })),
    (0, sequelize_typescript_1.Table)({
        tableName: 'video',
        indexes: [
            (0, utils_1.buildTrigramSearchIndex)('video_name_trigram', 'name'),
            { fields: ['createdAt'] },
            {
                fields: [
                    { name: 'publishedAt', order: 'DESC' },
                    { name: 'id', order: 'ASC' }
                ]
            },
            { fields: ['duration'] },
            {
                fields: [
                    { name: 'views', order: 'DESC' },
                    { name: 'id', order: 'ASC' }
                ]
            },
            { fields: ['channelId'] },
            {
                fields: ['originallyPublishedAt'],
                where: {
                    originallyPublishedAt: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['category'],
                where: {
                    category: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['licence'],
                where: {
                    licence: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['language'],
                where: {
                    language: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['nsfw'],
                where: {
                    nsfw: true
                }
            },
            {
                fields: ['remote'],
                where: {
                    remote: false
                }
            },
            {
                fields: ['uuid'],
                unique: true
            },
            {
                fields: ['url'],
                unique: true
            }
        ]
    })
], VideoModel);
exports.VideoModel = VideoModel;
