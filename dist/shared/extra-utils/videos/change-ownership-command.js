"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeOwnershipCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class ChangeOwnershipCommand extends shared_1.AbstractCommand {
    create(options) {
        const { videoId, username } = options;
        const path = '/api/v1/videos/' + videoId + '/give-ownership';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { username }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    list(options = {}) {
        const path = '/api/v1/videos/ownership';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { sort: '-createdAt' }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    accept(options) {
        const { ownershipId, channelId } = options;
        const path = '/api/v1/videos/ownership/' + ownershipId + '/accept';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { channelId }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    refuse(options) {
        const { ownershipId } = options;
        const path = '/api/v1/videos/ownership/' + ownershipId + '/refuse';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.ChangeOwnershipCommand = ChangeOwnershipCommand;
