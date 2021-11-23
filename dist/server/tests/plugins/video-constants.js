"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test plugin altering video constants', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-video-constants') });
        });
    });
    it('Should have updated languages', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const languages = yield server.videos.getLanguages();
            expect(languages['en']).to.not.exist;
            expect(languages['fr']).to.not.exist;
            expect(languages['al_bhed']).to.equal('Al Bhed');
            expect(languages['al_bhed2']).to.equal('Al Bhed 2');
            expect(languages['al_bhed3']).to.not.exist;
        });
    });
    it('Should have updated categories', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const categories = yield server.videos.getCategories();
            expect(categories[1]).to.not.exist;
            expect(categories[2]).to.not.exist;
            expect(categories[42]).to.equal('Best category');
            expect(categories[43]).to.equal('High best category');
        });
    });
    it('Should have updated licences', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const licences = yield server.videos.getLicences();
            expect(licences[1]).to.not.exist;
            expect(licences[7]).to.not.exist;
            expect(licences[42]).to.equal('Best licence');
            expect(licences[43]).to.equal('High best licence');
        });
    });
    it('Should have updated video privacies', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const privacies = yield server.videos.getPrivacies();
            expect(privacies[1]).to.exist;
            expect(privacies[2]).to.not.exist;
            expect(privacies[3]).to.exist;
            expect(privacies[4]).to.exist;
        });
    });
    it('Should have updated playlist privacies', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const playlistPrivacies = yield server.playlists.getPrivacies();
            expect(playlistPrivacies[1]).to.exist;
            expect(playlistPrivacies[2]).to.exist;
            expect(playlistPrivacies[3]).to.not.exist;
        });
    });
    it('Should not be able to create a video with this privacy', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = { name: 'video', privacy: 2 };
            yield server.videos.upload({ attributes, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should not be able to create a video with this privacy', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = { displayName: 'video playlist', privacy: 3 };
            yield server.playlists.create({ attributes, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
        });
    });
    it('Should be able to upload a video with these values', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const attributes = { name: 'video', category: 42, licence: 42, language: 'al_bhed2' };
            const { uuid } = yield server.videos.upload({ attributes });
            const video = yield server.videos.get({ id: uuid });
            expect(video.language.label).to.equal('Al Bhed 2');
            expect(video.licence.label).to.equal('Best licence');
            expect(video.category.label).to.equal('Best category');
        });
    });
    it('Should uninstall the plugin and reset languages, categories, licences and privacies', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.plugins.uninstall({ npmName: 'peertube-plugin-test-video-constants' });
            {
                const languages = yield server.videos.getLanguages();
                expect(languages['en']).to.equal('English');
                expect(languages['fr']).to.equal('French');
                expect(languages['al_bhed']).to.not.exist;
                expect(languages['al_bhed2']).to.not.exist;
                expect(languages['al_bhed3']).to.not.exist;
            }
            {
                const categories = yield server.videos.getCategories();
                expect(categories[1]).to.equal('Music');
                expect(categories[2]).to.equal('Films');
                expect(categories[42]).to.not.exist;
                expect(categories[43]).to.not.exist;
            }
            {
                const licences = yield server.videos.getLicences();
                expect(licences[1]).to.equal('Attribution');
                expect(licences[7]).to.equal('Public Domain Dedication');
                expect(licences[42]).to.not.exist;
                expect(licences[43]).to.not.exist;
            }
            {
                const privacies = yield server.videos.getPrivacies();
                expect(privacies[1]).to.exist;
                expect(privacies[2]).to.exist;
                expect(privacies[3]).to.exist;
                expect(privacies[4]).to.exist;
            }
            {
                const playlistPrivacies = yield server.playlists.getPrivacies();
                expect(playlistPrivacies[1]).to.exist;
                expect(playlistPrivacies[2]).to.exist;
                expect(playlistPrivacies[3]).to.exist;
            }
        });
    });
    it('Should be able to reset categories', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield server.plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath('-video-constants') });
            {
                const categories = yield server.videos.getCategories();
                expect(categories[1]).to.not.exist;
                expect(categories[2]).to.not.exist;
                expect(categories[42]).to.exist;
                expect(categories[43]).to.exist;
            }
            yield (0, extra_utils_1.makeGetRequest)({
                url: server.url,
                token: server.accessToken,
                path: '/plugins/test-video-constants/router/reset-categories',
                expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204
            });
            {
                const categories = yield server.videos.getCategories();
                expect(categories[1]).to.exist;
                expect(categories[2]).to.exist;
                expect(categories[42]).to.not.exist;
                expect(categories[43]).to.not.exist;
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
