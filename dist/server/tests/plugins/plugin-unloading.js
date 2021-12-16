"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test plugins module unloading', function () {
    let server = null;
    const requestPath = '/plugins/test-unloading/router/get';
    let value = null;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-unloading') });
        });
    });
    it('Should return a numeric value', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield extra_utils_1.makeGetRequest({
                url: server.url,
                path: requestPath,
                expectedStatus: models_1.HttpStatusCode.OK_200
            });
            chai_1.expect(res.body.message).to.match(/^\d+$/);
            value = res.body.message;
        });
    });
    it('Should return the same value the second time', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const res = yield extra_utils_1.makeGetRequest({
                url: server.url,
                path: requestPath,
                expectedStatus: models_1.HttpStatusCode.OK_200
            });
            chai_1.expect(res.body.message).to.be.equal(value);
        });
    });
    it('Should uninstall the plugin and free the route', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-unloading' });
            yield extra_utils_1.makeGetRequest({
                url: server.url,
                path: requestPath,
                expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
            });
        });
    });
    it('Should return a different numeric value', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-unloading') });
            const res = yield extra_utils_1.makeGetRequest({
                url: server.url,
                path: requestPath,
                expectedStatus: models_1.HttpStatusCode.OK_200
            });
            chai_1.expect(res.body.message).to.match(/^\d+$/);
            chai_1.expect(res.body.message).to.be.not.equal(value);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
