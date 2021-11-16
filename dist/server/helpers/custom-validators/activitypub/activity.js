"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUndoActivityValid = exports.isRejectActivityValid = exports.isAcceptActivityValid = exports.isFollowActivityValid = exports.isDeleteActivityValid = exports.isUpdateActivityValid = exports.isCreateActivityValid = exports.isViewActivityValid = exports.isAnnounceActivityValid = exports.isDislikeActivityValid = exports.isLikeActivityValid = exports.isFlagActivityValid = exports.isActivityValid = exports.isRootActivityValid = void 0;
const tslib_1 = require("tslib");
const validator_1 = tslib_1.__importDefault(require("validator"));
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
    return misc_2.isActivityPubUrlValid(activity.id) &&
        misc_1.exists(activity.actor) &&
        (misc_2.isActivityPubUrlValid(activity.actor) || misc_2.isActivityPubUrlValid(activity.actor.id));
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
    return misc_2.isBaseActivityValid(activity, 'Flag') &&
        abuses_1.isAbuseReasonValid(activity.content) &&
        misc_2.isActivityPubUrlValid(activity.object);
}
exports.isFlagActivityValid = isFlagActivityValid;
function isLikeActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Like') &&
        misc_2.isObjectValid(activity.object);
}
exports.isLikeActivityValid = isLikeActivityValid;
function isDislikeActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Dislike') &&
        misc_2.isObjectValid(activity.object);
}
exports.isDislikeActivityValid = isDislikeActivityValid;
function isAnnounceActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Announce') &&
        misc_2.isObjectValid(activity.object);
}
exports.isAnnounceActivityValid = isAnnounceActivityValid;
function isViewActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'View') &&
        misc_2.isActivityPubUrlValid(activity.actor) &&
        misc_2.isActivityPubUrlValid(activity.object);
}
exports.isViewActivityValid = isViewActivityValid;
function isCreateActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Create') &&
        (isViewActivityValid(activity.object) ||
            isDislikeActivityValid(activity.object) ||
            isFlagActivityValid(activity.object) ||
            playlist_1.isPlaylistObjectValid(activity.object) ||
            cache_file_1.isCacheFileObjectValid(activity.object) ||
            video_comments_1.sanitizeAndCheckVideoCommentObject(activity.object) ||
            videos_1.sanitizeAndCheckVideoTorrentObject(activity.object));
}
exports.isCreateActivityValid = isCreateActivityValid;
function isUpdateActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Update') &&
        (cache_file_1.isCacheFileObjectValid(activity.object) ||
            playlist_1.isPlaylistObjectValid(activity.object) ||
            videos_1.sanitizeAndCheckVideoTorrentObject(activity.object) ||
            actor_1.sanitizeAndCheckActorObject(activity.object));
}
exports.isUpdateActivityValid = isUpdateActivityValid;
function isDeleteActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Delete') &&
        misc_2.isObjectValid(activity.object);
}
exports.isDeleteActivityValid = isDeleteActivityValid;
function isFollowActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Follow') &&
        misc_2.isObjectValid(activity.object);
}
exports.isFollowActivityValid = isFollowActivityValid;
function isAcceptActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Accept');
}
exports.isAcceptActivityValid = isAcceptActivityValid;
function isRejectActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Reject');
}
exports.isRejectActivityValid = isRejectActivityValid;
function isUndoActivityValid(activity) {
    return misc_2.isBaseActivityValid(activity, 'Undo') &&
        (isFollowActivityValid(activity.object) ||
            isLikeActivityValid(activity.object) ||
            isDislikeActivityValid(activity.object) ||
            isAnnounceActivityValid(activity.object) ||
            isCreateActivityValid(activity.object));
}
exports.isUndoActivityValid = isUndoActivityValid;
