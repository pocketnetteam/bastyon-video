"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosModelListQueryBuilder = void 0;
const abstract_videos_model_query_builder_1 = require("./shared/abstract-videos-model-query-builder");
const video_model_builder_1 = require("./shared/video-model-builder");
const videos_id_list_query_builder_1 = require("./videos-id-list-query-builder");
class VideosModelListQueryBuilder extends abstract_videos_model_query_builder_1.AbstractVideosModelQueryBuilder {
    constructor(sequelize) {
        super('list');
        this.sequelize = sequelize;
        this.videoModelBuilder = new video_model_builder_1.VideoModelBuilder(this.mode, this.tables);
    }
    queryVideos(options) {
        this.buildInnerQuery(options);
        this.buildListQueryFromIdsQuery(options);
        return this.runQuery()
            .then(rows => this.videoModelBuilder.buildVideosFromRows(rows));
    }
    buildInnerQuery(options) {
        const idsQueryBuilder = new videos_id_list_query_builder_1.VideosIdListQueryBuilder(this.sequelize);
        const { query, sort, replacements } = idsQueryBuilder.getIdsListQueryAndSort(options);
        this.replacements = replacements;
        this.innerQuery = query;
        this.innerSort = sort;
    }
    buildListQueryFromIdsQuery(options) {
        this.attributes = {
            '"video".*': ''
        };
        this.addJoin('INNER JOIN "video" ON "tmp"."id" = "video"."id"');
        this.includeChannels();
        this.includeAccounts();
        this.includeThumbnails();
        if (options.withFiles) {
            this.includeWebtorrentFiles();
            this.includeStreamingPlaylistFiles();
        }
        if (options.user) {
            this.includeUserHistory(options.user.id);
        }
        if (options.videoPlaylistId) {
            this.includePlaylist(options.videoPlaylistId);
        }
        const select = this.buildSelect();
        this.query = `${select} FROM (${this.innerQuery}) AS "tmp" ${this.joins} ${this.innerSort}`;
    }
}
exports.VideosModelListQueryBuilder = VideosModelListQueryBuilder;
