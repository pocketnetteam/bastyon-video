"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APVideoCreator = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const database_1 = require("@server/initializers/database");
const video_blacklist_1 = require("@server/lib/video-blacklist");
const video_1 = require("@server/models/video/video");
const abstract_builder_1 = require("./abstract-builder");
const object_to_model_attributes_1 = require("./object-to-model-attributes");
class APVideoCreator extends abstract_builder_1.APVideoAbstractBuilder {
    constructor(videoObject) {
        super();
        this.videoObject = videoObject;
        this.lTags = logger_1.loggerTagsFactory('ap', 'video', 'create', this.videoObject.uuid, this.videoObject.id);
    }
    create(waitThumbnail = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug('Adding remote video %s.', this.videoObject.id, this.lTags());
            const channelActor = yield this.getOrCreateVideoChannelFromVideoObject();
            const channel = channelActor.VideoChannel;
            const videoData = object_to_model_attributes_1.getVideoAttributesFromObject(channel, this.videoObject, this.videoObject.to);
            const video = video_1.VideoModel.build(videoData);
            const promiseThumbnail = this.tryToGenerateThumbnail(video);
            let thumbnailModel;
            if (waitThumbnail === true) {
                thumbnailModel = yield promiseThumbnail;
            }
            const { autoBlacklisted, videoCreated } = yield database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const videoCreated = yield video.save({ transaction: t });
                    videoCreated.VideoChannel = channel;
                    if (thumbnailModel)
                        yield videoCreated.addAndSaveThumbnail(thumbnailModel, t);
                    yield this.setPreview(videoCreated, t);
                    yield this.setWebTorrentFiles(videoCreated, t);
                    yield this.setStreamingPlaylists(videoCreated, t);
                    yield this.setTags(videoCreated, t);
                    yield this.setTrackers(videoCreated, t);
                    yield this.insertOrReplaceCaptions(videoCreated, t);
                    yield this.insertOrReplaceLive(videoCreated, t);
                    yield channel.setAsUpdated(t);
                    const autoBlacklisted = yield video_blacklist_1.autoBlacklistVideoIfNeeded({
                        video: videoCreated,
                        user: undefined,
                        isRemote: true,
                        isNew: true,
                        transaction: t
                    });
                    logger_1.logger.info('Remote video with uuid %s inserted.', this.videoObject.uuid, this.lTags());
                    return { autoBlacklisted, videoCreated };
                }
                catch (err) {
                    if (thumbnailModel)
                        yield thumbnailModel.removeThumbnail();
                    throw err;
                }
            }));
            if (waitThumbnail === false) {
                promiseThumbnail.then(thumbnailModel => {
                    if (!thumbnailModel)
                        return;
                    thumbnailModel = videoCreated.id;
                    return thumbnailModel.save();
                });
            }
            return { autoBlacklisted, videoCreated };
        });
    }
}
exports.APVideoCreator = APVideoCreator;
