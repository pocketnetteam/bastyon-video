"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterHelpers = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const logger_1 = require("@server/helpers/logger");
const external_auth_1 = require("@server/lib/auth/external-auth");
const video_constant_manager_factory_1 = require("@server/lib/plugins/video-constant-manager-factory");
const plugin_1 = require("@server/models/server/plugin");
const models_1 = require("@shared/models");
const video_transcoding_profiles_1 = require("../transcoding/video-transcoding-profiles");
const plugin_helpers_builder_1 = require("./plugin-helpers-builder");
class RegisterHelpers {
    constructor(npmName, plugin, onHookAdded) {
        this.npmName = npmName;
        this.plugin = plugin;
        this.onHookAdded = onHookAdded;
        this.transcodingProfiles = {};
        this.transcodingEncoders = {};
        this.settings = [];
        this.idAndPassAuths = [];
        this.externalAuths = [];
        this.onSettingsChangeCallbacks = [];
        this.router = express_1.default.Router();
        this.videoConstantManagerFactory = new video_constant_manager_factory_1.VideoConstantManagerFactory(this.npmName);
    }
    buildRegisterHelpers() {
        const registerHook = this.buildRegisterHook();
        const registerSetting = this.buildRegisterSetting();
        const getRouter = this.buildGetRouter();
        const settingsManager = this.buildSettingsManager();
        const storageManager = this.buildStorageManager();
        const videoLanguageManager = this.videoConstantManagerFactory.createVideoConstantManager('language');
        const videoLicenceManager = this.videoConstantManagerFactory.createVideoConstantManager('licence');
        const videoCategoryManager = this.videoConstantManagerFactory.createVideoConstantManager('category');
        const videoPrivacyManager = this.videoConstantManagerFactory.createVideoConstantManager('privacy');
        const playlistPrivacyManager = this.videoConstantManagerFactory.createVideoConstantManager('playlistPrivacy');
        const transcodingManager = this.buildTranscodingManager();
        const registerIdAndPassAuth = this.buildRegisterIdAndPassAuth();
        const registerExternalAuth = this.buildRegisterExternalAuth();
        const unregisterIdAndPassAuth = this.buildUnregisterIdAndPassAuth();
        const unregisterExternalAuth = this.buildUnregisterExternalAuth();
        const peertubeHelpers = (0, plugin_helpers_builder_1.buildPluginHelpers)(this.plugin, this.npmName);
        return {
            registerHook,
            registerSetting,
            getRouter,
            settingsManager,
            storageManager,
            videoLanguageManager: Object.assign(Object.assign({}, videoLanguageManager), { addLanguage: videoLanguageManager.addConstant, deleteLanguage: videoLanguageManager.deleteConstant }),
            videoCategoryManager: Object.assign(Object.assign({}, videoCategoryManager), { addCategory: videoCategoryManager.addConstant, deleteCategory: videoCategoryManager.deleteConstant }),
            videoLicenceManager: Object.assign(Object.assign({}, videoLicenceManager), { addLicence: videoLicenceManager.addConstant, deleteLicence: videoLicenceManager.deleteConstant }),
            videoPrivacyManager: Object.assign(Object.assign({}, videoPrivacyManager), { deletePrivacy: videoPrivacyManager.deleteConstant }),
            playlistPrivacyManager: Object.assign(Object.assign({}, playlistPrivacyManager), { deletePlaylistPrivacy: playlistPrivacyManager.deleteConstant }),
            transcodingManager,
            registerIdAndPassAuth,
            registerExternalAuth,
            unregisterIdAndPassAuth,
            unregisterExternalAuth,
            peertubeHelpers
        };
    }
    reinitVideoConstants(npmName) {
        this.videoConstantManagerFactory.resetVideoConstants(npmName);
    }
    reinitTranscodingProfilesAndEncoders(npmName) {
        const profiles = this.transcodingProfiles[npmName];
        if (Array.isArray(profiles)) {
            for (const profile of profiles) {
                video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.removeProfile(profile);
            }
        }
        const encoders = this.transcodingEncoders[npmName];
        if (Array.isArray(encoders)) {
            for (const o of encoders) {
                video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.removeEncoderPriority(o.type, o.streamType, o.encoder, o.priority);
            }
        }
    }
    getSettings() {
        return this.settings;
    }
    getRouter() {
        return this.router;
    }
    getIdAndPassAuths() {
        return this.idAndPassAuths;
    }
    getExternalAuths() {
        return this.externalAuths;
    }
    getOnSettingsChangedCallbacks() {
        return this.onSettingsChangeCallbacks;
    }
    buildGetRouter() {
        return () => this.router;
    }
    buildRegisterSetting() {
        return (options) => {
            this.settings.push(options);
        };
    }
    buildRegisterHook() {
        return (options) => {
            if (models_1.serverHookObject[options.target] !== true) {
                logger_1.logger.warn('Unknown hook %s of plugin %s. Skipping.', options.target, this.npmName);
                return;
            }
            return this.onHookAdded(options);
        };
    }
    buildRegisterIdAndPassAuth() {
        return (options) => {
            if (!options.authName || typeof options.getWeight !== 'function' || typeof options.login !== 'function') {
                logger_1.logger.error('Cannot register auth plugin %s: authName, getWeight or login are not valid.', this.npmName, { options });
                return;
            }
            this.idAndPassAuths.push(options);
        };
    }
    buildRegisterExternalAuth() {
        const self = this;
        return (options) => {
            if (!options.authName || typeof options.authDisplayName !== 'function' || typeof options.onAuthRequest !== 'function') {
                logger_1.logger.error('Cannot register auth plugin %s: authName, authDisplayName or onAuthRequest are not valid.', this.npmName, { options });
                return;
            }
            this.externalAuths.push(options);
            return {
                userAuthenticated(result) {
                    (0, external_auth_1.onExternalUserAuthenticated)({
                        npmName: self.npmName,
                        authName: options.authName,
                        authResult: result
                    }).catch(err => {
                        logger_1.logger.error('Cannot execute onExternalUserAuthenticated.', { npmName: self.npmName, authName: options.authName, err });
                    });
                }
            };
        };
    }
    buildUnregisterExternalAuth() {
        return (authName) => {
            this.externalAuths = this.externalAuths.filter(a => a.authName !== authName);
        };
    }
    buildUnregisterIdAndPassAuth() {
        return (authName) => {
            this.idAndPassAuths = this.idAndPassAuths.filter(a => a.authName !== authName);
        };
    }
    buildSettingsManager() {
        return {
            getSetting: (name) => plugin_1.PluginModel.getSetting(this.plugin.name, this.plugin.type, name, this.settings),
            getSettings: (names) => plugin_1.PluginModel.getSettings(this.plugin.name, this.plugin.type, names, this.settings),
            setSetting: (name, value) => plugin_1.PluginModel.setSetting(this.plugin.name, this.plugin.type, name, value),
            onSettingsChange: (cb) => this.onSettingsChangeCallbacks.push(cb)
        };
    }
    buildStorageManager() {
        return {
            getData: (key) => plugin_1.PluginModel.getData(this.plugin.name, this.plugin.type, key),
            storeData: (key, data) => plugin_1.PluginModel.storeData(this.plugin.name, this.plugin.type, key, data)
        };
    }
    buildTranscodingManager() {
        const self = this;
        function addProfile(type, encoder, profile, builder) {
            if (profile === 'default') {
                logger_1.logger.error('A plugin cannot add a default live transcoding profile');
                return false;
            }
            video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.addProfile({
                type,
                encoder,
                profile,
                builder
            });
            if (!self.transcodingProfiles[self.npmName])
                self.transcodingProfiles[self.npmName] = [];
            self.transcodingProfiles[self.npmName].push({ type, encoder, profile });
            return true;
        }
        function addEncoderPriority(type, streamType, encoder, priority) {
            video_transcoding_profiles_1.VideoTranscodingProfilesManager.Instance.addEncoderPriority(type, streamType, encoder, priority);
            if (!self.transcodingEncoders[self.npmName])
                self.transcodingEncoders[self.npmName] = [];
            self.transcodingEncoders[self.npmName].push({ type, streamType, encoder, priority });
        }
        return {
            addLiveProfile(encoder, profile, builder) {
                return addProfile('live', encoder, profile, builder);
            },
            addVODProfile(encoder, profile, builder) {
                return addProfile('vod', encoder, profile, builder);
            },
            addLiveEncoderPriority(streamType, encoder, priority) {
                return addEncoderPriority('live', streamType, encoder, priority);
            },
            addVODEncoderPriority(streamType, encoder, priority) {
                return addEncoderPriority('vod', streamType, encoder, priority);
            },
            removeAllProfilesAndEncoderPriorities() {
                return self.reinitTranscodingProfilesAndEncoders(self.npmName);
            }
        };
    }
}
exports.RegisterHelpers = RegisterHelpers;
