"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCache = void 0;
const core_utils_1 = require("@server/helpers/core-utils");
const logger_1 = require("@server/helpers/logger");
const redis_1 = require("@server/lib/redis");
class ApiCache {
    constructor(options) {
        this.timers = {};
        this.index = { all: [] };
        this.options = Object.assign({ headerBlacklist: [], excludeStatus: [] }, options);
    }
    buildMiddleware(strDuration) {
        const duration = (0, core_utils_1.parseDurationToMs)(strDuration);
        return (req, res, next) => {
            const key = redis_1.Redis.Instance.getPrefix() + 'api-cache-' + req.originalUrl;
            const redis = redis_1.Redis.Instance.getClient();
            if (!redis.connected)
                return this.makeResponseCacheable(res, next, key, duration);
            try {
                redis.hgetall(key, (err, obj) => {
                    if (!err && obj && obj.response) {
                        return this.sendCachedResponse(req, res, JSON.parse(obj.response), duration);
                    }
                    return this.makeResponseCacheable(res, next, key, duration);
                });
            }
            catch (err) {
                return this.makeResponseCacheable(res, next, key, duration);
            }
        };
    }
    shouldCacheResponse(response) {
        if (!response)
            return false;
        if (this.options.excludeStatus.includes(response.statusCode))
            return false;
        return true;
    }
    addIndexEntries(key) {
        this.index.all.unshift(key);
    }
    filterBlacklistedHeaders(headers) {
        return Object.keys(headers)
            .filter(key => !this.options.headerBlacklist.includes(key))
            .reduce((acc, header) => {
            acc[header] = headers[header];
            return acc;
        }, {});
    }
    createCacheObject(status, headers, data, encoding) {
        return {
            status,
            headers: this.filterBlacklistedHeaders(headers),
            data,
            encoding,
            timestamp: new Date().getTime() / 1000
        };
    }
    cacheResponse(key, value, duration) {
        const redis = redis_1.Redis.Instance.getClient();
        if (redis.connected) {
            try {
                redis.hset(key, 'response', JSON.stringify(value));
                redis.hset(key, 'duration', duration + '');
                redis.expire(key, duration / 1000);
            }
            catch (err) {
                logger_1.logger.error('Cannot set cache in redis.', { err });
            }
        }
        this.timers[key] = setTimeout(() => this.clear(key), Math.min(duration, 2147483647));
    }
    accumulateContent(res, content) {
        if (!content)
            return;
        if (typeof content === 'string') {
            res.locals.apicache.content = (res.locals.apicache.content || '') + content;
            return;
        }
        if (Buffer.isBuffer(content)) {
            let oldContent = res.locals.apicache.content;
            if (typeof oldContent === 'string') {
                oldContent = Buffer.from(oldContent);
            }
            if (!oldContent) {
                oldContent = Buffer.alloc(0);
            }
            res.locals.apicache.content = Buffer.concat([oldContent, content], oldContent.length + content.length);
            return;
        }
        res.locals.apicache.content = content;
    }
    makeResponseCacheable(res, next, key, duration) {
        const self = this;
        res.locals.apicache = {
            write: res.write,
            writeHead: res.writeHead,
            end: res.end,
            cacheable: true,
            content: undefined,
            headers: {}
        };
        res.writeHead = function () {
            if (self.shouldCacheResponse(res)) {
                res.setHeader('cache-control', 'max-age=' + (duration / 1000).toFixed(0));
            }
            else {
                res.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
            }
            res.locals.apicache.headers = Object.assign({}, res.getHeaders());
            return res.locals.apicache.writeHead.apply(this, arguments);
        };
        res.write = function (chunk) {
            self.accumulateContent(res, chunk);
            return res.locals.apicache.write.apply(this, arguments);
        };
        res.end = function (content, encoding) {
            if (self.shouldCacheResponse(res)) {
                self.accumulateContent(res, content);
                if (res.locals.apicache.cacheable && res.locals.apicache.content) {
                    self.addIndexEntries(key);
                    const headers = res.locals.apicache.headers || res.getHeaders();
                    const cacheObject = self.createCacheObject(res.statusCode, headers, res.locals.apicache.content, encoding);
                    self.cacheResponse(key, cacheObject, duration);
                }
            }
            res.locals.apicache.end.apply(this, arguments);
        };
        next();
    }
    sendCachedResponse(request, response, cacheObject, duration) {
        const headers = response.getHeaders();
        if ((0, core_utils_1.isTestInstance)()) {
            Object.assign(headers, {
                'x-api-cache-cached': 'true'
            });
        }
        Object.assign(headers, this.filterBlacklistedHeaders(cacheObject.headers || {}), {
            'cache-control': 'max-age=' +
                Math.max(0, (duration / 1000 - (new Date().getTime() / 1000 - cacheObject.timestamp))).toFixed(0)
        });
        let data = cacheObject.data;
        if (data && data.type === 'Buffer') {
            data = typeof data.data === 'number'
                ? Buffer.alloc(data.data)
                : Buffer.from(data.data);
        }
        const cachedEtag = cacheObject.headers.etag;
        const requestEtag = request.headers['if-none-match'];
        if (requestEtag && cachedEtag === requestEtag) {
            response.writeHead(304, headers);
            return response.end();
        }
        response.writeHead(cacheObject.status || 200, headers);
        return response.end(data, cacheObject.encoding);
    }
    clear(target) {
        const redis = redis_1.Redis.Instance.getClient();
        if (target) {
            clearTimeout(this.timers[target]);
            delete this.timers[target];
            try {
                redis.del(target);
            }
            catch (err) {
                logger_1.logger.error('Cannot delete %s in redis cache.', target, { err });
            }
            this.index.all = this.index.all.filter(key => key !== target);
        }
        else {
            for (const key of this.index.all) {
                clearTimeout(this.timers[key]);
                delete this.timers[key];
                try {
                    redis.del(key);
                }
                catch (err) {
                    logger_1.logger.error('Cannot delete %s in redis cache.', key, { err });
                }
            }
            this.index.all = [];
        }
        return this.index;
    }
}
exports.ApiCache = ApiCache;
