"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensCache = void 0;
const tslib_1 = require("tslib");
const lru_cache_1 = (0, tslib_1.__importDefault)(require("lru-cache"));
const constants_1 = require("../../initializers/constants");
class TokensCache {
    constructor() {
        this.accessTokenCache = new lru_cache_1.default({ max: constants_1.LRU_CACHE.USER_TOKENS.MAX_SIZE });
        this.userHavingToken = new lru_cache_1.default({ max: constants_1.LRU_CACHE.USER_TOKENS.MAX_SIZE });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
    hasToken(token) {
        return this.accessTokenCache.has(token);
    }
    getByToken(token) {
        return this.accessTokenCache.get(token);
    }
    setToken(token) {
        this.accessTokenCache.set(token.accessToken, token);
        this.userHavingToken.set(token.userId, token.accessToken);
    }
    deleteUserToken(userId) {
        this.clearCacheByUserId(userId);
    }
    clearCacheByUserId(userId) {
        const token = this.userHavingToken.get(userId);
        if (token !== undefined) {
            this.accessTokenCache.del(token);
            this.userHavingToken.del(userId);
        }
    }
    clearCacheByToken(token) {
        const tokenModel = this.accessTokenCache.get(token);
        if (tokenModel !== undefined) {
            this.userHavingToken.del(tokenModel.userId);
            this.accessTokenCache.del(token);
        }
    }
}
exports.TokensCache = TokensCache;
