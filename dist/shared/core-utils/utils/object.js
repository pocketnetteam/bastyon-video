"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = void 0;
function pick(object, keys) {
    const result = {};
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            result[key] = object[key];
        }
    }
    return result;
}
exports.pick = pick;
