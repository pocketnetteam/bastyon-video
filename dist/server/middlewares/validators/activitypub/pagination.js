"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apPaginationValidator = void 0;
const express_validator_1 = require("express-validator");
const constants_1 = require("@server/initializers/constants");
const logger_1 = require("../../../helpers/logger");
const shared_1 = require("../shared");
const apPaginationValidator = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Should have a valid page number'),
    (0, express_validator_1.query)('size')
        .optional()
        .isInt({ min: 0, max: constants_1.PAGINATION.OUTBOX.COUNT.MAX }).withMessage(`Should have a valid page size (max: ${constants_1.PAGINATION.OUTBOX.COUNT.MAX})`),
    (req, res, next) => {
        logger_1.logger.debug('Checking pagination parameters', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.apPaginationValidator = apPaginationValidator;
