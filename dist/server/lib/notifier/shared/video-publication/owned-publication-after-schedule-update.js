"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnedPublicationAfterScheduleUpdate = void 0;
const abstract_owned_video_publication_1 = require("./abstract-owned-video-publication");
class OwnedPublicationAfterScheduleUpdate extends abstract_owned_video_publication_1.AbstractOwnedVideoPublication {
    isDisabled() {
        return !!this.payload.VideoBlacklist || (this.payload.waitTranscoding && this.payload.state !== 1);
    }
}
exports.OwnedPublicationAfterScheduleUpdate = OwnedPublicationAfterScheduleUpdate;
