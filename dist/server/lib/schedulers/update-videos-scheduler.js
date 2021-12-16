"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVideosScheduler = void 0;
const tslib_1 = require("tslib");
const video_1 = require("@server/models/video/video");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const database_1 = require("../../initializers/database");
const schedule_video_update_1 = require("../../models/video/schedule-video-update");
const videos_1 = require("../activitypub/videos");
const notifier_1 = require("../notifier");
const abstract_scheduler_1 = require("./abstract-scheduler");
class UpdateVideosScheduler extends abstract_scheduler_1.AbstractScheduler {
    constructor() {
        super();
        this.schedulerIntervalMs = constants_1.SCHEDULER_INTERVALS_MS.updateVideos;
    }
    internalExecute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.updateVideos();
        });
    }
    updateVideos() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!(yield schedule_video_update_1.ScheduleVideoUpdateModel.areVideosToUpdate()))
                return undefined;
            const schedules = yield schedule_video_update_1.ScheduleVideoUpdateModel.listVideosToUpdate();
            const publishedVideos = [];
            for (const schedule of schedules) {
                yield database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(schedule.videoId, t);
                    logger_1.logger.info('Executing scheduled video update on %s.', video.uuid);
                    if (schedule.privacy) {
                        const wasConfidentialVideo = video.isConfidential();
                        const isNewVideo = video.isNewVideo(schedule.privacy);
                        video.setPrivacy(schedule.privacy);
                        yield video.save({ transaction: t });
                        yield videos_1.federateVideoIfNeeded(video, isNewVideo, t);
                        if (wasConfidentialVideo) {
                            publishedVideos.push(video);
                        }
                    }
                    yield schedule.destroy({ transaction: t });
                }));
            }
            for (const v of publishedVideos) {
                notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(v);
                notifier_1.Notifier.Instance.notifyOnVideoPublishedAfterScheduledUpdate(v);
            }
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.UpdateVideosScheduler = UpdateVideosScheduler;
