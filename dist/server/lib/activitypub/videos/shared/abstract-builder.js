"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APVideoAbstractBuilder = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const database_utils_1 = require("@server/helpers/database-utils");
const logger_1 = require("@server/helpers/logger");
const thumbnail_1 = require("@server/lib/thumbnail");
const video_1 = require("@server/lib/video");
const video_caption_1 = require("@server/models/video/video-caption");
const video_file_1 = require("@server/models/video/video-file");
const video_live_1 = require("@server/models/video/video-live");
const video_streaming_playlist_1 = require("@server/models/video/video-streaming-playlist");
const actors_1 = require("../../actors");
const object_to_model_attributes_1 = require("./object-to-model-attributes");
const trackers_1 = require("./trackers");
class APVideoAbstractBuilder {
    getOrCreateVideoChannelFromVideoObject() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const channel = this.videoObject.attributedTo.find(a => a.type === 'Group');
            if (!channel)
                throw new Error('Cannot find associated video channel to video ' + this.videoObject.url);
            if ((0, activitypub_1.checkUrlsSameHost)(channel.id, this.videoObject.id) !== true) {
                throw new Error(`Video channel url ${channel.id} does not have the same host than video object id ${this.videoObject.id}`);
            }
            return (0, actors_1.getOrCreateAPActor)(channel.id, 'all');
        });
    }
    tryToGenerateThumbnail(video) {
        return (0, thumbnail_1.updateVideoMiniatureFromUrl)({
            downloadUrl: (0, object_to_model_attributes_1.getThumbnailFromIcons)(this.videoObject).url,
            video,
            type: 1
        }).catch(err => {
            logger_1.logger.warn('Cannot generate thumbnail of %s.', this.videoObject.id, Object.assign({ err }, this.lTags()));
            return undefined;
        });
    }
    setPreview(video, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const previewIcon = (0, object_to_model_attributes_1.getPreviewFromIcons)(this.videoObject);
            if (!previewIcon)
                return;
            const previewModel = (0, thumbnail_1.updatePlaceholderThumbnail)({
                fileUrl: previewIcon.url,
                video,
                type: 2,
                size: previewIcon
            });
            yield video.addAndSaveThumbnail(previewModel, t);
        });
    }
    setTags(video, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const tags = (0, object_to_model_attributes_1.getTagsFromObject)(this.videoObject);
            yield (0, video_1.setVideoTags)({ video, tags, transaction: t });
        });
    }
    setTrackers(video, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const trackers = (0, trackers_1.getTrackerUrls)(this.videoObject, video);
            yield (0, trackers_1.setVideoTrackers)({ video, trackers, transaction: t });
        });
    }
    insertOrReplaceCaptions(video, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const existingCaptions = yield video_caption_1.VideoCaptionModel.listVideoCaptions(video.id, t);
            let captionsToCreate = (0, object_to_model_attributes_1.getCaptionAttributesFromObject)(video, this.videoObject)
                .map(a => new video_caption_1.VideoCaptionModel(a));
            for (const existingCaption of existingCaptions) {
                const filtered = captionsToCreate.filter(c => !c.isEqual(existingCaption));
                if (filtered.length !== captionsToCreate.length) {
                    captionsToCreate = filtered;
                    continue;
                }
                yield existingCaption.destroy({ transaction: t });
            }
            for (const captionToCreate of captionsToCreate) {
                yield captionToCreate.save({ transaction: t });
            }
        });
    }
    insertOrReplaceLive(video, transaction) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = (0, object_to_model_attributes_1.getLiveAttributesFromObject)(video, this.videoObject);
            const [videoLive] = yield video_live_1.VideoLiveModel.upsert(attributes, { transaction, returning: true });
            video.VideoLive = videoLive;
        });
    }
    setWebTorrentFiles(video, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const videoFileAttributes = (0, object_to_model_attributes_1.getFileAttributesFromUrl)(video, this.videoObject.url);
            const newVideoFiles = videoFileAttributes.map(a => new video_file_1.VideoFileModel(a));
            yield (0, database_utils_1.deleteAllModels)((0, database_utils_1.filterNonExistingModels)(video.VideoFiles || [], newVideoFiles), t);
            const upsertTasks = newVideoFiles.map(f => video_file_1.VideoFileModel.customUpsert(f, 'video', t));
            video.VideoFiles = yield Promise.all(upsertTasks);
        });
    }
    setStreamingPlaylists(video, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const streamingPlaylistAttributes = (0, object_to_model_attributes_1.getStreamingPlaylistAttributesFromObject)(video, this.videoObject, video.VideoFiles || []);
            const newStreamingPlaylists = streamingPlaylistAttributes.map(a => new video_streaming_playlist_1.VideoStreamingPlaylistModel(a));
            yield (0, database_utils_1.deleteAllModels)((0, database_utils_1.filterNonExistingModels)(video.VideoStreamingPlaylists || [], newStreamingPlaylists), t);
            video.VideoStreamingPlaylists = [];
            for (const playlistAttributes of streamingPlaylistAttributes) {
                const streamingPlaylistModel = yield this.insertOrReplaceStreamingPlaylist(playlistAttributes, t);
                streamingPlaylistModel.Video = video;
                yield this.setStreamingPlaylistFiles(video, streamingPlaylistModel, playlistAttributes.tagAPObject, t);
                video.VideoStreamingPlaylists.push(streamingPlaylistModel);
            }
        });
    }
    insertOrReplaceStreamingPlaylist(attributes, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [streamingPlaylist] = yield video_streaming_playlist_1.VideoStreamingPlaylistModel.upsert(attributes, { returning: true, transaction: t });
            return streamingPlaylist;
        });
    }
    getStreamingPlaylistFiles(video, type) {
        const playlist = video.VideoStreamingPlaylists.find(s => s.type === type);
        if (!playlist)
            return [];
        return playlist.VideoFiles;
    }
    setStreamingPlaylistFiles(video, playlistModel, tagObjects, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const oldStreamingPlaylistFiles = this.getStreamingPlaylistFiles(video, playlistModel.type);
            const newVideoFiles = (0, object_to_model_attributes_1.getFileAttributesFromUrl)(playlistModel, tagObjects).map(a => new video_file_1.VideoFileModel(a));
            yield (0, database_utils_1.deleteAllModels)((0, database_utils_1.filterNonExistingModels)(oldStreamingPlaylistFiles, newVideoFiles), t);
            const upsertTasks = newVideoFiles.map(f => video_file_1.VideoFileModel.customUpsert(f, 'streaming-playlist', t));
            playlistModel.VideoFiles = yield Promise.all(upsertTasks);
        });
    }
}
exports.APVideoAbstractBuilder = APVideoAbstractBuilder;
