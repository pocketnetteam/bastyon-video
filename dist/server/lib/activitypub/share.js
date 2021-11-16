"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareVideoByServerAndChannel = exports.addVideoShares = exports.changeVideoChannelShare = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const application_1 = require("@server/models/application/application");
const activitypub_1 = require("../../helpers/activitypub");
const logger_1 = require("../../helpers/logger");
const requests_1 = require("../../helpers/requests");
const constants_1 = require("../../initializers/constants");
const video_share_1 = require("../../models/video/video-share");
const actors_1 = require("./actors");
const send_1 = require("./send");
const url_1 = require("./url");
const lTags = logger_1.loggerTagsFactory('share');
function shareVideoByServerAndChannel(video, t) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!video.hasPrivacyForFederation())
            return undefined;
        return Promise.all([
            shareByServer(video, t),
            shareByVideoChannel(video, t)
        ]);
    });
}
exports.shareVideoByServerAndChannel = shareVideoByServerAndChannel;
function changeVideoChannelShare(video, oldVideoChannel, t) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Updating video channel of video %s: %s -> %s.', video.uuid, oldVideoChannel.name, video.VideoChannel.name, lTags(video.uuid));
        yield undoShareByVideoChannel(video, oldVideoChannel, t);
        yield shareByVideoChannel(video, t);
    });
}
exports.changeVideoChannelShare = changeVideoChannelShare;
function addVideoShares(shareUrls, video) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield bluebird_1.map(shareUrls, (shareUrl) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield addVideoShare(shareUrl, video);
            }
            catch (err) {
                logger_1.logger.warn('Cannot add share %s.', shareUrl, { err });
            }
        }), { concurrency: constants_1.CRAWL_REQUEST_CONCURRENCY });
    });
}
exports.addVideoShares = addVideoShares;
function addVideoShare(shareUrl, video) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { body } = yield requests_1.doJSONRequest(shareUrl, { activityPub: true });
        if (!body || !body.actor)
            throw new Error('Body or body actor is invalid');
        const actorUrl = activitypub_1.getAPId(body.actor);
        if (activitypub_1.checkUrlsSameHost(shareUrl, actorUrl) !== true) {
            throw new Error(`Actor url ${actorUrl} has not the same host than the share url ${shareUrl}`);
        }
        const actor = yield actors_1.getOrCreateAPActor(actorUrl);
        const entry = {
            actorId: actor.id,
            videoId: video.id,
            url: shareUrl
        };
        yield video_share_1.VideoShareModel.upsert(entry);
    });
}
function shareByServer(video, t) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const serverActor = yield application_1.getServerActor();
        const serverShareUrl = url_1.getLocalVideoAnnounceActivityPubUrl(serverActor, video);
        const [serverShare] = yield video_share_1.VideoShareModel.findOrCreate({
            defaults: {
                actorId: serverActor.id,
                videoId: video.id,
                url: serverShareUrl
            },
            where: {
                url: serverShareUrl
            },
            transaction: t
        });
        return send_1.sendVideoAnnounce(serverActor, serverShare, video, t);
    });
}
function shareByVideoChannel(video, t) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoChannelShareUrl = url_1.getLocalVideoAnnounceActivityPubUrl(video.VideoChannel.Actor, video);
        const [videoChannelShare] = yield video_share_1.VideoShareModel.findOrCreate({
            defaults: {
                actorId: video.VideoChannel.actorId,
                videoId: video.id,
                url: videoChannelShareUrl
            },
            where: {
                url: videoChannelShareUrl
            },
            transaction: t
        });
        return send_1.sendVideoAnnounce(video.VideoChannel.Actor, videoChannelShare, video, t);
    });
}
function undoShareByVideoChannel(video, oldVideoChannel, t) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const oldShare = yield video_share_1.VideoShareModel.load(oldVideoChannel.actorId, video.id, t);
        if (!oldShare)
            return new Error('Cannot find old video channel share ' + oldVideoChannel.actorId + ' for video ' + video.id);
        yield send_1.sendUndoAnnounce(oldVideoChannel.Actor, oldShare, video, t);
        yield oldShare.destroy({ transaction: t });
    });
}
