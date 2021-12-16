"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const video_comment_1 = require("@server/lib/video-comment");
const bulk_1 = require("@server/middlewares/validators/bulk");
const video_comment_2 = require("@server/models/video/video-comment");
const models_1 = require("@shared/models");
const middlewares_1 = require("../../middlewares");
const bulkRouter = express_1.default.Router();
exports.bulkRouter = bulkRouter;
bulkRouter.post('/remove-comments-of', middlewares_1.authenticate, middlewares_1.asyncMiddleware(bulk_1.bulkRemoveCommentsOfValidator), middlewares_1.asyncMiddleware(bulkRemoveCommentsOf));
function bulkRemoveCommentsOf(req, res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const account = res.locals.account;
        const body = req.body;
        const user = res.locals.oauth.token.User;
        const filter = body.scope === 'my-videos'
            ? { onVideosOfAccount: user.Account }
            : {};
        const comments = yield video_comment_2.VideoCommentModel.listForBulkDelete(account, filter);
        res.status(models_1.HttpStatusCode.NO_CONTENT_204).end();
        for (const comment of comments) {
            yield video_comment_1.removeComment(comment);
        }
    });
}
