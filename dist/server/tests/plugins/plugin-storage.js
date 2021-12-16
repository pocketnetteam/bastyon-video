"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test plugin storage', function () {
    let server;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-six') });
        });
    });
    describe('DB storage', function () {
        it('Should correctly store a subkey', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.servers.waitUntilLog('superkey stored value is toto');
            });
        });
    });
    describe('Disk storage', function () {
        let dataPath;
        let pluginDataPath;
        function getFileContent() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const files = yield fs_extra_1.readdir(pluginDataPath);
                chai_1.expect(files).to.have.lengthOf(1);
                return fs_extra_1.readFile(path_1.join(pluginDataPath, files[0]), 'utf8');
            });
        }
        before(function () {
            dataPath = server.servers.buildDirectory('plugins/data');
            pluginDataPath = path_1.join(dataPath, 'peertube-plugin-test-six');
        });
        it('Should have created the directory on install', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const dataPath = server.servers.buildDirectory('plugins/data');
                const pluginDataPath = path_1.join(dataPath, 'peertube-plugin-test-six');
                chai_1.expect(yield fs_extra_1.pathExists(dataPath)).to.be.true;
                chai_1.expect(yield fs_extra_1.pathExists(pluginDataPath)).to.be.true;
                chai_1.expect(yield fs_extra_1.readdir(pluginDataPath)).to.have.lengthOf(0);
            });
        });
        it('Should have created a file', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: server.url,
                    token: server.accessToken,
                    path: '/plugins/test-six/router/create-file',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                const content = yield getFileContent();
                chai_1.expect(content).to.equal('Prince Ali');
            });
        });
        it('Should still have the file after an uninstallation', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-six' });
                const content = yield getFileContent();
                chai_1.expect(content).to.equal('Prince Ali');
            });
        });
        it('Should still have the file after the reinstallation', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-six') });
                const content = yield getFileContent();
                chai_1.expect(content).to.equal('Prince Ali');
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
