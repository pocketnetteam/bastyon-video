"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class LogsCommand extends shared_1.AbstractCommand {
    getLogs(options) {
        const { startDate, endDate, level } = options;
        const path = '/api/v1/server/logs';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { startDate, endDate, level }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getAuditLogs(options) {
        const { startDate, endDate } = options;
        const path = '/api/v1/server/audit-logs';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { startDate, endDate }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.LogsCommand = LogsCommand;
