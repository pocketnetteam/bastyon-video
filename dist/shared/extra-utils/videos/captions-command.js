"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionsCommand = void 0;
const models_1 = require("@shared/models");
const miscs_1 = require("../miscs");
const shared_1 = require("../shared");
class CaptionsCommand extends shared_1.AbstractCommand {
    add(options) {
        const { videoId, language, fixture, mimeType } = options;
        const path = '/api/v1/videos/' + videoId + '/captions/' + language;
        const captionfile = miscs_1.buildAbsoluteFixturePath(fixture);
        const captionfileAttach = mimeType
            ? [captionfile, { contentType: mimeType }]
            : captionfile;
        return this.putUploadRequest(Object.assign(Object.assign({}, options), { path, fields: {}, attaches: {
                captionfile: captionfileAttach
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    list(options) {
        const { videoId } = options;
        const path = '/api/v1/videos/' + videoId + '/captions';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    delete(options) {
        const { videoId, language } = options;
        const path = '/api/v1/videos/' + videoId + '/captions/' + language;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.CaptionsCommand = CaptionsCommand;
