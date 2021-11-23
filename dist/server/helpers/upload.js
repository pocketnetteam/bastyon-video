"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumableUploadPath = void 0;
const path_1 = require("path");
const constants_1 = require("../initializers/constants");
function getResumableUploadPath(filename) {
    if (filename)
        return (0, path_1.join)(constants_1.RESUMABLE_UPLOAD_DIRECTORY, filename);
    return constants_1.RESUMABLE_UPLOAD_DIRECTORY;
}
exports.getResumableUploadPath = getResumableUploadPath;
