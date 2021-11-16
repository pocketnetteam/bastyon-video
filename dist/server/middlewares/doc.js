"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapiOperationDoc = void 0;
function openapiOperationDoc(options) {
    return (req, res, next) => {
        res.locals.docUrl = options.url || 'https://docs.joinpeertube.org/api-rest-reference.html#operation/' + options.operationId;
        if (next)
            return next();
    };
}
exports.openapiOperationDoc = openapiOperationDoc;
