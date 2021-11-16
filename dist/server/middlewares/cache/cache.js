"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheRouteFactory = exports.cacheRoute = void 0;
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const redis_1 = require("../../lib/redis");
const shared_1 = require("./shared");
redis_1.Redis.Instance.init();
const defaultOptions = {
    excludeStatus: [
        http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
        http_error_codes_1.HttpStatusCode.NOT_FOUND_404
    ]
};
function cacheRoute(duration) {
    const instance = new shared_1.ApiCache(defaultOptions);
    return instance.buildMiddleware(duration);
}
exports.cacheRoute = cacheRoute;
function cacheRouteFactory(options) {
    const instance = new shared_1.ApiCache(Object.assign(Object.assign({}, defaultOptions), options));
    return instance.buildMiddleware.bind(instance);
}
exports.cacheRouteFactory = cacheRouteFactory;
