"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVideoRateChange = exports.createRates = exports.getLocalRateUrl = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const requests_1 = require("@server/helpers/requests");
const activitypub_1 = require("../../helpers/activitypub");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const account_video_rate_1 = require("../../models/account/account-video-rate");
const actors_1 = require("./actors");
const send_1 = require("./send");
const send_dislike_1 = require("./send/send-dislike");
const url_1 = require("./url");
const lTags = (0, logger_1.loggerTagsFactory)('ap', 'video-rate', 'create');
function createRates(ratesUrl, video, rate) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, bluebird_1.map)(ratesUrl, (rateUrl) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                yield createRate(rateUrl, video, rate);
            }
            catch (err) {
                logger_1.logger.info('Cannot add rate %s.', rateUrl, Object.assign({ err }, lTags(rateUrl, video.uuid, video.url)));
            }
        }), { concurrency: constants_1.CRAWL_REQUEST_CONCURRENCY });
    });
}
exports.createRates = createRates;
function sendVideoRateChange(account, video, likes, dislikes, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const actor = account.Actor;
        if (likes < 0)
            yield (0, send_1.sendUndoLike)(actor, video, t);
        if (dislikes < 0)
            yield (0, send_1.sendUndoDislike)(actor, video, t);
        if (likes > 0)
            yield (0, send_1.sendLike)(actor, video, t);
        if (dislikes > 0)
            yield (0, send_dislike_1.sendDislike)(actor, video, t);
    });
}
exports.sendVideoRateChange = sendVideoRateChange;
function getLocalRateUrl(rateType, actor, video) {
    return rateType === 'like'
        ? (0, url_1.getVideoLikeActivityPubUrlByLocalActor)(actor, video)
        : (0, url_1.getVideoDislikeActivityPubUrlByLocalActor)(actor, video);
}
exports.getLocalRateUrl = getLocalRateUrl;
function createRate(rateUrl, video, rate) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { body } = yield (0, requests_1.doJSONRequest)(rateUrl, { activityPub: true });
        if (!body || !body.actor)
            throw new Error('Body or body actor is invalid');
        const actorUrl = (0, activitypub_1.getAPId)(body.actor);
        if ((0, activitypub_1.checkUrlsSameHost)(actorUrl, rateUrl) !== true) {
            throw new Error(`Rate url ${rateUrl} has not the same host than actor url ${actorUrl}`);
        }
        if ((0, activitypub_1.checkUrlsSameHost)(body.id, rateUrl) !== true) {
            throw new Error(`Rate url ${rateUrl} host is different from the AP object id ${body.id}`);
        }
        const actor = yield (0, actors_1.getOrCreateAPActor)(actorUrl);
        const entry = {
            videoId: video.id,
            accountId: actor.Account.id,
            type: rate,
            url: body.id
        };
        yield account_video_rate_1.AccountVideoRateModel.upsert(entry);
    });
}
