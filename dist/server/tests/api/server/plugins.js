"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test plugins', function () {
    let server = null;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            const configOverride = {
                plugins: {
                    index: { check_latest_versions_interval: '5 seconds' }
                }
            };
            server = yield (0, extra_utils_1.createSingleServer)(1, configOverride);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            command = server.plugins;
        });
    });
    it('Should list and search available plugins and themes', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            {
                const body = yield command.listAvailable({
                    count: 1,
                    start: 0,
                    pluginType: models_1.PluginType.THEME,
                    search: 'background-red'
                });
                expect(body.total).to.be.at.least(1);
                expect(body.data).to.have.lengthOf(1);
            }
            {
                const body1 = yield command.listAvailable({
                    count: 2,
                    start: 0,
                    sort: 'npmName'
                });
                expect(body1.total).to.be.at.least(2);
                const data1 = body1.data;
                expect(data1).to.have.lengthOf(2);
                const body2 = yield command.listAvailable({
                    count: 2,
                    start: 0,
                    sort: '-npmName'
                });
                expect(body2.total).to.be.at.least(2);
                const data2 = body2.data;
                expect(data2).to.have.lengthOf(2);
                expect(data1[0].npmName).to.not.equal(data2[0].npmName);
            }
            {
                const body = yield command.listAvailable({
                    count: 10,
                    start: 0,
                    pluginType: models_1.PluginType.THEME,
                    search: 'background-red',
                    currentPeerTubeEngine: '1.0.0'
                });
                const p = body.data.find(p => p.npmName === 'peertube-theme-background-red');
                expect(p).to.be.undefined;
            }
        });
    });
    it('Should install a plugin and a theme', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield command.install({ npmName: 'peertube-plugin-hello-world' });
            yield command.install({ npmName: 'peertube-theme-background-red' });
        });
    });
    it('Should have the plugin loaded in the configuration', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            const theme = config.theme.registered.find(r => r.name === 'background-red');
            expect(theme).to.not.be.undefined;
            const plugin = config.plugin.registered.find(r => r.name === 'hello-world');
            expect(plugin).to.not.be.undefined;
        });
    });
    it('Should update the default theme in the configuration', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.config.updateCustomSubConfig({
                newConfig: {
                    theme: { default: 'background-red' }
                }
            });
            const config = yield server.config.getConfig();
            expect(config.theme.default).to.equal('background-red');
        });
    });
    it('Should update my default theme', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.users.updateMe({ theme: 'background-red' });
            const user = yield server.users.getMyInfo();
            expect(user.theme).to.equal('background-red');
        });
    });
    it('Should list plugins and themes', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield command.list({
                    count: 1,
                    start: 0,
                    pluginType: models_1.PluginType.THEME
                });
                expect(body.total).to.be.at.least(1);
                const data = body.data;
                expect(data).to.have.lengthOf(1);
                expect(data[0].name).to.equal('background-red');
            }
            {
                const { data } = yield command.list({
                    count: 2,
                    start: 0,
                    sort: 'name'
                });
                expect(data[0].name).to.equal('background-red');
                expect(data[1].name).to.equal('hello-world');
            }
            {
                const body = yield command.list({
                    count: 2,
                    start: 1,
                    sort: 'name'
                });
                expect(body.data[0].name).to.equal('hello-world');
            }
        });
    });
    it('Should get registered settings', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.testHelloWorldRegisteredSettings)(server);
        });
    });
    it('Should get public settings', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield command.getPublicSettings({ npmName: 'peertube-plugin-hello-world' });
            const publicSettings = body.publicSettings;
            expect(Object.keys(publicSettings)).to.have.lengthOf(1);
            expect(Object.keys(publicSettings)).to.deep.equal(['user-name']);
            expect(publicSettings['user-name']).to.be.null;
        });
    });
    it('Should update the settings', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const settings = {
                'admin-name': 'Cid'
            };
            yield command.updateSettings({
                npmName: 'peertube-plugin-hello-world',
                settings
            });
        });
    });
    it('Should have watched settings changes', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield server.servers.waitUntilLog('Settings changed!');
        });
    });
    it('Should get a plugin and a theme', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const plugin = yield command.get({ npmName: 'peertube-plugin-hello-world' });
                expect(plugin.type).to.equal(models_1.PluginType.PLUGIN);
                expect(plugin.name).to.equal('hello-world');
                expect(plugin.description).to.exist;
                expect(plugin.homepage).to.exist;
                expect(plugin.uninstalled).to.be.false;
                expect(plugin.enabled).to.be.true;
                expect(plugin.description).to.exist;
                expect(plugin.version).to.exist;
                expect(plugin.peertubeEngine).to.exist;
                expect(plugin.createdAt).to.exist;
                expect(plugin.settings).to.not.be.undefined;
                expect(plugin.settings['admin-name']).to.equal('Cid');
            }
            {
                const plugin = yield command.get({ npmName: 'peertube-theme-background-red' });
                expect(plugin.type).to.equal(models_1.PluginType.THEME);
                expect(plugin.name).to.equal('background-red');
                expect(plugin.description).to.exist;
                expect(plugin.homepage).to.exist;
                expect(plugin.uninstalled).to.be.false;
                expect(plugin.enabled).to.be.true;
                expect(plugin.description).to.exist;
                expect(plugin.version).to.exist;
                expect(plugin.peertubeEngine).to.exist;
                expect(plugin.createdAt).to.exist;
                expect(plugin.settings).to.be.null;
            }
        });
    });
    it('Should update the plugin and the theme', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(90000);
            yield (0, extra_utils_1.wait)(6000);
            yield server.sql.setPluginVersion('hello-world', '0.0.1');
            const packageJSON = yield command.getPackageJSON('peertube-plugin-hello-world');
            const oldVersion = packageJSON.version;
            packageJSON.version = '0.0.1';
            yield command.updatePackageJSON('peertube-plugin-hello-world', packageJSON);
            yield (0, extra_utils_1.killallServers)([server]);
            yield server.run();
            {
                const body = yield command.list({ pluginType: models_1.PluginType.PLUGIN });
                const plugin = body.data[0];
                expect(plugin.version).to.equal('0.0.1');
                expect(plugin.latestVersion).to.exist;
                expect(plugin.latestVersion).to.not.equal('0.0.1');
            }
            {
                yield command.update({ npmName: 'peertube-plugin-hello-world' });
                const body = yield command.list({ pluginType: models_1.PluginType.PLUGIN });
                const plugin = body.data[0];
                expect(plugin.version).to.equal(oldVersion);
                const updatedPackageJSON = yield command.getPackageJSON('peertube-plugin-hello-world');
                expect(updatedPackageJSON.version).to.equal(oldVersion);
            }
        });
    });
    it('Should uninstall the plugin', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield command.uninstall({ npmName: 'peertube-plugin-hello-world' });
            const body = yield command.list({ pluginType: models_1.PluginType.PLUGIN });
            expect(body.total).to.equal(0);
            expect(body.data).to.have.lengthOf(0);
        });
    });
    it('Should list uninstalled plugins', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield command.list({ pluginType: models_1.PluginType.PLUGIN, uninstalled: true });
            expect(body.total).to.equal(1);
            expect(body.data).to.have.lengthOf(1);
            const plugin = body.data[0];
            expect(plugin.name).to.equal('hello-world');
            expect(plugin.enabled).to.be.false;
            expect(plugin.uninstalled).to.be.true;
        });
    });
    it('Should uninstall the theme', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield command.uninstall({ npmName: 'peertube-theme-background-red' });
        });
    });
    it('Should have updated the configuration', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const config = yield server.config.getConfig();
            expect(config.theme.default).to.equal('default');
            const theme = config.theme.registered.find(r => r.name === 'background-red');
            expect(theme).to.be.undefined;
            const plugin = config.plugin.registered.find(r => r.name === 'hello-world');
            expect(plugin).to.be.undefined;
        });
    });
    it('Should have updated the user theme', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const user = yield server.users.getMyInfo();
            expect(user.theme).to.equal('instance-default');
        });
    });
    it('Should not install a broken plugin', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            function check() {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield command.list({ pluginType: models_1.PluginType.PLUGIN });
                    const plugins = body.data;
                    expect(plugins.find(p => p.name === 'test-broken')).to.not.exist;
                });
            }
            yield command.install({
                path: extra_utils_1.PluginsCommand.getPluginTestPath('-broken'),
                expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
            });
            yield check();
            yield (0, extra_utils_1.killallServers)([server]);
            yield server.run();
            yield check();
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
