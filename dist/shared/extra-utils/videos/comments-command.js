"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsCommand = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class CommentsCommand extends shared_1.AbstractCommand {
    listForAdmin(options = {}) {
        const { sort = '-createdAt' } = options;
        const path = '/api/v1/videos/comments';
        const query = Object.assign({ sort }, lodash_1.pick(options, ['start', 'count', 'isLocal', 'search', 'searchAccount', 'searchVideo']));
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listThreads(options) {
        const { start, count, sort, videoId } = options;
        const path = '/api/v1/videos/' + videoId + '/comment-threads';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { start, count, sort }, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getThread(options) {
        const { videoId, threadId } = options;
        const path = '/api/v1/videos/' + videoId + '/comment-threads/' + threadId;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    createThread(options) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { videoId, text } = options;
            const path = '/api/v1/videos/' + videoId + '/comment-threads';
            const body = yield requests_1.unwrapBody(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { text }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
            this.lastThreadId = (_a = body.comment) === null || _a === void 0 ? void 0 : _a.id;
            this.lastVideoId = videoId;
            return body.comment;
        });
    }
    addReply(options) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { videoId, toCommentId, text } = options;
            const path = '/api/v1/videos/' + videoId + '/comments/' + toCommentId;
            const body = yield requests_1.unwrapBody(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { text }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
            this.lastReplyId = (_a = body.comment) === null || _a === void 0 ? void 0 : _a.id;
            return body.comment;
        });
    }
    addReplyToLastReply(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.addReply(Object.assign(Object.assign({}, options), { videoId: this.lastVideoId, toCommentId: this.lastReplyId }));
        });
    }
    addReplyToLastThread(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.addReply(Object.assign(Object.assign({}, options), { videoId: this.lastVideoId, toCommentId: this.lastThreadId }));
        });
    }
    findCommentId(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { videoId, text } = options;
            const { data } = yield this.listThreads({ videoId, count: 25, sort: '-createdAt' });
            return data.find(c => c.text === text).id;
        });
    }
    delete(options) {
        const { videoId, commentId } = options;
        const path = '/api/v1/videos/' + videoId + '/comments/' + commentId;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.CommentsCommand = CommentsCommand;
