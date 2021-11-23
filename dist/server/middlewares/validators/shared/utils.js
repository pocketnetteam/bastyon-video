"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPlaylistIdParam = exports.isValidVideoIdParam = exports.createSortableColumns = exports.checkSort = exports.areValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const misc_1 = require("@server/helpers/custom-validators/misc");
const logger_1 = require("../../../helpers/logger");
function areValidationErrors(req, res) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        logger_1.logger.warn('Incorrect request parameters', { path: req.originalUrl, err: errors.mapped() });
        res.fail({
            message: 'Incorrect request parameters: ' + Object.keys(errors.mapped()).join(', '),
            instance: req.originalUrl,
            data: {
                'invalid-params': errors.mapped()
            }
        });
        return true;
    }
    return false;
}
exports.areValidationErrors = areValidationErrors;
function checkSort(sortableColumns, tags = []) {
    return [
        (0, express_validator_1.query)('sort').optional().isIn(sortableColumns).withMessage('Should have correct sortable column'),
        (req, res, next) => {
            logger_1.logger.debug('Checking sort parameters', { parameters: req.query, tags });
            if (areValidationErrors(req, res))
                return;
            return next();
        }
    ];
}
exports.checkSort = checkSort;
function createSortableColumns(sortableColumns) {
    const sortableColumnDesc = sortableColumns.map(sortableColumn => '-' + sortableColumn);
    return sortableColumns.concat(sortableColumnDesc);
}
exports.createSortableColumns = createSortableColumns;
function isValidVideoIdParam(paramName) {
    return (0, express_validator_1.param)(paramName)
        .customSanitizer(misc_1.toCompleteUUID)
        .custom(misc_1.isIdOrUUIDValid).withMessage('Should have a valid video id');
}
exports.isValidVideoIdParam = isValidVideoIdParam;
function isValidPlaylistIdParam(paramName) {
    return (0, express_validator_1.param)(paramName)
        .customSanitizer(misc_1.toCompleteUUID)
        .custom(misc_1.isIdOrUUIDValid).withMessage('Should have a valid playlist id');
}
exports.isValidPlaylistIdParam = isValidPlaylistIdParam;
