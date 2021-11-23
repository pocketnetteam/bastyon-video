"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosIdListQueryBuilder = void 0;
const tslib_1 = require("tslib");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const misc_1 = require("@server/helpers/custom-validators/misc");
const constants_1 = require("@server/initializers/constants");
const utils_1 = require("@server/models/utils");
const abstract_videos_query_builder_1 = require("./shared/abstract-videos-query-builder");
class VideosIdListQueryBuilder extends abstract_videos_query_builder_1.AbstractVideosQueryBuilder {
    constructor(sequelize) {
        super();
        this.sequelize = sequelize;
        this.replacements = {};
        this.joins = [];
        this.and = [];
        this.cte = [];
        this.group = '';
        this.having = '';
        this.sort = '';
        this.limit = '';
        this.offset = '';
    }
    queryVideoIds(options) {
        this.buildIdsListQuery(options);
        return this.runQuery();
    }
    countVideoIds(countOptions) {
        this.buildIdsListQuery(countOptions);
        return this.runQuery().then(rows => rows.length !== 0 ? rows[0].total : 0);
    }
    getIdsListQueryAndSort(options) {
        this.buildIdsListQuery(options);
        return { query: this.query, sort: this.sort, replacements: this.replacements };
    }
    buildIdsListQuery(options) {
        this.attributes = options.attributes || ['"video"."id"'];
        if (options.group)
            this.group = options.group;
        if (options.having)
            this.having = options.having;
        this.joins = this.joins.concat([
            'INNER JOIN "videoChannel" ON "videoChannel"."id" = "video"."channelId"',
            'INNER JOIN "account" ON "account"."id" = "videoChannel"."accountId"',
            'INNER JOIN "actor" "accountActor" ON "account"."actorId" = "accountActor"."id"'
        ]);
        this.whereNotBlacklisted();
        if (options.serverAccountId) {
            this.whereNotBlocked(options.serverAccountId, options.user);
        }
        if (!options.filter || (options.filter !== 'all-local' && options.filter !== 'all')) {
            this.whereStateAndPrivacyAvailable(options.user);
        }
        if (options.videoPlaylistId) {
            this.joinPlaylist(options.videoPlaylistId);
        }
        if (options.filter && (options.filter === 'local' || options.filter === 'all-local')) {
            this.whereOnlyLocal();
        }
        if (options.host) {
            this.whereHost(options.host);
        }
        if (options.accountId) {
            this.whereAccountId(options.accountId);
        }
        if (options.videoChannelId) {
            this.whereChannelId(options.videoChannelId);
        }
        if (options.followerActorId) {
            this.whereFollowerActorId(options.followerActorId, options.includeLocalVideos);
        }
        if (options.withFiles === true) {
            this.whereFileExists();
        }
        if (options.tagsOneOf) {
            this.whereTagsOneOf(options.tagsOneOf);
        }
        if (options.tagsAllOf) {
            this.whereTagsAllOf(options.tagsAllOf);
        }
        if (options.uuids) {
            this.whereUUIDs(options.uuids);
        }
        if (options.nsfw === true) {
            this.whereNSFW();
        }
        else if (options.nsfw === false) {
            this.whereSFW();
        }
        if (options.isLive === true) {
            this.whereLive();
        }
        else if (options.isLive === false) {
            this.whereVOD();
        }
        if (options.categoryOneOf) {
            this.whereCategoryOneOf(options.categoryOneOf);
        }
        if (options.licenceOneOf) {
            this.whereLicenceOneOf(options.licenceOneOf);
        }
        if (options.languageOneOf) {
            this.whereLanguageOneOf(options.languageOneOf);
        }
        if (options.isCount !== true) {
            if (options.trendingDays) {
                this.groupForTrending(options.trendingDays);
            }
            else if (['best', 'hot'].includes(options.trendingAlgorithm)) {
                this.groupForHotOrBest(options.trendingAlgorithm, options.user);
            }
        }
        if (options.historyOfUser) {
            this.joinHistory(options.historyOfUser.id);
        }
        if (options.startDate) {
            this.whereStartDate(options.startDate);
        }
        if (options.endDate) {
            this.whereEndDate(options.endDate);
        }
        if (options.originallyPublishedStartDate) {
            this.whereOriginallyPublishedStartDate(options.originallyPublishedStartDate);
        }
        if (options.originallyPublishedEndDate) {
            this.whereOriginallyPublishedEndDate(options.originallyPublishedEndDate);
        }
        if (options.durationMin) {
            this.whereDurationMin(options.durationMin);
        }
        if (options.durationMax) {
            this.whereDurationMax(options.durationMax);
        }
        this.whereSearch(options.search);
        if (options.isCount === true) {
            this.setCountAttribute();
        }
        else {
            if ((0, misc_1.exists)(options.sort)) {
                this.setSort(options.sort);
            }
            if ((0, misc_1.exists)(options.count)) {
                this.setLimit(options.count);
            }
            if ((0, misc_1.exists)(options.start)) {
                this.setOffset(options.start);
            }
        }
        const cteString = this.cte.length !== 0
            ? `WITH ${this.cte.join(', ')} `
            : '';
        this.query = cteString +
            'SELECT ' + this.attributes.join(', ') + ' ' +
            'FROM "video" ' + this.joins.join(' ') + ' ' +
            'WHERE ' + this.and.join(' AND ') + ' ' +
            this.group + ' ' +
            this.having + ' ' +
            this.sort + ' ' +
            this.limit + ' ' +
            this.offset;
    }
    setCountAttribute() {
        this.attributes = ['COUNT(*) as "total"'];
    }
    joinHistory(userId) {
        this.joins.push('INNER JOIN "userVideoHistory" ON "video"."id" = "userVideoHistory"."videoId"');
        this.and.push('"userVideoHistory"."userId" = :historyOfUser');
        this.replacements.historyOfUser = userId;
    }
    joinPlaylist(playlistId) {
        this.joins.push('INNER JOIN "videoPlaylistElement" "video"."id" = "videoPlaylistElement"."videoId" ' +
            'AND "videoPlaylistElement"."videoPlaylistId" = :videoPlaylistId');
        this.replacements.videoPlaylistId = playlistId;
    }
    whereStateAndPrivacyAvailable(user) {
        this.and.push(`("video"."state" = ${1} OR ` +
            `("video"."state" = ${2} AND "video"."waitTranscoding" IS false))`);
        if (user) {
            this.and.push(`("video"."privacy" = ${1} OR "video"."privacy" = ${4})`);
        }
        else {
            this.and.push(`"video"."privacy" = ${1}`);
        }
    }
    whereOnlyLocal() {
        this.and.push('"video"."remote" IS FALSE');
    }
    whereHost(host) {
        if (host === constants_1.WEBSERVER.HOST) {
            this.and.push('"accountActor"."serverId" IS NULL');
            return;
        }
        this.joins.push('INNER JOIN "server" ON "server"."id" = "accountActor"."serverId"');
        this.and.push('"server"."host" = :host');
        this.replacements.host = host;
    }
    whereAccountId(accountId) {
        this.and.push('"account"."id" = :accountId');
        this.replacements.accountId = accountId;
    }
    whereChannelId(channelId) {
        this.and.push('"videoChannel"."id" = :videoChannelId');
        this.replacements.videoChannelId = channelId;
    }
    whereFollowerActorId(followerActorId, includeLocalVideos) {
        let query = '(' +
            '  EXISTS (' +
            '    SELECT 1 FROM "videoShare" ' +
            '    INNER JOIN "actorFollow" "actorFollowShare" ON "actorFollowShare"."targetActorId" = "videoShare"."actorId" ' +
            '    AND "actorFollowShare"."actorId" = :followerActorId AND "actorFollowShare"."state" = \'accepted\' ' +
            '    WHERE "videoShare"."videoId" = "video"."id"' +
            '  )' +
            '  OR' +
            '  EXISTS (' +
            '    SELECT 1 from "actorFollow" ' +
            '    WHERE "actorFollow"."targetActorId" = "account"."actorId" AND "actorFollow"."actorId" = :followerActorId ' +
            '    AND "actorFollow"."state" = \'accepted\'' +
            '  )';
        if (includeLocalVideos) {
            query += '  OR "video"."remote" IS FALSE';
        }
        query += ')';
        this.and.push(query);
        this.replacements.followerActorId = followerActorId;
    }
    whereFileExists() {
        this.and.push('(' +
            '  EXISTS (SELECT 1 FROM "videoFile" WHERE "videoFile"."videoId" = "video"."id") ' +
            '  OR EXISTS (' +
            '    SELECT 1 FROM "videoStreamingPlaylist" ' +
            '    INNER JOIN "videoFile" ON "videoFile"."videoStreamingPlaylistId" = "videoStreamingPlaylist"."id" ' +
            '    WHERE "videoStreamingPlaylist"."videoId" = "video"."id"' +
            '  )' +
            ')');
    }
    whereTagsOneOf(tagsOneOf) {
        const tagsOneOfLower = tagsOneOf.map(t => t.toLowerCase());
        this.and.push('EXISTS (' +
            '  SELECT 1 FROM "videoTag" ' +
            '  INNER JOIN "tag" ON "tag"."id" = "videoTag"."tagId" ' +
            '  WHERE lower("tag"."name") IN (' + (0, utils_1.createSafeIn)(this.sequelize, tagsOneOfLower) + ') ' +
            '  AND "video"."id" = "videoTag"."videoId"' +
            ')');
    }
    whereTagsAllOf(tagsAllOf) {
        const tagsAllOfLower = tagsAllOf.map(t => t.toLowerCase());
        this.and.push('EXISTS (' +
            '  SELECT 1 FROM "videoTag" ' +
            '  INNER JOIN "tag" ON "tag"."id" = "videoTag"."tagId" ' +
            '  WHERE lower("tag"."name") IN (' + (0, utils_1.createSafeIn)(this.sequelize, tagsAllOfLower) + ') ' +
            '  AND "video"."id" = "videoTag"."videoId" ' +
            '  GROUP BY "videoTag"."videoId" HAVING COUNT(*) = ' + tagsAllOfLower.length +
            ')');
    }
    whereUUIDs(uuids) {
        this.and.push('"video"."uuid" IN (' + (0, utils_1.createSafeIn)(this.sequelize, uuids) + ')');
    }
    whereCategoryOneOf(categoryOneOf) {
        this.and.push('"video"."category" IN (:categoryOneOf)');
        this.replacements.categoryOneOf = categoryOneOf;
    }
    whereLicenceOneOf(licenceOneOf) {
        this.and.push('"video"."licence" IN (:licenceOneOf)');
        this.replacements.licenceOneOf = licenceOneOf;
    }
    whereLanguageOneOf(languageOneOf) {
        const languages = languageOneOf.filter(l => l && l !== '_unknown');
        const languagesQueryParts = [];
        if (languages.length !== 0) {
            languagesQueryParts.push('"video"."language" IN (:languageOneOf)');
            this.replacements.languageOneOf = languages;
            languagesQueryParts.push('EXISTS (' +
                '  SELECT 1 FROM "videoCaption" WHERE "videoCaption"."language" ' +
                '  IN (' + (0, utils_1.createSafeIn)(this.sequelize, languages) + ') AND ' +
                '  "videoCaption"."videoId" = "video"."id"' +
                ')');
        }
        if (languageOneOf.includes('_unknown')) {
            languagesQueryParts.push('"video"."language" IS NULL');
        }
        if (languagesQueryParts.length !== 0) {
            this.and.push('(' + languagesQueryParts.join(' OR ') + ')');
        }
    }
    whereNSFW() {
        this.and.push('"video"."nsfw" IS TRUE');
    }
    whereSFW() {
        this.and.push('"video"."nsfw" IS FALSE');
    }
    whereLive() {
        this.and.push('"video"."isLive" IS TRUE');
    }
    whereVOD() {
        this.and.push('"video"."isLive" IS FALSE');
    }
    whereNotBlocked(serverAccountId, user) {
        const blockerIds = [serverAccountId];
        if (user)
            blockerIds.push(user.Account.id);
        const inClause = (0, utils_1.createSafeIn)(this.sequelize, blockerIds);
        this.and.push('NOT EXISTS (' +
            '  SELECT 1 FROM "accountBlocklist" ' +
            '  WHERE "accountBlocklist"."accountId" IN (' + inClause + ') ' +
            '  AND "accountBlocklist"."targetAccountId" = "account"."id" ' +
            ')' +
            'AND NOT EXISTS (' +
            '  SELECT 1 FROM "serverBlocklist" WHERE "serverBlocklist"."accountId" IN (' + inClause + ') ' +
            '  AND "serverBlocklist"."targetServerId" = "accountActor"."serverId"' +
            ')');
    }
    whereSearch(search) {
        if (!search) {
            this.attributes.push('0 as similarity');
            return;
        }
        const escapedSearch = this.sequelize.escape(search);
        const escapedLikeSearch = this.sequelize.escape('%' + search + '%');
        this.cte.push('"trigramSearch" AS (' +
            '  SELECT "video"."id", ' +
            `  similarity(lower(immutable_unaccent("video"."name")), lower(immutable_unaccent(${escapedSearch}))) as similarity ` +
            '  FROM "video" ' +
            '  WHERE lower(immutable_unaccent("video"."name")) % lower(immutable_unaccent(' + escapedSearch + ')) OR ' +
            '        lower(immutable_unaccent("video"."name")) LIKE lower(immutable_unaccent(' + escapedLikeSearch + '))' +
            ')');
        this.joins.push('LEFT JOIN "trigramSearch" ON "video"."id" = "trigramSearch"."id"');
        let base = '(' +
            '  "trigramSearch"."id" IS NOT NULL OR ' +
            '  EXISTS (' +
            '    SELECT 1 FROM "videoTag" ' +
            '    INNER JOIN "tag" ON "tag"."id" = "videoTag"."tagId" ' +
            `    WHERE lower("tag"."name") = ${escapedSearch} ` +
            '    AND "video"."id" = "videoTag"."videoId"' +
            '  )';
        if (validator_1.default.isUUID(search)) {
            base += ` OR "video"."uuid" = ${escapedSearch}`;
        }
        base += ')';
        this.and.push(base);
        this.attributes.push(`COALESCE("trigramSearch"."similarity", 0) as similarity`);
    }
    whereNotBlacklisted() {
        this.and.push('"video"."id" NOT IN (SELECT "videoBlacklist"."videoId" FROM "videoBlacklist")');
    }
    whereStartDate(startDate) {
        this.and.push('"video"."publishedAt" >= :startDate');
        this.replacements.startDate = startDate;
    }
    whereEndDate(endDate) {
        this.and.push('"video"."publishedAt" <= :endDate');
        this.replacements.endDate = endDate;
    }
    whereOriginallyPublishedStartDate(startDate) {
        this.and.push('"video"."originallyPublishedAt" >= :originallyPublishedStartDate');
        this.replacements.originallyPublishedStartDate = startDate;
    }
    whereOriginallyPublishedEndDate(endDate) {
        this.and.push('"video"."originallyPublishedAt" <= :originallyPublishedEndDate');
        this.replacements.originallyPublishedEndDate = endDate;
    }
    whereDurationMin(durationMin) {
        this.and.push('"video"."duration" >= :durationMin');
        this.replacements.durationMin = durationMin;
    }
    whereDurationMax(durationMax) {
        this.and.push('"video"."duration" <= :durationMax');
        this.replacements.durationMax = durationMax;
    }
    groupForTrending(trendingDays) {
        const viewsGteDate = new Date(new Date().getTime() - (24 * 3600 * 1000) * trendingDays);
        this.joins.push('LEFT JOIN "videoView" ON "video"."id" = "videoView"."videoId" AND "videoView"."startDate" >= :viewsGteDate');
        this.replacements.viewsGteDate = viewsGteDate;
        this.attributes.push('COALESCE(SUM("videoView"."views"), 0) AS "score"');
        this.group = 'GROUP BY "video"."id"';
    }
    groupForHotOrBest(trendingAlgorithm, user) {
        const weights = {
            like: 3 * 50,
            dislike: -3 * 50,
            view: Math.floor((1 / 3) * 50),
            comment: 2 * 50,
            history: -2 * 50
        };
        this.joins.push('LEFT JOIN "videoComment" ON "video"."id" = "videoComment"."videoId"');
        let attribute = `LOG(GREATEST(1, "video"."likes" - 1)) * ${weights.like} ` +
            `+ LOG(GREATEST(1, "video"."dislikes" - 1)) * ${weights.dislike} ` +
            `+ LOG("video"."views" + 1) * ${weights.view} ` +
            `+ LOG(GREATEST(1, COUNT(DISTINCT "videoComment"."id"))) * ${weights.comment} ` +
            '+ (SELECT (EXTRACT(epoch FROM "video"."publishedAt") - 1446156582) / 47000) ';
        if (trendingAlgorithm === 'best' && user) {
            this.joins.push('LEFT JOIN "userVideoHistory" ON "video"."id" = "userVideoHistory"."videoId" AND "userVideoHistory"."userId" = :bestUser');
            this.replacements.bestUser = user.id;
            attribute += `+ POWER(COUNT(DISTINCT "userVideoHistory"."id"), 2.0) * ${weights.history} `;
        }
        attribute += 'AS "score"';
        this.attributes.push(attribute);
        this.group = 'GROUP BY "video"."id"';
    }
    setSort(sort) {
        if (sort === '-originallyPublishedAt' || sort === 'originallyPublishedAt') {
            this.attributes.push('COALESCE("video"."originallyPublishedAt", "video"."publishedAt") AS "publishedAtForOrder"');
        }
        this.sort = this.buildOrder(sort);
    }
    buildOrder(value) {
        const { direction, field } = (0, utils_1.buildDirectionAndField)(value);
        if (field.match(/^[a-zA-Z."]+$/) === null)
            throw new Error('Invalid sort column ' + field);
        if (field.toLowerCase() === 'random')
            return 'ORDER BY RANDOM()';
        if (['trending', 'hot', 'best'].includes(field.toLowerCase())) {
            return `ORDER BY "score" ${direction}, "video"."views" ${direction}`;
        }
        let firstSort;
        if (field.toLowerCase() === 'match') {
            firstSort = '"similarity"';
        }
        else if (field === 'originallyPublishedAt') {
            firstSort = '"publishedAtForOrder"';
        }
        else if (field.includes('.')) {
            firstSort = field;
        }
        else {
            firstSort = `"video"."${field}"`;
        }
        return `ORDER BY ${firstSort} ${direction}, "video"."id" ASC`;
    }
    setLimit(countArg) {
        const count = parseInt(countArg + '', 10);
        this.limit = `LIMIT ${count}`;
    }
    setOffset(startArg) {
        const start = parseInt(startArg + '', 10);
        this.offset = `OFFSET ${start}`;
    }
}
exports.VideosIdListQueryBuilder = VideosIdListQueryBuilder;
