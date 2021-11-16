"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class HistoryCommand extends shared_1.AbstractCommand {
    wathVideo(options) {
        const { videoId, currentTime } = options;
        const path = '/api/v1/videos/' + videoId + '/watching';
        const fields = { currentTime };
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path,
            fields, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    list(options = {}) {
        const { search } = options;
        const path = '/api/v1/users/me/history/videos';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: {
                search
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    remove(options = {}) {
        const { beforeDate } = options;
        const path = '/api/v1/users/me/history/videos/remove';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { beforeDate }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.HistoryCommand = HistoryCommand;
