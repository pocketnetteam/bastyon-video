"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const register_ts_paths_1 = require("../server/helpers/register-ts-paths");
register_ts_paths_1.registerTSPaths();
const prompt_1 = require("prompt");
const path_1 = require("path");
const config_1 = require("../server/initializers/config");
const video_1 = require("../server/models/video/video");
const database_1 = require("../server/initializers/database");
const fs_extra_1 = require("fs-extra");
const video_redundancy_1 = require("../server/models/redundancy/video-redundancy");
const bluebird_1 = require("bluebird");
const utils_1 = require("../server/helpers/utils");
const thumbnail_1 = require("../server/models/video/thumbnail");
const actor_image_1 = require("../server/models/actor/actor-image");
const lodash_1 = require("lodash");
const video_file_1 = require("@server/models/video/video-file");
const constants_1 = require("@server/initializers/constants");
run()
    .then(() => process.exit(0))
    .catch(err => {
    console.error(err);
    process.exit(-1);
});
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const dirs = lodash_1.values(config_1.CONFIG.STORAGE);
        if (lodash_1.uniq(dirs).length !== dirs.length) {
            console.error('Cannot prune storage because you put multiple storage keys in the same directory.');
            process.exit(0);
        }
        yield database_1.initDatabaseModels(true);
        let toDelete = [];
        console.log('Detecting files to remove, it could take a while...');
        toDelete = toDelete.concat(yield pruneDirectory(config_1.CONFIG.STORAGE.VIDEOS_DIR, doesWebTorrentFileExist()), yield pruneDirectory(config_1.CONFIG.STORAGE.TORRENTS_DIR, doesTorrentFileExist()), yield pruneDirectory(config_1.CONFIG.STORAGE.REDUNDANCY_DIR, doesRedundancyExist), yield pruneDirectory(config_1.CONFIG.STORAGE.PREVIEWS_DIR, doesThumbnailExist(true, 2)), yield pruneDirectory(config_1.CONFIG.STORAGE.THUMBNAILS_DIR, doesThumbnailExist(false, 1)), yield pruneDirectory(config_1.CONFIG.STORAGE.ACTOR_IMAGES, doesActorImageExist));
        const tmpFiles = yield fs_extra_1.readdir(config_1.CONFIG.STORAGE.TMP_DIR);
        toDelete = toDelete.concat(tmpFiles.map(t => path_1.join(config_1.CONFIG.STORAGE.TMP_DIR, t)));
        if (toDelete.length === 0) {
            console.log('No files to delete.');
            return;
        }
        console.log('Will delete %d files:\n\n%s\n\n', toDelete.length, toDelete.join('\n'));
        const res = yield askConfirmation();
        if (res === true) {
            console.log('Processing delete...\n');
            for (const path of toDelete) {
                yield fs_extra_1.remove(path);
            }
            console.log('Done!');
        }
        else {
            console.log('Exiting without deleting files.');
        }
    });
}
function pruneDirectory(directory, existFun) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield fs_extra_1.readdir(directory);
        const toDelete = [];
        yield bluebird_1.map(files, (file) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.join(directory, file);
            if ((yield existFun(filePath)) !== true) {
                toDelete.push(filePath);
            }
        }), { concurrency: 20 });
        return toDelete;
    });
}
function doesWebTorrentFileExist() {
    return (filePath) => video_file_1.VideoFileModel.doesOwnedWebTorrentVideoFileExist(path_1.basename(filePath));
}
function doesTorrentFileExist() {
    return (filePath) => video_file_1.VideoFileModel.doesOwnedTorrentFileExist(path_1.basename(filePath));
}
function doesThumbnailExist(keepOnlyOwned, type) {
    return (filePath) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const thumbnail = yield thumbnail_1.ThumbnailModel.loadByFilename(path_1.basename(filePath), type);
        if (!thumbnail)
            return false;
        if (keepOnlyOwned) {
            const video = yield video_1.VideoModel.load(thumbnail.videoId);
            if (video.isOwned() === false)
                return false;
        }
        return true;
    });
}
function doesActorImageExist(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const image = yield actor_image_1.ActorImageModel.loadByName(path_1.basename(filePath));
        return !!image;
    });
}
function doesRedundancyExist(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const isPlaylist = (yield fs_extra_1.stat(filePath)).isDirectory();
        if (isPlaylist) {
            if (filePath === constants_1.HLS_REDUNDANCY_DIRECTORY)
                return true;
            const uuid = utils_1.getUUIDFromFilename(filePath);
            const video = yield video_1.VideoModel.loadWithFiles(uuid);
            if (!video)
                return false;
            const p = video.getHLSPlaylist();
            if (!p)
                return false;
            const redundancy = yield video_redundancy_1.VideoRedundancyModel.loadLocalByStreamingPlaylistId(p.id);
            return !!redundancy;
        }
        const file = yield video_file_1.VideoFileModel.loadByFilename(path_1.basename(filePath));
        if (!file)
            return false;
        const redundancy = yield video_redundancy_1.VideoRedundancyModel.loadLocalByFileId(file.id);
        return !!redundancy;
    });
}
function askConfirmation() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            prompt_1.start();
            const schema = {
                properties: {
                    confirm: {
                        type: 'string',
                        description: 'These following unused files can be deleted, but please check your backups first (bugs happen).' +
                            ' Notice PeerTube must have been stopped when your ran this script.' +
                            ' Can we delete these files?',
                        default: 'n',
                        required: true
                    }
                }
            };
            prompt_1.get(schema, function (err, result) {
                var _a;
                if (err)
                    return rej(err);
                return res(((_a = result.confirm) === null || _a === void 0 ? void 0 : _a.match(/y/)) !== null);
            });
        });
    });
}
