"use strict";
var VideoStreamingPlaylistModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoStreamingPlaylistModel = void 0;
const tslib_1 = require("tslib");
const memoizee_1 = (0, tslib_1.__importDefault)(require("memoizee"));
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const object_storage_1 = require("@server/lib/object-storage");
const video_file_1 = require("@server/models/video/video-file");
const core_utils_1 = require("../../helpers/core-utils");
const misc_1 = require("../../helpers/custom-validators/activitypub/misc");
const misc_2 = require("../../helpers/custom-validators/misc");
const videos_1 = require("../../helpers/custom-validators/videos");
const constants_1 = require("../../initializers/constants");
const video_redundancy_1 = require("../redundancy/video-redundancy");
const shared_1 = require("../shared");
const utils_1 = require("../utils");
const video_1 = require("./video");
let VideoStreamingPlaylistModel = VideoStreamingPlaylistModel_1 = class VideoStreamingPlaylistModel extends sequelize_typescript_1.Model {
    static doesInfohashExist(infoHash) {
        const query = 'SELECT 1 FROM "videoStreamingPlaylist" WHERE $infoHash = ANY("p2pMediaLoaderInfohashes") LIMIT 1';
        return (0, shared_1.doesExist)(query, { infoHash });
    }
    static buildP2PMediaLoaderInfoHashes(playlistUrl, files) {
        const hashes = [];
        for (let i = 0; i < files.length; i++) {
            hashes.push((0, core_utils_1.sha1)(`${constants_1.P2P_MEDIA_LOADER_PEER_VERSION}${playlistUrl}+V${i}`));
        }
        return hashes;
    }
    static listByIncorrectPeerVersion() {
        const query = {
            where: {
                p2pMediaLoaderPeerVersion: {
                    [sequelize_1.Op.ne]: constants_1.P2P_MEDIA_LOADER_PEER_VERSION
                }
            },
            include: [
                {
                    model: video_1.VideoModel.unscoped(),
                    required: true
                }
            ]
        };
        return VideoStreamingPlaylistModel_1.findAll(query);
    }
    static loadWithVideo(id) {
        const options = {
            include: [
                {
                    model: video_1.VideoModel.unscoped(),
                    required: true
                }
            ]
        };
        return VideoStreamingPlaylistModel_1.findByPk(id, options);
    }
    static loadHLSPlaylistByVideo(videoId) {
        const options = {
            where: {
                type: 1,
                videoId
            }
        };
        return VideoStreamingPlaylistModel_1.findOne(options);
    }
    static loadOrGenerate(video) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let playlist = yield VideoStreamingPlaylistModel_1.loadHLSPlaylistByVideo(video.id);
            if (!playlist)
                playlist = new VideoStreamingPlaylistModel_1();
            return Object.assign(playlist, { videoId: video.id, Video: video });
        });
    }
    assignP2PMediaLoaderInfoHashes(video, files) {
        const masterPlaylistUrl = this.getMasterPlaylistUrl(video);
        this.p2pMediaLoaderInfohashes = VideoStreamingPlaylistModel_1.buildP2PMediaLoaderInfoHashes(masterPlaylistUrl, files);
    }
    getMasterPlaylistUrl(video) {
        if (this.storage === 1) {
            return (0, object_storage_1.getHLSPublicFileUrl)(this.playlistUrl);
        }
        if (video.isOwned())
            return constants_1.WEBSERVER.URL + this.getMasterPlaylistStaticPath(video.uuid);
        return this.playlistUrl;
    }
    getSha256SegmentsUrl(video) {
        if (this.storage === 1) {
            return (0, object_storage_1.getHLSPublicFileUrl)(this.segmentsSha256Url);
        }
        if (video.isOwned())
            return constants_1.WEBSERVER.URL + this.getSha256SegmentsStaticPath(video.uuid, video.isLive);
        return this.segmentsSha256Url;
    }
    getStringType() {
        if (this.type === 1)
            return 'hls';
        return 'unknown';
    }
    getTrackerUrls(baseUrlHttp, baseUrlWs) {
        return [baseUrlWs + '/tracker/socket', baseUrlHttp + '/tracker/announce'];
    }
    hasSameUniqueKeysThan(other) {
        return this.type === other.type &&
            this.videoId === other.videoId;
    }
    getMasterPlaylistStaticPath(videoUUID) {
        return (0, path_1.join)(constants_1.STATIC_PATHS.STREAMING_PLAYLISTS.HLS, videoUUID, this.playlistFilename);
    }
    getSha256SegmentsStaticPath(videoUUID, isLive) {
        if (isLive)
            return (0, path_1.join)('/live', 'segments-sha256', videoUUID);
        return (0, path_1.join)(constants_1.STATIC_PATHS.STREAMING_PLAYLISTS.HLS, videoUUID, this.segmentsSha256Filename);
    }
};
VideoStreamingPlaylistModel.doesInfohashExistCached = (0, memoizee_1.default)(VideoStreamingPlaylistModel_1.doesInfohashExist, {
    promise: true,
    max: constants_1.MEMOIZE_LENGTH.INFO_HASH_EXISTS,
    maxAge: constants_1.MEMOIZE_TTL.INFO_HASH_EXISTS
});
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoStreamingPlaylistModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoStreamingPlaylistModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoStreamingPlaylistModel.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoStreamingPlaylistModel.prototype, "playlistFilename", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Is)('PlaylistUrl', value => (0, utils_1.throwIfNotValid)(value, misc_1.isActivityPubUrlValid, 'playlist url', true)),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(constants_1.CONSTRAINTS_FIELDS.VIDEOS.URL.max)),
    (0, tslib_1.__metadata)("design:type", String)
], VideoStreamingPlaylistModel.prototype, "playlistUrl", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoStreamingPlaylistInfoHashes', value => (0, utils_1.throwIfNotValid)(value, v => (0, misc_2.isArrayOf)(v, videos_1.isVideoFileInfoHashValid), 'info hashes')),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING)),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoStreamingPlaylistModel.prototype, "p2pMediaLoaderInfohashes", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoStreamingPlaylistModel.prototype, "p2pMediaLoaderPeerVersion", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoStreamingPlaylistModel.prototype, "segmentsSha256Filename", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Is)('VideoStreamingSegmentsSha256Url', value => (0, utils_1.throwIfNotValid)(value, misc_1.isActivityPubUrlValid, 'segments sha256 url', true)),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoStreamingPlaylistModel.prototype, "segmentsSha256Url", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_1.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoStreamingPlaylistModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoStreamingPlaylistModel.prototype, "storage", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_1.VideoModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_1.VideoModel)
], VideoStreamingPlaylistModel.prototype, "Video", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_file_1.VideoFileModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoStreamingPlaylistModel.prototype, "VideoFiles", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_redundancy_1.VideoRedundancyModel, {
        foreignKey: {
            allowNull: false
        },
        onDelete: 'CASCADE',
        hooks: true
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoStreamingPlaylistModel.prototype, "RedundancyVideos", void 0);
VideoStreamingPlaylistModel = VideoStreamingPlaylistModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.Table)({
        tableName: 'videoStreamingPlaylist',
        indexes: [
            {
                fields: ['videoId']
            },
            {
                fields: ['videoId', 'type'],
                unique: true
            },
            {
                fields: ['p2pMediaLoaderInfohashes'],
                using: 'gin'
            }
        ]
    })
], VideoStreamingPlaylistModel);
exports.VideoStreamingPlaylistModel = VideoStreamingPlaylistModel;
