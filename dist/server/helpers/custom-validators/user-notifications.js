"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserNotificationTypeValid = exports.isUserNotificationSettingValid = void 0;
const tslib_1 = require("tslib");
const validator_1 = tslib_1.__importDefault(require("validator"));
const misc_1 = require("./misc");
function isUserNotificationTypeValid(value) {
    return misc_1.exists(value) && validator_1.default.isInt('' + value);
}
exports.isUserNotificationTypeValid = isUserNotificationTypeValid;
function isUserNotificationSettingValid(value) {
    return misc_1.exists(value) &&
        validator_1.default.isInt('' + value) &&
        (value === 0 ||
            value === 1 ||
            value === 2 ||
            value === (1 | 2));
}
exports.isUserNotificationSettingValid = isUserNotificationSettingValid;
