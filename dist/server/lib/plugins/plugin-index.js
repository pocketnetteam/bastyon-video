"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestPluginsVersion = exports.getLatestPluginVersion = exports.listAvailablePluginsFromIndex = void 0;
const tslib_1 = require("tslib");
const core_utils_1 = require("@server/helpers/core-utils");
const logger_1 = require("@server/helpers/logger");
const requests_1 = require("@server/helpers/requests");
const config_1 = require("@server/initializers/config");
const constants_1 = require("@server/initializers/constants");
const plugin_1 = require("@server/models/server/plugin");
const plugin_manager_1 = require("./plugin-manager");
function listAvailablePluginsFromIndex(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { start = 0, count = 20, search, sort = 'npmName', pluginType } = options;
        const searchParams = {
            start,
            count,
            sort,
            pluginType,
            search,
            currentPeerTubeEngine: options.currentPeerTubeEngine || constants_1.PEERTUBE_VERSION
        };
        const uri = config_1.CONFIG.PLUGINS.INDEX.URL + '/api/v1/plugins';
        try {
            const { body } = yield requests_1.doJSONRequest(uri, { searchParams });
            logger_1.logger.debug('Got result from PeerTube index.', { body });
            addInstanceInformation(body);
            return body;
        }
        catch (err) {
            logger_1.logger.error('Cannot list available plugins from index %s.', uri, { err });
            return undefined;
        }
    });
}
exports.listAvailablePluginsFromIndex = listAvailablePluginsFromIndex;
function addInstanceInformation(result) {
    for (const d of result.data) {
        d.installed = plugin_manager_1.PluginManager.Instance.isRegistered(d.npmName);
        d.name = plugin_1.PluginModel.normalizePluginName(d.npmName);
    }
    return result;
}
function getLatestPluginsVersion(npmNames) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const bodyRequest = {
            npmNames,
            currentPeerTubeEngine: constants_1.PEERTUBE_VERSION
        };
        const uri = core_utils_1.sanitizeUrl(config_1.CONFIG.PLUGINS.INDEX.URL) + '/api/v1/plugins/latest-version';
        const options = {
            json: bodyRequest,
            method: 'POST'
        };
        const { body } = yield requests_1.doJSONRequest(uri, options);
        return body;
    });
}
exports.getLatestPluginsVersion = getLatestPluginsVersion;
function getLatestPluginVersion(npmName) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const results = yield getLatestPluginsVersion([npmName]);
        if (Array.isArray(results) === false || results.length !== 1) {
            logger_1.logger.warn('Cannot get latest supported plugin version of %s.', npmName);
            return undefined;
        }
        return results[0].latestVersion;
    });
}
exports.getLatestPluginVersion = getLatestPluginVersion;
