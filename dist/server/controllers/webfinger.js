"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webfingerRouter = void 0;
const tslib_1 = require("tslib");
const cors_1 = (0, tslib_1.__importDefault)(require("cors"));
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const constants_1 = require("@server/initializers/constants");
const middlewares_1 = require("../middlewares");
const validators_1 = require("../middlewares/validators");
const webfingerRouter = express_1.default.Router();
exports.webfingerRouter = webfingerRouter;
webfingerRouter.use((0, cors_1.default)());
webfingerRouter.get('/.well-known/webfinger', (0, middlewares_1.asyncMiddleware)(validators_1.webfingerValidator), webfingerController);
function webfingerController(req, res) {
    const actor = res.locals.actorUrl;
    const json = {
        subject: req.query.resource,
        aliases: [actor.url],
        links: [
            {
                rel: 'self',
                type: 'application/activity+json',
                href: actor.url
            },
            {
                rel: 'http://ostatus.org/schema/1.0/subscribe',
                template: constants_1.WEBSERVER.URL + '/remote-interaction?uri={uri}'
            }
        ]
    };
    return res.json(json);
}
