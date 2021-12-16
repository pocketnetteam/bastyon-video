"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsCommand = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class PluginsCommand extends shared_1.AbstractCommand {
    static getPluginTestPath(suffix = '') {
        return path_1.join(core_utils_1.root(), 'server', 'tests', 'fixtures', 'peertube-plugin-test' + suffix);
    }
    list(options) {
        const { start, count, sort, pluginType, uninstalled } = options;
        const path = '/api/v1/plugins';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: {
                start,
                count,
                sort,
                pluginType,
                uninstalled
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listAvailable(options) {
        const { start, count, sort, pluginType, search, currentPeerTubeEngine } = options;
        const path = '/api/v1/plugins/available';
        const query = {
            start,
            count,
            sort,
            pluginType,
            currentPeerTubeEngine,
            search
        };
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    get(options) {
        const path = '/api/v1/plugins/' + options.npmName;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    updateSettings(options) {
        const { npmName, settings } = options;
        const path = '/api/v1/plugins/' + npmName + '/settings';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { settings }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    getRegisteredSettings(options) {
        const path = '/api/v1/plugins/' + options.npmName + '/registered-settings';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getPublicSettings(options) {
        const { npmName } = options;
        const path = '/api/v1/plugins/' + npmName + '/public-settings';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getTranslations(options) {
        const { locale } = options;
        const path = '/plugins/translations/' + locale + '.json';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    install(options) {
        const { npmName, path } = options;
        const apiPath = '/api/v1/plugins/install';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path: apiPath, fields: { npmName, path }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    update(options) {
        const { npmName, path } = options;
        const apiPath = '/api/v1/plugins/update';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path: apiPath, fields: { npmName, path }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    uninstall(options) {
        const { npmName } = options;
        const apiPath = '/api/v1/plugins/uninstall';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path: apiPath, fields: { npmName }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    getCSS(options = {}) {
        const path = '/plugins/global.css';
        return this.getRequestText(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getExternalAuth(options) {
        const { npmName, npmVersion, authName, query } = options;
        const path = '/plugins/' + npmName + '/' + npmVersion + '/auth/' + authName;
        return this.getRequest(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200, redirects: 0 }));
    }
    updatePackageJSON(npmName, json) {
        const path = this.getPackageJSONPath(npmName);
        return fs_extra_1.writeJSON(path, json);
    }
    getPackageJSON(npmName) {
        const path = this.getPackageJSONPath(npmName);
        return fs_extra_1.readJSON(path);
    }
    getPackageJSONPath(npmName) {
        return this.server.servers.buildDirectory(path_1.join('plugins', 'node_modules', npmName, 'package.json'));
    }
}
exports.PluginsCommand = PluginsCommand;
