"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHistoryRemoveValidator = exports.userHistoryListValidator = void 0;
const express_validator_1 = require("express-validator");
const misc_1 = require("../../helpers/custom-validators/misc");
const logger_1 = require("../../helpers/logger");
const shared_1 = require("./shared");
const userHistoryListValidator = [
    express_validator_1.query('search')
        .optional()
        .custom(misc_1.exists).withMessage('Should have a valid search'),
    (req, res, next) => {
        logger_1.logger.debug('Checking userHistoryListValidator parameters', { parameters: req.query });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.userHistoryListValidator = userHistoryListValidator;
const userHistoryRemoveValidator = [
    express_validator_1.body('beforeDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a before date that conforms to ISO 8601'),
    (req, res, next) => {
        logger_1.logger.debug('Checking userHistoryRemoveValidator parameters', { parameters: req.body });
        if (shared_1.areValidationErrors(req, res))
            return;
        return next();
    }
];
exports.userHistoryRemoveValidator = userHistoryRemoveValidator;
