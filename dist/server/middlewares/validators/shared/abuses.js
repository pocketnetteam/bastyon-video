"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesAbuseExist = void 0;
const tslib_1 = require("tslib");
const abuse_1 = require("@server/models/abuse/abuse");
const models_1 = require("@shared/models");
function doesAbuseExist(abuseId, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const abuse = yield abuse_1.AbuseModel.loadByIdWithReporter(parseInt(abuseId + '', 10));
        if (!abuse) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Abuse not found'
            });
            return false;
        }
        res.locals.abuse = abuse;
        return true;
    });
}
exports.doesAbuseExist = doesAbuseExist;
