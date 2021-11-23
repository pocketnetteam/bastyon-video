"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRemoteVideo = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const videos_1 = require("@server/helpers/custom-validators/activitypub/videos");
const logger_1 = require("@server/helpers/logger");
const requests_1 = require("@server/helpers/requests");
const lTags = (0, logger_1.loggerTagsFactory)('ap', 'video');
function fetchRemoteVideo(videoUrl) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Fetching remote video %s.', videoUrl, lTags(videoUrl));
        const { statusCode, body } = yield (0, requests_1.doJSONRequest)(videoUrl, { activityPub: true });
        if ((0, videos_1.sanitizeAndCheckVideoTorrentObject)(body) === false || (0, activitypub_1.checkUrlsSameHost)(body.id, videoUrl) !== true) {
            logger_1.logger.debug('Remote video JSON is not valid.', Object.assign({ body }, lTags(videoUrl)));
            return { statusCode, videoObject: undefined };
        }
        return { statusCode, videoObject: body };
    });
}
exports.fetchRemoteVideo = fetchRemoteVideo;
