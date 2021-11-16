"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserCanTerminateOwnershipChange = void 0;
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
function checkUserCanTerminateOwnershipChange(user, videoChangeOwnership, res) {
    if (videoChangeOwnership.NextOwner.userId === user.id) {
        return true;
    }
    res.fail({
        status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
        message: 'Cannot terminate an ownership change of another user'
    });
    return false;
}
exports.checkUserCanTerminateOwnershipChange = checkUserCanTerminateOwnershipChange;
