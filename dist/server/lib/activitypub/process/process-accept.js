"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAcceptActivity = void 0;
const tslib_1 = require("tslib");
const actor_follow_1 = require("../../../models/actor/actor-follow");
const outbox_1 = require("../outbox");
function processAcceptActivity(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { byActor: targetActor, inboxActor } = options;
        if (inboxActor === undefined)
            throw new Error('Need to accept on explicit inbox.');
        return processAccept(inboxActor, targetActor);
    });
}
exports.processAcceptActivity = processAcceptActivity;
function processAccept(actor, targetActor) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const follow = yield actor_follow_1.ActorFollowModel.loadByActorAndTarget(actor.id, targetActor.id);
        if (!follow)
            throw new Error('Cannot find associated follow.');
        if (follow.state !== 'accepted') {
            follow.state = 'accepted';
            yield follow.save();
            yield outbox_1.addFetchOutboxJob(targetActor);
        }
    });
}
