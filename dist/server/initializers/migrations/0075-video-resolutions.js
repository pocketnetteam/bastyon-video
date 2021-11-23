"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const config_1 = require("../../initializers/config");
const ffprobe_utils_1 = require("../../helpers/ffprobe-utils");
const fs_extra_1 = require("fs-extra");
function up(utils) {
    const torrentDir = config_1.CONFIG.STORAGE.TORRENTS_DIR;
    const videoFileDir = config_1.CONFIG.STORAGE.VIDEOS_DIR;
    return (0, fs_extra_1.readdir)(videoFileDir)
        .then(videoFiles => {
        const tasks = [];
        for (const videoFile of videoFiles) {
            const matches = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([a-z0-9]+)/.exec(videoFile);
            if (matches === null) {
                console.log('Invalid video file name %s.', videoFile);
                continue;
            }
            const uuid = matches[1];
            const ext = matches[2];
            const p = (0, ffprobe_utils_1.getVideoFileResolution)((0, path_1.join)(videoFileDir, videoFile))
                .then(({ resolution }) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const oldTorrentName = uuid + '.torrent';
                const newTorrentName = uuid + '-' + resolution + '.torrent';
                yield (0, fs_extra_1.rename)((0, path_1.join)(torrentDir, oldTorrentName), (0, path_1.join)(torrentDir, newTorrentName)).then(() => resolution);
                const newVideoFileName = uuid + '-' + resolution + '.' + ext;
                yield (0, fs_extra_1.rename)((0, path_1.join)(videoFileDir, videoFile), (0, path_1.join)(videoFileDir, newVideoFileName)).then(() => resolution);
                const query = 'UPDATE "VideoFiles" SET "resolution" = ' + resolution +
                    ' WHERE "videoId" = (SELECT "id" FROM "Videos" WHERE "uuid" = \'' + uuid + '\')';
                return utils.sequelize.query(query);
            }));
            tasks.push(p);
        }
        return Promise.all(tasks).then(() => undefined);
    });
}
exports.up = up;
function down(options) {
    throw new Error('Not implemented.');
}
exports.down = down;
