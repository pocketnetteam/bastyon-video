"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkResolutionsInMasterPlaylist = exports.checkLiveSegmentHash = exports.checkSegmentHash = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const core_utils_2 = require("@shared/core-utils");
const models_1 = require("@shared/models");
function checkSegmentHash(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { server, baseUrlPlaylist, baseUrlSegment, resolution, hlsPlaylist } = options;
        const command = server.streamingPlaylists;
        const file = hlsPlaylist.files.find(f => f.resolution.id === resolution);
        const videoName = path_1.basename(file.fileUrl);
        const playlist = yield command.get({ url: `${baseUrlPlaylist}/${core_utils_2.removeFragmentedMP4Ext(videoName)}.m3u8` });
        const matches = /#EXT-X-BYTERANGE:(\d+)@(\d+)/.exec(playlist);
        const length = parseInt(matches[1], 10);
        const offset = parseInt(matches[2], 10);
        const range = `${offset}-${offset + length - 1}`;
        const segmentBody = yield command.getSegment({
            url: `${baseUrlSegment}/${videoName}`,
            expectedStatus: models_1.HttpStatusCode.PARTIAL_CONTENT_206,
            range: `bytes=${range}`
        });
        const shaBody = yield command.getSegmentSha256({ url: hlsPlaylist.segmentsSha256Url });
        chai_1.expect(core_utils_1.sha256(segmentBody)).to.equal(shaBody[videoName][range]);
    });
}
exports.checkSegmentHash = checkSegmentHash;
function checkLiveSegmentHash(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { server, baseUrlSegment, videoUUID, segmentName, hlsPlaylist } = options;
        const command = server.streamingPlaylists;
        const segmentBody = yield command.getSegment({ url: `${baseUrlSegment}/${videoUUID}/${segmentName}` });
        const shaBody = yield command.getSegmentSha256({ url: hlsPlaylist.segmentsSha256Url });
        chai_1.expect(core_utils_1.sha256(segmentBody)).to.equal(shaBody[segmentName]);
    });
}
exports.checkLiveSegmentHash = checkLiveSegmentHash;
function checkResolutionsInMasterPlaylist(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { server, playlistUrl, resolutions } = options;
        const masterPlaylist = yield server.streamingPlaylists.get({ url: playlistUrl });
        for (const resolution of resolutions) {
            const reg = new RegExp('#EXT-X-STREAM-INF:BANDWIDTH=\\d+,RESOLUTION=\\d+x' + resolution + ',(FRAME-RATE=\\d+,)?CODECS="avc1.64001f,mp4a.40.2"');
            chai_1.expect(masterPlaylist).to.match(reg);
        }
    });
}
exports.checkResolutionsInMasterPlaylist = checkResolutionsInMasterPlaylist;
