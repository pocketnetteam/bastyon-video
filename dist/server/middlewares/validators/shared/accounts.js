"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesUserFeedTokenCorrespond = exports.doesAccountExist = exports.doesAccountNameWithHostExist = exports.doesLocalAccountNameExist = exports.doesAccountIdExist = void 0;
const tslib_1 = require("tslib");
const account_1 = require("@server/models/account/account");
const user_1 = require("@server/models/user/user");
const models_1 = require("@shared/models");
function doesAccountIdExist(id, res, sendNotFound = true) {
    const promise = account_1.AccountModel.load(parseInt(id + '', 10));
    return doesAccountExist(promise, res, sendNotFound);
}
exports.doesAccountIdExist = doesAccountIdExist;
function doesLocalAccountNameExist(name, res, sendNotFound = true) {
    const promise = account_1.AccountModel.loadLocalByName(name);
    return doesAccountExist(promise, res, sendNotFound);
}
exports.doesLocalAccountNameExist = doesLocalAccountNameExist;
function doesAccountNameWithHostExist(nameWithDomain, res, sendNotFound = true) {
    const promise = account_1.AccountModel.loadByNameWithHost(nameWithDomain);
    return doesAccountExist(promise, res, sendNotFound);
}
exports.doesAccountNameWithHostExist = doesAccountNameWithHostExist;
function doesAccountExist(p, res, sendNotFound) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const account = yield p;
        if (!account) {
            if (sendNotFound === true) {
                res.fail({
                    status: models_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'Account not found'
                });
            }
            return false;
        }
        res.locals.account = account;
        return true;
    });
}
exports.doesAccountExist = doesAccountExist;
function doesUserFeedTokenCorrespond(id, token, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const user = yield user_1.UserModel.loadByIdWithChannels(parseInt(id + '', 10));
        if (token !== user.feedToken) {
            res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: 'User and token mismatch'
            });
            return false;
        }
        res.locals.user = user;
        return true;
    });
}
exports.doesUserFeedTokenCorrespond = doesUserFeedTokenCorrespond;
