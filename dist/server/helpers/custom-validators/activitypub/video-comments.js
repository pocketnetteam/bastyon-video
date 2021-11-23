"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeAndCheckVideoCommentObject = void 0;
const tslib_1 = require("tslib");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const constants_1 = require("../../../initializers/constants");
const misc_1 = require("../misc");
const misc_2 = require("./misc");
function sanitizeAndCheckVideoCommentObject(comment) {
    if (!comment)
        return false;
    if (!isCommentTypeValid(comment))
        return false;
    normalizeComment(comment);
    if (comment.type === 'Tombstone') {
        return (0, misc_2.isActivityPubUrlValid)(comment.id) &&
            (0, misc_1.isDateValid)(comment.published) &&
            (0, misc_1.isDateValid)(comment.deleted) &&
            (0, misc_2.isActivityPubUrlValid)(comment.url);
    }
    return (0, misc_2.isActivityPubUrlValid)(comment.id) &&
        isCommentContentValid(comment.content) &&
        (0, misc_2.isActivityPubUrlValid)(comment.inReplyTo) &&
        (0, misc_1.isDateValid)(comment.published) &&
        (0, misc_2.isActivityPubUrlValid)(comment.url) &&
        (0, misc_1.isArray)(comment.to) &&
        (comment.to.indexOf(constants_1.ACTIVITY_PUB.PUBLIC) !== -1 ||
            comment.cc.indexOf(constants_1.ACTIVITY_PUB.PUBLIC) !== -1);
}
exports.sanitizeAndCheckVideoCommentObject = sanitizeAndCheckVideoCommentObject;
function isCommentContentValid(content) {
    return (0, misc_1.exists)(content) && validator_1.default.isLength('' + content, { min: 1 });
}
function normalizeComment(comment) {
    if (!comment)
        return;
    if (typeof comment.url !== 'string') {
        if (typeof comment.url === 'object')
            comment.url = comment.url.href || comment.url.url;
        else
            comment.url = comment.id;
    }
}
function isCommentTypeValid(comment) {
    if (comment.type === 'Note')
        return true;
    if (comment.type === 'Tombstone' && comment.formerType === 'Note')
        return true;
    return false;
}
