"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatureValidator = void 0;
const express_validator_1 = require("express-validator");
const signature_1 = require("../../../helpers/custom-validators/activitypub/signature");
const misc_1 = require("../../../helpers/custom-validators/misc");
const logger_1 = require("../../../helpers/logger");
const shared_1 = require("../shared");
const signatureValidator = [
    (0, express_validator_1.body)('signature.type')
        .optional()
        .custom(signature_1.isSignatureTypeValid).withMessage('Should have a valid signature type'),
    (0, express_validator_1.body)('signature.created')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a signature created date that conforms to ISO 8601'),
    (0, express_validator_1.body)('signature.creator')
        .optional()
        .custom(signature_1.isSignatureCreatorValid).withMessage('Should have a valid signature creator'),
    (0, express_validator_1.body)('signature.signatureValue')
        .optional()
        .custom(signature_1.isSignatureValueValid).withMessage('Should have a valid signature value'),
    (req, res, next) => {
        logger_1.logger.debug('Checking Linked Data Signature parameter', { parameters: { signature: req.body.signature } });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.signatureValidator = signatureValidator;
