"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBadSortPagination = exports.checkBadCountPagination = exports.checkBadStartPagination = void 0;
const tslib_1 = require("tslib");
const models_1 = require("@shared/models");
const requests_1 = require("./requests");
function checkBadStartPagination(url, path, token, query = {}) {
    return (0, requests_1.makeGetRequest)({
        url,
        path,
        token,
        query: Object.assign(Object.assign({}, query), { start: 'hello' }),
        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
    });
}
exports.checkBadStartPagination = checkBadStartPagination;
function checkBadCountPagination(url, path, token, query = {}) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, requests_1.makeGetRequest)({
            url,
            path,
            token,
            query: Object.assign(Object.assign({}, query), { count: 'hello' }),
            expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
        });
        yield (0, requests_1.makeGetRequest)({
            url,
            path,
            token,
            query: Object.assign(Object.assign({}, query), { count: 2000 }),
            expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
        });
    });
}
exports.checkBadCountPagination = checkBadCountPagination;
function checkBadSortPagination(url, path, token, query = {}) {
    return (0, requests_1.makeGetRequest)({
        url,
        path,
        token,
        query: Object.assign(Object.assign({}, query), { sort: 'hello' }),
        expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400
    });
}
exports.checkBadSortPagination = checkBadSortPagination;
