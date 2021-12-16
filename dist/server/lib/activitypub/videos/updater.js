"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APVideoUpdater = void 0;
const tslib_1 = require("tslib");
const database_utils_1 = require("@server/helpers/database-utils");
const logger_1 = require("@server/helpers/logger");
const notifier_1 = require("@server/lib/notifier");
const peertube_socket_1 = require("@server/lib/peertube-socket");
const video_blacklist_1 = require("@server/lib/video-blacklist");
const video_live_1 = require("@server/models/video/video-live");
const shared_1 = require("./shared");
class APVideoUpdater extends shared_1.APVideoAbstractBuilder {
    constructor(videoObject, video) {
        super();
        this.videoObject = videoObject;
        this.video = video;
        this.wasPrivateVideo = this.video.privacy === 3;
        this.wasUnlistedVideo = this.video.privacy === 2;
        this.oldVideoChannel = this.video.VideoChannel;
        this.videoFieldsSave = this.video.toJSON();
        this.lTags = logger_1.loggerTagsFactory('ap', 'video', 'update', video.uuid, video.url);
    }
    update(overrideTo) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug('Updating remote video "%s".', this.videoObject.uuid, Object.assign({ videoObject: this.videoObject }, this.lTags()));
            try {
                const channelActor = yield this.getOrCreateVideoChannelFromVideoObject();
                const thumbnailModel = yield this.tryToGenerateThumbnail(this.video);
                this.checkChannelUpdateOrThrow(channelActor);
                const videoUpdated = yield this.updateVideo(channelActor.VideoChannel, undefined, overrideTo);
                if (thumbnailModel)
                    yield videoUpdated.addAndSaveThumbnail(thumbnailModel);
                yield database_utils_1.runInReadCommittedTransaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield this.setWebTorrentFiles(videoUpdated, t);
                    yield this.setStreamingPlaylists(videoUpdated, t);
                }));
                yield Promise.all([
                    database_utils_1.runInReadCommittedTransaction(t => this.setTags(videoUpdated, t)),
                    database_utils_1.runInReadCommittedTransaction(t => this.setTrackers(videoUpdated, t)),
                    this.setOrDeleteLive(videoUpdated),
                    this.setPreview(videoUpdated)
                ]);
                yield database_utils_1.runInReadCommittedTransaction(t => this.setCaptions(videoUpdated, t));
                yield video_blacklist_1.autoBlacklistVideoIfNeeded({
                    video: videoUpdated,
                    user: undefined,
                    isRemote: true,
                    isNew: false,
                    transaction: undefined
                });
                if (this.wasPrivateVideo || this.wasUnlistedVideo) {
                    notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(videoUpdated);
                }
                if (videoUpdated.isLive) {
                    peertube_socket_1.PeerTubeSocket.Instance.sendVideoLiveNewState(videoUpdated);
                    peertube_socket_1.PeerTubeSocket.Instance.sendVideoViewsUpdate(videoUpdated);
                }
                logger_1.logger.info('Remote video with uuid %s updated', this.videoObject.uuid, this.lTags());
                return videoUpdated;
            }
            catch (err) {
                this.catchUpdateError(err);
            }
        });
    }
    checkChannelUpdateOrThrow(newChannelActor) {
        if (!this.oldVideoChannel.Actor.serverId || !newChannelActor.serverId) {
            throw new Error('Cannot check old channel/new channel validity because `serverId` is null');
        }
        if (this.oldVideoChannel.Actor.serverId !== newChannelActor.serverId) {
            throw new Error(`New channel ${newChannelActor.url} is not on the same server than new channel ${this.oldVideoChannel.Actor.url}`);
        }
    }
    updateVideo(channel, transaction, overrideTo) {
        const to = overrideTo || this.videoObject.to;
        const videoData = shared_1.getVideoAttributesFromObject(channel, this.videoObject, to);
        this.video.name = videoData.name;
        this.video.uuid = videoData.uuid;
        this.video.url = videoData.url;
        this.video.category = videoData.category;
        this.video.licence = videoData.licence;
        this.video.language = videoData.language;
        this.video.description = videoData.description;
        this.video.support = videoData.support;
        this.video.nsfw = videoData.nsfw;
        this.video.commentsEnabled = videoData.commentsEnabled;
        this.video.downloadEnabled = videoData.downloadEnabled;
        this.video.waitTranscoding = videoData.waitTranscoding;
        this.video.state = videoData.state;
        this.video.duration = videoData.duration;
        this.video.createdAt = videoData.createdAt;
        this.video.publishedAt = videoData.publishedAt;
        this.video.originallyPublishedAt = videoData.originallyPublishedAt;
        this.video.privacy = videoData.privacy;
        this.video.channelId = videoData.channelId;
        this.video.views = videoData.views;
        this.video.isLive = videoData.isLive;
        this.video.aspectRatio = videoData.aspectRatio;
        this.video.changed('updatedAt', true);
        return this.video.save({ transaction });
    }
    setCaptions(videoUpdated, t) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.insertOrReplaceCaptions(videoUpdated, t);
        });
    }
    setOrDeleteLive(videoUpdated, transaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.video.isLive)
                return;
            if (this.video.isLive)
                return this.insertOrReplaceLive(videoUpdated, transaction);
            yield video_live_1.VideoLiveModel.destroy({
                where: {
                    videoId: this.video.id
                },
                transaction
            });
            videoUpdated.VideoLive = null;
        });
    }
    catchUpdateError(err) {
        if (this.video !== undefined && this.videoFieldsSave !== undefined) {
            database_utils_1.resetSequelizeInstance(this.video, this.videoFieldsSave);
        }
        logger_1.logger.debug('Cannot update the remote video.', Object.assign({ err }, this.lTags()));
        throw err;
    }
}
exports.APVideoUpdater = APVideoUpdater;
