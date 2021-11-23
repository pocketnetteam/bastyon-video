"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncRetryTransactionMiddleware = exports.asyncMiddleware = void 0;
const async_1 = require("async");
const database_utils_1 = require("../helpers/database-utils");
function asyncMiddleware(fun) {
    return (req, res, next) => {
        if (Array.isArray(fun) === true) {
            return (0, async_1.eachSeries)(fun, (f, cb) => {
                Promise.resolve(f(req, res, err => cb(err)))
                    .catch(err => next(err));
            }, next);
        }
        return Promise.resolve(fun(req, res, next))
            .catch(err => next(err));
    };
}
exports.asyncMiddleware = asyncMiddleware;
function asyncRetryTransactionMiddleware(fun) {
    return (req, res, next) => {
        return Promise.resolve((0, database_utils_1.retryTransactionWrapper)(fun, req, res, next)).catch(err => next(err));
    };
}
exports.asyncRetryTransactionMiddleware = asyncRetryTransactionMiddleware;
