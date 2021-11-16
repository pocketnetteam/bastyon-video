"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnedPublicationAfterTranscoding = void 0;
const abstract_owned_video_publication_1 = require("./abstract-owned-video-publication");
class OwnedPublicationAfterTranscoding extends abstract_owned_video_publication_1.AbstractOwnedVideoPublication {
    isDisabled() {
        return !this.payload.waitTranscoding || !!this.payload.VideoBlacklist || !!this.payload.ScheduleVideoUpdate;
    }
}
exports.OwnedPublicationAfterTranscoding = OwnedPublicationAfterTranscoding;
