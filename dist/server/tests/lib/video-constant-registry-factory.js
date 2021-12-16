"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const video_constant_manager_factory_1 = require("@server/lib/plugins/video-constant-manager-factory");
const constants_1 = require("@server/initializers/constants");
describe('VideoConstantManagerFactory', function () {
    const factory = new video_constant_manager_factory_1.VideoConstantManagerFactory('peertube-plugin-constants');
    afterEach(() => {
        factory.resetVideoConstants('peertube-plugin-constants');
    });
    describe('VideoCategoryManager', () => {
        const videoCategoryManager = factory.createVideoConstantManager('category');
        it('Should be able to list all video category constants', () => {
            const constants = videoCategoryManager.getConstants();
            chai_1.expect(constants).to.deep.equal(constants_1.VIDEO_CATEGORIES);
        });
        it('Should be able to delete a video category constant', () => {
            const successfullyDeleted = videoCategoryManager.deleteConstant(1);
            chai_1.expect(successfullyDeleted).to.be.true;
            chai_1.expect(videoCategoryManager.getConstantValue(1)).to.be.undefined;
        });
        it('Should be able to add a video category constant', () => {
            const successfullyAdded = videoCategoryManager.addConstant(42, 'The meaning of life');
            chai_1.expect(successfullyAdded).to.be.true;
            chai_1.expect(videoCategoryManager.getConstantValue(42)).to.equal('The meaning of life');
        });
        it('Should be able to reset video category constants', () => {
            videoCategoryManager.deleteConstant(1);
            videoCategoryManager.resetConstants();
            chai_1.expect(videoCategoryManager.getConstantValue(1)).not.be.undefined;
        });
    });
    describe('VideoLicenceManager', () => {
        const videoLicenceManager = factory.createVideoConstantManager('licence');
        it('Should be able to list all video licence constants', () => {
            const constants = videoLicenceManager.getConstants();
            chai_1.expect(constants).to.deep.equal(constants_1.VIDEO_LICENCES);
        });
        it('Should be able to delete a video licence constant', () => {
            const successfullyDeleted = videoLicenceManager.deleteConstant(1);
            chai_1.expect(successfullyDeleted).to.be.true;
            chai_1.expect(videoLicenceManager.getConstantValue(1)).to.be.undefined;
        });
        it('Should be able to add a video licence constant', () => {
            const successfullyAdded = videoLicenceManager.addConstant(42, 'European Union Public Licence');
            chai_1.expect(successfullyAdded).to.be.true;
            chai_1.expect(videoLicenceManager.getConstantValue(42)).to.equal('European Union Public Licence');
        });
        it('Should be able to reset video licence constants', () => {
            videoLicenceManager.deleteConstant(1);
            videoLicenceManager.resetConstants();
            chai_1.expect(videoLicenceManager.getConstantValue(1)).not.be.undefined;
        });
    });
    describe('PlaylistPrivacyManager', () => {
        const playlistPrivacyManager = factory.createVideoConstantManager('playlistPrivacy');
        it('Should be able to list all video playlist privacy constants', () => {
            const constants = playlistPrivacyManager.getConstants();
            chai_1.expect(constants).to.deep.equal(constants_1.VIDEO_PLAYLIST_PRIVACIES);
        });
        it('Should be able to delete a video playlist privacy constant', () => {
            const successfullyDeleted = playlistPrivacyManager.deleteConstant(1);
            chai_1.expect(successfullyDeleted).to.be.true;
            chai_1.expect(playlistPrivacyManager.getConstantValue(1)).to.be.undefined;
        });
        it('Should be able to add a video playlist privacy constant', () => {
            const successfullyAdded = playlistPrivacyManager.addConstant(42, 'Friends only');
            chai_1.expect(successfullyAdded).to.be.true;
            chai_1.expect(playlistPrivacyManager.getConstantValue(42)).to.equal('Friends only');
        });
        it('Should be able to reset video playlist privacy constants', () => {
            playlistPrivacyManager.deleteConstant(1);
            playlistPrivacyManager.resetConstants();
            chai_1.expect(playlistPrivacyManager.getConstantValue(1)).not.be.undefined;
        });
    });
    describe('VideoPrivacyManager', () => {
        const videoPrivacyManager = factory.createVideoConstantManager('privacy');
        it('Should be able to list all video privacy constants', () => {
            const constants = videoPrivacyManager.getConstants();
            chai_1.expect(constants).to.deep.equal(constants_1.VIDEO_PRIVACIES);
        });
        it('Should be able to delete a video privacy constant', () => {
            const successfullyDeleted = videoPrivacyManager.deleteConstant(1);
            chai_1.expect(successfullyDeleted).to.be.true;
            chai_1.expect(videoPrivacyManager.getConstantValue(1)).to.be.undefined;
        });
        it('Should be able to add a video privacy constant', () => {
            const successfullyAdded = videoPrivacyManager.addConstant(42, 'Friends only');
            chai_1.expect(successfullyAdded).to.be.true;
            chai_1.expect(videoPrivacyManager.getConstantValue(42)).to.equal('Friends only');
        });
        it('Should be able to reset video privacy constants', () => {
            videoPrivacyManager.deleteConstant(1);
            videoPrivacyManager.resetConstants();
            chai_1.expect(videoPrivacyManager.getConstantValue(1)).not.be.undefined;
        });
    });
    describe('VideoLanguageManager', () => {
        const videoLanguageManager = factory.createVideoConstantManager('language');
        it('Should be able to list all video language constants', () => {
            const constants = videoLanguageManager.getConstants();
            chai_1.expect(constants).to.deep.equal(constants_1.VIDEO_LANGUAGES);
        });
        it('Should be able to add a video language constant', () => {
            const successfullyAdded = videoLanguageManager.addConstant('fr', 'Fr occitan');
            chai_1.expect(successfullyAdded).to.be.true;
            chai_1.expect(videoLanguageManager.getConstantValue('fr')).to.equal('Fr occitan');
        });
        it('Should be able to delete a video language constant', () => {
            videoLanguageManager.addConstant('fr', 'Fr occitan');
            const successfullyDeleted = videoLanguageManager.deleteConstant('fr');
            chai_1.expect(successfullyDeleted).to.be.true;
            chai_1.expect(videoLanguageManager.getConstantValue('fr')).to.be.undefined;
        });
        it('Should be able to reset video language constants', () => {
            videoLanguageManager.addConstant('fr', 'Fr occitan');
            videoLanguageManager.resetConstants();
            chai_1.expect(videoLanguageManager.getConstantValue('fr')).to.be.undefined;
        });
    });
});
