"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModelBuilder = void 0;
const account_1 = require("@server/models/account/account");
const actor_1 = require("@server/models/actor/actor");
const actor_image_1 = require("@server/models/actor/actor-image");
const video_redundancy_1 = require("@server/models/redundancy/video-redundancy");
const server_1 = require("@server/models/server/server");
const tracker_1 = require("@server/models/server/tracker");
const user_video_history_1 = require("@server/models/user/user-video-history");
const schedule_video_update_1 = require("../../schedule-video-update");
const tag_1 = require("../../tag");
const thumbnail_1 = require("../../thumbnail");
const video_1 = require("../../video");
const video_blacklist_1 = require("../../video-blacklist");
const video_channel_1 = require("../../video-channel");
const video_file_1 = require("../../video-file");
const video_live_1 = require("../../video-live");
const video_streaming_playlist_1 = require("../../video-streaming-playlist");
class VideoModelBuilder {
    constructor(mode, tables) {
        this.mode = mode;
        this.tables = tables;
        this.buildOpts = { raw: true, isNewRecord: false };
    }
    buildVideosFromRows(rows, rowsWebTorrentFiles, rowsStreamingPlaylist) {
        this.reinit();
        for (const row of rows) {
            this.buildVideoAndAccount(row);
            const videoModel = this.videosMemo[row.id];
            this.setUserHistory(row, videoModel);
            this.addThumbnail(row, videoModel);
            if (!rowsWebTorrentFiles) {
                this.addWebTorrentFile(row, videoModel);
            }
            if (!rowsStreamingPlaylist) {
                this.addStreamingPlaylist(row, videoModel);
                this.addStreamingPlaylistFile(row);
            }
            if (this.mode === 'get') {
                this.addTag(row, videoModel);
                this.addTracker(row, videoModel);
                this.setBlacklisted(row, videoModel);
                this.setScheduleVideoUpdate(row, videoModel);
                this.setLive(row, videoModel);
            }
        }
        this.grabSeparateWebTorrentFiles(rowsWebTorrentFiles);
        this.grabSeparateStreamingPlaylistFiles(rowsStreamingPlaylist);
        return this.videos;
    }
    reinit() {
        this.videosMemo = {};
        this.videoStreamingPlaylistMemo = {};
        this.videoFileMemo = {};
        this.thumbnailsDone = new Set();
        this.historyDone = new Set();
        this.blacklistDone = new Set();
        this.liveDone = new Set();
        this.redundancyDone = new Set();
        this.scheduleVideoUpdateDone = new Set();
        this.trackersDone = new Set();
        this.tagsDone = new Set();
        this.videos = [];
    }
    grabSeparateWebTorrentFiles(rowsWebTorrentFiles) {
        if (!rowsWebTorrentFiles)
            return;
        for (const row of rowsWebTorrentFiles) {
            const id = row['VideoFiles.id'];
            if (!id)
                continue;
            const videoModel = this.videosMemo[row.id];
            this.addWebTorrentFile(row, videoModel);
            this.addRedundancy(row, 'VideoFiles', this.videoFileMemo[id]);
        }
    }
    grabSeparateStreamingPlaylistFiles(rowsStreamingPlaylist) {
        if (!rowsStreamingPlaylist)
            return;
        for (const row of rowsStreamingPlaylist || []) {
            const id = row['VideoStreamingPlaylists.id'];
            if (!id)
                continue;
            const videoModel = this.videosMemo[row.id];
            this.addStreamingPlaylist(row, videoModel);
            this.addStreamingPlaylistFile(row);
            this.addRedundancy(row, 'VideoStreamingPlaylists', this.videoStreamingPlaylistMemo[id]);
        }
    }
    buildVideoAndAccount(row) {
        if (this.videosMemo[row.id])
            return;
        const videoModel = new video_1.VideoModel(this.grab(row, this.tables.getVideoAttributes(), ''), this.buildOpts);
        videoModel.UserVideoHistories = [];
        videoModel.Thumbnails = [];
        videoModel.VideoFiles = [];
        videoModel.VideoStreamingPlaylists = [];
        videoModel.Tags = [];
        videoModel.Trackers = [];
        this.buildAccount(row, videoModel);
        this.videosMemo[row.id] = videoModel;
        this.videos.push(videoModel);
    }
    buildAccount(row, videoModel) {
        const id = row['VideoChannel.Account.id'];
        if (!id)
            return;
        const channelModel = new video_channel_1.VideoChannelModel(this.grab(row, this.tables.getChannelAttributes(), 'VideoChannel'), this.buildOpts);
        channelModel.Actor = this.buildActor(row, 'VideoChannel');
        const accountModel = new account_1.AccountModel(this.grab(row, this.tables.getAccountAttributes(), 'VideoChannel.Account'), this.buildOpts);
        accountModel.Actor = this.buildActor(row, 'VideoChannel.Account');
        channelModel.Account = accountModel;
        videoModel.VideoChannel = channelModel;
    }
    buildActor(row, prefix) {
        const actorPrefix = `${prefix}.Actor`;
        const avatarPrefix = `${actorPrefix}.Avatar`;
        const serverPrefix = `${actorPrefix}.Server`;
        const avatarModel = row[`${avatarPrefix}.id`] !== null
            ? new actor_image_1.ActorImageModel(this.grab(row, this.tables.getAvatarAttributes(), avatarPrefix), this.buildOpts)
            : null;
        const serverModel = row[`${serverPrefix}.id`] !== null
            ? new server_1.ServerModel(this.grab(row, this.tables.getServerAttributes(), serverPrefix), this.buildOpts)
            : null;
        const actorModel = new actor_1.ActorModel(this.grab(row, this.tables.getActorAttributes(), actorPrefix), this.buildOpts);
        actorModel.Avatar = avatarModel;
        actorModel.Server = serverModel;
        return actorModel;
    }
    setUserHistory(row, videoModel) {
        const id = row['userVideoHistory.id'];
        if (!id || this.historyDone.has(id))
            return;
        const attributes = this.grab(row, this.tables.getUserHistoryAttributes(), 'userVideoHistory');
        const historyModel = new user_video_history_1.UserVideoHistoryModel(attributes, this.buildOpts);
        videoModel.UserVideoHistories.push(historyModel);
        this.historyDone.add(id);
    }
    addThumbnail(row, videoModel) {
        const id = row['Thumbnails.id'];
        if (!id || this.thumbnailsDone.has(id))
            return;
        const attributes = this.grab(row, this.tables.getThumbnailAttributes(), 'Thumbnails');
        const thumbnailModel = new thumbnail_1.ThumbnailModel(attributes, this.buildOpts);
        videoModel.Thumbnails.push(thumbnailModel);
        this.thumbnailsDone.add(id);
    }
    addWebTorrentFile(row, videoModel) {
        const id = row['VideoFiles.id'];
        if (!id || this.videoFileMemo[id])
            return;
        const attributes = this.grab(row, this.tables.getFileAttributes(), 'VideoFiles');
        const videoFileModel = new video_file_1.VideoFileModel(attributes, this.buildOpts);
        videoModel.VideoFiles.push(videoFileModel);
        this.videoFileMemo[id] = videoFileModel;
    }
    addStreamingPlaylist(row, videoModel) {
        const id = row['VideoStreamingPlaylists.id'];
        if (!id || this.videoStreamingPlaylistMemo[id])
            return;
        const attributes = this.grab(row, this.tables.getStreamingPlaylistAttributes(), 'VideoStreamingPlaylists');
        const streamingPlaylist = new video_streaming_playlist_1.VideoStreamingPlaylistModel(attributes, this.buildOpts);
        streamingPlaylist.VideoFiles = [];
        videoModel.VideoStreamingPlaylists.push(streamingPlaylist);
        this.videoStreamingPlaylistMemo[id] = streamingPlaylist;
    }
    addStreamingPlaylistFile(row) {
        const id = row['VideoStreamingPlaylists.VideoFiles.id'];
        if (!id || this.videoFileMemo[id])
            return;
        const streamingPlaylist = this.videoStreamingPlaylistMemo[row['VideoStreamingPlaylists.id']];
        const attributes = this.grab(row, this.tables.getFileAttributes(), 'VideoStreamingPlaylists.VideoFiles');
        const videoFileModel = new video_file_1.VideoFileModel(attributes, this.buildOpts);
        streamingPlaylist.VideoFiles.push(videoFileModel);
        this.videoFileMemo[id] = videoFileModel;
    }
    addRedundancy(row, prefix, to) {
        if (!to.RedundancyVideos)
            to.RedundancyVideos = [];
        const redundancyPrefix = `${prefix}.RedundancyVideos`;
        const id = row[`${redundancyPrefix}.id`];
        if (!id || this.redundancyDone.has(id))
            return;
        const attributes = this.grab(row, this.tables.getRedundancyAttributes(), redundancyPrefix);
        const redundancyModel = new video_redundancy_1.VideoRedundancyModel(attributes, this.buildOpts);
        to.RedundancyVideos.push(redundancyModel);
        this.redundancyDone.add(id);
    }
    addTag(row, videoModel) {
        if (!row['Tags.name'])
            return;
        const key = `${row['Tags.VideoTagModel.videoId']}-${row['Tags.VideoTagModel.tagId']}`;
        if (this.tagsDone.has(key))
            return;
        const attributes = this.grab(row, this.tables.getTagAttributes(), 'Tags');
        const tagModel = new tag_1.TagModel(attributes, this.buildOpts);
        videoModel.Tags.push(tagModel);
        this.tagsDone.add(key);
    }
    addTracker(row, videoModel) {
        if (!row['Trackers.id'])
            return;
        const key = `${row['Trackers.VideoTrackerModel.videoId']}-${row['Trackers.VideoTrackerModel.trackerId']}`;
        if (this.trackersDone.has(key))
            return;
        const attributes = this.grab(row, this.tables.getTrackerAttributes(), 'Trackers');
        const trackerModel = new tracker_1.TrackerModel(attributes, this.buildOpts);
        videoModel.Trackers.push(trackerModel);
        this.trackersDone.add(key);
    }
    setBlacklisted(row, videoModel) {
        const id = row['VideoBlacklist.id'];
        if (!id || this.blacklistDone.has(id))
            return;
        const attributes = this.grab(row, this.tables.getBlacklistedAttributes(), 'VideoBlacklist');
        videoModel.VideoBlacklist = new video_blacklist_1.VideoBlacklistModel(attributes, this.buildOpts);
        this.blacklistDone.add(id);
    }
    setScheduleVideoUpdate(row, videoModel) {
        const id = row['ScheduleVideoUpdate.id'];
        if (!id || this.scheduleVideoUpdateDone.has(id))
            return;
        const attributes = this.grab(row, this.tables.getScheduleUpdateAttributes(), 'ScheduleVideoUpdate');
        videoModel.ScheduleVideoUpdate = new schedule_video_update_1.ScheduleVideoUpdateModel(attributes, this.buildOpts);
        this.scheduleVideoUpdateDone.add(id);
    }
    setLive(row, videoModel) {
        const id = row['VideoLive.id'];
        if (!id || this.liveDone.has(id))
            return;
        const attributes = this.grab(row, this.tables.getLiveAttributes(), 'VideoLive');
        videoModel.VideoLive = new video_live_1.VideoLiveModel(attributes, this.buildOpts);
        this.liveDone.add(id);
    }
    grab(row, attributes, prefix) {
        const result = {};
        for (const a of attributes) {
            const key = prefix
                ? prefix + '.' + a
                : a;
            result[a] = row[key];
        }
        return result;
    }
}
exports.VideoModelBuilder = VideoModelBuilder;
