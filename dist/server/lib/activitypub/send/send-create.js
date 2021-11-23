"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCreateCacheFile = exports.sendCreateVideoPlaylist = exports.sendCreateVideoComment = exports.buildCreateActivity = exports.sendCreateVideo = void 0;
const tslib_1 = require("tslib");
const video_comment_1 = require("../../../models/video/video-comment");
const utils_1 = require("./utils");
const audience_1 = require("../audience");
const logger_1 = require("../../../helpers/logger");
const application_1 = require("@server/models/application/application");
const lTags = (0, logger_1.loggerTagsFactory)('ap', 'create');
function sendCreateVideo(video, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!video.hasPrivacyForFederation())
            return undefined;
        logger_1.logger.info('Creating job to send video creation of %s.', video.url, lTags(video.uuid));
        const byActor = video.VideoChannel.Account.Actor;
        const videoObject = video.toActivityPubObject();
        const audience = (0, audience_1.getAudience)(byActor, video.privacy === 1);
        const createActivity = buildCreateActivity(video.url, byActor, videoObject, audience);
        return (0, utils_1.broadcastToFollowers)(createActivity, byActor, [byActor], t);
    });
}
exports.sendCreateVideo = sendCreateVideo;
function sendCreateCacheFile(byActor, video, fileRedundancy) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Creating job to send file cache of %s.', fileRedundancy.url, lTags(video.uuid));
        return sendVideoRelatedCreateActivity({
            byActor,
            video,
            url: fileRedundancy.url,
            object: fileRedundancy.toActivityPubObject(),
            contextType: 'CacheFile'
        });
    });
}
exports.sendCreateCacheFile = sendCreateCacheFile;
function sendCreateVideoPlaylist(playlist, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (playlist.privacy === 3)
            return undefined;
        logger_1.logger.info('Creating job to send create video playlist of %s.', playlist.url, lTags(playlist.uuid));
        const byActor = playlist.OwnerAccount.Actor;
        const audience = (0, audience_1.getAudience)(byActor, playlist.privacy === 1);
        const object = yield playlist.toActivityPubObject(null, t);
        const createActivity = buildCreateActivity(playlist.url, byActor, object, audience);
        const serverActor = yield (0, application_1.getServerActor)();
        const toFollowersOf = [byActor, serverActor];
        if (playlist.VideoChannel)
            toFollowersOf.push(playlist.VideoChannel.Actor);
        return (0, utils_1.broadcastToFollowers)(createActivity, byActor, toFollowersOf, t);
    });
}
exports.sendCreateVideoPlaylist = sendCreateVideoPlaylist;
function sendCreateVideoComment(comment, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Creating job to send comment %s.', comment.url);
        const isOrigin = comment.Video.isOwned();
        const byActor = comment.Account.Actor;
        const threadParentComments = yield video_comment_1.VideoCommentModel.listThreadParentComments(comment, t);
        const commentObject = comment.toActivityPubObject(threadParentComments);
        const actorsInvolvedInComment = yield (0, audience_1.getActorsInvolvedInVideo)(comment.Video, t);
        actorsInvolvedInComment.push(byActor);
        const parentsCommentActors = threadParentComments.filter(c => !c.isDeleted())
            .map(c => c.Account.Actor);
        let audience;
        if (isOrigin) {
            audience = (0, audience_1.getVideoCommentAudience)(comment, threadParentComments, actorsInvolvedInComment, isOrigin);
        }
        else {
            audience = (0, audience_1.getAudienceFromFollowersOf)(actorsInvolvedInComment.concat(parentsCommentActors));
        }
        const createActivity = buildCreateActivity(comment.url, byActor, commentObject, audience);
        const actorsException = [byActor];
        yield (0, utils_1.broadcastToActors)(createActivity, byActor, parentsCommentActors, t, actorsException);
        yield (0, utils_1.broadcastToFollowers)(createActivity, byActor, [byActor], t);
        if (isOrigin)
            return (0, utils_1.broadcastToFollowers)(createActivity, byActor, actorsInvolvedInComment, t, actorsException);
        t.afterCommit(() => (0, utils_1.unicastTo)(createActivity, byActor, comment.Video.VideoChannel.Account.Actor.getSharedInbox()));
    });
}
exports.sendCreateVideoComment = sendCreateVideoComment;
function buildCreateActivity(url, byActor, object, audience) {
    if (!audience)
        audience = (0, audience_1.getAudience)(byActor);
    return (0, audience_1.audiencify)({
        type: 'Create',
        id: url + '/activity',
        actor: byActor.url,
        object: (0, audience_1.audiencify)(object, audience)
    }, audience);
}
exports.buildCreateActivity = buildCreateActivity;
function sendVideoRelatedCreateActivity(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const activityBuilder = (audience) => {
            return buildCreateActivity(options.url, options.byActor, options.object, audience);
        };
        return (0, utils_1.sendVideoRelatedActivity)(activityBuilder, options);
    });
}
