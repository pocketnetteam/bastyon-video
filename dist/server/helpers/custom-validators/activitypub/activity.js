"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUndoActivityValid = exports.isRejectActivityValid = exports.isAcceptActivityValid = exports.isFollowActivityValid = exports.isDeleteActivityValid = exports.isUpdateActivityValid = exports.isCreateActivityValid = exports.isViewActivityValid = exports.isAnnounceActivityValid = exports.isDislikeActivityValid = exports.isLikeActivityValid = exports.isFlagActivityValid = exports.isActivityValid = exports.isRootActivityValid = void 0;
const tslib_1 = require("tslib");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const abuses_1 = require("../abuses");
const misc_1 = require("../misc");
const actor_1 = require("./actor");
const cache_file_1 = require("./cache-file");
const misc_2 = require("./misc");
const playlist_1 = require("./playlist");
const video_comments_1 = require("./video-comments");
const videos_1 = require("./videos");
function isRootActivityValid(activity) {
    return isCollection(activity) || isActivity(activity);
}
exports.isRootActivityValid = isRootActivityValid;
function isCollection(activity) {
    return (activity.type === 'Collection' || activity.type === 'OrderedCollection') &&
        validator_1.default.isInt(activity.totalItems, { min: 0 }) &&
        Array.isArray(activity.items);
}
function isActivity(activity) {
    return (0, misc_2.isActivityPubUrlValid)(activity.id) &&
        (0, misc_1.exists)(activity.actor) &&
        ((0, misc_2.isActivityPubUrlValid)(activity.actor) || (0, misc_2.isActivityPubUrlValid)(activity.actor.id));
}
const activityCheckers = {
    Create: isCreateActivityValid,
    Update: isUpdateActivityValid,
    Delete: isDeleteActivityValid,
    Follow: isFollowActivityValid,
    Accept: isAcceptActivityValid,
    Reject: isRejectActivityValid,
    Announce: isAnnounceActivityValid,
    Undo: isUndoActivityValid,
    Like: isLikeActivityValid,
    View: isViewActivityValid,
    Flag: isFlagActivityValid,
    Dislike: isDislikeActivityValid
};
function isActivityValid(activity) {
    const checker = activityCheckers[activity.type];
    if (!checker)
        return false;
    return checker(activity);
}
exports.isActivityValid = isActivityValid;
function isFlagActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Flag') &&
        (0, abuses_1.isAbuseReasonValid)(activity.content) &&
        (0, misc_2.isActivityPubUrlValid)(activity.object);
}
exports.isFlagActivityValid = isFlagActivityValid;
function isLikeActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Like') &&
        (0, misc_2.isObjectValid)(activity.object);
}
exports.isLikeActivityValid = isLikeActivityValid;
function isDislikeActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Dislike') &&
        (0, misc_2.isObjectValid)(activity.object);
}
exports.isDislikeActivityValid = isDislikeActivityValid;
function isAnnounceActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Announce') &&
        (0, misc_2.isObjectValid)(activity.object);
}
exports.isAnnounceActivityValid = isAnnounceActivityValid;
function isViewActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'View') &&
        (0, misc_2.isActivityPubUrlValid)(activity.actor) &&
        (0, misc_2.isActivityPubUrlValid)(activity.object);
}
exports.isViewActivityValid = isViewActivityValid;
function isCreateActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Create') &&
        (isViewActivityValid(activity.object) ||
            isDislikeActivityValid(activity.object) ||
            isFlagActivityValid(activity.object) ||
            (0, playlist_1.isPlaylistObjectValid)(activity.object) ||
            (0, cache_file_1.isCacheFileObjectValid)(activity.object) ||
            (0, video_comments_1.sanitizeAndCheckVideoCommentObject)(activity.object) ||
            (0, videos_1.sanitizeAndCheckVideoTorrentObject)(activity.object));
}
exports.isCreateActivityValid = isCreateActivityValid;
function isUpdateActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Update') &&
        ((0, cache_file_1.isCacheFileObjectValid)(activity.object) ||
            (0, playlist_1.isPlaylistObjectValid)(activity.object) ||
            (0, videos_1.sanitizeAndCheckVideoTorrentObject)(activity.object) ||
            (0, actor_1.sanitizeAndCheckActorObject)(activity.object));
}
exports.isUpdateActivityValid = isUpdateActivityValid;
function isDeleteActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Delete') &&
        (0, misc_2.isObjectValid)(activity.object);
}
exports.isDeleteActivityValid = isDeleteActivityValid;
function isFollowActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Follow') &&
        (0, misc_2.isObjectValid)(activity.object);
}
exports.isFollowActivityValid = isFollowActivityValid;
function isAcceptActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Accept');
}
exports.isAcceptActivityValid = isAcceptActivityValid;
function isRejectActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Reject');
}
exports.isRejectActivityValid = isRejectActivityValid;
function isUndoActivityValid(activity) {
    return (0, misc_2.isBaseActivityValid)(activity, 'Undo') &&
        (isFollowActivityValid(activity.object) ||
            isLikeActivityValid(activity.object) ||
            isDislikeActivityValid(activity.object) ||
            isAnnounceActivityValid(activity.object) ||
            isCreateActivityValid(activity.object));
}
exports.isUndoActivityValid = isUndoActivityValid;
