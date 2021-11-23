"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APActorCreator = void 0;
const tslib_1 = require("tslib");
const sequelize_1 = require("sequelize");
const database_1 = require("@server/initializers/database");
const account_1 = require("@server/models/account/account");
const actor_1 = require("@server/models/actor/actor");
const server_1 = require("@server/models/server/server");
const video_channel_1 = require("@server/models/video/video-channel");
const image_1 = require("../image");
const object_to_model_attributes_1 = require("./object-to-model-attributes");
const url_to_object_1 = require("./url-to-object");
class APActorCreator {
    constructor(actorObject, ownerActor) {
        this.actorObject = actorObject;
        this.ownerActor = ownerActor;
    }
    create() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const { followersCount, followingCount } = yield (0, url_to_object_1.fetchActorFollowsCount)(this.actorObject);
            const actorInstance = new actor_1.ActorModel((0, object_to_model_attributes_1.getActorAttributesFromObject)(this.actorObject, followersCount, followingCount));
            return database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const server = yield this.setServer(actorInstance, t);
                yield this.setImageIfNeeded(actorInstance, 1, t);
                yield this.setImageIfNeeded(actorInstance, 2, t);
                const { actorCreated, created } = yield this.saveActor(actorInstance, t);
                yield this.tryToFixActorUrlIfNeeded(actorCreated, actorInstance, created, t);
                if (actorCreated.type === 'Person' || actorCreated.type === 'Application') {
                    actorCreated.Account = (yield this.saveAccount(actorCreated, t));
                    actorCreated.Account.Actor = actorCreated;
                }
                if (actorCreated.type === 'Group') {
                    const channel = yield this.saveVideoChannel(actorCreated, t);
                    actorCreated.VideoChannel = Object.assign(channel, { Actor: actorCreated, Account: this.ownerActor.Account });
                }
                actorCreated.Server = server;
                return actorCreated;
            }));
        });
    }
    setServer(actor, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const actorHost = new URL(actor.url).host;
            const serverOptions = {
                where: {
                    host: actorHost
                },
                defaults: {
                    host: actorHost
                },
                transaction: t
            };
            const [server] = yield server_1.ServerModel.findOrCreate(serverOptions);
            actor.serverId = server.id;
            return server;
        });
    }
    setImageIfNeeded(actor, type, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const imageInfo = (0, object_to_model_attributes_1.getImageInfoFromObject)(this.actorObject, type);
            if (!imageInfo)
                return;
            return (0, image_1.updateActorImageInstance)(actor, type, imageInfo, t);
        });
    }
    saveActor(actor, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [actorCreated, created] = yield actor_1.ActorModel.findOrCreate({
                defaults: actor.toJSON(),
                where: {
                    [sequelize_1.Op.or]: [
                        {
                            url: actor.url
                        },
                        {
                            serverId: actor.serverId,
                            preferredUsername: actor.preferredUsername
                        }
                    ]
                },
                transaction: t
            });
            return { actorCreated, created };
        });
    }
    tryToFixActorUrlIfNeeded(actorCreated, newActor, created, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (created !== true && actorCreated.url !== newActor.url) {
                if (actorCreated.url.replace(/^http:\/\//, '') !== newActor.url.replace(/^https:\/\//, '')) {
                    throw new Error(`Actor from DB with URL ${actorCreated.url} does not correspond to actor ${newActor.url}`);
                }
                actorCreated.url = newActor.url;
                yield actorCreated.save({ transaction: t });
            }
        });
    }
    saveAccount(actor, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [accountCreated] = yield account_1.AccountModel.findOrCreate({
                defaults: {
                    name: (0, object_to_model_attributes_1.getActorDisplayNameFromObject)(this.actorObject),
                    description: this.actorObject.summary,
                    actorId: actor.id
                },
                where: {
                    actorId: actor.id
                },
                transaction: t
            });
            return accountCreated;
        });
    }
    saveVideoChannel(actor, t) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const [videoChannelCreated] = yield video_channel_1.VideoChannelModel.findOrCreate({
                defaults: {
                    name: (0, object_to_model_attributes_1.getActorDisplayNameFromObject)(this.actorObject),
                    description: this.actorObject.summary,
                    support: this.actorObject.support,
                    actorId: actor.id,
                    accountId: this.ownerActor.Account.id
                },
                where: {
                    actorId: actor.id
                },
                transaction: t
            });
            return videoChannelCreated;
        });
    }
}
exports.APActorCreator = APActorCreator;
