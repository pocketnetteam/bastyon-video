"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExternalAuthValidator = exports.listPluginsValidator = exports.installOrUpdatePluginValidator = exports.existingPluginValidator = exports.listAvailablePluginsValidator = exports.uninstallPluginValidator = exports.updatePluginSettingsValidator = exports.getPluginValidator = exports.pluginStaticDirectoryValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const misc_1 = require("../../helpers/custom-validators/misc");
const plugins_1 = require("../../helpers/custom-validators/plugins");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const plugin_manager_1 = require("../../lib/plugins/plugin-manager");
const plugin_1 = require("../../models/server/plugin");
const shared_1 = require("./shared");
const getPluginValidator = (pluginType, withVersion = true) => {
    const validators = [
        (0, express_validator_1.param)('pluginName').custom(plugins_1.isPluginNameValid).withMessage('Should have a valid plugin name')
    ];
    if (withVersion) {
        validators.push((0, express_validator_1.param)('pluginVersion').custom(plugins_1.isPluginVersionValid).withMessage('Should have a valid plugin version'));
    }
    return validators.concat([
        (req, res, next) => {
            logger_1.logger.debug('Checking getPluginValidator parameters', { parameters: req.params });
            if ((0, shared_1.areValidationErrors)(req, res))
                return;
            const npmName = plugin_1.PluginModel.buildNpmName(req.params.pluginName, pluginType);
            const plugin = plugin_manager_1.PluginManager.Instance.getRegisteredPluginOrTheme(npmName);
            if (!plugin) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'No plugin found named ' + npmName
                });
            }
            if (withVersion && plugin.version !== req.params.pluginVersion) {
                return res.fail({
                    status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                    message: 'No plugin found named ' + npmName + ' with version ' + req.params.pluginVersion
                });
            }
            res.locals.registeredPlugin = plugin;
            return next();
        }
    ]);
};
exports.getPluginValidator = getPluginValidator;
const getExternalAuthValidator = [
    (0, express_validator_1.param)('authName').custom(misc_1.exists).withMessage('Should have a valid auth name'),
    (req, res, next) => {
        logger_1.logger.debug('Checking getExternalAuthValidator parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const plugin = res.locals.registeredPlugin;
        if (!plugin.registerHelpers) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'No registered helpers were found for this plugin'
            });
        }
        const externalAuth = plugin.registerHelpers.getExternalAuths().find(a => a.authName === req.params.authName);
        if (!externalAuth) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'No external auths were found for this plugin'
            });
        }
        res.locals.externalAuth = externalAuth;
        return next();
    }
];
exports.getExternalAuthValidator = getExternalAuthValidator;
const pluginStaticDirectoryValidator = [
    (0, express_validator_1.param)('staticEndpoint').custom(misc_1.isSafePath).withMessage('Should have a valid static endpoint'),
    (req, res, next) => {
        logger_1.logger.debug('Checking pluginStaticDirectoryValidator parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.pluginStaticDirectoryValidator = pluginStaticDirectoryValidator;
const listPluginsValidator = [
    (0, express_validator_1.query)('pluginType')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(plugins_1.isPluginTypeValid).withMessage('Should have a valid plugin type'),
    (0, express_validator_1.query)('uninstalled')
        .optional()
        .customSanitizer(misc_1.toBooleanOrNull)
        .custom(misc_1.isBooleanValid).withMessage('Should have a valid uninstalled attribute'),
    (req, res, next) => {
        logger_1.logger.debug('Checking listPluginsValidator parameters', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.listPluginsValidator = listPluginsValidator;
const installOrUpdatePluginValidator = [
    (0, express_validator_1.body)('npmName')
        .optional()
        .custom(plugins_1.isNpmPluginNameValid).withMessage('Should have a valid npm name'),
    (0, express_validator_1.body)('path')
        .optional()
        .custom(misc_1.isSafePath).withMessage('Should have a valid safe path'),
    (req, res, next) => {
        logger_1.logger.debug('Checking installOrUpdatePluginValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const body = req.body;
        if (!body.path && !body.npmName) {
            return res.fail({ message: 'Should have either a npmName or a path' });
        }
        return next();
    }
];
exports.installOrUpdatePluginValidator = installOrUpdatePluginValidator;
const uninstallPluginValidator = [
    (0, express_validator_1.body)('npmName').custom(plugins_1.isNpmPluginNameValid).withMessage('Should have a valid npm name'),
    (req, res, next) => {
        logger_1.logger.debug('Checking uninstallPluginValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.uninstallPluginValidator = uninstallPluginValidator;
const existingPluginValidator = [
    (0, express_validator_1.param)('npmName').custom(plugins_1.isNpmPluginNameValid).withMessage('Should have a valid plugin name'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking enabledPluginValidator parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const plugin = yield plugin_1.PluginModel.loadByNpmName(req.params.npmName);
        if (!plugin) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Plugin not found'
            });
        }
        res.locals.plugin = plugin;
        return next();
    })
];
exports.existingPluginValidator = existingPluginValidator;
const updatePluginSettingsValidator = [
    (0, express_validator_1.body)('settings').exists().withMessage('Should have settings'),
    (req, res, next) => {
        logger_1.logger.debug('Checking enabledPluginValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.updatePluginSettingsValidator = updatePluginSettingsValidator;
const listAvailablePluginsValidator = [
    (0, express_validator_1.query)('search')
        .optional()
        .exists().withMessage('Should have a valid search'),
    (0, express_validator_1.query)('pluginType')
        .optional()
        .customSanitizer(misc_1.toIntOrNull)
        .custom(plugins_1.isPluginTypeValid).withMessage('Should have a valid plugin type'),
    (0, express_validator_1.query)('currentPeerTubeEngine')
        .optional()
        .custom(plugins_1.isPluginVersionValid).withMessage('Should have a valid current peertube engine'),
    (req, res, next) => {
        logger_1.logger.debug('Checking enabledPluginValidator parameters', { parameters: req.query });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (config_1.CONFIG.PLUGINS.INDEX.ENABLED === false) {
            return res.fail({ message: 'Plugin index is not enabled' });
        }
        return next();
    }
];
exports.listAvailablePluginsValidator = listAvailablePluginsValidator;
