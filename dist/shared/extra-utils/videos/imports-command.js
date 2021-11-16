"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsCommand = void 0;
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class ImportsCommand extends shared_1.AbstractCommand {
    importVideo(options) {
        const { attributes } = options;
        const path = '/api/v1/videos/imports';
        let attaches = {};
        if (attributes.torrentfile)
            attaches = { torrentfile: attributes.torrentfile };
        return requests_1.unwrapBody(this.postUploadRequest(Object.assign(Object.assign({}, options), { path,
            attaches, fields: options.attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    getMyVideoImports(options = {}) {
        const { sort } = options;
        const path = '/api/v1/users/me/videos/imports';
        const query = {};
        if (sort)
            query['sort'] = sort;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { sort }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.ImportsCommand = ImportsCommand;
