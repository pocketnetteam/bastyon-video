"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test plugin helpers', function () {
    let server;
    const basePaths = [
        '/plugins/test-five/router/',
        '/plugins/test-five/0.0.1/router/'
    ];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-five') });
        });
    });
    it('Should answer "pong"', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const path of basePaths) {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: path + 'ping',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                (0, chai_1.expect)(res.body.message).to.equal('pong');
            }
        });
    });
    it('Should check if authenticated', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const path of basePaths) {
                const res = yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: path + 'is-authenticated',
                    token: server.accessToken,
                    expectedStatus: 200
                });
                (0, chai_1.expect)(res.body.isAuthenticated).to.equal(true);
                const secRes = yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: path + 'is-authenticated',
                    expectedStatus: 200
                });
                (0, chai_1.expect)(secRes.body.isAuthenticated).to.equal(false);
            }
        });
    });
    it('Should mirror post body', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = {
                hello: 'world',
                riri: 'fifi',
                loulou: 'picsou'
            };
            for (const path of basePaths) {
                const res = yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path: path + 'form/post/mirror',
                    fields: body,
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                (0, chai_1.expect)(res.body).to.deep.equal(body);
            }
        });
    });
    it('Should remove the plugin and remove the routes', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-five' });
            for (const path of basePaths) {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: path + 'ping',
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
                yield (0, extra_utils_1.makePostBodyRequest)({
                    url: server.url,
                    path: path + 'ping',
                    fields: {},
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404
                });
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
