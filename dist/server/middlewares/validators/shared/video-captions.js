"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesVideoCaptionExist = void 0;
const tslib_1 = require("tslib");
const video_caption_1 = require("@server/models/video/video-caption");
const models_1 = require("@shared/models");
function doesVideoCaptionExist(video, language, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoCaption = yield video_caption_1.VideoCaptionModel.loadByVideoIdAndLanguage(video.id, language);
        if (!videoCaption) {
            res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Video caption not found'
            });
            return false;
        }
        res.locals.videoCaption = videoCaption;
        return true;
    });
}
exports.doesVideoCaptionExist = doesVideoCaptionExist;
