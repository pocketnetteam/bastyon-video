"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActorImageInstance = exports.updateActorImageInstance = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const actor_image_1 = require("@server/models/actor/actor-image");
function updateActorImageInstance(actor, type, imageInfo, t) {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const oldImageModel = type === 1
            ? actor.Avatar
            : actor.Banner;
        if (oldImageModel) {
            if ((imageInfo === null || imageInfo === void 0 ? void 0 : imageInfo.fileUrl) && oldImageModel.fileUrl === imageInfo.fileUrl)
                return actor;
            try {
                yield oldImageModel.destroy({ transaction: t });
                setActorImage(actor, type, null);
            }
            catch (err) {
                logger_1.logger.error('Cannot remove old actor image of actor %s.', actor.url, { err });
            }
        }
        if (imageInfo) {
            const imageModel = yield actor_image_1.ActorImageModel.create({
                filename: imageInfo.name,
                onDisk: (_a = imageInfo.onDisk) !== null && _a !== void 0 ? _a : false,
                fileUrl: imageInfo.fileUrl,
                height: imageInfo.height,
                width: imageInfo.width,
                type
            }, { transaction: t });
            setActorImage(actor, type, imageModel);
        }
        return actor;
    });
}
exports.updateActorImageInstance = updateActorImageInstance;
function deleteActorImageInstance(actor, type, t) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        try {
            if (type === 1) {
                yield actor.Avatar.destroy({ transaction: t });
                actor.avatarId = null;
                actor.Avatar = null;
            }
            else {
                yield actor.Banner.destroy({ transaction: t });
                actor.bannerId = null;
                actor.Banner = null;
            }
        }
        catch (err) {
            logger_1.logger.error('Cannot remove old image of actor %s.', actor.url, { err });
        }
        return actor;
    });
}
exports.deleteActorImageInstance = deleteActorImageInstance;
function setActorImage(actorModel, type, imageModel) {
    const id = imageModel
        ? imageModel.id
        : null;
    if (type === 1) {
        actorModel.avatarId = id;
        actorModel.Avatar = imageModel;
    }
    else {
        actorModel.bannerId = id;
        actorModel.Banner = imageModel;
    }
    return actorModel;
}
