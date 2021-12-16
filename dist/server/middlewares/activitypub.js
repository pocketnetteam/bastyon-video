"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHttpSignature = exports.executeIfActivityPub = exports.checkSignature = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const actor_1 = require("@server/helpers/custom-validators/activitypub/actor");
const http_error_codes_1 = require("../../shared/models/http/http-error-codes");
const logger_1 = require("../helpers/logger");
const peertube_crypto_1 = require("../helpers/peertube-crypto");
const constants_1 = require("../initializers/constants");
const actors_1 = require("../lib/activitypub/actors");
function checkSignature(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const httpSignatureChecked = yield checkHttpSignature(req, res);
            if (httpSignatureChecked !== true)
                return;
            const actor = res.locals.signature.actor;
            const bodyActor = req.body.actor;
            const bodyActorId = activitypub_1.getAPId(bodyActor);
            if (bodyActorId && bodyActorId !== actor.url) {
                const jsonLDSignatureChecked = yield checkJsonLDSignature(req, res);
                if (jsonLDSignatureChecked !== true)
                    return;
            }
            return next();
        }
        catch (err) {
            const activity = req.body;
            if (actor_1.isActorDeleteActivityValid(activity) && activity.object === activity.actor) {
                logger_1.logger.debug('Handling signature error on actor delete activity', { err });
                return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
            }
            logger_1.logger.warn('Error in ActivityPub signature checker.', { err });
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'ActivityPub signature could not be checked'
            });
        }
    });
}
exports.checkSignature = checkSignature;
function executeIfActivityPub(req, res, next) {
    const accepted = req.accepts(constants_1.ACCEPT_HEADERS);
    if (accepted === false || constants_1.ACTIVITY_PUB.POTENTIAL_ACCEPT_HEADERS.includes(accepted) === false) {
        return next('route');
    }
    logger_1.logger.debug('ActivityPub request for %s.', req.url);
    return next();
}
exports.executeIfActivityPub = executeIfActivityPub;
function checkHttpSignature(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const sig = req.headers[constants_1.HTTP_SIGNATURE.HEADER_NAME];
        if (sig && sig.startsWith('Signature ') === true)
            req.headers[constants_1.HTTP_SIGNATURE.HEADER_NAME] = sig.replace(/^Signature /, '');
        let parsed;
        try {
            parsed = peertube_crypto_1.parseHTTPSignature(req, constants_1.HTTP_SIGNATURE.CLOCK_SKEW_SECONDS);
        }
        catch (err) {
            logger_1.logger.warn('Invalid signature because of exception in signature parser', { reqBody: req.body, err });
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: err.message
            });
            return false;
        }
        const keyId = parsed.keyId;
        if (!keyId) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Invalid key ID',
                data: {
                    keyId
                }
            });
            return false;
        }
        logger_1.logger.debug('Checking HTTP signature of actor %s...', keyId);
        let [actorUrl] = keyId.split('#');
        if (actorUrl.startsWith('acct:')) {
            actorUrl = yield actors_1.loadActorUrlOrGetFromWebfinger(actorUrl.replace(/^acct:/, ''));
        }
        const actor = yield actors_1.getOrCreateAPActor(actorUrl);
        const verified = peertube_crypto_1.isHTTPSignatureVerified(parsed, actor);
        if (verified !== true) {
            logger_1.logger.warn('Signature from %s is invalid', actorUrl, { parsed });
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Invalid signature',
                data: {
                    actorUrl
                }
            });
            return false;
        }
        res.locals.signature = { actor };
        return true;
    });
}
exports.checkHttpSignature = checkHttpSignature;
function checkJsonLDSignature(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const signatureObject = req.body.signature;
        if (!signatureObject || !signatureObject.creator) {
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Object and creator signature do not match'
            });
            return false;
        }
        const [creator] = signatureObject.creator.split('#');
        logger_1.logger.debug('Checking JsonLD signature of actor %s...', creator);
        const actor = yield actors_1.getOrCreateAPActor(creator);
        const verified = yield peertube_crypto_1.isJsonLDSignatureVerified(actor, req.body);
        if (verified !== true) {
            logger_1.logger.warn('Signature not verified.', req.body);
            res.fail({
                status: http_error_codes_1.HttpStatusCode.FORBIDDEN_403,
                message: 'Signature could not be verified'
            });
            return false;
        }
        res.locals.signature = { actor };
        return true;
    });
}