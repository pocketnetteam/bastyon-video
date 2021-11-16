"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoConstantManagerFactory = void 0;
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const constantsHash = {
    language: constants_1.VIDEO_LANGUAGES,
    licence: constants_1.VIDEO_LICENCES,
    category: constants_1.VIDEO_CATEGORIES,
    privacy: constants_1.VIDEO_PRIVACIES,
    playlistPrivacy: constants_1.VIDEO_PLAYLIST_PRIVACIES
};
class VideoConstantManagerFactory {
    constructor(npmName) {
        this.npmName = npmName;
        this.updatedVideoConstants = {
            playlistPrivacy: {},
            privacy: {},
            language: {},
            licence: {},
            category: {}
        };
    }
    resetVideoConstants(npmName) {
        const types = ['language', 'licence', 'category', 'privacy', 'playlistPrivacy'];
        for (const type of types) {
            this.resetConstants({ npmName, type });
        }
    }
    resetConstants(parameters) {
        const { npmName, type } = parameters;
        const updatedConstants = this.updatedVideoConstants[type][npmName];
        if (!updatedConstants)
            return;
        for (const added of updatedConstants.added) {
            delete constantsHash[type][added.key];
        }
        for (const deleted of updatedConstants.deleted) {
            constantsHash[type][deleted.key] = deleted.label;
        }
        delete this.updatedVideoConstants[type][npmName];
    }
    createVideoConstantManager(type) {
        const { npmName } = this;
        return {
            addConstant: (key, label) => this.addConstant({ npmName, type, key, label }),
            deleteConstant: (key) => this.deleteConstant({ npmName, type, key }),
            getConstantValue: (key) => constantsHash[type][key],
            getConstants: () => constantsHash[type],
            resetConstants: () => this.resetConstants({ npmName, type })
        };
    }
    addConstant(parameters) {
        const { npmName, type, key, label } = parameters;
        const obj = constantsHash[type];
        if (obj[key]) {
            logger_1.logger.warn('Cannot add %s %s by plugin %s: key already exists.', type, npmName, key);
            return false;
        }
        if (!this.updatedVideoConstants[type][npmName]) {
            this.updatedVideoConstants[type][npmName] = {
                added: [],
                deleted: []
            };
        }
        this.updatedVideoConstants[type][npmName].added.push({ key: key, label });
        obj[key] = label;
        return true;
    }
    deleteConstant(parameters) {
        const { npmName, type, key } = parameters;
        const obj = constantsHash[type];
        if (!obj[key]) {
            logger_1.logger.warn('Cannot delete %s by plugin %s: key %s does not exist.', type, npmName, key);
            return false;
        }
        if (!this.updatedVideoConstants[type][npmName]) {
            this.updatedVideoConstants[type][npmName] = {
                added: [],
                deleted: []
            };
        }
        const updatedConstants = this.updatedVideoConstants[type][npmName];
        const alreadyAdded = updatedConstants.added.find(a => a.key === key);
        if (alreadyAdded) {
            updatedConstants.added.filter(a => a.key !== key);
        }
        else if (obj[key]) {
            updatedConstants.deleted.push({ key, label: obj[key] });
        }
        delete obj[key];
        return true;
    }
}
exports.VideoConstantManagerFactory = VideoConstantManagerFactory;
