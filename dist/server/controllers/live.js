"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveRouter = void 0;
const tslib_1 = require("tslib");
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const core_utils_1 = require("@server/helpers/core-utils");
const live_1 = require("@server/lib/live");
const models_1 = require("@shared/models");
const liveRouter = express_1.default.Router();
exports.liveRouter = liveRouter;
liveRouter.use('/segments-sha256/:videoUUID', cors_1.default(), getSegmentsSha256);
function getSegmentsSha256(req, res) {
    const videoUUID = req.params.videoUUID;
    const result = live_1.LiveSegmentShaStore.Instance.getSegmentsSha256(videoUUID);
    if (!result) {
        return res.status(models_1.HttpStatusCode.NOT_FOUND_404).end();
    }
    return res.json(core_utils_1.mapToJSON(result));
}
