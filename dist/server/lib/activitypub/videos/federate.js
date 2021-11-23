"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.federateVideoIfNeeded = void 0;
const tslib_1 = require("tslib");
const misc_1 = require("@server/helpers/custom-validators/misc");
const send_1 = require("../send");
const share_1 = require("../share");
function federateVideoIfNeeded(videoArg, isNewVideo, transaction) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const video = videoArg;
        if ((video.isBlacklisted() === false || (isNewVideo === false && video.VideoBlacklist.unfederated === false)) &&
            video.hasPrivacyForFederation() && video.hasStateForFederation()) {
            if ((0, misc_1.isArray)(video.VideoCaptions) === false) {
                video.VideoCaptions = yield video.$get('VideoCaptions', {
                    attributes: ['filename', 'language'],
                    transaction
                });
            }
            if (isNewVideo) {
                yield (0, send_1.sendCreateVideo)(video, transaction);
                yield (0, share_1.shareVideoByServerAndChannel)(video, transaction);
            }
            else {
                yield (0, send_1.sendUpdateVideo)(video, transaction);
            }
        }
    });
}
exports.federateVideoIfNeeded = federateVideoIfNeeded;
