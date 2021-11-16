"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTorrentVideo = exports.webtorrentAdd = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const parse_torrent_1 = tslib_1.__importDefault(require("parse-torrent"));
const path_1 = require("path");
let webtorrent;
function webtorrentAdd(torrentId, refreshWebTorrent = false) {
    const WebTorrent = require('webtorrent');
    if (!webtorrent)
        webtorrent = new WebTorrent();
    if (refreshWebTorrent === true)
        webtorrent = new WebTorrent();
    webtorrent.on('error', err => console.error('Error in webtorrent', err));
    return new Promise(res => {
        const torrent = webtorrent.add(torrentId, res);
        torrent.on('error', err => console.error('Error in webtorrent torrent', err));
        torrent.on('warning', warn => {
            const msg = typeof warn === 'string'
                ? warn
                : warn.message;
            if (msg.includes('Unsupported'))
                return;
            console.error('Warning in webtorrent torrent', warn);
        });
    });
}
exports.webtorrentAdd = webtorrentAdd;
function parseTorrentVideo(server, file) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const torrentName = path_1.basename(file.torrentUrl);
        const torrentPath = server.servers.buildDirectory(path_1.join('torrents', torrentName));
        const data = yield fs_extra_1.readFile(torrentPath);
        return parse_torrent_1.default(data);
    });
}
exports.parseTorrentVideo = parseTorrentVideo;
