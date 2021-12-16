"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSearchTargetValid = exports.isBooleanBothQueryValid = exports.isStringArray = exports.isNumberArray = void 0;
const tslib_1 = require("tslib");
const validator_1 = tslib_1.__importDefault(require("validator"));
const misc_1 = require("./misc");
const config_1 = require("@server/initializers/config");
function isNumberArray(value) {
    return misc_1.isArray(value) && value.every(v => validator_1.default.isInt('' + v));
}
exports.isNumberArray = isNumberArray;
function isStringArray(value) {
    return misc_1.isArray(value) && value.every(v => typeof v === 'string');
}
exports.isStringArray = isStringArray;
function isBooleanBothQueryValid(value) {
    return value === 'true' || value === 'false' || value === 'both';
}
exports.isBooleanBothQueryValid = isBooleanBothQueryValid;
function isSearchTargetValid(value) {
    if (!misc_1.exists(value))
        return true;
    const searchIndexConfig = config_1.CONFIG.SEARCH.SEARCH_INDEX;
    if (value === 'local' && (!searchIndexConfig.ENABLED || !searchIndexConfig.DISABLE_LOCAL_SEARCH))
        return true;
    if (value === 'search-index' && searchIndexConfig.ENABLED)
        return true;
    return false;
}
exports.isSearchTargetValid = isSearchTargetValid;
