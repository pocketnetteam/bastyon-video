"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedundancyCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class RedundancyCommand extends shared_1.AbstractCommand {
    updateRedundancy(options) {
        const { host, redundancyAllowed } = options;
        const path = '/api/v1/server/redundancy/' + host;
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { redundancyAllowed }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    listVideos(options) {
        const path = '/api/v1/server/redundancy/videos';
        const { target, start, count, sort } = options;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: {
                start: start !== null && start !== void 0 ? start : 0,
                count: count !== null && count !== void 0 ? count : 5,
                sort: sort !== null && sort !== void 0 ? sort : 'name',
                target
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    addVideo(options) {
        const path = '/api/v1/server/redundancy/videos';
        const { videoId } = options;
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { videoId }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    removeVideo(options) {
        const { redundancyId } = options;
        const path = '/api/v1/server/redundancy/videos/' + redundancyId;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.RedundancyCommand = RedundancyCommand;
