"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncVideoExternalAttributes = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const job_queue_1 = require("@server/lib/job-queue");
const account_video_rate_1 = require("@server/models/account/account-video-rate");
const video_comment_1 = require("@server/models/video/video-comment");
const video_share_1 = require("@server/models/video/video-share");
const crawl_1 = require("../../crawl");
const share_1 = require("../../share");
const video_comments_1 = require("../../video-comments");
const video_rates_1 = require("../../video-rates");
const lTags = logger_1.loggerTagsFactory('ap', 'video');
function syncVideoExternalAttributes(video, fetchedVideo, syncParam) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Adding likes/dislikes/shares/comments of video %s.', video.uuid);
        yield syncRates('like', video, fetchedVideo, syncParam.likes);
        yield syncRates('dislike', video, fetchedVideo, syncParam.dislikes);
        yield syncShares(video, fetchedVideo, syncParam.shares);
        yield syncComments(video, fetchedVideo, syncParam.comments);
    });
}
exports.syncVideoExternalAttributes = syncVideoExternalAttributes;
function createJob(payload) {
    return job_queue_1.JobQueue.Instance.createJobWithPromise({ type: 'activitypub-http-fetcher', payload });
}
function syncRates(type, video, fetchedVideo, isSync) {
    const uri = type === 'like'
        ? fetchedVideo.likes
        : fetchedVideo.dislikes;
    if (!isSync) {
        const jobType = type === 'like'
            ? 'video-likes'
            : 'video-dislikes';
        return createJob({ uri, videoId: video.id, type: jobType });
    }
    const handler = items => video_rates_1.createRates(items, video, type);
    const cleaner = crawlStartDate => account_video_rate_1.AccountVideoRateModel.cleanOldRatesOf(video.id, type, crawlStartDate);
    return crawl_1.crawlCollectionPage(uri, handler, cleaner)
        .catch(err => logger_1.logger.error('Cannot add rate of video %s.', video.uuid, Object.assign({ err, rootUrl: uri }, lTags(video.uuid, video.url))));
}
function syncShares(video, fetchedVideo, isSync) {
    const uri = fetchedVideo.shares;
    if (!isSync) {
        return createJob({ uri, videoId: video.id, type: 'video-shares' });
    }
    const handler = items => share_1.addVideoShares(items, video);
    const cleaner = crawlStartDate => video_share_1.VideoShareModel.cleanOldSharesOf(video.id, crawlStartDate);
    return crawl_1.crawlCollectionPage(uri, handler, cleaner)
        .catch(err => logger_1.logger.error('Cannot add shares of video %s.', video.uuid, Object.assign({ err, rootUrl: uri }, lTags(video.uuid, video.url))));
}
function syncComments(video, fetchedVideo, isSync) {
    const uri = fetchedVideo.comments;
    if (!isSync) {
        return createJob({ uri, videoId: video.id, type: 'video-comments' });
    }
    const handler = items => video_comments_1.addVideoComments(items);
    const cleaner = crawlStartDate => video_comment_1.VideoCommentModel.cleanOldCommentsOf(video.id, crawlStartDate);
    return crawl_1.crawlCollectionPage(uri, handler, cleaner)
        .catch(err => logger_1.logger.error('Cannot add comments of video %s.', video.uuid, Object.assign({ err, rootUrl: uri }, lTags(video.uuid, video.url))));
}
