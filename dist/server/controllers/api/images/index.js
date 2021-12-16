"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagesRouter = void 0;
const tslib_1 = require("tslib");
const middlewares_1 = require("@server/middlewares");
const image_1 = require("@server/models/image/image");
const express_1 = tslib_1.__importDefault(require("express"));
const sequelize_1 = require("sequelize");
const upload_1 = require("./upload");
const imagesRouter = express_1.default.Router();
exports.imagesRouter = imagesRouter;
const LIMIT_LIST_QUERY = 10;
const DEFAULT_ORDER_BY = 'updatedAt';
const DEFAULT_ORDER_DIRECTION = 'DESC';
imagesRouter.use('/', upload_1.uploadRouter);
imagesRouter.get('/', middlewares_1.asyncMiddleware(listImages));
function listImages(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const limit = (req.query.limit && req.query.limit > 0 && req.query.limit <= LIMIT_LIST_QUERY) ? req.query.limit : LIMIT_LIST_QUERY;
        var order_by = DEFAULT_ORDER_BY, order_direction = DEFAULT_ORDER_DIRECTION;
        if (req.query.order && req.query.order.length >= 2 && req.query.order.startsWith('-')) {
            order_direction = 'ASC';
            order_by = req.query.order.substring(1);
        }
        else if (req.query.order && req.query.order.length >= 1)
            order_by = req.query.order;
        const offset = (req.query.offset) ? req.query.offset : 0;
        const images = yield image_1.ImageModel.findAll({
            where: {
                createdAt: {
                    [sequelize_1.Op.gt]: req.query.createdAt || new Date(0)
                }
            },
            order: [[order_by, order_direction]],
            limit: limit,
            offset: offset
        });
        return res.json(images);
    });
}
