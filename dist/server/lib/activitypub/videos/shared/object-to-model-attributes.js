"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoAttributesFromObject = exports.getCaptionAttributesFromObject = exports.getLiveAttributesFromObject = exports.getStreamingPlaylistAttributesFromObject = exports.getFileAttributesFromUrl = exports.getTagsFromObject = exports.getPreviewFromIcons = exports.getThumbnailFromIcons = void 0;
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const magnet_uri_1 = (0, tslib_1.__importDefault)(require("magnet-uri"));
const path_1 = require("path");
const videos_1 = require("@server/helpers/custom-validators/activitypub/videos");
const videos_2 = require("@server/helpers/custom-validators/videos");
const logger_1 = require("@server/helpers/logger");
const video_1 = require("@server/helpers/video");
const constants_1 = require("@server/initializers/constants");
const paths_1 = require("@server/lib/paths");
const video_caption_1 = require("@server/models/video/video-caption");
const video_streaming_playlist_1 = require("@server/models/video/video-streaming-playlist");
const models_1 = require("@server/types/models");
function getThumbnailFromIcons(videoObject) {
    let validIcons = videoObject.icon.filter(i => i.width > constants_1.THUMBNAILS_SIZE.minWidth);
    if (validIcons.length === 0)
        validIcons = videoObject.icon;
    return (0, lodash_1.minBy)(validIcons, 'width');
}
exports.getThumbnailFromIcons = getThumbnailFromIcons;
function getPreviewFromIcons(videoObject) {
    const validIcons = videoObject.icon.filter(i => i.width > constants_1.PREVIEWS_SIZE.minWidth);
    return (0, lodash_1.maxBy)(validIcons, 'width');
}
exports.getPreviewFromIcons = getPreviewFromIcons;
function getTagsFromObject(videoObject) {
    return videoObject.tag
        .filter(isAPHashTagObject)
        .map(t => t.name);
}
exports.getTagsFromObject = getTagsFromObject;
function getFileAttributesFromUrl(videoOrPlaylist, urls) {
    const fileUrls = urls.filter(u => isAPVideoUrlObject(u));
    if (fileUrls.length === 0)
        return [];
    const attributes = [];
    for (const fileUrl of fileUrls) {
        const magnet = urls.filter(isAPMagnetUrlObject)
            .find(u => u.height === fileUrl.height);
        if (!magnet)
            throw new Error('Cannot find associated magnet uri for file ' + fileUrl.href);
        const parsed = magnet_uri_1.default.decode(magnet.href);
        if (!parsed || (0, videos_2.isVideoFileInfoHashValid)(parsed.infoHash) === false) {
            throw new Error('Cannot parse magnet URI ' + magnet.href);
        }
        const torrentUrl = Array.isArray(parsed.xs)
            ? parsed.xs[0]
            : parsed.xs;
        const metadata = urls.filter(videos_1.isAPVideoFileUrlMetadataObject)
            .find(u => {
            return u.height === fileUrl.height &&
                u.fps === fileUrl.fps &&
                u.rel.includes(fileUrl.mediaType);
        });
        const extname = (0, video_1.getExtFromMimetype)(constants_1.MIMETYPES.VIDEO.MIMETYPE_EXT, fileUrl.mediaType);
        const resolution = fileUrl.height;
        const videoId = (0, models_1.isStreamingPlaylist)(videoOrPlaylist) ? null : videoOrPlaylist.id;
        const videoStreamingPlaylistId = (0, models_1.isStreamingPlaylist)(videoOrPlaylist) ? videoOrPlaylist.id : null;
        const attribute = {
            extname,
            infoHash: parsed.infoHash,
            resolution,
            size: fileUrl.size,
            fps: fileUrl.fps || -1,
            metadataUrl: metadata === null || metadata === void 0 ? void 0 : metadata.href,
            filename: (0, path_1.basename)(fileUrl.href),
            fileUrl: fileUrl.href,
            torrentUrl,
            torrentFilename: (0, paths_1.generateTorrentFileName)(videoOrPlaylist, resolution),
            videoId,
            videoStreamingPlaylistId
        };
        attributes.push(attribute);
    }
    return attributes;
}
exports.getFileAttributesFromUrl = getFileAttributesFromUrl;
function getStreamingPlaylistAttributesFromObject(video, videoObject, videoFiles) {
    const playlistUrls = videoObject.url.filter(u => isAPStreamingPlaylistUrlObject(u));
    if (playlistUrls.length === 0)
        return [];
    const attributes = [];
    for (const playlistUrlObject of playlistUrls) {
        const segmentsSha256UrlObject = playlistUrlObject.tag.find(isAPPlaylistSegmentHashesUrlObject);
        let files = playlistUrlObject.tag.filter(u => isAPVideoUrlObject(u));
        if (files.length === 0)
            files = videoFiles;
        if (!segmentsSha256UrlObject) {
            logger_1.logger.warn('No segment sha256 URL found in AP playlist object.', { playlistUrl: playlistUrlObject });
            continue;
        }
        const attribute = {
            type: 1,
            playlistFilename: (0, path_1.basename)(playlistUrlObject.href),
            playlistUrl: playlistUrlObject.href,
            segmentsSha256Filename: (0, path_1.basename)(segmentsSha256UrlObject.href),
            segmentsSha256Url: segmentsSha256UrlObject.href,
            p2pMediaLoaderInfohashes: video_streaming_playlist_1.VideoStreamingPlaylistModel.buildP2PMediaLoaderInfoHashes(playlistUrlObject.href, files),
            p2pMediaLoaderPeerVersion: constants_1.P2P_MEDIA_LOADER_PEER_VERSION,
            videoId: video.id,
            tagAPObject: playlistUrlObject.tag
        };
        attributes.push(attribute);
    }
    return attributes;
}
exports.getStreamingPlaylistAttributesFromObject = getStreamingPlaylistAttributesFromObject;
function getLiveAttributesFromObject(video, videoObject) {
    return {
        saveReplay: videoObject.liveSaveReplay,
        permanentLive: videoObject.permanentLive,
        videoId: video.id
    };
}
exports.getLiveAttributesFromObject = getLiveAttributesFromObject;
function getCaptionAttributesFromObject(video, videoObject) {
    return videoObject.subtitleLanguage.map(c => ({
        videoId: video.id,
        filename: video_caption_1.VideoCaptionModel.generateCaptionName(c.identifier),
        language: c.identifier,
        fileUrl: c.url
    }));
}
exports.getCaptionAttributesFromObject = getCaptionAttributesFromObject;
function getVideoAttributesFromObject(videoChannel, videoObject, to = []) {
    var _a;
    const privacy = to.includes(constants_1.ACTIVITY_PUB.PUBLIC)
        ? 1
        : 2;
    const duration = videoObject.duration.replace(/[^\d]+/, '');
    const language = (_a = videoObject.language) === null || _a === void 0 ? void 0 : _a.identifier;
    const category = videoObject.category
        ? parseInt(videoObject.category.identifier, 10)
        : undefined;
    const licence = videoObject.licence
        ? parseInt(videoObject.licence.identifier, 10)
        : undefined;
    const description = videoObject.content || null;
    const support = videoObject.support || null;
    return {
        name: videoObject.name,
        uuid: videoObject.uuid,
        url: videoObject.id,
        category,
        licence,
        language,
        description,
        support,
        nsfw: videoObject.sensitive,
        commentsEnabled: videoObject.commentsEnabled,
        downloadEnabled: videoObject.downloadEnabled,
        waitTranscoding: videoObject.waitTranscoding,
        isLive: videoObject.isLiveBroadcast,
        state: videoObject.state,
        channelId: videoChannel.id,
        duration: parseInt(duration, 10),
        createdAt: new Date(videoObject.published),
        publishedAt: new Date(videoObject.published),
        originallyPublishedAt: videoObject.originallyPublishedAt
            ? new Date(videoObject.originallyPublishedAt)
            : null,
        updatedAt: new Date(videoObject.updated),
        views: videoObject.views,
        likes: 0,
        dislikes: 0,
        remote: true,
        privacy,
        aspectRatio: videoObject.aspectRatio
    };
}
exports.getVideoAttributesFromObject = getVideoAttributesFromObject;
function isAPVideoUrlObject(url) {
    const urlMediaType = url.mediaType;
    return constants_1.MIMETYPES.VIDEO.MIMETYPE_EXT[urlMediaType] && urlMediaType.startsWith('video/');
}
function isAPStreamingPlaylistUrlObject(url) {
    return url && url.mediaType === 'application/x-mpegURL';
}
function isAPPlaylistSegmentHashesUrlObject(tag) {
    return tag && tag.name === 'sha256' && tag.type === 'Link' && tag.mediaType === 'application/json';
}
function isAPMagnetUrlObject(url) {
    return url && url.mediaType === 'application/x-bittorrent;x-scheme-handler/magnet';
}
function isAPHashTagObject(url) {
    return url && url.type === 'Hashtag';
}
