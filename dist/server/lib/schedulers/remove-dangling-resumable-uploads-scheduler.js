"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveDanglingResumableUploadsScheduler = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const fs_extra_1 = require("fs-extra");
const logger_1 = require("@server/helpers/logger");
const upload_1 = require("@server/helpers/upload");
const constants_1 = require("@server/initializers/constants");
const core_1 = require("@uploadx/core");
const abstract_scheduler_1 = require("./abstract-scheduler");
const lTags = logger_1.loggerTagsFactory('scheduler', 'resumable-upload', 'cleaner');
class RemoveDanglingResumableUploadsScheduler extends abstract_scheduler_1.AbstractScheduler {
    constructor() {
        super();
        this.schedulerIntervalMs = constants_1.SCHEDULER_INTERVALS_MS.removeDanglingResumableUploads;
        this.lastExecutionTimeMs = new Date().getTime();
    }
    internalExecute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const path = upload_1.getResumableUploadPath();
            const files = yield fs_extra_1.readdir(path);
            const metafiles = files.filter(f => f.endsWith(core_1.METAFILE_EXTNAME));
            if (metafiles.length === 0)
                return;
            logger_1.logger.debug('Reading resumable video upload folder %s with %d files', path, metafiles.length, lTags());
            try {
                yield bluebird_1.map(metafiles, metafile => {
                    return this.deleteIfOlderThan(metafile, this.lastExecutionTimeMs);
                }, { concurrency: 5 });
            }
            catch (error) {
                logger_1.logger.error('Failed to handle file during resumable video upload folder cleanup', Object.assign({ error }, lTags()));
            }
            finally {
                this.lastExecutionTimeMs = new Date().getTime();
            }
        });
    }
    deleteIfOlderThan(metafile, olderThan) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const metafilePath = upload_1.getResumableUploadPath(metafile);
            const statResult = yield fs_extra_1.stat(metafilePath);
            if (statResult.ctimeMs < olderThan) {
                yield fs_extra_1.remove(metafilePath);
                const datafile = metafilePath.replace(new RegExp(`${core_1.METAFILE_EXTNAME}$`), '');
                yield fs_extra_1.remove(datafile);
            }
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.RemoveDanglingResumableUploadsScheduler = RemoveDanglingResumableUploadsScheduler;
