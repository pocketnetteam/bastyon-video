"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class DebugCommand extends shared_1.AbstractCommand {
    getDebug(options = {}) {
        const path = '/api/v1/server/debug';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    sendCommand(options) {
        const { body } = options;
        const path = '/api/v1/server/debug/run-command';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: body, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.DebugCommand = DebugCommand;
