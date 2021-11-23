"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactAdministratorValidator = exports.serverGetValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const servers_1 = require("../../helpers/custom-validators/servers");
const users_1 = require("../../helpers/custom-validators/users");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const redis_1 = require("../../lib/redis");
const server_1 = require("../../models/server/server");
const shared_1 = require("./shared");
const serverGetValidator = [
    (0, express_validator_1.body)('host').custom(servers_1.isHostValid).withMessage('Should have a valid host'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking serverGetValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const server = yield server_1.ServerModel.loadByHost(req.body.host);
        if (!server) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Server host not found.'
            });
        }
        res.locals.server = server;
        return next();
    })
];
exports.serverGetValidator = serverGetValidator;
const contactAdministratorValidator = [
    (0, express_validator_1.body)('fromName')
        .custom(users_1.isUserDisplayNameValid).withMessage('Should have a valid name'),
    (0, express_validator_1.body)('fromEmail')
        .isEmail().withMessage('Should have a valid email'),
    (0, express_validator_1.body)('body')
        .custom(servers_1.isValidContactBody).withMessage('Should have a valid body'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking contactAdministratorValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (config_1.CONFIG.CONTACT_FORM.ENABLED === false) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'Contact form is not enabled on this instance.'
            });
        }
        if ((0, config_1.isEmailEnabled)() === false) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.CONFLICT_409,
                message: 'Emailer is not enabled on this instance.'
            });
        }
        if (yield redis_1.Redis.Instance.doesContactFormIpExist(req.ip)) {
            logger_1.logger.info('Refusing a contact form by %s: already sent one recently.', req.ip);
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'You already sent a contact form recently.'
            });
        }
        return next();
    })
];
exports.contactAdministratorValidator = contactAdministratorValidator;
