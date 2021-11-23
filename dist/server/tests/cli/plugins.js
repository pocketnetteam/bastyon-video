"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("../../../shared/extra-utils");
describe('Test plugin scripts', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
        });
    });
    it('Should install a plugin from stateless CLI', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            const packagePath = extra_utils_1.PluginsCommand.getPluginTestPath();
            yield server.cli.execWithEnv(`npm run plugin:install -- --plugin-path ${packagePath}`);
        });
    });
    it('Should install a theme from stateless CLI', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield server.cli.execWithEnv(`npm run plugin:install -- --npm-name peertube-theme-background-red`);
        });
    });
    it('Should have the theme and the plugin registered when we restart peertube', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield (0, extra_utils_1.killallServers)([server]);
            yield server.run();
            const config = yield server.config.getConfig();
            const plugin = config.plugin.registered
                .find(p => p.name === 'test');
            (0, chai_1.expect)(plugin).to.not.be.undefined;
            const theme = config.theme.registered
                .find(t => t.name === 'background-red');
            (0, chai_1.expect)(theme).to.not.be.undefined;
        });
    });
    it('Should uninstall a plugin from stateless CLI', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            yield server.cli.execWithEnv(`npm run plugin:uninstall -- --npm-name peertube-plugin-test`);
        });
    });
    it('Should have removed the plugin on another peertube restart', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield (0, extra_utils_1.killallServers)([server]);
            yield server.run();
            const config = yield server.config.getConfig();
            const plugin = config.plugin.registered
                .find(p => p.name === 'test');
            (0, chai_1.expect)(plugin).to.be.undefined;
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
