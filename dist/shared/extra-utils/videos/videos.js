"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVideoInServers = exports.checkVideoFilesWereRemoved = exports.uploadRandomVideoOnServers = exports.completeVideoCheck = exports.checkUploadVideoParam = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const core_utils_2 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const constants_1 = require("../../../server/initializers/constants");
const miscs_1 = require("../miscs");
const requests_1 = require("../requests/requests");
const server_1 = require("../server");
function checkVideoFilesWereRemoved(options) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { video, server, captions = [], onlyVideoFiles = false } = options;
        const webtorrentFiles = video.files || [];
        const hlsFiles = ((_a = video.streamingPlaylists[0]) === null || _a === void 0 ? void 0 : _a.files) || [];
        const thumbnailName = path_1.basename(video.thumbnailPath);
        const previewName = path_1.basename(video.previewPath);
        const torrentNames = webtorrentFiles.concat(hlsFiles).map(f => path_1.basename(f.torrentUrl));
        const captionNames = captions.map(c => path_1.basename(c.captionPath));
        const webtorrentFilenames = webtorrentFiles.map(f => path_1.basename(f.fileUrl));
        const hlsFilenames = hlsFiles.map(f => path_1.basename(f.fileUrl));
        let directories = {
            videos: webtorrentFilenames,
            redundancy: webtorrentFilenames,
            [path_1.join('playlists', 'hls')]: hlsFilenames,
            [path_1.join('redundancy', 'hls')]: hlsFilenames
        };
        if (onlyVideoFiles !== true) {
            directories = Object.assign(Object.assign({}, directories), { thumbnails: [thumbnailName], previews: [previewName], torrents: torrentNames, captions: captionNames });
        }
        for (const directory of Object.keys(directories)) {
            const directoryPath = server.servers.buildDirectory(directory);
            const directoryExists = yield fs_extra_1.pathExists(directoryPath);
            if (directoryExists === false)
                continue;
            const existingFiles = yield fs_extra_1.readdir(directoryPath);
            for (const existingFile of existingFiles) {
                for (const shouldNotExist of directories[directory]) {
                    chai_1.expect(existingFile, `File ${existingFile} should not exist in ${directoryPath}`).to.not.contain(shouldNotExist);
                }
            }
        }
    });
}
exports.checkVideoFilesWereRemoved = checkVideoFilesWereRemoved;
function saveVideoInServers(servers, uuid) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const server of servers) {
            server.store.videoDetails = yield server.videos.get({ id: uuid });
        }
    });
}
exports.saveVideoInServers = saveVideoInServers;
function checkUploadVideoParam(server, token, attributes, expectedStatus = models_1.HttpStatusCode.OK_200, mode = 'legacy') {
    return mode === 'legacy'
        ? server.videos.buildLegacyUpload({ token, attributes, expectedStatus })
        : server.videos.buildResumeUpload({ token, attributes, expectedStatus });
}
exports.checkUploadVideoParam = checkUploadVideoParam;
function completeVideoCheck(server, video, attributes) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!attributes.likes)
            attributes.likes = 0;
        if (!attributes.dislikes)
            attributes.dislikes = 0;
        const host = new URL(server.url).host;
        const originHost = attributes.account.host;
        chai_1.expect(video.name).to.equal(attributes.name);
        chai_1.expect(video.category.id).to.equal(attributes.category);
        chai_1.expect(video.category.label).to.equal(attributes.category !== null ? constants_1.VIDEO_CATEGORIES[attributes.category] : 'Misc');
        chai_1.expect(video.licence.id).to.equal(attributes.licence);
        chai_1.expect(video.licence.label).to.equal(attributes.licence !== null ? constants_1.VIDEO_LICENCES[attributes.licence] : 'Unknown');
        chai_1.expect(video.language.id).to.equal(attributes.language);
        chai_1.expect(video.language.label).to.equal(attributes.language !== null ? constants_1.VIDEO_LANGUAGES[attributes.language] : 'Unknown');
        chai_1.expect(video.privacy.id).to.deep.equal(attributes.privacy);
        chai_1.expect(video.privacy.label).to.deep.equal(constants_1.VIDEO_PRIVACIES[attributes.privacy]);
        chai_1.expect(video.nsfw).to.equal(attributes.nsfw);
        chai_1.expect(video.description).to.equal(attributes.description);
        chai_1.expect(video.account.id).to.be.a('number');
        chai_1.expect(video.account.host).to.equal(attributes.account.host);
        chai_1.expect(video.account.name).to.equal(attributes.account.name);
        chai_1.expect(video.channel.displayName).to.equal(attributes.channel.displayName);
        chai_1.expect(video.channel.name).to.equal(attributes.channel.name);
        chai_1.expect(video.likes).to.equal(attributes.likes);
        chai_1.expect(video.dislikes).to.equal(attributes.dislikes);
        chai_1.expect(video.isLocal).to.equal(attributes.isLocal);
        chai_1.expect(video.duration).to.equal(attributes.duration);
        chai_1.expect(miscs_1.dateIsValid(video.createdAt)).to.be.true;
        chai_1.expect(miscs_1.dateIsValid(video.publishedAt)).to.be.true;
        chai_1.expect(miscs_1.dateIsValid(video.updatedAt)).to.be.true;
        if (attributes.publishedAt) {
            chai_1.expect(video.publishedAt).to.equal(attributes.publishedAt);
        }
        if (attributes.originallyPublishedAt) {
            chai_1.expect(video.originallyPublishedAt).to.equal(attributes.originallyPublishedAt);
        }
        else {
            chai_1.expect(video.originallyPublishedAt).to.be.null;
        }
        const videoDetails = yield server.videos.get({ id: video.uuid });
        chai_1.expect(videoDetails.files).to.have.lengthOf(attributes.files.length);
        chai_1.expect(videoDetails.tags).to.deep.equal(attributes.tags);
        chai_1.expect(videoDetails.account.name).to.equal(attributes.account.name);
        chai_1.expect(videoDetails.account.host).to.equal(attributes.account.host);
        chai_1.expect(video.channel.displayName).to.equal(attributes.channel.displayName);
        chai_1.expect(video.channel.name).to.equal(attributes.channel.name);
        chai_1.expect(videoDetails.channel.host).to.equal(attributes.account.host);
        chai_1.expect(videoDetails.channel.isLocal).to.equal(attributes.channel.isLocal);
        chai_1.expect(miscs_1.dateIsValid(videoDetails.channel.createdAt.toString())).to.be.true;
        chai_1.expect(miscs_1.dateIsValid(videoDetails.channel.updatedAt.toString())).to.be.true;
        chai_1.expect(videoDetails.commentsEnabled).to.equal(attributes.commentsEnabled);
        chai_1.expect(videoDetails.downloadEnabled).to.equal(attributes.downloadEnabled);
        for (const attributeFile of attributes.files) {
            const file = videoDetails.files.find(f => f.resolution.id === attributeFile.resolution);
            chai_1.expect(file).not.to.be.undefined;
            let extension = core_utils_1.getLowercaseExtension(attributes.fixture);
            if (attributes.files.length > 1)
                extension = '.mp4';
            chai_1.expect(file.magnetUri).to.have.lengthOf.above(2);
            chai_1.expect(file.torrentDownloadUrl).to.match(new RegExp(`http://${host}/download/torrents/${core_utils_2.uuidRegex}-${file.resolution.id}.torrent`));
            chai_1.expect(file.torrentUrl).to.match(new RegExp(`http://${host}/lazy-static/torrents/${core_utils_2.uuidRegex}-${file.resolution.id}.torrent`));
            chai_1.expect(file.fileUrl).to.match(new RegExp(`http://${originHost}/static/webseed/${core_utils_2.uuidRegex}-${file.resolution.id}${extension}`));
            chai_1.expect(file.fileDownloadUrl).to.match(new RegExp(`http://${originHost}/download/videos/${core_utils_2.uuidRegex}-${file.resolution.id}${extension}`));
            yield Promise.all([
                requests_1.makeRawRequest(file.torrentUrl, 200),
                requests_1.makeRawRequest(file.torrentDownloadUrl, 200),
                requests_1.makeRawRequest(file.metadataUrl, 200)
            ]);
            chai_1.expect(file.resolution.id).to.equal(attributeFile.resolution);
            chai_1.expect(file.resolution.label).to.equal(attributeFile.resolution + 'p');
            const minSize = attributeFile.size - ((10 * attributeFile.size) / 100);
            const maxSize = attributeFile.size + ((10 * attributeFile.size) / 100);
            chai_1.expect(file.size, 'File size for resolution ' + file.resolution.label + ' outside confidence interval (' + minSize + '> size <' + maxSize + ')').to.be.above(minSize).and.below(maxSize);
            const torrent = yield miscs_1.webtorrentAdd(file.magnetUri, true);
            chai_1.expect(torrent.files).to.be.an('array');
            chai_1.expect(torrent.files.length).to.equal(1);
            chai_1.expect(torrent.files[0].path).to.exist.and.to.not.equal('');
        }
        chai_1.expect(videoDetails.thumbnailPath).to.exist;
        yield miscs_1.testImage(server.url, attributes.thumbnailfile || attributes.fixture, videoDetails.thumbnailPath);
        if (attributes.previewfile) {
            chai_1.expect(videoDetails.previewPath).to.exist;
            yield miscs_1.testImage(server.url, attributes.previewfile, videoDetails.previewPath);
        }
    });
}
exports.completeVideoCheck = completeVideoCheck;
function uploadRandomVideoOnServers(servers, serverNumber, additionalParams) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const server = servers.find(s => s.serverNumber === serverNumber);
        const res = yield server.videos.randomUpload({ wait: false, additionalParams });
        yield server_1.waitJobs(servers);
        return res;
    });
}
exports.uploadRandomVideoOnServers = uploadRandomVideoOnServers;
