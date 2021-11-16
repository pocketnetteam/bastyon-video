"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class FeedCommand extends shared_1.AbstractCommand {
    getXML(options) {
        const { feed, format } = options;
        const path = '/feeds/' + feed + '.xml';
        return this.getRequestText(Object.assign(Object.assign({}, options), { path, query: format ? { format } : undefined, accept: 'application/xml', implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getJSON(options) {
        const { feed, query } = options;
        const path = '/feeds/' + feed + '.json';
        return this.getRequestText(Object.assign(Object.assign({}, options), { path,
            query, accept: 'application/json', implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.FeedCommand = FeedCommand;
