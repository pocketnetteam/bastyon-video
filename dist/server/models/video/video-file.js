"use strict";
var VideoFileModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoFileModel = exports.ScopeNames = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const memoizee_1 = (0, tslib_1.__importDefault)(require("memoizee"));
const path_1 = require("path");
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const activitypub_1 = require("@server/helpers/activitypub");
const logger_1 = require("@server/helpers/logger");
const video_1 = require("@server/helpers/video");
const object_storage_1 = require("@server/lib/object-storage");
const paths_1 = require("@server/lib/paths");
const videos_1 = require("../../helpers/custom-validators/videos");
const constants_1 = require("../../initializers/constants");
const video_redundancy_1 = require("../redundancy/video-redundancy");
const shared_1 = require("../shared");
const utils_1 = require("../utils");
const video_2 = require("./video");
const video_streaming_playlist_1 = require("./video-streaming-playlist");
var ScopeNames;
(function (ScopeNames) {
    ScopeNames["WITH_VIDEO"] = "WITH_VIDEO";
    ScopeNames["WITH_METADATA"] = "WITH_METADATA";
    ScopeNames["WITH_VIDEO_OR_PLAYLIST"] = "WITH_VIDEO_OR_PLAYLIST";
})(ScopeNames = exports.ScopeNames || (exports.ScopeNames = {}));
let VideoFileModel = VideoFileModel_1 = class VideoFileModel extends sequelize_typescript_1.Model {
    static doesInfohashExist(infoHash) {
        const query = 'SELECT 1 FROM "videoFile" WHERE "infoHash" = $infoHash LIMIT 1';
        return (0, shared_1.doesExist)(query, { infoHash });
    }
    static doesVideoExistForVideoFile(id, videoIdOrUUID) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const videoFile = yield VideoFileModel_1.loadWithVideoOrPlaylist(id, videoIdOrUUID);
            return !!videoFile;
        });
    }
    static doesOwnedTorrentFileExist(filename) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const query = 'SELECT 1 FROM "videoFile" ' +
                'LEFT JOIN "video" "webtorrent" ON "webtorrent"."id" = "videoFile"."videoId" AND "webtorrent"."remote" IS FALSE ' +
                'LEFT JOIN "videoStreamingPlaylist" ON "videoStreamingPlaylist"."id" = "videoFile"."videoStreamingPlaylistId" ' +
                'LEFT JOIN "video" "hlsVideo" ON "hlsVideo"."id" = "videoStreamingPlaylist"."videoId" AND "hlsVideo"."remote" IS FALSE ' +
                'WHERE "torrentFilename" = $filename AND ("hlsVideo"."id" IS NOT NULL OR "webtorrent"."id" IS NOT NULL) LIMIT 1';
            return (0, shared_1.doesExist)(query, { filename });
        });
    }
    static doesOwnedWebTorrentVideoFileExist(filename) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const query = 'SELECT 1 FROM "videoFile" INNER JOIN "video" ON "video"."id" = "videoFile"."videoId" AND "video"."remote" IS FALSE ' +
                `WHERE "filename" = $filename AND "storage" = ${0} LIMIT 1`;
            return (0, shared_1.doesExist)(query, { filename });
        });
    }
    static loadByFilename(filename) {
        const query = {
            where: {
                filename
            }
        };
        return VideoFileModel_1.findOne(query);
    }
    static loadWithVideoOrPlaylistByTorrentFilename(filename) {
        const query = {
            where: {
                torrentFilename: filename
            }
        };
        return VideoFileModel_1.scope(ScopeNames.WITH_VIDEO_OR_PLAYLIST).findOne(query);
    }
    static loadWithMetadata(id) {
        return VideoFileModel_1.scope(ScopeNames.WITH_METADATA).findByPk(id);
    }
    static loadWithVideo(id) {
        return VideoFileModel_1.scope(ScopeNames.WITH_VIDEO).findByPk(id);
    }
    static loadWithVideoOrPlaylist(id, videoIdOrUUID) {
        const whereVideo = validator_1.default.isUUID(videoIdOrUUID + '')
            ? { uuid: videoIdOrUUID }
            : { id: videoIdOrUUID };
        const options = {
            where: {
                id
            }
        };
        return VideoFileModel_1.scope({ method: [ScopeNames.WITH_VIDEO_OR_PLAYLIST, whereVideo] })
            .findOne(options)
            .then(file => {
            if (!file.Video && !file.VideoStreamingPlaylist)
                return null;
            return file;
        });
    }
    static listByStreamingPlaylist(streamingPlaylistId, transaction) {
        const query = {
            include: [
                {
                    model: video_2.VideoModel.unscoped(),
                    required: true,
                    include: [
                        {
                            model: video_streaming_playlist_1.VideoStreamingPlaylistModel.unscoped(),
                            required: true,
                            where: {
                                id: streamingPlaylistId
                            }
                        }
                    ]
                }
            ],
            transaction
        };
        return VideoFileModel_1.findAll(query);
    }
    static getStats() {
        const webtorrentFilesQuery = {
            include: [
                {
                    attributes: [],
                    required: true,
                    model: video_2.VideoModel.unscoped(),
                    where: {
                        remote: false
                    }
                }
            ]
        };
        const hlsFilesQuery = {
            include: [
                {
                    attributes: [],
                    required: true,
                    model: video_streaming_playlist_1.VideoStreamingPlaylistModel.unscoped(),
                    include: [
                        {
                            attributes: [],
                            model: video_2.VideoModel.unscoped(),
                            required: true,
                            where: {
                                remote: false
                            }
                        }
                    ]
                }
            ]
        };
        return Promise.all([
            VideoFileModel_1.aggregate('size', 'SUM', webtorrentFilesQuery),
            VideoFileModel_1.aggregate('size', 'SUM', hlsFilesQuery)
        ]).then(([webtorrentResult, hlsResult]) => ({
            totalLocalVideoFilesSize: (0, utils_1.parseAggregateResult)(webtorrentResult) + (0, utils_1.parseAggregateResult)(hlsResult)
        }));
    }
    static customUpsert(videoFile, mode, transaction) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const baseWhere = {
                fps: videoFile.fps,
                resolution: videoFile.resolution
            };
            if (mode === 'streaming-playlist')
                Object.assign(baseWhere, { videoStreamingPlaylistId: videoFile.videoStreamingPlaylistId });
            else
                Object.assign(baseWhere, { videoId: videoFile.videoId });
            const element = yield VideoFileModel_1.findOne({ where: baseWhere, transaction });
            if (!element)
                return videoFile.save({ transaction });
            for (const k of Object.keys(videoFile.toJSON())) {
                element[k] = videoFile[k];
            }
            return element.save({ transaction });
        });
    }
    static removeHLSFilesOfVideoId(videoStreamingPlaylistId) {
        const options = {
            where: { videoStreamingPlaylistId }
        };
        return VideoFileModel_1.destroy(options);
    }
    hasTorrent() {
        return this.infoHash && this.torrentFilename;
    }
    getVideoOrStreamingPlaylist() {
        if (this.videoId)
            return this.Video;
        return this.VideoStreamingPlaylist;
    }
    getVideo() {
        return (0, video_1.extractVideo)(this.getVideoOrStreamingPlaylist());
    }
    isAudio() {
        return !!constants_1.MIMETYPES.AUDIO.EXT_MIMETYPE[this.extname];
    }
    isLive() {
        return this.size === -1;
    }
    isHLS() {
        return !!this.videoStreamingPlaylistId;
    }
    getObjectStorageUrl() {
        if (this.isHLS()) {
            return (0, object_storage_1.getHLSPublicFileUrl)(this.fileUrl);
        }
        return (0, object_storage_1.getWebTorrentPublicFileUrl)(this.fileUrl);
    }
    getFileUrl(video) {
        if (this.storage === 1) {
            return this.getObjectStorageUrl();
        }
        if (!this.Video)
            this.Video = video;
        if (video.isOwned())
            return constants_1.WEBSERVER.URL + this.getFileStaticPath(video);
        return this.fileUrl;
    }
    getFileStaticPath(video) {
        if (this.isHLS())
            return (0, path_1.join)(constants_1.STATIC_PATHS.STREAMING_PLAYLISTS.HLS, video.uuid, this.filename);
        return (0, path_1.join)(constants_1.STATIC_PATHS.WEBSEED, this.filename);
    }
    getFileDownloadUrl(video) {
        const path = this.isHLS()
            ? (0, path_1.join)(constants_1.STATIC_DOWNLOAD_PATHS.HLS_VIDEOS, `${video.uuid}-${this.resolution}-fragmented${this.extname}`)
            : (0, path_1.join)(constants_1.STATIC_DOWNLOAD_PATHS.VIDEOS, `${video.uuid}-${this.resolution}${this.extname}`);
        if (video.isOwned())
            return constants_1.WEBSERVER.URL + path;
        return (0, activitypub_1.buildRemoteVideoBaseUrl)(video, path);
    }
    getRemoteTorrentUrl(video) {
        if (video.isOwned())
            throw new Error(`Video ${video.url} is not a remote video`);
        return this.torrentUrl;
    }
    getTorrentUrl() {
        if (!this.torrentFilename)
            return null;
        return constants_1.WEBSERVER.URL + this.getTorrentStaticPath();
    }
    getTorrentStaticPath() {
        if (!this.torrentFilename)
            return null;
        return (0, path_1.join)(constants_1.LAZY_STATIC_PATHS.TORRENTS, this.torrentFilename);
    }
    getTorrentDownloadUrl() {
        if (!this.torrentFilename)
            return null;
        return constants_1.WEBSERVER.URL + (0, path_1.join)(constants_1.STATIC_DOWNLOAD_PATHS.TORRENTS, this.torrentFilename);
    }
    removeTorrent() {
        if (!this.torrentFilename)
            return null;
        const torrentPath = (0, paths_1.getFSTorrentFilePath)(this);
        return (0, fs_extra_1.remove)(torrentPath)
            .catch(err => logger_1.logger.warn('Cannot delete torrent %s.', torrentPath, { err }));
    }
    hasSameUniqueKeysThan(other) {
        return this.fps === other.fps &&
            this.resolution === other.resolution &&
            ((this.videoId !== null && this.videoId === other.videoId) ||
                (this.videoStreamingPlaylistId !== null && this.videoStreamingPlaylistId === other.videoStreamingPlaylistId));
    }
    static loadByPlaylistId(playlistId, resolution) {
        const query = {
            where: {
                videoStreamingPlaylistId: playlistId,
                resolution
            }
        };
        return VideoFileModel_1.findOne(query);
    }
};
VideoFileModel.doesInfohashExistCached = (0, memoizee_1.default)(VideoFileModel_1.doesInfohashExist, {
    promise: true,
    max: constants_1.MEMOIZE_LENGTH.INFO_HASH_EXISTS,
    maxAge: constants_1.MEMOIZE_TTL.INFO_HASH_EXISTS
});
(0, tslib_1.__decorate)([
    sequelize_typescript_1.CreatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoFileModel.prototype, "createdAt", void 0);
(0, tslib_1.__decorate)([
    sequelize_typescript_1.UpdatedAt,
    (0, tslib_1.__metadata)("design:type", Date)
], VideoFileModel.prototype, "updatedAt", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoFileResolution', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoFileResolutionValid, 'resolution')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoFileModel.prototype, "resolution", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoFileSize', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoFileSizeValid, 'size')),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    (0, tslib_1.__metadata)("design:type", Number)
], VideoFileModel.prototype, "size", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('VideoFileExtname', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoFileExtnameValid, 'extname')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "extname", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Is)('VideoFileInfohash', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoFileInfoHashValid, 'info hash', true)),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "infoHash", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(-1),
    (0, sequelize_typescript_1.Is)('VideoFileFPS', value => (0, utils_1.throwIfNotValid)(value, videos_1.isVideoFPSResolutionValid, 'fps')),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoFileModel.prototype, "fps", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    (0, tslib_1.__metadata)("design:type", Object)
], VideoFileModel.prototype, "metadata", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "metadataUrl", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "fileUrl", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "filename", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "torrentUrl", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", String)
], VideoFileModel.prototype, "torrentFilename", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_2.VideoModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoFileModel.prototype, "videoId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoFileModel.prototype, "storage", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_2.VideoModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_2.VideoModel)
], VideoFileModel.prototype, "Video", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.ForeignKey)(() => video_streaming_playlist_1.VideoStreamingPlaylistModel),
    sequelize_typescript_1.Column,
    (0, tslib_1.__metadata)("design:type", Number)
], VideoFileModel.prototype, "videoStreamingPlaylistId", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.BelongsTo)(() => video_streaming_playlist_1.VideoStreamingPlaylistModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE'
    }),
    (0, tslib_1.__metadata)("design:type", video_streaming_playlist_1.VideoStreamingPlaylistModel)
], VideoFileModel.prototype, "VideoStreamingPlaylist", void 0);
(0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.HasMany)(() => video_redundancy_1.VideoRedundancyModel, {
        foreignKey: {
            allowNull: true
        },
        onDelete: 'CASCADE',
        hooks: true
    }),
    (0, tslib_1.__metadata)("design:type", Array)
], VideoFileModel.prototype, "RedundancyVideos", void 0);
VideoFileModel = VideoFileModel_1 = (0, tslib_1.__decorate)([
    (0, sequelize_typescript_1.DefaultScope)(() => ({
        attributes: {
            exclude: ['metadata']
        }
    })),
    (0, sequelize_typescript_1.Scopes)(() => ({
        [ScopeNames.WITH_VIDEO]: {
            include: [
                {
                    model: video_2.VideoModel.unscoped(),
                    required: true
                }
            ]
        },
        [ScopeNames.WITH_VIDEO_OR_PLAYLIST]: (options = {}) => {
            return {
                include: [
                    {
                        model: video_2.VideoModel.unscoped(),
                        required: false,
                        where: options.whereVideo
                    },
                    {
                        model: video_streaming_playlist_1.VideoStreamingPlaylistModel.unscoped(),
                        required: false,
                        include: [
                            {
                                model: video_2.VideoModel.unscoped(),
                                required: true,
                                where: options.whereVideo
                            }
                        ]
                    }
                ]
            };
        },
        [ScopeNames.WITH_METADATA]: {
            attributes: {
                include: ['metadata']
            }
        }
    })),
    (0, sequelize_typescript_1.Table)({
        tableName: 'videoFile',
        indexes: [
            {
                fields: ['videoId'],
                where: {
                    videoId: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['videoStreamingPlaylistId'],
                where: {
                    videoStreamingPlaylistId: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['infoHash']
            },
            {
                fields: ['torrentFilename'],
                unique: true
            },
            {
                fields: ['filename'],
                unique: true
            },
            {
                fields: ['videoId', 'resolution', 'fps'],
                unique: true,
                where: {
                    videoId: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            },
            {
                fields: ['videoStreamingPlaylistId', 'resolution', 'fps'],
                unique: true,
                where: {
                    videoStreamingPlaylistId: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            }
        ]
    })
], VideoFileModel);
exports.VideoFileModel = VideoFileModel;
