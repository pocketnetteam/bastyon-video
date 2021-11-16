"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoFileQueryBuilder = void 0;
const abstract_videos_model_query_builder_1 = require("./abstract-videos-model-query-builder");
class VideoFileQueryBuilder extends abstract_videos_model_query_builder_1.AbstractVideosModelQueryBuilder {
    constructor(sequelize) {
        super('get');
        this.sequelize = sequelize;
    }
    queryWebTorrentVideos(options) {
        this.buildWebtorrentFilesQuery(options);
        return this.runQuery(options);
    }
    queryStreamingPlaylistVideos(options) {
        this.buildVideoStreamingPlaylistFilesQuery(options);
        return this.runQuery(options);
    }
    buildWebtorrentFilesQuery(options) {
        this.attributes = {
            '"video"."id"': ''
        };
        this.includeWebtorrentFiles();
        if (this.shouldIncludeRedundancies(options)) {
            this.includeWebTorrentRedundancies();
        }
        this.whereId(options);
        this.query = this.buildQuery();
    }
    buildVideoStreamingPlaylistFilesQuery(options) {
        this.attributes = {
            '"video"."id"': ''
        };
        this.includeStreamingPlaylistFiles();
        if (this.shouldIncludeRedundancies(options)) {
            this.includeStreamingPlaylistRedundancies();
        }
        this.whereId(options);
        this.query = this.buildQuery();
    }
    buildQuery() {
        return `${this.buildSelect()} FROM "video" ${this.joins} ${this.where}`;
    }
    shouldIncludeRedundancies(options) {
        return options.type === 'api';
    }
}
exports.VideoFileQueryBuilder = VideoFileQueryBuilder;
