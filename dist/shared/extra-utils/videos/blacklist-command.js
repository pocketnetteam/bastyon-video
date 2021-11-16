"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlacklistCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class BlacklistCommand extends shared_1.AbstractCommand {
    add(options) {
        const { videoId, reason, unfederate } = options;
        const path = '/api/v1/videos/' + videoId + '/blacklist';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { reason, unfederate }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    update(options) {
        const { videoId, reason } = options;
        const path = '/api/v1/videos/' + videoId + '/blacklist';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { reason }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    remove(options) {
        const { videoId } = options;
        const path = '/api/v1/videos/' + videoId + '/blacklist';
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    list(options = {}) {
        const { sort, type } = options;
        const path = '/api/v1/videos/blacklist/';
        const query = { sort, type };
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.BlacklistCommand = BlacklistCommand;
