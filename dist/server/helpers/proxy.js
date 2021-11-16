"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProxyEnabled = exports.getProxy = void 0;
function getProxy() {
    return process.env.HTTPS_PROXY ||
        process.env.HTTP_PROXY ||
        undefined;
}
exports.getProxy = getProxy;
function isProxyEnabled() {
    return !!getProxy();
}
exports.isProxyEnabled = isProxyEnabled;
