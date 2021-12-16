"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildActorInstance = exports.pushActorImageProcessInQueue = exports.deleteLocalActorImageFile = exports.updateLocalActorImageFile = exports.actorImagePathUnsafeCache = void 0;
const tslib_1 = require("tslib");
require("multer");
const async_1 = require("async");
const lru_cache_1 = tslib_1.__importDefault(require("lru-cache"));
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const uuid_1 = require("@server/helpers/uuid");
const actor_1 = require("@server/models/actor/actor");
const database_utils_1 = require("../helpers/database-utils");
const image_utils_1 = require("../helpers/image-utils");
const requests_1 = require("../helpers/requests");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const database_1 = require("../initializers/database");
const actors_1 = require("./activitypub/actors");
const send_1 = require("./activitypub/send");
function buildActorInstance(type, url, preferredUsername) {
    return new actor_1.ActorModel({
        type,
        url,
        preferredUsername,
        publicKey: null,
        privateKey: null,
        followersCount: 0,
        followingCount: 0,
        inboxUrl: url + '/inbox',
        outboxUrl: url + '/outbox',
        sharedInboxUrl: constants_1.WEBSERVER.URL + '/inbox',
        followersUrl: url + '/followers',
        followingUrl: url + '/following'
    });
}
exports.buildActorInstance = buildActorInstance;
function updateLocalActorImageFile(accountOrChannel, imagePhysicalFile, type) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const imageSize = type === 1
            ? constants_1.ACTOR_IMAGES_SIZE.AVATARS
            : constants_1.ACTOR_IMAGES_SIZE.BANNERS;
        const extension = core_utils_1.getLowercaseExtension(imagePhysicalFile.filename);
        const imageName = uuid_1.buildUUID() + extension;
        const destination = path_1.join(config_1.CONFIG.STORAGE.ACTOR_IMAGES, imageName);
        yield image_utils_1.processImage(imagePhysicalFile.path, destination, imageSize);
        return database_utils_1.retryTransactionWrapper(() => {
            return database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const actorImageInfo = {
                    name: imageName,
                    fileUrl: null,
                    height: imageSize.height,
                    width: imageSize.width,
                    onDisk: true
                };
                const updatedActor = yield actors_1.updateActorImageInstance(accountOrChannel.Actor, type, actorImageInfo, t);
                yield updatedActor.save({ transaction: t });
                yield send_1.sendUpdateActor(accountOrChannel, t);
                return type === 1
                    ? updatedActor.Avatar
                    : updatedActor.Banner;
            }));
        });
    });
}
exports.updateLocalActorImageFile = updateLocalActorImageFile;
function deleteLocalActorImageFile(accountOrChannel, type) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return database_utils_1.retryTransactionWrapper(() => {
            return database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const updatedActor = yield actors_1.deleteActorImageInstance(accountOrChannel.Actor, type, t);
                yield updatedActor.save({ transaction: t });
                yield send_1.sendUpdateActor(accountOrChannel, t);
                return updatedActor.Avatar;
            }));
        });
    });
}
exports.deleteLocalActorImageFile = deleteLocalActorImageFile;
const downloadImageQueue = async_1.queue((task, cb) => {
    const size = task.type === 1
        ? constants_1.ACTOR_IMAGES_SIZE.AVATARS
        : constants_1.ACTOR_IMAGES_SIZE.BANNERS;
    requests_1.downloadImage(task.fileUrl, config_1.CONFIG.STORAGE.ACTOR_IMAGES, task.filename, size)
        .then(() => cb())
        .catch(err => cb(err));
}, constants_1.QUEUE_CONCURRENCY.ACTOR_PROCESS_IMAGE);
function pushActorImageProcessInQueue(task) {
    return new Promise((res, rej) => {
        downloadImageQueue.push(task, err => {
            if (err)
                return rej(err);
            return res();
        });
    });
}
exports.pushActorImageProcessInQueue = pushActorImageProcessInQueue;
const actorImagePathUnsafeCache = new lru_cache_1.default({ max: constants_1.LRU_CACHE.ACTOR_IMAGE_STATIC.MAX_SIZE });
exports.actorImagePathUnsafeCache = actorImagePathUnsafeCache;
