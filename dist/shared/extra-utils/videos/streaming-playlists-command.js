"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingPlaylistsCommand = void 0;
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class StreamingPlaylistsCommand extends shared_1.AbstractCommand {
    get(options) {
        return (0, requests_1.unwrapTextOrDecode)(this.getRawRequest(Object.assign(Object.assign({}, options), { url: options.url, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    getSegment(options) {
        return (0, requests_1.unwrapBody)(this.getRawRequest(Object.assign(Object.assign({}, options), { url: options.url, range: options.range, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    getSegmentSha256(options) {
        return (0, requests_1.unwrapBodyOrDecodeToJSON)(this.getRawRequest(Object.assign(Object.assign({}, options), { url: options.url, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
}
exports.StreamingPlaylistsCommand = StreamingPlaylistsCommand;
