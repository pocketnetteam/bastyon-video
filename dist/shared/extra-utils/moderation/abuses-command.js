"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbusesCommand = void 0;
const core_utils_1 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const requests_1 = require("../requests/requests");
const shared_1 = require("../shared");
class AbusesCommand extends shared_1.AbstractCommand {
    report(options) {
        const path = '/api/v1/abuses';
        const video = options.videoId
            ? {
                id: options.videoId,
                startAt: options.startAt,
                endAt: options.endAt
            }
            : undefined;
        const comment = options.commentId
            ? { id: options.commentId }
            : undefined;
        const account = options.accountId
            ? { id: options.accountId }
            : undefined;
        const body = {
            account,
            video,
            comment,
            reason: options.reason,
            predefinedReasons: options.predefinedReasons
        };
        return (0, requests_1.unwrapBody)(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: body, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    getAdminList(options = {}) {
        const toPick = [
            'count',
            'filter',
            'id',
            'predefinedReason',
            'search',
            'searchReportee',
            'searchReporter',
            'searchVideo',
            'searchVideoChannel',
            'sort',
            'start',
            'state',
            'videoIs'
        ];
        const path = '/api/v1/abuses';
        const defaultQuery = { sort: 'createdAt' };
        const query = Object.assign(Object.assign({}, defaultQuery), (0, core_utils_1.pick)(options, toPick));
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getUserList(options) {
        const toPick = [
            'id',
            'search',
            'state',
            'start',
            'count',
            'sort'
        ];
        const path = '/api/v1/users/me/abuses';
        const defaultQuery = { sort: 'createdAt' };
        const query = Object.assign(Object.assign({}, defaultQuery), (0, core_utils_1.pick)(options, toPick));
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    update(options) {
        const { abuseId, body } = options;
        const path = '/api/v1/abuses/' + abuseId;
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: body, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    delete(options) {
        const { abuseId } = options;
        const path = '/api/v1/abuses/' + abuseId;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    listMessages(options) {
        const { abuseId } = options;
        const path = '/api/v1/abuses/' + abuseId + '/messages';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    deleteMessage(options) {
        const { abuseId, messageId } = options;
        const path = '/api/v1/abuses/' + abuseId + '/messages/' + messageId;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    addMessage(options) {
        const { abuseId, message } = options;
        const path = '/api/v1/abuses/' + abuseId + '/messages';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { message }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.AbusesCommand = AbusesCommand;
