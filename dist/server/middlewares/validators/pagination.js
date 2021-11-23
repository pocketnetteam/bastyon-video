"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationValidatorBuilder = exports.paginationValidator = void 0;
const express_validator_1 = require("express-validator");
const constants_1 = require("@server/initializers/constants");
const logger_1 = require("../../helpers/logger");
const shared_1 = require("./shared");
const paginationValidator = paginationValidatorBuilder();
exports.paginationValidator = paginationValidator;
function paginationValidatorBuilder(tags = []) {
    return [
        (0, express_validator_1.query)('start')
            .optional()
            .isInt({ min: 0 }).withMessage('Should have a number start'),
        (0, express_validator_1.query)('count')
            .optional()
            .isInt({ min: 0, max: constants_1.PAGINATION.GLOBAL.COUNT.MAX }).withMessage(`Should have a number count (max: ${constants_1.PAGINATION.GLOBAL.COUNT.MAX})`),
        (req, res, next) => {
            logger_1.logger.debug('Checking pagination parameters', { parameters: req.query, tags });
            if ((0, shared_1.areValidationErrors)(req, res))
                return;
            return next();
        }
    ];
}
exports.paginationValidatorBuilder = paginationValidatorBuilder;
