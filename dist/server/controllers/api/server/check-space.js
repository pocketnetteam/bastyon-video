"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spaceRouter = void 0;
const tslib_1 = require("tslib");
const express = tslib_1.__importStar(require("express"));
const middlewares_1 = require("../../../middlewares");
const config_1 = require("../../../../server/initializers/config");
const constants_1 = require("../../../../server/initializers/constants");
const check_disk_space_1 = tslib_1.__importDefault(require("check-disk-space"));
const spaceRouter = express.Router();
exports.spaceRouter = spaceRouter;
spaceRouter.get("/space", middlewares_1.asyncMiddleware(getSpace));
function getSpace(_req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return check_disk_space_1.default(config_1.CONFIG.STORAGE.VIDEOS_DIR).then((diskSpace) => res.json(Object.assign(Object.assign({}, diskSpace), { isFull: diskSpace.free / diskSpace.size >= constants_1.FULL_DISC_SPACE_PERCENTAGE })));
    });
}
