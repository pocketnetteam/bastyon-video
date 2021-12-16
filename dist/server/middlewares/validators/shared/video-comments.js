"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesCommentIdExist = exports.doesVideoCommentExist = exports.doesVideoCommentThreadExist = void 0;
const tslib_1 = require("tslib");
const video_comment_1 = require("@server/models/video/video-comment");
const models_1 = require("@shared/models");
function doesVideoCommentThreadExist(idArg, video, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const id = parseInt(idArg + '', 10);
        const videoComment = yield video_comment_1.VideoCommentModel.loadById(id);
        if (!videoComment) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video comment thread not found'
            });
            return false;
        }
        if (videoComment.videoId !== video.id) {
            res.fail({ message: 'Video comment is not associated to this video.' });
            return false;
        }
        if (videoComment.inReplyToCommentId !== null) {
            res.fail({ message: 'Video comment is not a thread.' });
            return false;
        }
        res.locals.videoCommentThread = videoComment;
        return true;
    });
}
exports.doesVideoCommentThreadExist = doesVideoCommentThreadExist;
function doesVideoCommentExist(idArg, video, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const id = parseInt(idArg + '', 10);
        const videoComment = yield video_comment_1.VideoCommentModel.loadByIdAndPopulateVideoAndAccountAndReply(id);
        if (!videoComment) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video comment thread not found'
            });
            return false;
        }
        if (videoComment.videoId !== video.id) {
            res.fail({ message: 'Video comment is not associated to this video.' });
            return false;
        }
        res.locals.videoCommentFull = videoComment;
        return true;
    });
}
exports.doesVideoCommentExist = doesVideoCommentExist;
function doesCommentIdExist(idArg, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const id = parseInt(idArg + '', 10);
        const videoComment = yield video_comment_1.VideoCommentModel.loadByIdAndPopulateVideoAndAccountAndReply(id);
        if (!videoComment) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video comment thread not found'
            });
            return false;
        }
        res.locals.videoCommentFull = videoComment;
        return true;
    });
}
exports.doesCommentIdExist = doesCommentIdExist;
