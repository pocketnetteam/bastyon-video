"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const register_ts_paths_1 = require("../server/helpers/register-ts-paths");
(0, register_ts_paths_1.registerTSPaths)();
const bluebird_1 = require("bluebird");
const commander_1 = require("commander");
const fs_extra_1 = require("fs-extra");
const image_utils_1 = require("@server/helpers/image-utils");
const constants_1 = require("@server/initializers/constants");
const video_1 = require("@server/models/video/video");
const database_1 = require("@server/initializers/database");
commander_1.program
    .description('Regenerate local thumbnails using preview files')
    .parse(process.argv);
run()
    .then(() => process.exit(0))
    .catch(err => console.error(err));
function run() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, database_1.initDatabaseModels)(true);
        const videos = yield video_1.VideoModel.listLocal();
        yield (0, bluebird_1.map)(videos, v => {
            return processVideo(v)
                .catch(err => console.error('Cannot process video %s.', v.url, err));
        }, { concurrency: 20 });
    });
}
function processVideo(videoArg) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const video = yield video_1.VideoModel.loadWithFiles(videoArg.id);
        console.log('Processing video %s.', video.name);
        const thumbnail = video.getMiniature();
        const preview = video.getPreview();
        const previewPath = preview.getPath();
        if (!(yield (0, fs_extra_1.pathExists)(previewPath))) {
            throw new Error(`Preview ${previewPath} does not exist on disk`);
        }
        const size = {
            width: constants_1.THUMBNAILS_SIZE.width,
            height: constants_1.THUMBNAILS_SIZE.height
        };
        const oldPath = thumbnail.getPath();
        thumbnail.filename = (0, image_utils_1.generateImageFilename)();
        thumbnail.width = size.width;
        thumbnail.height = size.height;
        const thumbnailPath = thumbnail.getPath();
        yield (0, image_utils_1.processImage)(previewPath, thumbnailPath, size, true);
        yield thumbnail.save();
        yield (0, fs_extra_1.remove)(oldPath);
    });
}
