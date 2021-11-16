"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnedPublicationAfterAutoUnblacklist = void 0;
const abstract_owned_video_publication_1 = require("./abstract-owned-video-publication");
class OwnedPublicationAfterAutoUnblacklist extends abstract_owned_video_publication_1.AbstractOwnedVideoPublication {
    isDisabled() {
        return !!this.payload.ScheduleVideoUpdate || (this.payload.waitTranscoding && this.payload.state !== 1);
    }
}
exports.OwnedPublicationAfterAutoUnblacklist = OwnedPublicationAfterAutoUnblacklist;
