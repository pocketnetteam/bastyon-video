"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiFailMiddleware = void 0;
const http_problem_details_1 = require("http-problem-details");
const models_1 = require("@shared/models");
function apiFailMiddleware(req, res, next) {
    res.fail = options => {
        const { status = models_1.HttpStatusCode.BAD_REQUEST_400, message, title, type, data, instance } = options;
        const extension = new http_problem_details_1.ProblemDocumentExtension(Object.assign(Object.assign({}, data), { docs: res.locals.docUrl, code: type, error: message }));
        res.status(status);
        res.setHeader('Content-Type', 'application/problem+json');
        res.json(new http_problem_details_1.ProblemDocument({
            status,
            title,
            instance,
            detail: message,
            type: type
                ? `https://docs.joinpeertube.org/api-rest-reference.html#section/Errors/${type}`
                : undefined
        }, extension));
    };
    if (next)
        next();
}
exports.apiFailMiddleware = apiFailMiddleware;
