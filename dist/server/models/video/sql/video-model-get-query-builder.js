"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosModelGetQuerySubBuilder = exports.VideosModelGetQueryBuilder = void 0;
const tslib_1 = require("tslib");
const abstract_videos_model_query_builder_1 = require("./shared/abstract-videos-model-query-builder");
const video_file_query_builder_1 = require("./shared/video-file-query-builder");
const video_model_builder_1 = require("./shared/video-model-builder");
const video_tables_1 = require("./shared/video-tables");
class VideosModelGetQueryBuilder {
    constructor(sequelize) {
        this.sequelize = sequelize;
        this.videoQueryBuilder = new VideosModelGetQuerySubBuilder(sequelize);
        this.webtorrentFilesQueryBuilder = new video_file_query_builder_1.VideoFileQueryBuilder(sequelize);
        this.streamingPlaylistFilesQueryBuilder = new video_file_query_builder_1.VideoFileQueryBuilder(sequelize);
        this.videoModelBuilder = new video_model_builder_1.VideoModelBuilder('get', new video_tables_1.VideoTables('get'));
    }
    queryVideo(options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [videoRows, webtorrentFilesRows, streamingPlaylistFilesRows] = yield Promise.all([
                this.videoQueryBuilder.queryVideos(options),
                VideosModelGetQueryBuilder.videoFilesInclude.has(options.type)
                    ? this.webtorrentFilesQueryBuilder.queryWebTorrentVideos(options)
                    : Promise.resolve(undefined),
                VideosModelGetQueryBuilder.videoFilesInclude.has(options.type)
                    ? this.streamingPlaylistFilesQueryBuilder.queryStreamingPlaylistVideos(options)
                    : Promise.resolve(undefined)
            ]);
            const videos = this.videoModelBuilder.buildVideosFromRows(videoRows, webtorrentFilesRows, streamingPlaylistFilesRows);
            if (videos.length > 1) {
                throw new Error('Video results is more than ');
            }
            if (videos.length === 0)
                return null;
            return videos[0];
        });
    }
}
exports.VideosModelGetQueryBuilder = VideosModelGetQueryBuilder;
VideosModelGetQueryBuilder.videoFilesInclude = new Set(['api', 'full-light', 'account-blacklist-files', 'all-files']);
class VideosModelGetQuerySubBuilder extends abstract_videos_model_query_builder_1.AbstractVideosModelQueryBuilder {
    constructor(sequelize) {
        super('get');
        this.sequelize = sequelize;
    }
    queryVideos(options) {
        this.buildMainGetQuery(options);
        return this.runQuery(options);
    }
    buildMainGetQuery(options) {
        this.attributes = {
            '"video".*': ''
        };
        if (VideosModelGetQuerySubBuilder.thumbnailsInclude.has(options.type)) {
            this.includeThumbnails();
        }
        if (VideosModelGetQuerySubBuilder.blacklistedInclude.has(options.type)) {
            this.includeBlacklisted();
        }
        if (VideosModelGetQuerySubBuilder.accountInclude.has(options.type)) {
            this.includeChannels();
            this.includeAccounts();
        }
        if (VideosModelGetQuerySubBuilder.tagsInclude.has(options.type)) {
            this.includeTags();
        }
        if (VideosModelGetQuerySubBuilder.scheduleUpdateInclude.has(options.type)) {
            this.includeScheduleUpdate();
        }
        if (VideosModelGetQuerySubBuilder.liveInclude.has(options.type)) {
            this.includeLive();
        }
        if (options.userId && VideosModelGetQuerySubBuilder.userHistoryInclude.has(options.type)) {
            this.includeUserHistory(options.userId);
        }
        if (VideosModelGetQuerySubBuilder.ownerUserInclude.has(options.type)) {
            this.includeOwnerUser();
        }
        if (VideosModelGetQuerySubBuilder.trackersInclude.has(options.type)) {
            this.includeTrackers();
        }
        this.whereId(options);
        this.query = this.buildQuery(options);
    }
    buildQuery(options) {
        const order = VideosModelGetQuerySubBuilder.tagsInclude.has(options.type)
            ? 'ORDER BY "Tags"."name" ASC'
            : '';
        const from = `SELECT * FROM "video" ${this.where} LIMIT 1`;
        return `${this.buildSelect()} FROM (${from}) AS "video" ${this.joins} ${order}`;
    }
}
exports.VideosModelGetQuerySubBuilder = VideosModelGetQuerySubBuilder;
VideosModelGetQuerySubBuilder.trackersInclude = new Set(['api']);
VideosModelGetQuerySubBuilder.liveInclude = new Set(['api', 'full-light']);
VideosModelGetQuerySubBuilder.scheduleUpdateInclude = new Set(['api', 'full-light']);
VideosModelGetQuerySubBuilder.tagsInclude = new Set(['api', 'full-light']);
VideosModelGetQuerySubBuilder.userHistoryInclude = new Set(['api', 'full-light']);
VideosModelGetQuerySubBuilder.accountInclude = new Set(['api', 'full-light', 'account-blacklist-files']);
VideosModelGetQuerySubBuilder.ownerUserInclude = new Set(['blacklist-rights']);
VideosModelGetQuerySubBuilder.blacklistedInclude = new Set([
    'api',
    'full-light',
    'account-blacklist-files',
    'thumbnails-blacklist',
    'blacklist-rights'
]);
VideosModelGetQuerySubBuilder.thumbnailsInclude = new Set([
    'api',
    'full-light',
    'account-blacklist-files',
    'all-files',
    'thumbnails',
    'thumbnails-blacklist'
]);
