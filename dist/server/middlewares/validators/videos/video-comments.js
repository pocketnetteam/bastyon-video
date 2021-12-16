"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeVideoCommentValidator = exports.videoCommentGetValidator = exports.addVideoCommentReplyValidator = exports.listVideoCommentsValidator = exports.addVideoCommentThreadValidator = exports.listVideoThreadCommentsValidator = exports.listVideoCommentThreadsValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const misc_1 = require("../../../helpers/custom-validators/misc");
const video_comments_1 = require("../../../helpers/custom-validators/video-comments");
const logger_1 = require("../../../helpers/logger");
const moderation_1 = require("../../../lib/moderation");
const hooks_1 = require("../../../lib/plugins/hooks");
const shared_1 = require("../shared");
const listVideoCommentsValidator = [
    express_validator_1.query('isLocal')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid)
        .withMessage('Should have a valid is local boolean'),
    express_validator_1.query('search')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid search'),
    express_validator_1.query('searchAccount')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid account search'),
    express_validator_1.query('searchVideo')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid video search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking listVideoCommentsValidator parameters.', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.listVideoCommentsValidator = listVideoCommentsValidator;
const listVideoCommentThreadsValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking listVideoCommentThreads parameters.', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res, 'only-video')))
            return;
        return next();
    })
];
exports.listVideoCommentThreadsValidator = listVideoCommentThreadsValidator;
const listVideoThreadCommentsValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    express_validator_1.param('threadId')
        .custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid threadId'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking listVideoThreadComments parameters.', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res, 'only-video')))
            return;
        if (!(yield shared_1.doesVideoCommentThreadExist(req.params.threadId, res.locals.onlyVideo, res)))
            return;
        return next();
    })
];
exports.listVideoThreadCommentsValidator = listVideoThreadCommentsValidator;
const addVideoCommentThreadValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    express_validator_1.body('text')
        .custom(video_comments_1.isValidVideoCommentText).not().isEmpty().withMessage('Should have a valid comment text'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking addVideoCommentThread parameters.', { parameters: req.params, body: req.body });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res)))
            return;
        if (!isVideoCommentsEnabled(res.locals.videoAll, res))
            return;
        if (!(yield isVideoCommentAccepted(req, res, res.locals.videoAll, false)))
            return;
        return next();
    })
];
exports.addVideoCommentThreadValidator = addVideoCommentThreadValidator;
const addVideoCommentReplyValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    express_validator_1.param('commentId').custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid commentId'),
    express_validator_1.body('text').custom(video_comments_1.isValidVideoCommentText).not().isEmpty().withMessage('Should have a valid comment text'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking addVideoCommentReply parameters.', { parameters: req.params, body: req.body });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res)))
            return;
        if (!isVideoCommentsEnabled(res.locals.videoAll, res))
            return;
        if (!(yield shared_1.doesVideoCommentExist(req.params.commentId, res.locals.videoAll, res)))
            return;
        if (!(yield isVideoCommentAccepted(req, res, res.locals.videoAll, true)))
            return;
        return next();
    })
];
exports.addVideoCommentReplyValidator = addVideoCommentReplyValidator;
const videoCommentGetValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    express_validator_1.param('commentId')
        .custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid commentId'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking videoCommentGetValidator parameters.', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res, 'id')))
            return;
        if (!(yield shared_1.doesVideoCommentExist(req.params.commentId, res.locals.videoId, res)))
            return;
        return next();
    })
];
exports.videoCommentGetValidator = videoCommentGetValidator;
const removeVideoCommentValidator = [
    shared_1.isValidVideoIdParam('videoId'),
    express_validator_1.param('commentId').custom(misc_1.isIdValid).not().isEmpty().withMessage('Should have a valid commentId'),
    (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking removeVideoCommentValidator parameters.', { parameters: req.params });
        if (shared_1.areValidationErrors(req, res))
            return;
        if (!(yield shared_1.doesVideoExist(req.params.videoId, res)))
            return;
        if (!(yield shared_1.doesVideoCommentExist(req.params.commentId, res.locals.videoAll, res)))
            return;
        if (!checkUserCanDeleteVideoComment(res.locals.oauth.token.User, res.locals.videoCommentFull, res))
            return;
        return next();
    })
];
exports.removeVideoCommentValidator = removeVideoCommentValidator;
function isVideoCommentsEnabled(video, res) {
    if (video.commentsEnabled !== true) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
            message: 'Video comments are disabled for this video.'
        });
        return false;
    }
    return true;
}
function checkUserCanDeleteVideoComment(user, videoComment, res) {
    if (videoComment.isDeleted()) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
            message: 'This comment is already deleted'
        });
        return false;
    }
    const userAccount = user.Account;
    if (user.hasRight(16) === false &&
        videoComment.accountId !== userAccount.id &&
        videoComment.Video.VideoChannel.accountId !== userAccount.id) {
        res.fail({
            status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
            message: 'Cannot remove video comment of another user'
        });
        return false;
    }
    return true;
}
function isVideoCommentAccepted(req, res, video, isReply) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const acceptParameters = {
            video,
            commentBody: req.body,
            user: res.locals.oauth.token.User
        };
        let acceptedResult;
        if (isReply) {
            const acceptReplyParameters = Object.assign(acceptParameters, { parentComment: res.locals.videoCommentFull });
            acceptedResult = yield hooks_1.Hooks.wrapFun(moderation_1.isLocalVideoCommentReplyAccepted, acceptReplyParameters, 'filter:api.video-comment-reply.create.accept.result');
        }
        else {
            acceptedResult = yield hooks_1.Hooks.wrapFun(moderation_1.isLocalVideoThreadAccepted, acceptParameters, 'filter:api.video-thread.create.accept.result');
        }
        if (!acceptedResult || acceptedResult.accepted !== true) {
            logger_1.logger.info('Refused local comment.', { acceptedResult, acceptParameters });
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: (acceptedResult === null || acceptedResult === void 0 ? void 0 : acceptedResult.errorMessage) || 'Refused local comment'
            });
            return false;
        }
        return true;
    });
}
