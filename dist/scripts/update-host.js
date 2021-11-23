"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const register_ts_paths_1 = require("../server/helpers/register-ts-paths");
(0, register_ts_paths_1.registerTSPaths)();
const constants_1 = require("../server/initializers/constants");
const actor_follow_1 = require("../server/models/actor/actor-follow");
const video_1 = require("../server/models/video/video");
const actor_1 = require("../server/models/actor/actor");
const url_1 = require("../server/lib/activitypub/url");
const video_share_1 = require("../server/models/video/video-share");
const video_comment_1 = require("../server/models/video/video-comment");
const account_1 = require("../server/models/account/account");
const video_channel_1 = require("../server/models/video/video-channel");
const database_1 = require("../server/initializers/database");
const webtorrent_1 = require("@server/helpers/webtorrent");
const application_1 = require("@server/models/application/application");
run()
    .then(() => process.exit(0))
    .catch(err => {
    console.error(err);
    process.exit(-1);
});
function run() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, database_1.initDatabaseModels)(true);
        const serverAccount = yield (0, application_1.getServerActor)();
        {
            const res = yield actor_follow_1.ActorFollowModel.listAcceptedFollowingUrlsForApi([serverAccount.id], undefined);
            const hasFollowing = res.total > 0;
            if (hasFollowing === true) {
                throw new Error('Cannot update host because you follow other servers!');
            }
        }
        console.log('Updating actors.');
        const actors = yield actor_1.ActorModel.unscoped().findAll({
            include: [
                {
                    model: video_channel_1.VideoChannelModel.unscoped(),
                    required: false
                },
                {
                    model: account_1.AccountModel.unscoped(),
                    required: false
                }
            ]
        });
        for (const actor of actors) {
            if (actor.isOwned() === false)
                continue;
            console.log('Updating actor ' + actor.url);
            const newUrl = actor.Account
                ? (0, url_1.getLocalAccountActivityPubUrl)(actor.preferredUsername)
                : (0, url_1.getLocalVideoChannelActivityPubUrl)(actor.preferredUsername);
            actor.url = newUrl;
            actor.inboxUrl = newUrl + '/inbox';
            actor.outboxUrl = newUrl + '/outbox';
            actor.sharedInboxUrl = constants_1.WEBSERVER.URL + '/inbox';
            actor.followersUrl = newUrl + '/followers';
            actor.followingUrl = newUrl + '/following';
            yield actor.save();
        }
        console.log('Updating video shares.');
        const videoShares = yield video_share_1.VideoShareModel.findAll({
            include: [video_1.VideoModel.unscoped(), actor_1.ActorModel.unscoped()]
        });
        for (const videoShare of videoShares) {
            if (videoShare.Video.isOwned() === false)
                continue;
            console.log('Updating video share ' + videoShare.url);
            videoShare.url = (0, url_1.getLocalVideoAnnounceActivityPubUrl)(videoShare.Actor, videoShare.Video);
            yield videoShare.save();
        }
        console.log('Updating video comments.');
        const videoComments = yield video_comment_1.VideoCommentModel.findAll({
            include: [
                {
                    model: video_1.VideoModel.unscoped()
                },
                {
                    model: account_1.AccountModel.unscoped(),
                    include: [
                        {
                            model: actor_1.ActorModel.unscoped()
                        }
                    ]
                }
            ]
        });
        for (const comment of videoComments) {
            if (comment.isOwned() === false)
                continue;
            console.log('Updating comment ' + comment.url);
            comment.url = (0, url_1.getLocalVideoCommentActivityPubUrl)(comment.Video, comment);
            yield comment.save();
        }
        console.log('Updating video and torrent files.');
        const localVideos = yield video_1.VideoModel.listLocal();
        for (const localVideo of localVideos) {
            const video = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(localVideo.id);
            console.log('Updating video ' + video.uuid);
            video.url = (0, url_1.getLocalVideoActivityPubUrl)(video);
            yield video.save();
            for (const file of video.VideoFiles) {
                console.log('Updating torrent file %s of video %s.', file.resolution, video.uuid);
                yield (0, webtorrent_1.updateTorrentUrls)(video, file);
                yield file.save();
            }
            const playlist = video.getHLSPlaylist();
            for (const file of ((playlist === null || playlist === void 0 ? void 0 : playlist.VideoFiles) || [])) {
                console.log('Updating fragmented torrent file %s of video %s.', file.resolution, video.uuid);
                yield (0, webtorrent_1.updateTorrentUrls)(video, file);
                yield file.save();
            }
        }
    });
}
