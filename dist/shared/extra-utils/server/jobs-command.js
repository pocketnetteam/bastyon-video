"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsCommand = void 0;
const tslib_1 = require("tslib");
const core_utils_1 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class JobsCommand extends shared_1.AbstractCommand {
    getLatest(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.list(Object.assign(Object.assign({}, options), { start: 0, count: 1, sort: '-createdAt' }));
            if (data.length === 0)
                return undefined;
            return data[0];
        });
    }
    list(options = {}) {
        const path = this.buildJobsUrl(options.state);
        const query = core_utils_1.pick(options, ['start', 'count', 'sort', 'jobType']);
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    buildJobsUrl(state) {
        let path = '/api/v1/jobs';
        if (state)
            path += '/' + state;
        return path;
    }
}
exports.JobsCommand = JobsCommand;
