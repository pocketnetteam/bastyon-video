"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class StatsCommand extends shared_1.AbstractCommand {
    get(options = {}) {
        const { useCache = false } = options;
        const path = '/api/v1/server/stats';
        const query = {
            t: useCache ? undefined : new Date().getTime()
        };
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.StatsCommand = StatsCommand;
