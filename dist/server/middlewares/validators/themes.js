"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveThemeCSSValidator = void 0;
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const misc_1 = require("../../helpers/custom-validators/misc");
const plugins_1 = require("../../helpers/custom-validators/plugins");
const logger_1 = require("../../helpers/logger");
const plugin_manager_1 = require("../../lib/plugins/plugin-manager");
const shared_1 = require("./shared");
const serveThemeCSSValidator = [
    (0, express_validator_1.param)('themeName').custom(plugins_1.isPluginNameValid).withMessage('Should have a valid theme name'),
    (0, express_validator_1.param)('themeVersion').custom(plugins_1.isPluginVersionValid).withMessage('Should have a valid theme version'),
    (0, express_validator_1.param)('staticEndpoint').custom(misc_1.isSafePath).withMessage('Should have a valid static endpoint'),
    (req, res, next) => {
        logger_1.logger.debug('Checking serveThemeCSS parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const theme = plugin_manager_1.PluginManager.Instance.getRegisteredThemeByShortName(req.params.themeName);
        if (!theme || theme.version !== req.params.themeVersion) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'No theme named ' + req.params.themeName + ' was found with version ' + req.params.themeVersion
            });
        }
        if (theme.css.includes(req.params.staticEndpoint) === false) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'No static endpoint was found for this theme'
            });
        }
        res.locals.registeredPlugin = theme;
        return next();
    }
];
exports.serveThemeCSSValidator = serveThemeCSSValidator;
