"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processActivityPubHttpBroadcast = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const logger_1 = require("../../../helpers/logger");
const requests_1 = require("../../../helpers/requests");
const constants_1 = require("../../../initializers/constants");
const files_cache_1 = require("../../files-cache");
const activitypub_http_utils_1 = require("./utils/activitypub-http-utils");
function processActivityPubHttpBroadcast(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Processing ActivityPub broadcast in job %d.', job.id);
        const payload = job.data;
        const body = yield (0, activitypub_http_utils_1.computeBody)(payload);
        const httpSignatureOptions = yield (0, activitypub_http_utils_1.buildSignedRequestOptions)(payload);
        const options = {
            method: 'POST',
            json: body,
            httpSignature: httpSignatureOptions,
            headers: (0, activitypub_http_utils_1.buildGlobalHeaders)(body)
        };
        const badUrls = [];
        const goodUrls = [];
        yield (0, bluebird_1.map)(payload.uris, uri => {
            return (0, requests_1.doRequest)(uri, options)
                .then(() => goodUrls.push(uri))
                .catch(() => badUrls.push(uri));
        }, { concurrency: constants_1.BROADCAST_CONCURRENCY });
        return files_cache_1.ActorFollowScoreCache.Instance.updateActorFollowsScore(goodUrls, badUrls);
    });
}
exports.processActivityPubHttpBroadcast = processActivityPubHttpBroadcast;
