"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogsValidator = exports.getLogsValidator = void 0;
const express_validator_1 = require("express-validator");
const logs_1 = require("../../helpers/custom-validators/logs");
const misc_1 = require("../../helpers/custom-validators/misc");
const logger_1 = require("../../helpers/logger");
const shared_1 = require("./shared");
const getLogsValidator = [
    express_validator_1.query('startDate')
        .custom(misc_1.isDateValid).withMessage('Should have a start date that conforms to ISO 8601'),
    express_validator_1.query('level')
        .optional()
        .custom(logs_1.isValidLogLevel).withMessage('Should have a valid level'),
    express_validator_1.query('endDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have an end date that conforms to ISO 8601'),
    (req, res, next) => {
        logger_1.logger.debug('Checking getLogsValidator parameters.', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.getLogsValidator = getLogsValidator;
const getAuditLogsValidator = [
    express_validator_1.query('startDate')
        .custom(misc_1.isDateValid).withMessage('Should have a start date that conforms to ISO 8601'),
    express_validator_1.query('endDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a end date that conforms to ISO 8601'),
    (req, res, next) => {
        logger_1.logger.debug('Checking getAuditLogsValidator parameters.', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.getAuditLogsValidator = getAuditLogsValidator;
