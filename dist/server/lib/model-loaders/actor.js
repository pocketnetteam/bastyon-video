"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadActorByUrl = void 0;
const actor_1 = require("../../models/actor/actor");
function loadActorByUrl(url, fetchType) {
    if (fetchType === 'all')
        return actor_1.ActorModel.loadByUrlAndPopulateAccountAndChannel(url);
    if (fetchType === 'association-ids')
        return actor_1.ActorModel.loadByUrl(url);
}
exports.loadActorByUrl = loadActorByUrl;
