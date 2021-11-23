"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APActorUpdater = void 0;
const tslib_1 = require("tslib");
const database_utils_1 = require("@server/helpers/database-utils");
const logger_1 = require("@server/helpers/logger");
const video_channel_1 = require("@server/models/video/video-channel");
const image_1 = require("./image");
const shared_1 = require("./shared");
const object_to_model_attributes_1 = require("./shared/object-to-model-attributes");
class APActorUpdater {
    constructor(actorObject, actor) {
        this.actorObject = actorObject;
        this.actor = actor;
        this.actorFieldsSave = this.actor.toJSON();
        if (this.actorObject.type === 'Group')
            this.accountOrChannel = this.actor.VideoChannel;
        else
            this.accountOrChannel = this.actor.Account;
        this.accountOrChannelFieldsSave = this.accountOrChannel.toJSON();
    }
    update() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const avatarInfo = (0, object_to_model_attributes_1.getImageInfoFromObject)(this.actorObject, 1);
            const bannerInfo = (0, object_to_model_attributes_1.getImageInfoFromObject)(this.actorObject, 2);
            try {
                yield this.updateActorInstance(this.actor, this.actorObject);
                this.accountOrChannel.name = this.actorObject.name || this.actorObject.preferredUsername;
                this.accountOrChannel.description = this.actorObject.summary;
                if (this.accountOrChannel instanceof video_channel_1.VideoChannelModel)
                    this.accountOrChannel.support = this.actorObject.support;
                yield (0, database_utils_1.runInReadCommittedTransaction)((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield (0, image_1.updateActorImageInstance)(this.actor, 1, avatarInfo, t);
                    yield (0, image_1.updateActorImageInstance)(this.actor, 2, bannerInfo, t);
                }));
                yield (0, database_utils_1.runInReadCommittedTransaction)((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield this.actor.save({ transaction: t });
                    yield this.accountOrChannel.save({ transaction: t });
                }));
                logger_1.logger.info('Remote account %s updated', this.actorObject.url);
            }
            catch (err) {
                if (this.actor !== undefined && this.actorFieldsSave !== undefined) {
                    (0, database_utils_1.resetSequelizeInstance)(this.actor, this.actorFieldsSave);
                }
                if (this.accountOrChannel !== undefined && this.accountOrChannelFieldsSave !== undefined) {
                    (0, database_utils_1.resetSequelizeInstance)(this.accountOrChannel, this.accountOrChannelFieldsSave);
                }
                logger_1.logger.debug('Cannot update the remote account.', { err });
                throw err;
            }
        });
    }
    updateActorInstance(actorInstance, actorObject) {
        var _a;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { followersCount, followingCount } = yield (0, shared_1.fetchActorFollowsCount)(actorObject);
            actorInstance.type = actorObject.type;
            actorInstance.preferredUsername = actorObject.preferredUsername;
            actorInstance.url = actorObject.id;
            actorInstance.publicKey = actorObject.publicKey.publicKeyPem;
            actorInstance.followersCount = followersCount;
            actorInstance.followingCount = followingCount;
            actorInstance.inboxUrl = actorObject.inbox;
            actorInstance.outboxUrl = actorObject.outbox;
            actorInstance.followersUrl = actorObject.followers;
            actorInstance.followingUrl = actorObject.following;
            if (actorObject.published)
                actorInstance.remoteCreatedAt = new Date(actorObject.published);
            if ((_a = actorObject.endpoints) === null || _a === void 0 ? void 0 : _a.sharedInbox) {
                actorInstance.sharedInboxUrl = actorObject.endpoints.sharedInbox;
            }
            actorInstance.changed('updatedAt', true);
        });
    }
}
exports.APActorUpdater = APActorUpdater;
