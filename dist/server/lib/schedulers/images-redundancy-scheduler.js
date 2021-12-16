"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesRedundancyScheduler = void 0;
const tslib_1 = require("tslib");
const actor_follow_1 = require("@server/models/actor/actor-follow");
const application_1 = require("@server/models/application/application");
const image_redundancy_1 = require("@server/models/image/image-redundancy");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const abstract_scheduler_1 = require("./abstract-scheduler");
const fs_1 = require("fs");
const util_1 = require("util");
const stream_1 = require("stream");
const image_1 = require("@server/models/image/image");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const streamPipeline = util_1.promisify(stream_1.pipeline);
class ImagesRedundancyScheduler extends abstract_scheduler_1.AbstractScheduler {
    constructor() {
        super();
        this.schedulerIntervalMs = config_1.CONFIG.REDUNDANCY.IMAGES.CHECK_INTERVAL;
    }
    internalExecute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Running images redundancy scheduler');
            const actors = yield this.getAllActorsWithRedundancy();
            yield Promise.all(actors.map((actor) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const serverUrl = new URL(actor.url).origin;
                const currentImageRedundancy = (yield image_redundancy_1.ImageRedundancyModel.getImageRedundancyForActor(serverUrl))[0];
                var response;
                try {
                    response = yield image_redundancy_1.ImageRedundancyModel.getImagesFromDate(currentImageRedundancy);
                }
                catch (err) {
                    logger_1.logger.info('Images redundancy: ' + serverUrl + ' is not reachable:');
                    logger_1.logger.info(err);
                }
                if (!response)
                    return;
                const imagesToDownload = yield response.json();
                if (imagesToDownload && imagesToDownload.length > 0) {
                    const newFromDate = yield this.downloadImagesFromServer(serverUrl, imagesToDownload);
                    if (newFromDate) {
                        currentImageRedundancy.fromDate = newFromDate;
                        currentImageRedundancy.save();
                    }
                }
            })));
        });
    }
    getAllActorsWithRedundancy() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const serverActor = yield application_1.getServerActor();
            const resultList = yield actor_follow_1.ActorFollowModel.listFollowingForApi({
                id: serverActor.id,
                start: undefined,
                count: undefined,
                sort: '-createdAt'
            });
            return resultList.data.filter((a) => {
                return a.ActorFollowing.getRedundancyAllowed();
            }).map((a) => a.ActorFollowing);
        });
    }
    downloadImagesFromServer(serverUrl, imagesToDownload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            var resDate;
            yield Promise.all(imagesToDownload.map((imageToDownload) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield fs_extra_1.ensureDir(path_1.join(config_1.CONFIG.STORAGE.IMAGES_DIR, imageToDownload.id));
                yield this.downloadFile(image_1.ImageModel.getImageStaticUrl(imageToDownload.id, imageToDownload.filename, serverUrl), image_1.ImageModel.getImageStaticPath(imageToDownload.id, imageToDownload.filename));
                yield this.downloadFile(image_1.ImageModel.getImageStaticUrl(imageToDownload.id, imageToDownload.thumbnailname, serverUrl), image_1.ImageModel.getImageStaticPath(imageToDownload.id, imageToDownload.thumbnailname));
                const torrentHash = yield image_1.ImageModel.generateTorrentForImage(imageToDownload.id, path_1.join(config_1.CONFIG.STORAGE.IMAGES_DIR, imageToDownload.id));
                const currentCreatedAt = new Date(imageToDownload.createdAt);
                resDate = (!resDate || resDate < currentCreatedAt) ? currentCreatedAt : resDate;
                imageToDownload.createdAt = imageToDownload.updatedAt = new Date();
                imageToDownload.infoHash = torrentHash;
                const newImage = new image_1.ImageModel(imageToDownload);
                newImage.save();
            })));
            return resDate;
        });
    }
    downloadFile(url, filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default(url);
            if (!response.ok)
                throw new Error(`downloadFile: Unexpected response ${response.statusText}`);
            yield streamPipeline(response.body, fs_1.createWriteStream(filePath));
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.ImagesRedundancyScheduler = ImagesRedundancyScheduler;
