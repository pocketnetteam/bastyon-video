"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRemoveCommentsOfValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const bulk_1 = require("@server/helpers/custom-validators/bulk");
const models_1 = require("@shared/models");
const logger_1 = require("../../helpers/logger");
const shared_1 = require("./shared");
const bulkRemoveCommentsOfValidator = [
    (0, express_validator_1.body)('accountName').exists().withMessage('Should have an account name with host'),
    (0, express_validator_1.body)('scope')
        .custom(bulk_1.isBulkRemoveCommentsOfScopeValid).withMessage('Should have a valid scope'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking bulkRemoveCommentsOfValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!(yield (0, shared_1.doesAccountNameWithHostExist)(req.body.accountName, res)))
            return;
        const user = res.locals.oauth.token.User;
        const body = req.body;
        if (body.scope === 'instance' && user.hasRight(16) !== true) {
            return res.fail({
                status: models_1.HttpStatusCode.FORBIDDEN_403,
                message: 'User cannot remove any comments of this instance.'
            });
        }
        return next();
    })
];
exports.bulkRemoveCommentsOfValidator = bulkRemoveCommentsOfValidator;
