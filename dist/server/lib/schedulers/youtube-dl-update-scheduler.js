"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeDlUpdateScheduler = void 0;
const youtube_dl_1 = require("@server/helpers/youtube-dl");
const constants_1 = require("../../initializers/constants");
const abstract_scheduler_1 = require("./abstract-scheduler");
class YoutubeDlUpdateScheduler extends abstract_scheduler_1.AbstractScheduler {
    constructor() {
        super();
        this.schedulerIntervalMs = constants_1.SCHEDULER_INTERVALS_MS.youtubeDLUpdate;
    }
    internalExecute() {
        return youtube_dl_1.YoutubeDL.updateYoutubeDLBinary();
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.YoutubeDlUpdateScheduler = YoutubeDlUpdateScheduler;
