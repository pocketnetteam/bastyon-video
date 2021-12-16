"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshVideoIfNeeded = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const files_cache_1 = require("@server/lib/files-cache");
const video_1 = require("@server/models/video/video");
const models_1 = require("@shared/models");
const shared_1 = require("./shared");
const updater_1 = require("./updater");
function refreshVideoIfNeeded(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!options.video.isOutdated())
            return options.video;
        const video = options.fetchedType === 'all'
            ? options.video
            : yield video_1.VideoModel.loadByUrlAndPopulateAccount(options.video.url);
        const lTags = logger_1.loggerTagsFactory('ap', 'video', 'refresh', video.uuid, video.url);
        logger_1.logger.info('Refreshing video %s.', video.url, lTags());
        try {
            const { videoObject } = yield shared_1.fetchRemoteVideo(video.url);
            if (videoObject === undefined) {
                logger_1.logger.warn('Cannot refresh remote video %s: invalid body.', video.url, lTags());
                yield video.setAsRefreshed();
                return video;
            }
            const videoUpdater = new updater_1.APVideoUpdater(videoObject, video);
            yield videoUpdater.update();
            yield shared_1.syncVideoExternalAttributes(video, videoObject, options.syncParam);
            files_cache_1.ActorFollowScoreCache.Instance.addGoodServerId(video.VideoChannel.Actor.serverId);
            return video;
        }
        catch (err) {
            if (err.statusCode === models_1.HttpStatusCode.NOT_FOUND_404) {
                logger_1.logger.info('Cannot refresh remote video %s: video does not exist anymore. Deleting it.', video.url, lTags());
                yield video.destroy();
                return undefined;
            }
            logger_1.logger.warn('Cannot refresh video %s.', options.video.url, Object.assign({ err }, lTags()));
            files_cache_1.ActorFollowScoreCache.Instance.addBadServerId(video.VideoChannel.Actor.serverId);
            yield video.setAsRefreshed();
            return video;
        }
    });
}
exports.refreshVideoIfNeeded = refreshVideoIfNeeded;
