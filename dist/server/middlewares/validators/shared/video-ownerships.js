"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesChangeVideoOwnershipExist = void 0;
const tslib_1 = require("tslib");
const video_change_ownership_1 = require("@server/models/video/video-change-ownership");
const models_1 = require("@shared/models");
function doesChangeVideoOwnershipExist(idArg, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const id = parseInt(idArg + '', 10);
        const videoChangeOwnership = yield video_change_ownership_1.VideoChangeOwnershipModel.load(id);
        if (!videoChangeOwnership) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video change ownership not found'
            });
            return false;
        }
        res.locals.videoChangeOwnership = videoChangeOwnership;
        return true;
    });
}
exports.doesChangeVideoOwnershipExist = doesChangeVideoOwnershipExist;
