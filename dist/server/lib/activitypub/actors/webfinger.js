"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadActorUrlOrGetFromWebfinger = exports.getUrlFromWebfinger = void 0;
const tslib_1 = require("tslib");
const webfinger_js_1 = tslib_1.__importDefault(require("webfinger.js"));
const core_utils_1 = require("@server/helpers/core-utils");
const misc_1 = require("@server/helpers/custom-validators/activitypub/misc");
const constants_1 = require("@server/initializers/constants");
const actor_1 = require("@server/models/actor/actor");
const webfinger = new webfinger_js_1.default({
    webfist_fallback: false,
    tls_only: core_utils_1.isProdInstance(),
    uri_fallback: false,
    request_timeout: constants_1.REQUEST_TIMEOUT
});
function loadActorUrlOrGetFromWebfinger(uriArg) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const uri = uriArg.startsWith('@') ? uriArg.slice(1) : uriArg;
        const [name, host] = uri.split('@');
        let actor;
        if (!host || host === constants_1.WEBSERVER.HOST) {
            actor = yield actor_1.ActorModel.loadLocalByName(name);
        }
        else {
            actor = yield actor_1.ActorModel.loadByNameAndHost(name, host);
        }
        if (actor)
            return actor.url;
        return getUrlFromWebfinger(uri);
    });
}
exports.loadActorUrlOrGetFromWebfinger = loadActorUrlOrGetFromWebfinger;
function getUrlFromWebfinger(uri) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const webfingerData = yield webfingerLookup(uri);
        return getLinkOrThrow(webfingerData);
    });
}
exports.getUrlFromWebfinger = getUrlFromWebfinger;
function getLinkOrThrow(webfingerData) {
    if (Array.isArray(webfingerData.links) === false)
        throw new Error('WebFinger links is not an array.');
    const selfLink = webfingerData.links.find(l => l.rel === 'self');
    if (selfLink === undefined || misc_1.isActivityPubUrlValid(selfLink.href) === false) {
        throw new Error('Cannot find self link or href is not a valid URL.');
    }
    return selfLink.href;
}
function webfingerLookup(nameWithHost) {
    return new Promise((res, rej) => {
        webfinger.lookup(nameWithHost, (err, p) => {
            if (err)
                return rej(err);
            return res(p.object);
        });
    });
}
