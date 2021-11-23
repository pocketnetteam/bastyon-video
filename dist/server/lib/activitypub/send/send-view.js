"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendView = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("../../../helpers/logger");
const audience_1 = require("../audience");
const url_1 = require("../url");
const utils_1 = require("./utils");
function sendView(byActor, video, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        logger_1.logger.info('Creating job to send view of %s.', video.url);
        const activityBuilder = (audience) => {
            const url = (0, url_1.getLocalVideoViewActivityPubUrl)(byActor, video);
            return buildViewActivity(url, byActor, video, audience);
        };
        return (0, utils_1.sendVideoRelatedActivity)(activityBuilder, { byActor, video, transaction: t, contextType: 'View' });
    });
}
exports.sendView = sendView;
function buildViewActivity(url, byActor, video, audience) {
    if (!audience)
        audience = (0, audience_1.getAudience)(byActor);
    return (0, audience_1.audiencify)({
        id: url,
        type: 'View',
        actor: byActor.url,
        object: video.url
    }, audience);
}
