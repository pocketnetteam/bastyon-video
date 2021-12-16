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
const application_1 = require("@server/models/application/application");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
function processActivityPubHttpBroadcast(job) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Processing ActivityPub broadcast in job %d.', job.id);
        const payload = job.data;
        const body = yield activitypub_http_utils_1.computeBody(payload);
        const httpSignatureOptions = yield activitypub_http_utils_1.buildSignedRequestOptions(payload);
        const options = {
            method: 'POST',
            json: body,
            httpSignature: httpSignatureOptions,
            headers: activitypub_http_utils_1.buildGlobalHeaders(body)
        };
        const badUrls = [];
        const goodUrls = [];
        yield bluebird_1.map(payload.uris, uri => {
            return requests_1.doRequest(uri, options)
                .then(() => goodUrls.push(uri))
                .catch((err) => {
                badUrls.push(uri);
                return application_1.getServerActor().then(server => {
                    node_fetch_1.default(constants_1.LOGGER_ENDPOINT, {
                        method: "post",
                        body: JSON.stringify({
                            server: server.url,
                            type: "BrodcastFail",
                            requestUrl: uri,
                            requestOptions: body,
                            err
                        })
                    });
                });
            });
        }, { concurrency: constants_1.BROADCAST_CONCURRENCY });
        return files_cache_1.ActorFollowScoreCache.Instance.updateActorFollowsScore(goodUrls, badUrls);
    });
}
exports.processActivityPubHttpBroadcast = processActivityPubHttpBroadcast;