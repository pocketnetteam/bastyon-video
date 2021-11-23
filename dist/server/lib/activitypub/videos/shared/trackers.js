"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVideoTrackers = exports.getTrackerUrls = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const videos_1 = require("@server/helpers/custom-validators/activitypub/videos");
const misc_1 = require("@server/helpers/custom-validators/misc");
const constants_1 = require("@server/initializers/constants");
const tracker_1 = require("@server/models/server/tracker");
function getTrackerUrls(object, video) {
    let wsFound = false;
    const trackers = object.url.filter(u => (0, videos_1.isAPVideoTrackerUrlObject)(u))
        .map((u) => {
        if ((0, misc_1.isArray)(u.rel) && u.rel.includes('websocket'))
            wsFound = true;
        return u.href;
    });
    if (wsFound)
        return trackers;
    return [
        (0, activitypub_1.buildRemoteVideoBaseUrl)(video, '/tracker/socket', constants_1.REMOTE_SCHEME.WS),
        (0, activitypub_1.buildRemoteVideoBaseUrl)(video, '/tracker/announce')
    ];
}
exports.getTrackerUrls = getTrackerUrls;
function setVideoTrackers(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { video, trackers, transaction } = options;
        const trackerInstances = yield tracker_1.TrackerModel.findOrCreateTrackers(trackers, transaction);
        yield video.$set('Trackers', trackerInstances, { transaction });
    });
}
exports.setVideoTrackers = setVideoTrackers;
