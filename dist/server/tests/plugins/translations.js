"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test plugin translations', function () {
    let server;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            command = server.plugins;
            yield command.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath() });
            yield command.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-filter-translations') });
        });
    });
    it('Should not have translations for locale pt', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield command.getTranslations({ locale: 'pt' });
            expect(body).to.deep.equal({});
        });
    });
    it('Should have translations for locale fr', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield command.getTranslations({ locale: 'fr-FR' });
            expect(body).to.deep.equal({
                'peertube-plugin-test': {
                    Hi: 'Coucou'
                },
                'peertube-plugin-test-filter-translations': {
                    'Hello world': 'Bonjour le monde'
                }
            });
        });
    });
    it('Should have translations of locale it', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield command.getTranslations({ locale: 'it-IT' });
            expect(body).to.deep.equal({
                'peertube-plugin-test-filter-translations': {
                    'Hello world': 'Ciao, mondo!'
                }
            });
        });
    });
    it('Should remove the plugin and remove the locales', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield command.uninstall({ npmName: 'peertube-plugin-test-filter-translations' });
            {
                const body = yield command.getTranslations({ locale: 'fr-FR' });
                expect(body).to.deep.equal({
                    'peertube-plugin-test': {
                        Hi: 'Coucou'
                    }
                });
            }
            {
                const body = yield command.getTranslations({ locale: 'it-IT' });
                expect(body).to.deep.equal({});
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
