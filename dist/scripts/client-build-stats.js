"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const register_ts_paths_1 = require("../server/helpers/register-ts-paths");
(0, register_ts_paths_1.registerTSPaths)();
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
function run() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const result = {
            app: yield buildResult((0, path_1.join)((0, core_utils_1.root)(), 'client', 'dist', 'en-US')),
            embed: yield buildResult((0, path_1.join)((0, core_utils_1.root)(), 'client', 'dist', 'standalone', 'videos'))
        };
        console.log(JSON.stringify(result));
    });
}
run()
    .catch(err => console.error(err));
function buildResult(path) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const distFiles = yield (0, fs_extra_1.readdir)(path);
        const files = [];
        for (const file of distFiles) {
            const filePath = (0, path_1.join)(path, file);
            const statsResult = yield (0, fs_extra_1.stat)(filePath);
            files.push({
                name: file,
                size: statsResult.size
            });
        }
        return files;
    });
}
