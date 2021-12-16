"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveAndProcessCaptionFile = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const srt_to_vtt_1 = tslib_1.__importDefault(require("srt-to-vtt"));
const stream_1 = require("stream");
const config_1 = require("../initializers/config");
const core_utils_1 = require("./core-utils");
function moveAndProcessCaptionFile(physicalFile, videoCaption) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoCaptionsDir = config_1.CONFIG.STORAGE.CAPTIONS_DIR;
        const destination = path_1.join(videoCaptionsDir, videoCaption.filename);
        if (physicalFile.path.endsWith('.srt')) {
            yield convertSrtToVtt(physicalFile.path, destination);
            yield fs_extra_1.remove(physicalFile.path);
        }
        else if (physicalFile.path !== destination) {
            yield fs_extra_1.move(physicalFile.path, destination, { overwrite: true });
        }
        physicalFile.filename = videoCaption.filename;
        physicalFile.path = destination;
    });
}
exports.moveAndProcessCaptionFile = moveAndProcessCaptionFile;
function convertSrtToVtt(source, destination) {
    const fixVTT = new stream_1.Transform({
        transform: (chunk, _encoding, cb) => {
            let block = chunk.toString();
            block = block.replace(/(\d\d:\d\d:\d\d)(\s)/g, '$1.000$2')
                .replace(/(\d\d:\d\d:\d\d),(\d)(\s)/g, '$1.00$2$3')
                .replace(/(\d\d:\d\d:\d\d),(\d\d)(\s)/g, '$1.0$2$3');
            return cb(undefined, block);
        }
    });
    return core_utils_1.pipelinePromise(fs_extra_1.createReadStream(source), srt_to_vtt_1.default(), fixVTT, fs_extra_1.createWriteStream(destination));
}
