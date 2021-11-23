"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateVideoPlaylist = exports.createAccountPlaylists = void 0;
const tslib_1 = require("tslib");
const bluebird_1 = require("bluebird");
const activitypub_1 = require("@server/helpers/activitypub");
const misc_1 = require("@server/helpers/custom-validators/misc");
const logger_1 = require("@server/helpers/logger");
const constants_1 = require("@server/initializers/constants");
const database_1 = require("@server/initializers/database");
const thumbnail_1 = require("@server/lib/thumbnail");
const video_playlist_1 = require("@server/models/video/video-playlist");
const video_playlist_element_1 = require("@server/models/video/video-playlist-element");
const actors_1 = require("../actors");
const crawl_1 = require("../crawl");
const videos_1 = require("../videos");
const shared_1 = require("./shared");
const lTags = (0, logger_1.loggerTagsFactory)('ap', 'video-playlist');
function createAccountPlaylists(playlistUrls) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield (0, bluebird_1.map)(playlistUrls, (playlistUrl) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                const exists = yield video_playlist_1.VideoPlaylistModel.doesPlaylistExist(playlistUrl);
                if (exists === true)
                    return;
                const { playlistObject } = yield (0, shared_1.fetchRemoteVideoPlaylist)(playlistUrl);
                if (playlistObject === undefined) {
                    throw new Error(`Cannot refresh remote playlist ${playlistUrl}: invalid body.`);
                }
                return createOrUpdateVideoPlaylist(playlistObject);
            }
            catch (err) {
                logger_1.logger.warn('Cannot add playlist element %s.', playlistUrl, Object.assign({ err }, lTags(playlistUrl)));
            }
        }), { concurrency: constants_1.CRAWL_REQUEST_CONCURRENCY });
    });
}
exports.createAccountPlaylists = createAccountPlaylists;
function createOrUpdateVideoPlaylist(playlistObject, to) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const playlistAttributes = (0, shared_1.playlistObjectToDBAttributes)(playlistObject, to || playlistObject.to);
        yield setVideoChannel(playlistObject, playlistAttributes);
        const [upsertPlaylist] = yield video_playlist_1.VideoPlaylistModel.upsert(playlistAttributes, { returning: true });
        const playlistElementUrls = yield fetchElementUrls(playlistObject);
        const playlist = yield video_playlist_1.VideoPlaylistModel.loadWithAccountAndChannel(upsertPlaylist.id, null);
        yield updatePlaylistThumbnail(playlistObject, playlist);
        const elementsLength = yield rebuildVideoPlaylistElements(playlistElementUrls, playlist);
        playlist.setVideosLength(elementsLength);
        return playlist;
    });
}
exports.createOrUpdateVideoPlaylist = createOrUpdateVideoPlaylist;
function setVideoChannel(playlistObject, playlistAttributes) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!(0, misc_1.isArray)(playlistObject.attributedTo) || playlistObject.attributedTo.length !== 1) {
            throw new Error('Not attributed to for playlist object ' + (0, activitypub_1.getAPId)(playlistObject));
        }
        const actor = yield (0, actors_1.getOrCreateAPActor)(playlistObject.attributedTo[0], 'all');
        if (!actor.VideoChannel) {
            logger_1.logger.warn('Playlist "attributedTo" %s is not a video channel.', playlistObject.id, Object.assign({ playlistObject }, lTags(playlistObject.id)));
            return;
        }
        playlistAttributes.videoChannelId = actor.VideoChannel.id;
        playlistAttributes.ownerAccountId = actor.VideoChannel.Account.id;
    });
}
function fetchElementUrls(playlistObject) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let accItems = [];
        yield (0, crawl_1.crawlCollectionPage)(playlistObject.id, items => {
            accItems = accItems.concat(items);
            return Promise.resolve();
        });
        return accItems;
    });
}
function updatePlaylistThumbnail(playlistObject, playlist) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (playlistObject.icon) {
            let thumbnailModel;
            try {
                thumbnailModel = yield (0, thumbnail_1.updatePlaylistMiniatureFromUrl)({ downloadUrl: playlistObject.icon.url, playlist });
                yield playlist.setAndSaveThumbnail(thumbnailModel, undefined);
            }
            catch (err) {
                logger_1.logger.warn('Cannot set thumbnail of %s.', playlistObject.id, Object.assign({ err }, lTags(playlistObject.id, playlist.uuid, playlist.url)));
                if (thumbnailModel)
                    yield thumbnailModel.removeThumbnail();
            }
            return;
        }
        if (playlist.hasThumbnail()) {
            yield playlist.Thumbnail.destroy();
            playlist.Thumbnail = null;
        }
    });
}
function rebuildVideoPlaylistElements(elementUrls, playlist) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const elementsToCreate = yield buildElementsDBAttributes(elementUrls, playlist);
        yield database_1.sequelizeTypescript.transaction((t) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield video_playlist_element_1.VideoPlaylistElementModel.deleteAllOf(playlist.id, t);
            for (const element of elementsToCreate) {
                yield video_playlist_element_1.VideoPlaylistElementModel.create(element, { transaction: t });
            }
        }));
        logger_1.logger.info('Rebuilt playlist %s with %s elements.', playlist.url, elementsToCreate.length, lTags(playlist.uuid, playlist.url));
        return elementsToCreate.length;
    });
}
function buildElementsDBAttributes(elementUrls, playlist) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const elementsToCreate = [];
        yield (0, bluebird_1.map)(elementUrls, (elementUrl) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            try {
                const { elementObject } = yield (0, shared_1.fetchRemotePlaylistElement)(elementUrl);
                const { video } = yield (0, videos_1.getOrCreateAPVideo)({ videoObject: { id: elementObject.url }, fetchType: 'only-video' });
                elementsToCreate.push((0, shared_1.playlistElementObjectToDBAttributes)(elementObject, playlist, video));
            }
            catch (err) {
                logger_1.logger.warn('Cannot add playlist element %s.', elementUrl, Object.assign({ err }, lTags(playlist.uuid, playlist.url)));
            }
        }), { concurrency: constants_1.CRAWL_REQUEST_CONCURRENCY });
        return elementsToCreate;
    });
}
