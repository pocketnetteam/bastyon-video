"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseCache = void 0;
class PromiseCache {
    constructor(fn, keyBuilder) {
        this.fn = fn;
        this.keyBuilder = keyBuilder;
        this.running = new Map();
    }
    run(arg) {
        const key = this.keyBuilder(arg);
        if (this.running.has(key))
            return this.running.get(key);
        const p = this.fn(arg);
        this.running.set(key, p);
        return p.finally(() => this.running.delete(key));
    }
}
exports.PromiseCache = PromiseCache;
