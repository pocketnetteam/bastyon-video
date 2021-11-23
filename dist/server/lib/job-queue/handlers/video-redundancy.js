"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideoRedundancy = void 0;
const tslib_1 = require("tslib");
const videos_redundancy_scheduler_1 = require("@server/lib/schedulers/videos-redundancy-scheduler");
const logger_1 = require("../../../helpers/logger");
function processVideoRedundancy(job) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const payload = job.data;
        logger_1.logger.info('Processing video redundancy in job %d.', job.id);
        return videos_redundancy_scheduler_1.VideosRedundancyScheduler.Instance.createManualRedundancy(payload.videoId);
    });
}
exports.processVideoRedundancy = processVideoRedundancy;
