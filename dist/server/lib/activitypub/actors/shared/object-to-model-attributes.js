"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActorDisplayNameFromObject = exports.getImageInfoFromObject = exports.getActorAttributesFromObject = void 0;
const core_utils_1 = require("@server/helpers/core-utils");
const misc_1 = require("@server/helpers/custom-validators/activitypub/misc");
const uuid_1 = require("@server/helpers/uuid");
const constants_1 = require("@server/initializers/constants");
function getActorAttributesFromObject(actorObject, followersCount, followingCount) {
    var _a;
    return {
        type: actorObject.type,
        preferredUsername: actorObject.preferredUsername,
        url: actorObject.id,
        publicKey: actorObject.publicKey.publicKeyPem,
        privateKey: null,
        followersCount,
        followingCount,
        inboxUrl: actorObject.inbox,
        outboxUrl: actorObject.outbox,
        followersUrl: actorObject.followers,
        followingUrl: actorObject.following,
        sharedInboxUrl: ((_a = actorObject.endpoints) === null || _a === void 0 ? void 0 : _a.sharedInbox)
            ? actorObject.endpoints.sharedInbox
            : null
    };
}
exports.getActorAttributesFromObject = getActorAttributesFromObject;
function getImageInfoFromObject(actorObject, type) {
    const mimetypes = constants_1.MIMETYPES.IMAGE;
    const icon = type === 1
        ? actorObject.icon
        : actorObject.image;
    if (!icon || icon.type !== 'Image' || !misc_1.isActivityPubUrlValid(icon.url))
        return undefined;
    let extension;
    if (icon.mediaType) {
        extension = mimetypes.MIMETYPE_EXT[icon.mediaType];
    }
    else {
        const tmp = core_utils_1.getLowercaseExtension(icon.url);
        if (mimetypes.EXT_MIMETYPE[tmp] !== undefined)
            extension = tmp;
    }
    if (!extension)
        return undefined;
    return {
        name: uuid_1.buildUUID() + extension,
        fileUrl: icon.url,
        height: icon.height,
        width: icon.width,
        type
    };
}
exports.getImageInfoFromObject = getImageInfoFromObject;
function getActorDisplayNameFromObject(actorObject) {
    return actorObject.name || actorObject.preferredUsername;
}
exports.getActorDisplayNameFromObject = getActorDisplayNameFromObject;
