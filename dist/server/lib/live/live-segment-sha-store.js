"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveSegmentShaStore = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const logger_1 = require("@server/helpers/logger");
const hls_1 = require("../hls");
const lTags = (0, logger_1.loggerTagsFactory)('live');
class LiveSegmentShaStore {
    constructor() {
        this.segmentsSha256 = new Map();
    }
    getSegmentsSha256(videoUUID) {
        return this.segmentsSha256.get(videoUUID);
    }
    addSegmentSha(videoUUID, segmentPath) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const segmentName = (0, path_1.basename)(segmentPath);
            logger_1.logger.debug('Adding live sha segment %s.', segmentPath, lTags(videoUUID));
            const shaResult = yield (0, hls_1.buildSha256Segment)(segmentPath);
            if (!this.segmentsSha256.has(videoUUID)) {
                this.segmentsSha256.set(videoUUID, new Map());
            }
            const filesMap = this.segmentsSha256.get(videoUUID);
            filesMap.set(segmentName, shaResult);
        });
    }
    removeSegmentSha(videoUUID, segmentPath) {
        const segmentName = (0, path_1.basename)(segmentPath);
        logger_1.logger.debug('Removing live sha segment %s.', segmentPath, lTags(videoUUID));
        const filesMap = this.segmentsSha256.get(videoUUID);
        if (!filesMap) {
            logger_1.logger.warn('Unknown files map to remove sha for %s.', videoUUID, lTags(videoUUID));
            return;
        }
        if (!filesMap.has(segmentName)) {
            logger_1.logger.warn('Unknown segment in files map for video %s and segment %s.', videoUUID, segmentPath, lTags(videoUUID));
            return;
        }
        filesMap.delete(segmentName);
    }
    cleanupShaSegments(videoUUID) {
        this.segmentsSha256.delete(videoUUID);
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.LiveSegmentShaStore = LiveSegmentShaStore;
