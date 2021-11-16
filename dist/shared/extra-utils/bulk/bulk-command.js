"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class BulkCommand extends shared_1.AbstractCommand {
    removeCommentsOf(options) {
        const { attributes } = options;
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path: '/api/v1/bulk/remove-comments-of', fields: attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.BulkCommand = BulkCommand;
