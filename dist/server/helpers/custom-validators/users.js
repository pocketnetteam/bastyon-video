"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserNoModal = exports.isUserDescriptionValid = exports.isUserDisplayNameValid = exports.isUserAutoPlayNextVideoPlaylistValid = exports.isUserAutoPlayNextVideoValid = exports.isUserAutoPlayVideoValid = exports.isUserWebTorrentEnabledValid = exports.isUserNSFWPolicyValid = exports.isUserEmailVerifiedValid = exports.isUserAdminFlagsValid = exports.isUserUsernameValid = exports.isUserVideoQuotaDailyValid = exports.isUserVideoQuotaValid = exports.isUserRoleValid = exports.isUserBlockedReasonValid = exports.isUserVideoLanguages = exports.isUserPasswordValidOrEmpty = exports.isUserPasswordValid = exports.isUserBlockedValid = exports.isUserVideosHistoryEnabledValid = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const shared_1 = require("../../../shared");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const misc_1 = require("./misc");
const USERS_CONSTRAINTS_FIELDS = constants_1.CONSTRAINTS_FIELDS.USERS;
function isUserPasswordValid(value) {
    return validator_1.default.isLength(value, USERS_CONSTRAINTS_FIELDS.PASSWORD);
}
exports.isUserPasswordValid = isUserPasswordValid;
function isUserPasswordValidOrEmpty(value) {
    if (value === '')
        return (0, config_1.isEmailEnabled)();
    return isUserPasswordValid(value);
}
exports.isUserPasswordValidOrEmpty = isUserPasswordValidOrEmpty;
function isUserVideoQuotaValid(value) {
    return (0, misc_1.exists)(value) && validator_1.default.isInt(value + '', USERS_CONSTRAINTS_FIELDS.VIDEO_QUOTA);
}
exports.isUserVideoQuotaValid = isUserVideoQuotaValid;
function isUserVideoQuotaDailyValid(value) {
    return (0, misc_1.exists)(value) && validator_1.default.isInt(value + '', USERS_CONSTRAINTS_FIELDS.VIDEO_QUOTA_DAILY);
}
exports.isUserVideoQuotaDailyValid = isUserVideoQuotaDailyValid;
function isUserUsernameValid(value) {
    const max = USERS_CONSTRAINTS_FIELDS.USERNAME.max;
    const min = USERS_CONSTRAINTS_FIELDS.USERNAME.min;
    return (0, misc_1.exists)(value) && validator_1.default.matches(value, new RegExp(`^[a-zA-Z0-9._]{${min},${max}}$`));
}
exports.isUserUsernameValid = isUserUsernameValid;
function isUserDisplayNameValid(value) {
    return value === null || ((0, misc_1.exists)(value) && validator_1.default.isLength(value, constants_1.CONSTRAINTS_FIELDS.USERS.NAME));
}
exports.isUserDisplayNameValid = isUserDisplayNameValid;
function isUserDescriptionValid(value) {
    return value === null || ((0, misc_1.exists)(value) && validator_1.default.isLength(value, constants_1.CONSTRAINTS_FIELDS.USERS.DESCRIPTION));
}
exports.isUserDescriptionValid = isUserDescriptionValid;
function isUserEmailVerifiedValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserEmailVerifiedValid = isUserEmailVerifiedValid;
const nsfwPolicies = (0, lodash_1.values)(constants_1.NSFW_POLICY_TYPES);
function isUserNSFWPolicyValid(value) {
    return (0, misc_1.exists)(value) && nsfwPolicies.includes(value);
}
exports.isUserNSFWPolicyValid = isUserNSFWPolicyValid;
function isUserWebTorrentEnabledValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserWebTorrentEnabledValid = isUserWebTorrentEnabledValid;
function isUserVideosHistoryEnabledValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserVideosHistoryEnabledValid = isUserVideosHistoryEnabledValid;
function isUserAutoPlayVideoValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserAutoPlayVideoValid = isUserAutoPlayVideoValid;
function isUserVideoLanguages(value) {
    return value === null || ((0, misc_1.isArray)(value) && value.length < constants_1.CONSTRAINTS_FIELDS.USERS.VIDEO_LANGUAGES.max);
}
exports.isUserVideoLanguages = isUserVideoLanguages;
function isUserAdminFlagsValid(value) {
    return (0, misc_1.exists)(value) && validator_1.default.isInt('' + value);
}
exports.isUserAdminFlagsValid = isUserAdminFlagsValid;
function isUserBlockedValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserBlockedValid = isUserBlockedValid;
function isUserAutoPlayNextVideoValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserAutoPlayNextVideoValid = isUserAutoPlayNextVideoValid;
function isUserAutoPlayNextVideoPlaylistValid(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserAutoPlayNextVideoPlaylistValid = isUserAutoPlayNextVideoPlaylistValid;
function isUserNoModal(value) {
    return (0, misc_1.isBooleanValid)(value);
}
exports.isUserNoModal = isUserNoModal;
function isUserBlockedReasonValid(value) {
    return value === null || ((0, misc_1.exists)(value) && validator_1.default.isLength(value, constants_1.CONSTRAINTS_FIELDS.USERS.BLOCKED_REASON));
}
exports.isUserBlockedReasonValid = isUserBlockedReasonValid;
function isUserRoleValid(value) {
    return (0, misc_1.exists)(value) && validator_1.default.isInt('' + value) && shared_1.UserRole[value] !== undefined;
}
exports.isUserRoleValid = isUserRoleValid;
