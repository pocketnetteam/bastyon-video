"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoPlaylistsListSearchValidator = exports.videoChannelsListSearchValidator = exports.videosSearchValidator = void 0;
const express_validator_1 = require("express-validator");
const search_1 = require("@server/helpers/custom-validators/search");
const servers_1 = require("@server/helpers/custom-validators/servers");
const misc_1 = require("../../helpers/custom-validators/misc");
const logger_1 = require("../../helpers/logger");
const shared_1 = require("./shared");
const videosSearchValidator = [
    (0, express_validator_1.query)('search').optional().not().isEmpty().withMessage('Should have a valid search'),
    (0, express_validator_1.query)('host')
        .optional()
        .custom(servers_1.isHostValid).withMessage('Should have a valid host'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a start date that conforms to ISO 8601'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a end date that conforms to ISO 8601'),
    (0, express_validator_1.query)('originallyPublishedStartDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a published start date that conforms to ISO 8601'),
    (0, express_validator_1.query)('originallyPublishedEndDate')
        .optional()
        .custom(misc_1.isDateValid).withMessage('Should have a published end date that conforms to ISO 8601'),
    (0, express_validator_1.query)('durationMin')
        .optional()
        .isInt().withMessage('Should have a valid min duration'),
    (0, express_validator_1.query)('durationMax')
        .optional()
        .isInt().withMessage('Should have a valid max duration'),
    (0, express_validator_1.query)('uuids')
        .optional()
        .toArray()
        .customSanitizer(misc_1.toCompleteUUIDs)
        .custom(misc_1.areUUIDsValid).withMessage('Should have valid uuids'),
    (0, express_validator_1.query)('searchTarget').optional().custom(search_1.isSearchTargetValid).withMessage('Should have a valid search target'),
    (req, res, next) => {
        logger_1.logger.debug('Checking videos search query', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.videosSearchValidator = videosSearchValidator;
const videoChannelsListSearchValidator = [
    (0, express_validator_1.query)('search')
        .optional()
        .not().isEmpty().withMessage('Should have a valid search'),
    (0, express_validator_1.query)('host')
        .optional()
        .custom(servers_1.isHostValid).withMessage('Should have a valid host'),
    (0, express_validator_1.query)('searchTarget')
        .optional()
        .custom(search_1.isSearchTargetValid).withMessage('Should have a valid search target'),
    (0, express_validator_1.query)('handles')
        .optional()
        .toArray()
        .custom(misc_1.isNotEmptyStringArray).withMessage('Should have valid handles'),
    (req, res, next) => {
        logger_1.logger.debug('Checking video channels search query', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.videoChannelsListSearchValidator = videoChannelsListSearchValidator;
const videoPlaylistsListSearchValidator = [
    (0, express_validator_1.query)('search')
        .optional()
        .not().isEmpty().withMessage('Should have a valid search'),
    (0, express_validator_1.query)('host')
        .optional()
        .custom(servers_1.isHostValid).withMessage('Should have a valid host'),
    (0, express_validator_1.query)('searchTarget')
        .optional()
        .custom(search_1.isSearchTargetValid).withMessage('Should have a valid search target'),
    (0, express_validator_1.query)('uuids')
        .optional()
        .toArray()
        .customSanitizer(misc_1.toCompleteUUIDs)
        .custom(misc_1.areUUIDsValid).withMessage('Should have valid uuids'),
    (req, res, next) => {
        logger_1.logger.debug('Checking video playlists search query', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.videoPlaylistsListSearchValidator = videoPlaylistsListSearchValidator;
