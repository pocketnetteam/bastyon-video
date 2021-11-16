"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class SubscriptionsCommand extends shared_1.AbstractCommand {
    add(options) {
        const path = '/api/v1/users/me/subscriptions';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { uri: options.targetUri }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    list(options = {}) {
        const { sort = '-createdAt', search } = options;
        const path = '/api/v1/users/me/subscriptions';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: {
                sort,
                search
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listVideos(options = {}) {
        const { sort = '-createdAt' } = options;
        const path = '/api/v1/users/me/subscriptions/videos';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { sort }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    get(options) {
        const path = '/api/v1/users/me/subscriptions/' + options.uri;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    remove(options) {
        const path = '/api/v1/users/me/subscriptions/' + options.uri;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    exist(options) {
        const path = '/api/v1/users/me/subscriptions/exist';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { 'uris[]': options.uris }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.SubscriptionsCommand = SubscriptionsCommand;
