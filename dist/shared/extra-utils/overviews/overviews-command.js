"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverviewsCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class OverviewsCommand extends shared_1.AbstractCommand {
    getVideos(options) {
        const { page } = options;
        const path = '/api/v1/overviews/videos';
        const query = { page };
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.OverviewsCommand = OverviewsCommand;
