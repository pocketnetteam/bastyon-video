"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsManager = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const config_1 = require("@server/initializers/config");
const actor_follow_1 = require("@server/models/actor/actor-follow");
const video_redundancy_1 = require("@server/models/redundancy/video-redundancy");
const user_1 = require("@server/models/user/user");
const video_1 = require("@server/models/video/video");
const video_channel_1 = require("@server/models/video/video-channel");
const video_comment_1 = require("@server/models/video/video-comment");
const video_file_1 = require("@server/models/video/video-file");
const video_playlist_1 = require("@server/models/video/video-playlist");
const job_queue_1 = require("./job-queue");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("../initializers/constants");
class StatsManager {
    constructor() {
        this.instanceStartDate = new Date();
        this.inboxMessages = {
            processed: 0,
            errors: 0,
            successes: 0,
            waiting: 0,
            errorsPerType: this.buildAPPerType(),
            successesPerType: this.buildAPPerType()
        };
    }
    updateInboxWaiting(inboxMessagesWaiting) {
        this.inboxMessages.waiting = inboxMessagesWaiting;
    }
    addInboxProcessedSuccess(type) {
        this.inboxMessages.processed++;
        this.inboxMessages.successes++;
        this.inboxMessages.successesPerType[type]++;
    }
    addInboxProcessedError(type) {
        this.inboxMessages.processed++;
        this.inboxMessages.errors++;
        this.inboxMessages.errorsPerType[type]++;
    }
    getStats() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { totalLocalVideos, totalLocalVideoViews, totalVideos } = yield video_1.VideoModel.getStats();
            const { totalLocalVideoComments, totalVideoComments } = yield video_comment_1.VideoCommentModel.getStats();
            const { totalUsers, totalDailyActiveUsers, totalWeeklyActiveUsers, totalMonthlyActiveUsers } = yield user_1.UserModel.getStats();
            const { totalInstanceFollowers, totalInstanceFollowing } = yield actor_follow_1.ActorFollowModel.getStats();
            const { totalLocalVideoFilesSize } = yield video_file_1.VideoFileModel.getStats();
            const { totalLocalVideoChannels, totalLocalDailyActiveVideoChannels, totalLocalWeeklyActiveVideoChannels, totalLocalMonthlyActiveVideoChannels } = yield video_channel_1.VideoChannelModel.getStats();
            const { totalLocalPlaylists } = yield video_playlist_1.VideoPlaylistModel.getStats();
            const videosRedundancyStats = yield this.buildRedundancyStats();
            const performance = yield this.getPerformanceStats();
            const data = Object.assign({ totalUsers,
                totalDailyActiveUsers,
                totalWeeklyActiveUsers,
                totalMonthlyActiveUsers,
                totalLocalVideos,
                totalLocalVideoViews,
                totalLocalVideoComments,
                totalLocalVideoFilesSize,
                totalVideos,
                totalVideoComments,
                totalLocalVideoChannels,
                totalLocalDailyActiveVideoChannels,
                totalLocalWeeklyActiveVideoChannels,
                totalLocalMonthlyActiveVideoChannels,
                totalLocalPlaylists,
                totalInstanceFollowers,
                totalInstanceFollowing, videosRedundancy: videosRedundancyStats, performance }, this.buildAPStats());
            return data;
        });
    }
    getPerformanceStats() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const waitTranscodingJobs = yield job_queue_1.JobQueue.Instance.count("waiting", "video-transcoding");
            const failTranscodingJobs = yield job_queue_1.JobQueue.Instance.count("failed", "video-transcoding");
            const waitImportsCount = yield job_queue_1.JobQueue.Instance.count("waiting", "video-import");
            const failImportsCount = yield job_queue_1.JobQueue.Instance.count("failed", "video-import");
            const activeLivestreams = yield video_1.VideoModel.countLocalLives();
            const completedTranscodingJobs = yield job_queue_1.JobQueue.Instance.listForApi({
                state: "completed",
                start: 0,
                count: 50,
                jobType: "video-transcoding"
            });
            const speedByResolution = {};
            completedTranscodingJobs.forEach((job) => {
                var _a, _b, _c;
                if (job.data.type !== constants_1.TRANSCODING_JOB_TYPE)
                    return;
                const targetResolution = job.data.resolution;
                const executionTime = (job.finishedOn - job.timestamp) / 1000;
                logger_1.logger.info("Calculated time for %s : %s", targetResolution, executionTime);
                const fileSize = ((_c = (_b = (_a = job.returnvalue) === null || _a === void 0 ? void 0 : _a.VideoStreamingPlaylists[0]) === null || _b === void 0 ? void 0 : _b.VideoFiles[0]) === null || _c === void 0 ? void 0 : _c.size) || 0;
                if (!fileSize)
                    return;
                const mbpsSpeed = (fileSize * 8) / (1000000 * executionTime);
                speedByResolution[targetResolution]
                    ? speedByResolution[targetResolution].push(mbpsSpeed)
                    : (speedByResolution[targetResolution] = [mbpsSpeed]);
            });
            Object.keys(speedByResolution).forEach((resolution) => {
                const times = speedByResolution[resolution];
                const averageTime = times.reduce((accum, val) => accum + val, 0) / times.length;
                speedByResolution[resolution] = averageTime;
            });
            const data = {
                waitTranscodingJobs,
                failTranscodingJobs,
                waitImportsCount,
                activeLivestreams,
                failImportsCount,
                speedByResolution
            };
            return data;
        });
    }
    buildActivityPubMessagesProcessedPerSecond() {
        const now = new Date();
        const startedSeconds = (now.getTime() - this.instanceStartDate.getTime()) / 1000;
        return this.inboxMessages.processed / startedSeconds;
    }
    buildRedundancyStats() {
        const strategies = config_1.CONFIG.REDUNDANCY.VIDEOS.STRATEGIES.map((r) => ({
            strategy: r.strategy,
            size: r.size
        }));
        strategies.push({ strategy: "manual", size: null });
        return bluebird_1.mapSeries(strategies, (r) => {
            return video_redundancy_1.VideoRedundancyModel.getStats(r.strategy).then((stats) => Object.assign(stats, { strategy: r.strategy, totalSize: r.size }));
        });
    }
    buildAPPerType() {
        return {
            Create: 0,
            Update: 0,
            Delete: 0,
            Follow: 0,
            Accept: 0,
            Reject: 0,
            Announce: 0,
            Undo: 0,
            Like: 0,
            Dislike: 0,
            Flag: 0,
            View: 0
        };
    }
    buildAPStats() {
        return {
            totalActivityPubMessagesProcessed: this.inboxMessages.processed,
            totalActivityPubMessagesSuccesses: this.inboxMessages.successes,
            totalActivityPubCreateMessagesSuccesses: this.inboxMessages.successesPerType.Create,
            totalActivityPubUpdateMessagesSuccesses: this.inboxMessages.successesPerType.Update,
            totalActivityPubDeleteMessagesSuccesses: this.inboxMessages.successesPerType.Delete,
            totalActivityPubFollowMessagesSuccesses: this.inboxMessages.successesPerType.Follow,
            totalActivityPubAcceptMessagesSuccesses: this.inboxMessages.successesPerType.Accept,
            totalActivityPubRejectMessagesSuccesses: this.inboxMessages.successesPerType.Reject,
            totalActivityPubAnnounceMessagesSuccesses: this.inboxMessages.successesPerType.Announce,
            totalActivityPubUndoMessagesSuccesses: this.inboxMessages.successesPerType.Undo,
            totalActivityPubLikeMessagesSuccesses: this.inboxMessages.successesPerType.Like,
            totalActivityPubDislikeMessagesSuccesses: this.inboxMessages.successesPerType.Dislike,
            totalActivityPubFlagMessagesSuccesses: this.inboxMessages.successesPerType.Flag,
            totalActivityPubViewMessagesSuccesses: this.inboxMessages.successesPerType.View,
            totalActivityPubCreateMessagesErrors: this.inboxMessages.errorsPerType.Create,
            totalActivityPubUpdateMessagesErrors: this.inboxMessages.errorsPerType.Update,
            totalActivityPubDeleteMessagesErrors: this.inboxMessages.errorsPerType.Delete,
            totalActivityPubFollowMessagesErrors: this.inboxMessages.errorsPerType.Follow,
            totalActivityPubAcceptMessagesErrors: this.inboxMessages.errorsPerType.Accept,
            totalActivityPubRejectMessagesErrors: this.inboxMessages.errorsPerType.Reject,
            totalActivityPubAnnounceMessagesErrors: this.inboxMessages.errorsPerType.Announce,
            totalActivityPubUndoMessagesErrors: this.inboxMessages.errorsPerType.Undo,
            totalActivityPubLikeMessagesErrors: this.inboxMessages.errorsPerType.Like,
            totalActivityPubDislikeMessagesErrors: this.inboxMessages.errorsPerType.Dislike,
            totalActivityPubFlagMessagesErrors: this.inboxMessages.errorsPerType.Flag,
            totalActivityPubViewMessagesErrors: this.inboxMessages.errorsPerType.View,
            totalActivityPubMessagesErrors: this.inboxMessages.errors,
            activityPubMessagesProcessedPerSecond: this.buildActivityPubMessagesProcessedPerSecond(),
            totalActivityPubMessagesWaiting: this.inboxMessages.waiting
        };
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.StatsManager = StatsManager;
