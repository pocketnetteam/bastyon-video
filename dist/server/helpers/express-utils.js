"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountVideos = exports.cleanUpReqFiles = exports.createReqFiles = exports.badRequest = exports.isUserAbleToSearchRemoteURI = exports.getHostWithPort = exports.buildNSFWFilter = void 0;
const tslib_1 = require("tslib");
const multer_1 = tslib_1.__importStar(require("multer"));
const http_error_codes_1 = require("../../shared/models/http/http-error-codes");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const core_utils_1 = require("./core-utils");
const misc_1 = require("./custom-validators/misc");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
const video_1 = require("./video");
function buildNSFWFilter(res, paramNSFW) {
    if (paramNSFW === 'true')
        return true;
    if (paramNSFW === 'false')
        return false;
    if (paramNSFW === 'both')
        return undefined;
    if (res === null || res === void 0 ? void 0 : res.locals.oauth) {
        const user = res.locals.oauth.token.User;
        if (user.nsfwPolicy === 'do_not_list')
            return false;
        return undefined;
    }
    if (config_1.CONFIG.INSTANCE.DEFAULT_NSFW_POLICY === 'do_not_list')
        return false;
    return null;
}
exports.buildNSFWFilter = buildNSFWFilter;
function cleanUpReqFiles(req) {
    const filesObject = req.files;
    if (!filesObject)
        return;
    if (misc_1.isArray(filesObject)) {
        filesObject.forEach(f => utils_1.deleteFileAndCatch(f.path));
        return;
    }
    for (const key of Object.keys(filesObject)) {
        const files = filesObject[key];
        files.forEach(f => utils_1.deleteFileAndCatch(f.path));
    }
}
exports.cleanUpReqFiles = cleanUpReqFiles;
function getHostWithPort(host) {
    const splitted = host.split(':');
    if (splitted.length === 1) {
        if (constants_1.REMOTE_SCHEME.HTTP === 'https')
            return host + ':443';
        return host + ':80';
    }
    return host;
}
exports.getHostWithPort = getHostWithPort;
function badRequest(req, res) {
    return res.type('json')
        .status(http_error_codes_1.HttpStatusCode.BAD_REQUEST_400)
        .end();
}
exports.badRequest = badRequest;
function createReqFiles(fieldNames, mimeTypes, destinations) {
    const storage = multer_1.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destinations[file.fieldname]);
        },
        filename: (req, file, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let extension;
            const fileExtension = core_utils_1.getLowercaseExtension(file.originalname);
            const extensionFromMimetype = video_1.getExtFromMimetype(mimeTypes, file.mimetype);
            if (!extensionFromMimetype) {
                extension = fileExtension;
            }
            else {
                extension = extensionFromMimetype;
            }
            let randomString = '';
            try {
                randomString = yield utils_1.generateRandomString(16);
            }
            catch (err) {
                logger_1.logger.error('Cannot generate random string for file name.', { err });
                randomString = 'fake-random-string';
            }
            cb(null, randomString + extension);
        })
    });
    const fields = [];
    for (const fieldName of fieldNames) {
        fields.push({
            name: fieldName,
            maxCount: 1
        });
    }
    return multer_1.default({ storage }).fields(fields);
}
exports.createReqFiles = createReqFiles;
function isUserAbleToSearchRemoteURI(res) {
    const user = res.locals.oauth ? res.locals.oauth.token.User : undefined;
    return config_1.CONFIG.SEARCH.REMOTE_URI.ANONYMOUS === true ||
        (config_1.CONFIG.SEARCH.REMOTE_URI.USERS === true && user !== undefined);
}
exports.isUserAbleToSearchRemoteURI = isUserAbleToSearchRemoteURI;
function getCountVideos(req) {
    return req.query.skipCount !== true;
}
exports.getCountVideos = getCountVideos;
