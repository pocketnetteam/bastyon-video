"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processActivityPubHttpFetcher = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("../../../helpers/logger");
const account_video_rate_1 = require("../../../models/account/account-video-rate");
const video_1 = require("../../../models/video/video");
const video_comment_1 = require("../../../models/video/video-comment");
const video_share_1 = require("../../../models/video/video-share");
const crawl_1 = require("../../activitypub/crawl");
const playlists_1 = require("../../activitypub/playlists");
const process_1 = require("../../activitypub/process");
const share_1 = require("../../activitypub/share");
const video_comments_1 = require("../../activitypub/video-comments");
const video_rates_1 = require("../../activitypub/video-rates");
function processActivityPubHttpFetcher(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Processing ActivityPub fetcher in job %d.', job.id);
        const payload = job.data;
        let video;
        if (payload.videoId)
            video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(payload.videoId);
        const fetcherType = {
            'activity': items => (0, process_1.processActivities)(items, { outboxUrl: payload.uri, fromFetch: true }),
            'video-likes': items => (0, video_rates_1.createRates)(items, video, 'like'),
            'video-dislikes': items => (0, video_rates_1.createRates)(items, video, 'dislike'),
            'video-shares': items => (0, share_1.addVideoShares)(items, video),
            'video-comments': items => (0, video_comments_1.addVideoComments)(items),
            'account-playlists': items => (0, playlists_1.createAccountPlaylists)(items)
        };
        const cleanerType = {
            'video-likes': crawlStartDate => account_video_rate_1.AccountVideoRateModel.cleanOldRatesOf(video.id, 'like', crawlStartDate),
            'video-dislikes': crawlStartDate => account_video_rate_1.AccountVideoRateModel.cleanOldRatesOf(video.id, 'dislike', crawlStartDate),
            'video-shares': crawlStartDate => video_share_1.VideoShareModel.cleanOldSharesOf(video.id, crawlStartDate),
            'video-comments': crawlStartDate => video_comment_1.VideoCommentModel.cleanOldCommentsOf(video.id, crawlStartDate)
        };
        return (0, crawl_1.crawlCollectionPage)(payload.uri, fetcherType[payload.type], cleanerType[payload.type]);
    });
}
exports.processActivityPubHttpFetcher = processActivityPubHttpFetcher;
