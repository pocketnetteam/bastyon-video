"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCatchable = exports.isPromise = void 0;
function isPromise(value) {
    return value && typeof value.then === 'function';
}
exports.isPromise = isPromise;
function isCatchable(value) {
    return value && typeof value.catch === 'function';
}
exports.isCatchable = isCatchable;
