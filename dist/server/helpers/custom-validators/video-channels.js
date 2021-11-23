"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVideoChannelSupportValid = exports.isVideoChannelDisplayNameValid = exports.isVideoChannelDescriptionValid = exports.isVideoChannelUsernameValid = void 0;
const tslib_1 = require("tslib");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const constants_1 = require("../../initializers/constants");
const misc_1 = require("./misc");
const users_1 = require("./users");
const VIDEO_CHANNELS_CONSTRAINTS_FIELDS = constants_1.CONSTRAINTS_FIELDS.VIDEO_CHANNELS;
function isVideoChannelUsernameValid(value) {
    return (0, users_1.isUserUsernameValid)(value);
}
exports.isVideoChannelUsernameValid = isVideoChannelUsernameValid;
function isVideoChannelDescriptionValid(value) {
    return value === null || validator_1.default.isLength(value, VIDEO_CHANNELS_CONSTRAINTS_FIELDS.DESCRIPTION);
}
exports.isVideoChannelDescriptionValid = isVideoChannelDescriptionValid;
function isVideoChannelDisplayNameValid(value) {
    return (0, misc_1.exists)(value) && validator_1.default.isLength(value, VIDEO_CHANNELS_CONSTRAINTS_FIELDS.NAME);
}
exports.isVideoChannelDisplayNameValid = isVideoChannelDisplayNameValid;
function isVideoChannelSupportValid(value) {
    return value === null || ((0, misc_1.exists)(value) && validator_1.default.isLength(value, VIDEO_CHANNELS_CONSTRAINTS_FIELDS.SUPPORT));
}
exports.isVideoChannelSupportValid = isVideoChannelSupportValid;
