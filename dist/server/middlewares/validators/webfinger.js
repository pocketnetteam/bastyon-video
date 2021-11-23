"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webfingerValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const webfinger_1 = require("../../helpers/custom-validators/webfinger");
const express_utils_1 = require("../../helpers/express-utils");
const logger_1 = require("../../helpers/logger");
const actor_1 = require("../../models/actor/actor");
const shared_1 = require("./shared");
const webfingerValidator = [
    (0, express_validator_1.query)('resource').custom(webfinger_1.isWebfingerLocalResourceValid).withMessage('Should have a valid webfinger resource'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking webfinger parameters', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const nameWithHost = (0, express_utils_1.getHostWithPort)(req.query.resource.substr(5));
        const [name] = nameWithHost.split('@');
        const actor = yield actor_1.ActorModel.loadLocalUrlByName(name);
        if (!actor) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Actor not found'
            });
        }
        res.locals.actorUrl = actor;
        return next();
    })
];
exports.webfingerValidator = webfingerValidator;
