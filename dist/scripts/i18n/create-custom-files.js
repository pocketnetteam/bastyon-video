"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const path_1 = require("path");
const register_ts_paths_1 = require("../../server/helpers/register-ts-paths");
const constants_1 = require("../../server/initializers/constants");
const i18n_1 = require("../../shared/core-utils/i18n");
(0, register_ts_paths_1.registerTSPaths)();
const videojs = require((0, path_1.join)(__dirname, '../../../client/src/locale/videojs.en-US.json'));
const playerKeys = {
    'Quality': 'Quality',
    'Auto': 'Auto',
    'Speed': 'Speed',
    'Subtitles/CC': 'Subtitles/CC',
    'peers': 'peers',
    'peer': 'peer',
    'Go to the video page': 'Go to the video page',
    'Settings': 'Settings',
    'Watching this video may reveal your IP address to others.': 'Watching this video may reveal your IP address to others.',
    'Copy the video URL': 'Copy the video URL',
    'Copy the video URL at the current time': 'Copy the video URL at the current time',
    'Copy embed code': 'Copy embed code',
    'Copy magnet URI': 'Copy magnet URI',
    'Total downloaded: ': 'Total downloaded: ',
    'Total uploaded: ': 'Total uploaded: ',
    'From servers: ': 'From servers: ',
    'From peers: ': 'From peers: ',
    'Normal mode': 'Normal mode',
    'Stats for nerds': 'Stats for nerds',
    'Theater mode': 'Theater mode',
    'Video UUID': 'Video UUID',
    'Viewport / Frames': 'Viewport / Frames',
    'Resolution': 'Resolution',
    'Volume': 'Volume',
    'Codecs': 'Codecs',
    'Color': 'Color',
    'Connection Speed': 'Connection Speed',
    'Network Activity': 'Network Activity',
    'Total Transfered': 'Total Transfered',
    'Download Breakdown': 'Download Breakdown',
    'Buffer Progress': 'Buffer Progress',
    'Buffer State': 'Buffer State',
    'Live Latency': 'Live Latency',
    'Player mode': 'Player mode'
};
Object.assign(playerKeys, videojs);
const serverKeys = {};
(0, lodash_1.values)(constants_1.VIDEO_CATEGORIES)
    .concat((0, lodash_1.values)(constants_1.VIDEO_LICENCES))
    .concat((0, lodash_1.values)(constants_1.VIDEO_PRIVACIES))
    .concat((0, lodash_1.values)(constants_1.VIDEO_STATES))
    .concat((0, lodash_1.values)(constants_1.VIDEO_IMPORT_STATES))
    .concat((0, lodash_1.values)(constants_1.VIDEO_PLAYLIST_PRIVACIES))
    .concat((0, lodash_1.values)(constants_1.VIDEO_PLAYLIST_TYPES))
    .concat([
    'This video does not exist.',
    'We cannot fetch the video. Please try again later.',
    'Sorry',
    'This video is not available because the remote instance is not responding.',
    'This playlist does not exist',
    'We cannot fetch the playlist. Please try again later.',
    'Playlist: {1}',
    'By {1}',
    'Unavailable video'
])
    .forEach(v => { serverKeys[v] = v; });
Object.assign(serverKeys, {
    Misc: 'Misc',
    Unknown: 'Unknown'
});
const languageKeys = {};
const languages = (0, constants_1.buildLanguages)();
Object.keys(languages).forEach(k => { languageKeys[languages[k]] = languages[k]; });
Object.assign(serverKeys, languageKeys);
writeAll().catch(err => {
    console.error(err);
    process.exit(-1);
});
function writeAll() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const localePath = (0, path_1.join)(__dirname, '../../../client/src/locale');
        yield (0, fs_extra_1.writeJSON)((0, path_1.join)(localePath, 'player.en-US.json'), playerKeys, { spaces: 4 });
        yield (0, fs_extra_1.writeJSON)((0, path_1.join)(localePath, 'server.en-US.json'), serverKeys, { spaces: 4 });
        for (const key of Object.keys(i18n_1.I18N_LOCALES)) {
            const playerJsonPath = (0, path_1.join)(localePath, `player.${key}.json`);
            const translatedPlayer = require(playerJsonPath);
            const newTranslatedPlayer = Object.assign({}, playerKeys, translatedPlayer);
            yield (0, fs_extra_1.writeJSON)(playerJsonPath, newTranslatedPlayer, { spaces: 4 });
            const serverJsonPath = (0, path_1.join)(localePath, `server.${key}.json`);
            const translatedServer = require(serverJsonPath);
            const newTranslatedServer = Object.assign({}, serverKeys, translatedServer);
            yield (0, fs_extra_1.writeJSON)(serverJsonPath, newTranslatedServer, { spaces: 4 });
        }
    });
}
