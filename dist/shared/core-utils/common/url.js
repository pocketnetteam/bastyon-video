"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decoratePlaylistLink = exports.decorateVideoLink = exports.buildVideoEmbedLink = exports.buildPlaylistEmbedLink = exports.buildVideoEmbedPath = exports.buildPlaylistEmbedPath = exports.buildPlaylistWatchPath = exports.buildVideoWatchPath = exports.buildVideoLink = exports.buildPlaylistLink = void 0;
const date_1 = require("./date");
function buildPlaylistLink(playlist, base) {
    return (base !== null && base !== void 0 ? base : window.location.origin) + buildPlaylistWatchPath(playlist);
}
exports.buildPlaylistLink = buildPlaylistLink;
function buildPlaylistWatchPath(playlist) {
    return '/w/p/' + playlist.shortUUID;
}
exports.buildPlaylistWatchPath = buildPlaylistWatchPath;
function buildVideoWatchPath(video) {
    return '/w/' + video.shortUUID;
}
exports.buildVideoWatchPath = buildVideoWatchPath;
function buildVideoLink(video, base) {
    return (base !== null && base !== void 0 ? base : window.location.origin) + buildVideoWatchPath(video);
}
exports.buildVideoLink = buildVideoLink;
function buildPlaylistEmbedPath(playlist) {
    return '/video-playlists/embed/' + playlist.uuid;
}
exports.buildPlaylistEmbedPath = buildPlaylistEmbedPath;
function buildPlaylistEmbedLink(playlist, base) {
    return (base !== null && base !== void 0 ? base : window.location.origin) + buildPlaylistEmbedPath(playlist);
}
exports.buildPlaylistEmbedLink = buildPlaylistEmbedLink;
function buildVideoEmbedPath(video) {
    return '/videos/embed/' + video.uuid;
}
exports.buildVideoEmbedPath = buildVideoEmbedPath;
function buildVideoEmbedLink(video, base) {
    return (base !== null && base !== void 0 ? base : window.location.origin) + buildVideoEmbedPath(video);
}
exports.buildVideoEmbedLink = buildVideoEmbedLink;
function decorateVideoLink(options) {
    const { url } = options;
    const params = generateParams(window.location.search);
    if (options.startTime !== undefined && options.startTime !== null) {
        const startTimeInt = Math.floor(options.startTime);
        params.set('start', (0, date_1.secondsToTime)(startTimeInt));
    }
    if (options.stopTime) {
        const stopTimeInt = Math.floor(options.stopTime);
        params.set('stop', (0, date_1.secondsToTime)(stopTimeInt));
    }
    if (options.subtitle)
        params.set('subtitle', options.subtitle);
    if (options.loop === true)
        params.set('loop', '1');
    if (options.autoplay === true)
        params.set('autoplay', '1');
    if (options.muted === true)
        params.set('muted', '1');
    if (options.title === false)
        params.set('title', '0');
    if (options.warningTitle === false)
        params.set('warningTitle', '0');
    if (options.controls === false)
        params.set('controls', '0');
    if (options.peertubeLink === false)
        params.set('peertubeLink', '0');
    return buildUrl(url, params);
}
exports.decorateVideoLink = decorateVideoLink;
function decoratePlaylistLink(options) {
    const { url } = options;
    const params = generateParams(window.location.search);
    if (options.playlistPosition)
        params.set('playlistPosition', '' + options.playlistPosition);
    return buildUrl(url, params);
}
exports.decoratePlaylistLink = decoratePlaylistLink;
function buildUrl(url, params) {
    let hasParams = false;
    params.forEach(() => { hasParams = true; });
    if (hasParams)
        return url + '?' + params.toString();
    return url;
}
function generateParams(url) {
    const params = new URLSearchParams(window.location.search);
    params.delete('videoId');
    params.delete('resume');
    return params;
}
