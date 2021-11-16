"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playlistElementObjectToDBAttributes = exports.playlistObjectToDBAttributes = void 0;
const constants_1 = require("@server/initializers/constants");
function playlistObjectToDBAttributes(playlistObject, to) {
    const privacy = to.includes(constants_1.ACTIVITY_PUB.PUBLIC)
        ? 1
        : 2;
    return {
        name: playlistObject.name,
        description: playlistObject.content,
        privacy,
        url: playlistObject.id,
        uuid: playlistObject.uuid,
        ownerAccountId: null,
        videoChannelId: null,
        createdAt: new Date(playlistObject.published),
        updatedAt: new Date(playlistObject.updated)
    };
}
exports.playlistObjectToDBAttributes = playlistObjectToDBAttributes;
function playlistElementObjectToDBAttributes(elementObject, videoPlaylist, video) {
    return {
        position: elementObject.position,
        url: elementObject.id,
        startTimestamp: elementObject.startTimestamp || null,
        stopTimestamp: elementObject.stopTimestamp || null,
        videoPlaylistId: videoPlaylist.id,
        videoId: video.id
    };
}
exports.playlistElementObjectToDBAttributes = playlistElementObjectToDBAttributes;
