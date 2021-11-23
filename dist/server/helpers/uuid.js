"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isShortUUID = exports.shortToUUID = exports.uuidToShort = exports.buildUUID = void 0;
const tslib_1 = require("tslib");
const short_uuid_1 = (0, tslib_1.__importStar)(require("short-uuid"));
const translator = (0, short_uuid_1.default)();
function buildUUID() {
    return (0, short_uuid_1.uuid)();
}
exports.buildUUID = buildUUID;
function uuidToShort(uuid) {
    if (!uuid)
        return uuid;
    return translator.fromUUID(uuid);
}
exports.uuidToShort = uuidToShort;
function shortToUUID(shortUUID) {
    if (!shortUUID)
        return shortUUID;
    return translator.toUUID(shortUUID);
}
exports.shortToUUID = shortToUUID;
function isShortUUID(value) {
    if (!value)
        return false;
    return value.length === translator.maxLength;
}
exports.isShortUUID = isShortUUID;
