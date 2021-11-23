"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapText = exports.unwrapBodyOrDecodeToJSON = exports.unwrapTextOrDecode = exports.unwrapBody = exports.makeActivityPubGetRequest = exports.makeRawRequest = exports.makeDeleteRequest = exports.makePutBodyRequest = exports.makePostBodyRequest = exports.makeUploadRequest = exports.decodeQueryString = exports.makeGetRequest = exports.makeHTMLRequest = void 0;
const tslib_1 = require("tslib");
const querystring_1 = require("querystring");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const url_1 = require("url");
const models_1 = require("@shared/models");
const tests_1 = require("../miscs/tests");
function makeRawRequest(url, expectedStatus, range) {
    const { host, protocol, pathname } = new url_1.URL(url);
    return makeGetRequest({ url: `${protocol}//${host}`, path: pathname, expectedStatus, range });
}
exports.makeRawRequest = makeRawRequest;
function makeGetRequest(options) {
    const req = (0, supertest_1.default)(options.url).get(options.path);
    if (options.query)
        req.query(options.query);
    if (options.rawQuery)
        req.query(options.rawQuery);
    return buildRequest(req, Object.assign({ contentType: 'application/json', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, options));
}
exports.makeGetRequest = makeGetRequest;
function makeHTMLRequest(url, path) {
    return makeGetRequest({
        url,
        path,
        accept: 'text/html',
        expectedStatus: models_1.HttpStatusCode.OK_200
    });
}
exports.makeHTMLRequest = makeHTMLRequest;
function makeActivityPubGetRequest(url, path, expectedStatus = models_1.HttpStatusCode.OK_200) {
    return makeGetRequest({
        url,
        path,
        expectedStatus: expectedStatus,
        accept: 'application/activity+json,text/html;q=0.9,\\*/\\*;q=0.8'
    });
}
exports.makeActivityPubGetRequest = makeActivityPubGetRequest;
function makeDeleteRequest(options) {
    const req = (0, supertest_1.default)(options.url).delete(options.path);
    if (options.query)
        req.query(options.query);
    if (options.rawQuery)
        req.query(options.rawQuery);
    return buildRequest(req, Object.assign({ accept: 'application/json', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, options));
}
exports.makeDeleteRequest = makeDeleteRequest;
function makeUploadRequest(options) {
    let req = options.method === 'PUT'
        ? (0, supertest_1.default)(options.url).put(options.path)
        : (0, supertest_1.default)(options.url).post(options.path);
    req = buildRequest(req, Object.assign({ accept: 'application/json', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, options));
    buildFields(req, options.fields);
    Object.keys(options.attaches || {}).forEach(attach => {
        const value = options.attaches[attach];
        if (Array.isArray(value)) {
            req.attach(attach, (0, tests_1.buildAbsoluteFixturePath)(value[0]), value[1]);
        }
        else {
            req.attach(attach, (0, tests_1.buildAbsoluteFixturePath)(value));
        }
    });
    return req;
}
exports.makeUploadRequest = makeUploadRequest;
function makePostBodyRequest(options) {
    const req = (0, supertest_1.default)(options.url).post(options.path)
        .send(options.fields);
    return buildRequest(req, Object.assign({ accept: 'application/json', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, options));
}
exports.makePostBodyRequest = makePostBodyRequest;
function makePutBodyRequest(options) {
    const req = (0, supertest_1.default)(options.url).put(options.path)
        .send(options.fields);
    return buildRequest(req, Object.assign({ accept: 'application/json', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, options));
}
exports.makePutBodyRequest = makePutBodyRequest;
function decodeQueryString(path) {
    return (0, querystring_1.decode)(path.split('?')[1]);
}
exports.decodeQueryString = decodeQueryString;
function unwrapBody(test) {
    return test.then(res => res.body);
}
exports.unwrapBody = unwrapBody;
function unwrapText(test) {
    return test.then(res => res.text);
}
exports.unwrapText = unwrapText;
function unwrapBodyOrDecodeToJSON(test) {
    return test.then(res => {
        if (res.body instanceof Buffer) {
            return JSON.parse(new TextDecoder().decode(res.body));
        }
        return res.body;
    });
}
exports.unwrapBodyOrDecodeToJSON = unwrapBodyOrDecodeToJSON;
function unwrapTextOrDecode(test) {
    return test.then(res => res.text || new TextDecoder().decode(res.body));
}
exports.unwrapTextOrDecode = unwrapTextOrDecode;
function buildRequest(req, options) {
    if (options.contentType)
        req.set('Accept', options.contentType);
    if (options.token)
        req.set('Authorization', 'Bearer ' + options.token);
    if (options.range)
        req.set('Range', options.range);
    if (options.accept)
        req.set('Accept', options.accept);
    if (options.host)
        req.set('Host', options.host);
    if (options.redirects)
        req.redirects(options.redirects);
    if (options.expectedStatus)
        req.expect(options.expectedStatus);
    if (options.xForwardedFor)
        req.set('X-Forwarded-For', options.xForwardedFor);
    if (options.type)
        req.type(options.type);
    Object.keys(options.headers || {}).forEach(name => {
        req.set(name, options.headers[name]);
    });
    return req;
}
function buildFields(req, fields, namespace) {
    if (!fields)
        return;
    let formKey;
    for (const key of Object.keys(fields)) {
        if (namespace)
            formKey = `${namespace}[${key}]`;
        else
            formKey = key;
        if (fields[key] === undefined)
            continue;
        if (Array.isArray(fields[key]) && fields[key].length === 0) {
            req.field(key, []);
            continue;
        }
        if (fields[key] !== null && typeof fields[key] === 'object') {
            buildFields(req, fields[key], formKey);
        }
        else {
            req.field(formKey, fields[key]);
        }
    }
}
