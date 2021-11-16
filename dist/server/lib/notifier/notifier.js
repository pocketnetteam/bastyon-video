"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifier = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const job_queue_1 = require("../job-queue");
const peertube_socket_1 = require("../peertube-socket");
const shared_1 = require("./shared");
class Notifier {
    constructor() {
        this.notificationModels = {
            newVideo: [shared_1.NewVideoForSubscribers],
            publicationAfterTranscoding: [shared_1.OwnedPublicationAfterTranscoding],
            publicationAfterScheduleUpdate: [shared_1.OwnedPublicationAfterScheduleUpdate],
            publicationAfterAutoUnblacklist: [shared_1.OwnedPublicationAfterAutoUnblacklist],
            newComment: [shared_1.CommentMention, shared_1.NewCommentForVideoOwner],
            newAbuse: [shared_1.NewAbuseForModerators],
            newBlacklist: [shared_1.NewBlacklistForOwner],
            unblacklist: [shared_1.UnblacklistForOwner],
            importFinished: [shared_1.ImportFinishedForOwner],
            userRegistration: [shared_1.RegistrationForModerators],
            userFollow: [shared_1.FollowForUser],
            instanceFollow: [shared_1.FollowForInstance],
            autoInstanceFollow: [shared_1.AutoFollowForInstance],
            newAutoBlacklist: [shared_1.NewAutoBlacklistForModerators],
            abuseStateChange: [shared_1.AbuseStateChangeForReporter],
            newAbuseMessage: [shared_1.NewAbuseMessageForReporter, shared_1.NewAbuseMessageForModerators],
            newPeertubeVersion: [shared_1.NewPeerTubeVersionForAdmins],
            newPluginVersion: [shared_1.NewPluginVersionForAdmins]
        };
    }
    notifyOnNewVideoIfNeeded(video) {
        const models = this.notificationModels.newVideo;
        this.sendNotifications(models, video)
            .catch(err => logger_1.logger.error('Cannot notify subscribers of new video %s.', video.url, { err }));
    }
    notifyOnVideoPublishedAfterTranscoding(video) {
        const models = this.notificationModels.publicationAfterTranscoding;
        this.sendNotifications(models, video)
            .catch(err => logger_1.logger.error('Cannot notify owner that its video %s has been published after transcoding.', video.url, { err }));
    }
    notifyOnVideoPublishedAfterScheduledUpdate(video) {
        const models = this.notificationModels.publicationAfterScheduleUpdate;
        this.sendNotifications(models, video)
            .catch(err => logger_1.logger.error('Cannot notify owner that its video %s has been published after scheduled update.', video.url, { err }));
    }
    notifyOnVideoPublishedAfterRemovedFromAutoBlacklist(video) {
        const models = this.notificationModels.publicationAfterAutoUnblacklist;
        this.sendNotifications(models, video)
            .catch(err => {
            logger_1.logger.error('Cannot notify owner that its video %s has been published after removed from auto-blacklist.', video.url, { err });
        });
    }
    notifyOnNewComment(comment) {
        const models = this.notificationModels.newComment;
        this.sendNotifications(models, comment)
            .catch(err => logger_1.logger.error('Cannot notify of new comment.', comment.url, { err }));
    }
    notifyOnNewAbuse(payload) {
        const models = this.notificationModels.newAbuse;
        this.sendNotifications(models, payload)
            .catch(err => logger_1.logger.error('Cannot notify of new abuse %d.', payload.abuseInstance.id, { err }));
    }
    notifyOnVideoAutoBlacklist(videoBlacklist) {
        const models = this.notificationModels.newAutoBlacklist;
        this.sendNotifications(models, videoBlacklist)
            .catch(err => logger_1.logger.error('Cannot notify of auto-blacklist of video %s.', videoBlacklist.Video.url, { err }));
    }
    notifyOnVideoBlacklist(videoBlacklist) {
        const models = this.notificationModels.newBlacklist;
        this.sendNotifications(models, videoBlacklist)
            .catch(err => logger_1.logger.error('Cannot notify video owner of new video blacklist of %s.', videoBlacklist.Video.url, { err }));
    }
    notifyOnVideoUnblacklist(video) {
        const models = this.notificationModels.unblacklist;
        this.sendNotifications(models, video)
            .catch(err => logger_1.logger.error('Cannot notify video owner of unblacklist of %s.', video.url, { err }));
    }
    notifyOnFinishedVideoImport(payload) {
        const models = this.notificationModels.importFinished;
        this.sendNotifications(models, payload)
            .catch(err => {
            logger_1.logger.error('Cannot notify owner that its video import %s is finished.', payload.videoImport.getTargetIdentifier(), { err });
        });
    }
    notifyOnNewUserRegistration(user) {
        const models = this.notificationModels.userRegistration;
        this.sendNotifications(models, user)
            .catch(err => logger_1.logger.error('Cannot notify moderators of new user registration (%s).', user.username, { err }));
    }
    notifyOfNewUserFollow(actorFollow) {
        const models = this.notificationModels.userFollow;
        this.sendNotifications(models, actorFollow)
            .catch(err => {
            logger_1.logger.error('Cannot notify owner of channel %s of a new follow by %s.', actorFollow.ActorFollowing.VideoChannel.getDisplayName(), actorFollow.ActorFollower.Account.getDisplayName(), { err });
        });
    }
    notifyOfNewInstanceFollow(actorFollow) {
        const models = this.notificationModels.instanceFollow;
        this.sendNotifications(models, actorFollow)
            .catch(err => logger_1.logger.error('Cannot notify administrators of new follower %s.', actorFollow.ActorFollower.url, { err }));
    }
    notifyOfAutoInstanceFollowing(actorFollow) {
        const models = this.notificationModels.autoInstanceFollow;
        this.sendNotifications(models, actorFollow)
            .catch(err => logger_1.logger.error('Cannot notify administrators of auto instance following %s.', actorFollow.ActorFollowing.url, { err }));
    }
    notifyOnAbuseStateChange(abuse) {
        const models = this.notificationModels.abuseStateChange;
        this.sendNotifications(models, abuse)
            .catch(err => logger_1.logger.error('Cannot notify of abuse %d state change.', abuse.id, { err }));
    }
    notifyOnAbuseMessage(abuse, message) {
        const models = this.notificationModels.newAbuseMessage;
        this.sendNotifications(models, { abuse, message })
            .catch(err => logger_1.logger.error('Cannot notify on new abuse %d message.', abuse.id, { err }));
    }
    notifyOfNewPeerTubeVersion(application, latestVersion) {
        const models = this.notificationModels.newPeertubeVersion;
        this.sendNotifications(models, { application, latestVersion })
            .catch(err => logger_1.logger.error('Cannot notify on new PeerTubeb version %s.', latestVersion, { err }));
    }
    notifyOfNewPluginVersion(plugin) {
        const models = this.notificationModels.newPluginVersion;
        this.sendNotifications(models, plugin)
            .catch(err => logger_1.logger.error('Cannot notify on new plugin version %s.', plugin.name, { err }));
    }
    notify(object) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield object.prepare();
            const users = object.getTargetUsers();
            if (users.length === 0)
                return;
            if (yield object.isDisabled())
                return;
            object.log();
            const toEmails = [];
            for (const user of users) {
                const setting = object.getSetting(user);
                if (this.isWebNotificationEnabled(setting)) {
                    const notification = yield object.createNotification(user);
                    peertube_socket_1.PeerTubeSocket.Instance.sendNotification(user.id, notification);
                }
                if (this.isEmailEnabled(user, setting)) {
                    toEmails.push(user.email);
                }
            }
            for (const to of toEmails) {
                const payload = yield object.createEmail(to);
                job_queue_1.JobQueue.Instance.createJob({ type: 'email', payload });
            }
        });
    }
    isEmailEnabled(user, value) {
        if (config_1.CONFIG.SIGNUP.REQUIRES_EMAIL_VERIFICATION === true && user.emailVerified === false)
            return false;
        return value & 2;
    }
    isWebNotificationEnabled(value) {
        return value & 1;
    }
    sendNotifications(models, payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const model of models) {
                yield this.notify(new model(payload));
            }
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.Notifier = Notifier;
