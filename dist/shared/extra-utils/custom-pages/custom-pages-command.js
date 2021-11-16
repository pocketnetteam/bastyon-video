"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPagesCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class CustomPagesCommand extends shared_1.AbstractCommand {
    getInstanceHomepage(options = {}) {
        const path = '/api/v1/custom-pages/homepage/instance';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    updateInstanceHomepage(options) {
        const { content } = options;
        const path = '/api/v1/custom-pages/homepage/instance';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { content }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.CustomPagesCommand = CustomPagesCommand;
