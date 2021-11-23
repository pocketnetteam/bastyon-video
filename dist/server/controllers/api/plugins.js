"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const logger_1 = require("@server/helpers/logger");
const utils_1 = require("@server/helpers/utils");
const plugin_index_1 = require("@server/lib/plugins/plugin-index");
const plugin_manager_1 = require("@server/lib/plugins/plugin-manager");
const middlewares_1 = require("@server/middlewares");
const plugins_1 = require("@server/middlewares/validators/plugins");
const plugin_1 = require("@server/models/server/plugin");
const models_1 = require("@shared/models");
const pluginRouter = express_1.default.Router();
exports.pluginRouter = pluginRouter;
pluginRouter.get('/available', (0, middlewares_1.openapiOperationDoc)({ operationId: 'getAvailablePlugins' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), plugins_1.listAvailablePluginsValidator, middlewares_1.paginationValidator, middlewares_1.availablePluginsSortValidator, middlewares_1.setDefaultSort, middlewares_1.setDefaultPagination, (0, middlewares_1.asyncMiddleware)(listAvailablePlugins));
pluginRouter.get('/', (0, middlewares_1.openapiOperationDoc)({ operationId: 'getPlugins' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), plugins_1.listPluginsValidator, middlewares_1.paginationValidator, middlewares_1.pluginsSortValidator, middlewares_1.setDefaultSort, middlewares_1.setDefaultPagination, (0, middlewares_1.asyncMiddleware)(listPlugins));
pluginRouter.get('/:npmName/registered-settings', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), (0, middlewares_1.asyncMiddleware)(plugins_1.existingPluginValidator), getPluginRegisteredSettings);
pluginRouter.get('/:npmName/public-settings', (0, middlewares_1.asyncMiddleware)(plugins_1.existingPluginValidator), getPublicPluginSettings);
pluginRouter.put('/:npmName/settings', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), plugins_1.updatePluginSettingsValidator, (0, middlewares_1.asyncMiddleware)(plugins_1.existingPluginValidator), (0, middlewares_1.asyncMiddleware)(updatePluginSettings));
pluginRouter.get('/:npmName', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), (0, middlewares_1.asyncMiddleware)(plugins_1.existingPluginValidator), getPlugin);
pluginRouter.post('/install', (0, middlewares_1.openapiOperationDoc)({ operationId: 'addPlugin' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), plugins_1.installOrUpdatePluginValidator, (0, middlewares_1.asyncMiddleware)(installPlugin));
pluginRouter.post('/update', (0, middlewares_1.openapiOperationDoc)({ operationId: 'updatePlugin' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), plugins_1.installOrUpdatePluginValidator, (0, middlewares_1.asyncMiddleware)(updatePlugin));
pluginRouter.post('/uninstall', (0, middlewares_1.openapiOperationDoc)({ operationId: 'uninstallPlugin' }), middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(23), plugins_1.uninstallPluginValidator, (0, middlewares_1.asyncMiddleware)(uninstallPlugin));
function listPlugins(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const pluginType = req.query.pluginType;
        const uninstalled = req.query.uninstalled;
        const resultList = yield plugin_1.PluginModel.listForApi({
            pluginType,
            uninstalled,
            start: req.query.start,
            count: req.query.count,
            sort: req.query.sort
        });
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total));
    });
}
function getPlugin(req, res) {
    const plugin = res.locals.plugin;
    return res.json(plugin.toFormattedJSON());
}
function installPlugin(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        const fromDisk = !!body.path;
        const toInstall = body.npmName || body.path;
        try {
            const plugin = yield plugin_manager_1.PluginManager.Instance.install(toInstall, undefined, fromDisk);
            return res.json(plugin.toFormattedJSON());
        }
        catch (err) {
            logger_1.logger.warn('Cannot install plugin %s.', toInstall, { err });
            return res.fail({ message: 'Cannot install plugin ' + toInstall });
        }
    });
}
function updatePlugin(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        const fromDisk = !!body.path;
        const toUpdate = body.npmName || body.path;
        try {
            const plugin = yield plugin_manager_1.PluginManager.Instance.update(toUpdate, fromDisk);
            return res.json(plugin.toFormattedJSON());
        }
        catch (err) {
            logger_1.logger.warn('Cannot update plugin %s.', toUpdate, { err });
            return res.fail({ message: 'Cannot update plugin ' + toUpdate });
        }
    });
}
function uninstallPlugin(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        yield plugin_manager_1.PluginManager.Instance.uninstall(body.npmName);
        return res.status(models_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function getPublicPluginSettings(req, res) {
    const plugin = res.locals.plugin;
    const registeredSettings = plugin_manager_1.PluginManager.Instance.getRegisteredSettings(req.params.npmName);
    const publicSettings = plugin.getPublicSettings(registeredSettings);
    const json = { publicSettings };
    return res.json(json);
}
function getPluginRegisteredSettings(req, res) {
    const registeredSettings = plugin_manager_1.PluginManager.Instance.getRegisteredSettings(req.params.npmName);
    const json = { registeredSettings };
    return res.json(json);
}
function updatePluginSettings(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const plugin = res.locals.plugin;
        plugin.settings = req.body.settings;
        yield plugin.save();
        yield plugin_manager_1.PluginManager.Instance.onSettingsChanged(plugin.name, plugin.settings);
        return res.status(models_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
function listAvailablePlugins(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const query = req.query;
        const resultList = yield (0, plugin_index_1.listAvailablePluginsFromIndex)(query);
        if (!resultList) {
            return res.fail({
                status: models_1.HttpStatusCode.SERVICE_UNAVAILABLE_503,
                message: 'Plugin index unavailable. Please retry later'
            });
        }
        return res.json(resultList);
    });
}
