"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesVideoImportExist = void 0;
const tslib_1 = require("tslib");
const video_import_1 = require("@server/models/video/video-import");
const models_1 = require("@shared/models");
function doesVideoImportExist(id, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoImport = yield video_import_1.VideoImportModel.loadAndPopulateVideo(id);
        if (!videoImport) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video import not found'
            });
            return false;
        }
        res.locals.videoImport = videoImport;
        return true;
    });
}
exports.doesVideoImportExist = doesVideoImportExist;
