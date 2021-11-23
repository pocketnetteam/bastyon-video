"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAnnounceActivity = void 0;
const tslib_1 = require("tslib");
const database_utils_1 = require("../../../helpers/database-utils");
const database_1 = require("../../../initializers/database");
const video_share_1 = require("../../../models/video/video-share");
const utils_1 = require("../send/utils");
const videos_1 = require("../videos");
const notifier_1 = require("../../notifier");
const logger_1 = require("../../../helpers/logger");
function processAnnounceActivity(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { activity, byActor: actorAnnouncer } = options;
        const notify = options.fromFetch !== true;
        return (0, database_utils_1.retryTransactionWrapper)(processVideoShare, actorAnnouncer, activity, notify);
    });
}
exports.processAnnounceActivity = processAnnounceActivity;
function processVideoShare(actorAnnouncer, activity, notify) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const objectUri = typeof activity.object === 'string' ? activity.object : activity.object.id;
        let video;
        let videoCreated;
        try {
            const result = yield (0, videos_1.getOrCreateAPVideo)({ videoObject: objectUri });
            video = result.video;
            videoCreated = result.created;
        }
        catch (err) {
            logger_1.logger.debug('Cannot process share of %s. Maybe this is not a video object, so just skipping.', objectUri, { err });
            return;
        }
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const share = {
                actorId: actorAnnouncer.id,
                videoId: video.id,
                url: activity.id
            };
            const [, created] = yield video_share_1.VideoShareModel.findOrCreate({
                where: {
                    url: activity.id
                },
                defaults: share,
                transaction: t
            });
            if (video.isOwned() && created === true) {
                const exceptions = [actorAnnouncer];
                yield (0, utils_1.forwardVideoRelatedActivity)(activity, t, exceptions, video);
            }
            return undefined;
        }));
        if (videoCreated && notify)
            notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(video);
    });
}
