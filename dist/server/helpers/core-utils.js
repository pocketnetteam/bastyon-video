"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEven = exports.isOdd = exports.parseSemVersion = exports.pipelinePromise = exports.execPromise = exports.execPromise2 = exports.getPublicKey = exports.createPrivateKey = exports.randomBytesPromise = exports.promisify2 = exports.promisify1 = exports.promisify0 = exports.sha1 = exports.sha256 = exports.peertubeTruncate = exports.pageToStartAndCount = exports.execShell = exports.sanitizeHost = exports.sanitizeUrl = exports.getLowercaseExtension = exports.buildPath = exports.root = exports.mapToJSON = exports.objectConverter = exports.getAppNumber = exports.isProdInstance = exports.isTestInstance = exports.parseBytes = exports.parseDurationToMs = void 0;
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const lodash_1 = require("lodash");
const path_1 = require("path");
const pem_1 = require("pem");
const stream_1 = require("stream");
const url_1 = require("url");
const util_1 = require("util");
const objectConverter = (oldObject, keyConverter, valueConverter) => {
    if (!oldObject || typeof oldObject !== 'object') {
        return valueConverter(oldObject);
    }
    if (Array.isArray(oldObject)) {
        return oldObject.map(e => objectConverter(e, keyConverter, valueConverter));
    }
    const newObject = {};
    Object.keys(oldObject).forEach(oldKey => {
        const newKey = keyConverter(oldKey);
        newObject[newKey] = objectConverter(oldObject[oldKey], keyConverter, valueConverter);
    });
    return newObject;
};
exports.objectConverter = objectConverter;
function mapToJSON(map) {
    const obj = {};
    for (const [k, v] of map) {
        obj[k] = v;
    }
    return obj;
}
exports.mapToJSON = mapToJSON;
const timeTable = {
    ms: 1,
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 3600000 * 24,
    week: 3600000 * 24 * 7,
    month: 3600000 * 24 * 30
};
function parseDurationToMs(duration) {
    if (duration === null)
        return null;
    if (typeof duration === 'number')
        return duration;
    if (typeof duration === 'string') {
        const split = duration.match(/^([\d.,]+)\s?(\w+)$/);
        if (split.length === 3) {
            const len = parseFloat(split[1]);
            let unit = split[2].replace(/s$/i, '').toLowerCase();
            if (unit === 'm') {
                unit = 'ms';
            }
            return (len || 1) * (timeTable[unit] || 0);
        }
    }
    throw new Error(`Duration ${duration} could not be properly parsed`);
}
exports.parseDurationToMs = parseDurationToMs;
function parseBytes(value) {
    if (typeof value === 'number')
        return value;
    const tgm = /^(\d+)\s*TB\s*(\d+)\s*GB\s*(\d+)\s*MB$/;
    const tg = /^(\d+)\s*TB\s*(\d+)\s*GB$/;
    const tm = /^(\d+)\s*TB\s*(\d+)\s*MB$/;
    const gm = /^(\d+)\s*GB\s*(\d+)\s*MB$/;
    const t = /^(\d+)\s*TB$/;
    const g = /^(\d+)\s*GB$/;
    const m = /^(\d+)\s*MB$/;
    const b = /^(\d+)\s*B$/;
    let match;
    if (value.match(tgm)) {
        match = value.match(tgm);
        return parseInt(match[1], 10) * 1024 * 1024 * 1024 * 1024 +
            parseInt(match[2], 10) * 1024 * 1024 * 1024 +
            parseInt(match[3], 10) * 1024 * 1024;
    }
    else if (value.match(tg)) {
        match = value.match(tg);
        return parseInt(match[1], 10) * 1024 * 1024 * 1024 * 1024 +
            parseInt(match[2], 10) * 1024 * 1024 * 1024;
    }
    else if (value.match(tm)) {
        match = value.match(tm);
        return parseInt(match[1], 10) * 1024 * 1024 * 1024 * 1024 +
            parseInt(match[2], 10) * 1024 * 1024;
    }
    else if (value.match(gm)) {
        match = value.match(gm);
        return parseInt(match[1], 10) * 1024 * 1024 * 1024 +
            parseInt(match[2], 10) * 1024 * 1024;
    }
    else if (value.match(t)) {
        match = value.match(t);
        return parseInt(match[1], 10) * 1024 * 1024 * 1024 * 1024;
    }
    else if (value.match(g)) {
        match = value.match(g);
        return parseInt(match[1], 10) * 1024 * 1024 * 1024;
    }
    else if (value.match(m)) {
        match = value.match(m);
        return parseInt(match[1], 10) * 1024 * 1024;
    }
    else if (value.match(b)) {
        match = value.match(b);
        return parseInt(match[1], 10) * 1024;
    }
    else {
        return parseInt(value, 10);
    }
}
exports.parseBytes = parseBytes;
function sanitizeUrl(url) {
    const urlObject = new url_1.URL(url);
    if (urlObject.protocol === 'https:' && urlObject.port === '443') {
        urlObject.port = '';
    }
    else if (urlObject.protocol === 'http:' && urlObject.port === '80') {
        urlObject.port = '';
    }
    return urlObject.href.replace(/\/$/, '');
}
exports.sanitizeUrl = sanitizeUrl;
function sanitizeHost(host, remoteScheme) {
    const toRemove = remoteScheme === 'https' ? 443 : 80;
    return host.replace(new RegExp(`:${toRemove}$`), '');
}
exports.sanitizeHost = sanitizeHost;
function isTestInstance() {
    return process.env.NODE_ENV === 'test';
}
exports.isTestInstance = isTestInstance;
function isProdInstance() {
    return process.env.NODE_ENV === 'production';
}
exports.isProdInstance = isProdInstance;
function getAppNumber() {
    return process.env.NODE_APP_INSTANCE;
}
exports.getAppNumber = getAppNumber;
let rootPath;
function root() {
    if (rootPath)
        return rootPath;
    rootPath = __dirname;
    if ((0, path_1.basename)(rootPath) === 'helpers')
        rootPath = (0, path_1.resolve)(rootPath, '..');
    if ((0, path_1.basename)(rootPath) === 'server')
        rootPath = (0, path_1.resolve)(rootPath, '..');
    if ((0, path_1.basename)(rootPath) === 'dist')
        rootPath = (0, path_1.resolve)(rootPath, '..');
    return rootPath;
}
exports.root = root;
function buildPath(path) {
    if ((0, path_1.isAbsolute)(path))
        return path;
    return (0, path_1.join)(root(), path);
}
exports.buildPath = buildPath;
function getLowercaseExtension(filename) {
    const ext = (0, path_1.extname)(filename) || '';
    return ext.toLowerCase();
}
exports.getLowercaseExtension = getLowercaseExtension;
function peertubeTruncate(str, options) {
    const truncatedStr = (0, lodash_1.truncate)(str, options);
    if (truncatedStr.length <= options.length)
        return truncatedStr;
    options.length -= truncatedStr.length - options.length;
    return (0, lodash_1.truncate)(str, options);
}
exports.peertubeTruncate = peertubeTruncate;
function pageToStartAndCount(page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    return { start, count: itemsPerPage };
}
exports.pageToStartAndCount = pageToStartAndCount;
function parseSemVersion(s) {
    const parsed = s.match(/^v?(\d+)\.(\d+)\.(\d+)$/i);
    return {
        major: parseInt(parsed[1]),
        minor: parseInt(parsed[2]),
        patch: parseInt(parsed[3])
    };
}
exports.parseSemVersion = parseSemVersion;
function sha256(str, encoding = 'hex') {
    return (0, crypto_1.createHash)('sha256').update(str).digest(encoding);
}
exports.sha256 = sha256;
function sha1(str, encoding = 'hex') {
    return (0, crypto_1.createHash)('sha1').update(str).digest(encoding);
}
exports.sha1 = sha1;
function execShell(command, options) {
    return new Promise((res, rej) => {
        (0, child_process_1.exec)(command, options, (err, stdout, stderr) => {
            if (err)
                return rej({ err, stdout, stderr });
            return res({ stdout, stderr });
        });
    });
}
exports.execShell = execShell;
function isOdd(num) {
    return (num % 2) !== 0;
}
exports.isOdd = isOdd;
function toEven(num) {
    if (isOdd(num))
        return num + 1;
    return num;
}
exports.toEven = toEven;
function promisify0(func) {
    return function promisified() {
        return new Promise((resolve, reject) => {
            func.apply(null, [(err, res) => err ? reject(err) : resolve(res)]);
        });
    };
}
exports.promisify0 = promisify0;
function promisify1(func) {
    return function promisified(arg) {
        return new Promise((resolve, reject) => {
            func.apply(null, [arg, (err, res) => err ? reject(err) : resolve(res)]);
        });
    };
}
exports.promisify1 = promisify1;
function promisify2(func) {
    return function promisified(arg1, arg2) {
        return new Promise((resolve, reject) => {
            func.apply(null, [arg1, arg2, (err, res) => err ? reject(err) : resolve(res)]);
        });
    };
}
exports.promisify2 = promisify2;
const randomBytesPromise = promisify1(crypto_1.randomBytes);
exports.randomBytesPromise = randomBytesPromise;
const createPrivateKey = promisify1(pem_1.createPrivateKey);
exports.createPrivateKey = createPrivateKey;
const getPublicKey = promisify1(pem_1.getPublicKey);
exports.getPublicKey = getPublicKey;
const execPromise2 = promisify2(child_process_1.exec);
exports.execPromise2 = execPromise2;
const execPromise = promisify1(child_process_1.exec);
exports.execPromise = execPromise;
const pipelinePromise = (0, util_1.promisify)(stream_1.pipeline);
exports.pipelinePromise = pipelinePromise;
