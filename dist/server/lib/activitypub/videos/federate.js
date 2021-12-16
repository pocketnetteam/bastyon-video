"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.federateVideoIfNeeded = void 0;
const tslib_1 = require("tslib");
const misc_1 = require("@server/helpers/custom-validators/misc");
const send_1 = require("../send");
const share_1 = require("../share");
function federateVideoIfNeeded(videoArg, isNewVideo, transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const video = videoArg;
        if ((video.isBlacklisted() === false || (isNewVideo === false && video.VideoBlacklist.unfederated === false)) &&
            video.hasPrivacyForFederation() && video.hasStateForFederation()) {
            if (misc_1.isArray(video.VideoCaptions) === false) {
                video.VideoCaptions = yield video.$get('VideoCaptions', {
                    attributes: ['filename', 'language'],
                    transaction
                });
            }
            if (isNewVideo) {
                yield send_1.sendCreateVideo(video, transaction);
                yield share_1.shareVideoByServerAndChannel(video, transaction);
            }
            else {
                yield send_1.sendUpdateVideo(video, transaction);
            }
        }
    });
}
exports.federateVideoIfNeeded = federateVideoIfNeeded;
