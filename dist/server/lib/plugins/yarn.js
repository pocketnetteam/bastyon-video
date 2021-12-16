"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNpmPlugin = exports.installNpmPluginFromDisk = exports.installNpmPlugin = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("../../helpers/core-utils");
const plugins_1 = require("../../helpers/custom-validators/plugins");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const plugin_index_1 = require("./plugin-index");
function installNpmPlugin(npmName, versionArg) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        checkNpmPluginNameOrThrow(npmName);
        if (versionArg)
            checkPluginVersionOrThrow(versionArg);
        const version = versionArg || (yield plugin_index_1.getLatestPluginVersion(npmName));
        let toInstall = npmName;
        if (version)
            toInstall += `@${version}`;
        const { stdout } = yield execYarn('add ' + toInstall);
        logger_1.logger.debug('Added a yarn package.', { yarnStdout: stdout });
    });
}
exports.installNpmPlugin = installNpmPlugin;
function installNpmPluginFromDisk(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield execYarn('add file:' + path);
    });
}
exports.installNpmPluginFromDisk = installNpmPluginFromDisk;
function removeNpmPlugin(name) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        checkNpmPluginNameOrThrow(name);
        yield execYarn('remove ' + name);
    });
}
exports.removeNpmPlugin = removeNpmPlugin;
function execYarn(command) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const pluginDirectory = config_1.CONFIG.STORAGE.PLUGINS_DIR;
            const pluginPackageJSON = path_1.join(pluginDirectory, 'package.json');
            if (!(yield fs_extra_1.pathExists(pluginPackageJSON))) {
                yield fs_extra_1.outputJSON(pluginPackageJSON, {});
            }
            return core_utils_1.execShell(`yarn ${command}`, { cwd: pluginDirectory });
        }
        catch (result) {
            logger_1.logger.error('Cannot exec yarn.', { command, err: result.err, stderr: result.stderr });
            throw result.err;
        }
    });
}
function checkNpmPluginNameOrThrow(name) {
    if (!plugins_1.isNpmPluginNameValid(name))
        throw new Error('Invalid NPM plugin name to install');
}
function checkPluginVersionOrThrow(name) {
    if (!plugins_1.isPluginVersionValid(name))
        throw new Error('Invalid NPM plugin version to install');
}
