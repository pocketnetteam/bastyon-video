"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCommand = void 0;
const path_1 = require("path");
const tests_1 = require("../miscs/tests");
const requests_1 = require("../requests/requests");
class AbstractCommand {
    constructor(server) {
        this.server = server;
    }
    getRequestBody(options) {
        return requests_1.unwrapBody(this.getRequest(options));
    }
    getRequestText(options) {
        return requests_1.unwrapText(this.getRequest(options));
    }
    getRawRequest(options) {
        const { url, range } = options;
        const { host, protocol, pathname } = new URL(url);
        return this.getRequest(Object.assign(Object.assign({}, options), { token: this.buildCommonRequestToken(options), defaultExpectedStatus: this.buildExpectedStatus(options), url: `${protocol}//${host}`, path: pathname, range }));
    }
    getRequest(options) {
        const { query } = options;
        return requests_1.makeGetRequest(Object.assign(Object.assign({}, this.buildCommonRequestOptions(options)), { query }));
    }
    deleteRequest(options) {
        const { query, rawQuery } = options;
        return requests_1.makeDeleteRequest(Object.assign(Object.assign({}, this.buildCommonRequestOptions(options)), { query,
            rawQuery }));
    }
    putBodyRequest(options) {
        const { fields } = options;
        return requests_1.makePutBodyRequest(Object.assign(Object.assign({}, this.buildCommonRequestOptions(options)), { fields }));
    }
    postBodyRequest(options) {
        const { fields } = options;
        return requests_1.makePostBodyRequest(Object.assign(Object.assign({}, this.buildCommonRequestOptions(options)), { fields }));
    }
    postUploadRequest(options) {
        const { fields, attaches } = options;
        return requests_1.makeUploadRequest(Object.assign(Object.assign({}, this.buildCommonRequestOptions(options)), { method: 'POST', fields,
            attaches }));
    }
    putUploadRequest(options) {
        const { fields, attaches } = options;
        return requests_1.makeUploadRequest(Object.assign(Object.assign({}, this.buildCommonRequestOptions(options)), { method: 'PUT', fields,
            attaches }));
    }
    updateImageRequest(options) {
        const filePath = path_1.isAbsolute(options.fixture)
            ? options.fixture
            : path_1.join(tests_1.root(), 'server', 'tests', 'fixtures', options.fixture);
        return this.postUploadRequest(Object.assign(Object.assign({}, options), { fields: {}, attaches: { [options.fieldname]: filePath } }));
    }
    buildCommonRequestOptions(options) {
        const { url, path, redirects, contentType, accept, range, host, headers, requestType, xForwardedFor } = options;
        return {
            url: url !== null && url !== void 0 ? url : this.server.url,
            path,
            token: this.buildCommonRequestToken(options),
            expectedStatus: this.buildExpectedStatus(options),
            redirects,
            contentType,
            range,
            host,
            accept,
            headers,
            type: requestType,
            xForwardedFor
        };
    }
    buildCommonRequestToken(options) {
        const { token } = options;
        const fallbackToken = options.implicitToken
            ? this.server.accessToken
            : undefined;
        return token !== undefined ? token : fallbackToken;
    }
    buildExpectedStatus(options) {
        const { expectedStatus, defaultExpectedStatus } = options;
        return expectedStatus !== undefined ? expectedStatus : defaultExpectedStatus;
    }
}
exports.AbstractCommand = AbstractCommand;
