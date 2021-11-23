"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEachUniqueHandleValid = exports.isRemoteHandleValid = exports.isFollowStateValid = void 0;
const misc_1 = require("./misc");
function isFollowStateValid(value) {
    if (!(0, misc_1.exists)(value))
        return false;
    return value === 'pending' || value === 'accepted';
}
exports.isFollowStateValid = isFollowStateValid;
function isRemoteHandleValid(value) {
    if (!(0, misc_1.exists)(value))
        return false;
    if (typeof value !== 'string')
        return false;
    return value.includes('@');
}
exports.isRemoteHandleValid = isRemoteHandleValid;
function isEachUniqueHandleValid(handles) {
    return (0, misc_1.isArray)(handles) &&
        handles.every(handle => {
            return isRemoteHandleValid(handle) && handles.indexOf(handle) === handles.lastIndexOf(handle);
        });
}
exports.isEachUniqueHandleValid = isEachUniqueHandleValid;
