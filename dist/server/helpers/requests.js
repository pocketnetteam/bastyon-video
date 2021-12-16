"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImage = exports.doRequestAndSaveToFile = exports.doJSONRequest = exports.doRequest = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const got_1 = tslib_1.__importDefault(require("got"));
const hpagent_1 = require("hpagent");
const path_1 = require("path");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const core_utils_1 = require("./core-utils");
const image_utils_1 = require("./image-utils");
const logger_1 = require("./logger");
const proxy_1 = require("./proxy");
const httpSignature = require("http-signature");
const peertubeGot = got_1.default.extend(Object.assign(Object.assign({}, getAgent()), { headers: {
        "user-agent": getUserAgent()
    }, handlers: [
        (options, next) => {
            var _a;
            const promiseOrStream = next(options);
            const bodyKBLimit = (_a = options.context) === null || _a === void 0 ? void 0 : _a.bodyKBLimit;
            if (!bodyKBLimit)
                throw new Error("No KB limit for this request");
            const bodyLimit = bodyKBLimit * 1000;
            promiseOrStream.on("downloadProgress", (progress) => {
                if (progress.transferred > bodyLimit && progress.percent !== 1) {
                    const message = `Exceeded the download limit of ${bodyLimit} B`;
                    logger_1.logger.warn(message);
                    if (promiseOrStream.cancel) {
                        promiseOrStream.cancel();
                        return;
                    }
                    promiseOrStream.destroy();
                }
            });
            return promiseOrStream;
        }
    ], hooks: {
        beforeRequest: [
            (options) => {
                const headers = options.headers || {};
                headers["host"] = options.url.host;
            },
            (options) => {
                var _a, _b, _c;
                const httpSignatureOptions = (_a = options.context) === null || _a === void 0 ? void 0 : _a.httpSignature;
                if (httpSignatureOptions) {
                    const method = (_b = options.method) !== null && _b !== void 0 ? _b : "GET";
                    const path = (_c = options.path) !== null && _c !== void 0 ? _c : options.url.pathname;
                    if (!method || !path) {
                        throw new Error(`Cannot sign request without method (${method}) or path (${path}) ${options}`);
                    }
                    httpSignature.signRequest({
                        getHeader: function (header) {
                            return options.headers[header];
                        },
                        setHeader: function (header, value) {
                            options.headers[header] = value;
                        },
                        method,
                        path
                    }, httpSignatureOptions);
                }
            },
            (options) => {
                options.timeout = constants_1.REQUEST_TIMEOUT;
            }
        ]
    } }));
function doRequest(url, options = {}) {
    const gotOptions = buildGotOptions(options);
    return peertubeGot(url, gotOptions).catch((err) => {
        throw buildRequestError(err);
    });
}
exports.doRequest = doRequest;
function doJSONRequest(url, options = {}) {
    const gotOptions = buildGotOptions(options);
    return peertubeGot(url, Object.assign(Object.assign({}, gotOptions), { responseType: "json" })).catch((err) => {
        throw buildRequestError(err);
    });
}
exports.doJSONRequest = doJSONRequest;
function doRequestAndSaveToFile(url, destPath, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const gotOptions = buildGotOptions(options);
        const outFile = fs_extra_1.createWriteStream(destPath);
        try {
            yield core_utils_1.pipelinePromise(peertubeGot.stream(url, gotOptions), outFile);
        }
        catch (err) {
            fs_extra_1.remove(destPath).catch((err) => logger_1.logger.error("Cannot remove %s after request failure.", destPath, { err }));
            throw buildRequestError(err);
        }
    });
}
exports.doRequestAndSaveToFile = doRequestAndSaveToFile;
function downloadImage(url, destDir, destName, size) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tmpPath = path_1.join(config_1.CONFIG.STORAGE.TMP_DIR, "pending-" + destName);
        yield doRequestAndSaveToFile(url, tmpPath);
        const destPath = path_1.join(destDir, destName);
        try {
            yield image_utils_1.processImage(tmpPath, destPath, size);
        }
        catch (err) {
            yield fs_extra_1.remove(tmpPath);
            throw err;
        }
    });
}
exports.downloadImage = downloadImage;
function getAgent() {
    if (!proxy_1.isProxyEnabled())
        return {};
    const proxy = proxy_1.getProxy();
    logger_1.logger.info("Using proxy %s.", proxy);
    const proxyAgentOptions = {
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: "lifo",
        proxy
    };
    return {
        agent: {
            http: new hpagent_1.HttpProxyAgent(proxyAgentOptions),
            https: new hpagent_1.HttpsProxyAgent(proxyAgentOptions)
        }
    };
}
function getUserAgent() {
    return `PeerTube/${constants_1.PEERTUBE_VERSION} (+${constants_1.WEBSERVER.URL})`;
}
function buildGotOptions(options) {
    const { activityPub, bodyKBLimit = 1000 } = options;
    const context = { bodyKBLimit, httpSignature: options.httpSignature };
    let headers = options.headers || {};
    if (!headers.date) {
        headers = Object.assign(Object.assign({}, headers), { date: new Date().toUTCString() });
    }
    if (activityPub && !headers.accept) {
        headers = Object.assign(Object.assign({}, headers), { accept: constants_1.ACTIVITY_PUB.ACCEPT_HEADER });
    }
    return {
        method: options.method,
        dnsCache: true,
        json: options.json,
        searchParams: options.searchParams,
        headers,
        context
    };
}
function buildRequestError(error) {
    const newError = new Error(error.message);
    newError.name = error.name;
    newError.stack = error.stack;
    if (error.response) {
        newError.responseBody = error.response.body;
        newError.statusCode = error.response.statusCode;
    }
    return newError;
}
