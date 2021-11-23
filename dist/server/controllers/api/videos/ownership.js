"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownershipVideoRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const logger_1 = require("../../../helpers/logger");
const utils_1 = require("../../../helpers/utils");
const database_1 = require("../../../initializers/database");
const send_1 = require("../../../lib/activitypub/send");
const share_1 = require("../../../lib/activitypub/share");
const middlewares_1 = require("../../../middlewares");
const video_1 = require("../../../models/video/video");
const video_change_ownership_1 = require("../../../models/video/video-change-ownership");
const video_channel_1 = require("../../../models/video/video-channel");
const ownershipVideoRouter = express_1.default.Router();
exports.ownershipVideoRouter = ownershipVideoRouter;
ownershipVideoRouter.post('/:videoId/give-ownership', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosChangeOwnershipValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(giveVideoOwnership));
ownershipVideoRouter.get('/ownership', middlewares_1.authenticate, middlewares_1.paginationValidator, middlewares_1.setDefaultPagination, (0, middlewares_1.asyncRetryTransactionMiddleware)(listVideoOwnership));
ownershipVideoRouter.post('/ownership/:id/accept', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosTerminateChangeOwnershipValidator), (0, middlewares_1.asyncMiddleware)(middlewares_1.videosAcceptChangeOwnershipValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(acceptOwnership));
ownershipVideoRouter.post('/ownership/:id/refuse', middlewares_1.authenticate, (0, middlewares_1.asyncMiddleware)(middlewares_1.videosTerminateChangeOwnershipValidator), (0, middlewares_1.asyncRetryTransactionMiddleware)(refuseOwnership));
function giveVideoOwnership(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoInstance = res.locals.videoAll;
        const initiatorAccountId = res.locals.oauth.token.User.Account.id;
        const nextOwner = res.locals.nextOwner;
        yield database_1.sequelizeTypescript.transaction(t => {
            return video_change_ownership_1.VideoChangeOwnershipModel.findOrCreate({
                where: {
                    initiatorAccountId,
                    nextOwnerAccountId: nextOwner.id,
                    videoId: videoInstance.id,
                    status: "WAITING"
                },
                defaults: {
                    initiatorAccountId,
                    nextOwnerAccountId: nextOwner.id,
                    videoId: videoInstance.id,
                    status: "WAITING"
                },
                transaction: t
            });
        });
        logger_1.logger.info('Ownership change for video %s created.', videoInstance.name);
        return res.type('json')
            .status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204)
            .end();
    });
}
function listVideoOwnership(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const currentAccountId = res.locals.oauth.token.User.Account.id;
        const resultList = yield video_change_ownership_1.VideoChangeOwnershipModel.listForApi(currentAccountId, req.query.start || 0, req.query.count || 10, req.query.sort || 'createdAt');
        return res.json((0, utils_1.getFormattedObjects)(resultList.data, resultList.total));
    });
}
function acceptOwnership(req, res) {
    return database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoChangeOwnership = res.locals.videoChangeOwnership;
        const channel = res.locals.videoChannel;
        const targetVideo = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(videoChangeOwnership.Video.id, t);
        const oldVideoChannel = yield video_channel_1.VideoChannelModel.loadAndPopulateAccount(targetVideo.channelId, t);
        targetVideo.channelId = channel.id;
        const targetVideoUpdated = yield targetVideo.save({ transaction: t });
        targetVideoUpdated.VideoChannel = channel;
        if (targetVideoUpdated.hasPrivacyForFederation() && targetVideoUpdated.state === 1) {
            yield (0, share_1.changeVideoChannelShare)(targetVideoUpdated, oldVideoChannel, t);
            yield (0, send_1.sendUpdateVideo)(targetVideoUpdated, t, oldVideoChannel.Account.Actor);
        }
        videoChangeOwnership.status = "ACCEPTED";
        yield videoChangeOwnership.save({ transaction: t });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    }));
}
function refuseOwnership(req, res) {
    return database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const videoChangeOwnership = res.locals.videoChangeOwnership;
        videoChangeOwnership.status = "REFUSED";
        yield videoChangeOwnership.save({ transaction: t });
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    }));
}
