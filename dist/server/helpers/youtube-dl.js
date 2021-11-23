"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeDL = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const got_1 = (0, tslib_1.__importDefault)(require("got"));
const path_1 = require("path");
const config_1 = require("@server/initializers/config");
const http_error_codes_1 = require("../../shared/models/http/http-error-codes");
const constants_1 = require("../initializers/constants");
const core_utils_1 = require("./core-utils");
const videos_1 = require("./custom-validators/videos");
const logger_1 = require("./logger");
const utils_1 = require("./utils");
const processOptions = {
    maxBuffer: 1024 * 1024 * 10
};
class YoutubeDL {
    constructor(url = '', enabledResolutions = []) {
        this.url = url;
        this.enabledResolutions = enabledResolutions;
    }
    getYoutubeDLInfo(opts) {
        return new Promise((res, rej) => {
            let args = opts || [];
            if (config_1.CONFIG.IMPORT.VIDEOS.HTTP.FORCE_IPV4) {
                args.push('--force-ipv4');
            }
            args = this.wrapWithProxyOptions(args);
            args = ['-f', this.getYoutubeDLVideoFormat()].concat(args);
            YoutubeDL.safeGetYoutubeDL()
                .then(youtubeDL => {
                youtubeDL.getInfo(this.url, args, processOptions, (err, info) => {
                    if (err)
                        return rej(err);
                    if (info.is_live === true)
                        return rej(new Error('Cannot download a live streaming.'));
                    const obj = this.buildVideoInfo(this.normalizeObject(info));
                    if (obj.name && obj.name.length < constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.min)
                        obj.name += ' video';
                    return res(obj);
                });
            })
                .catch(err => rej(err));
        });
    }
    getYoutubeDLSubs(opts) {
        return new Promise((res, rej) => {
            const cwd = config_1.CONFIG.STORAGE.TMP_DIR;
            const options = opts || { all: true, format: 'vtt', cwd };
            YoutubeDL.safeGetYoutubeDL()
                .then(youtubeDL => {
                youtubeDL.getSubs(this.url, options, (err, files) => {
                    if (err)
                        return rej(err);
                    if (!files)
                        return [];
                    logger_1.logger.debug('Get subtitles from youtube dl.', { url: this.url, files });
                    const subtitles = files.reduce((acc, filename) => {
                        const matched = filename.match(/\.([a-z]{2})(-[a-z]+)?\.(vtt|ttml)/i);
                        if (!matched || !matched[1])
                            return acc;
                        return [
                            ...acc,
                            {
                                language: matched[1],
                                path: (0, path_1.join)(cwd, filename),
                                filename
                            }
                        ];
                    }, []);
                    return res(subtitles);
                });
            })
                .catch(err => rej(err));
        });
    }
    getYoutubeDLVideoFormat() {
        const resolution = this.enabledResolutions.length === 0
            ? 720
            : Math.max(...this.enabledResolutions);
        return [
            `bestvideo[vcodec^=avc1][height=${resolution}]+bestaudio[ext=m4a]`,
            `bestvideo[vcodec!*=av01][vcodec!*=vp9.2][height=${resolution}]+bestaudio`,
            `bestvideo[vcodec^=avc1][height<=${resolution}]+bestaudio[ext=m4a]`,
            `bestvideo[vcodec!*=av01][vcodec!*=vp9.2]+bestaudio`,
            'best[vcodec!*=av01][vcodec!*=vp9.2]',
            'best'
        ].join('/');
    }
    downloadYoutubeDLVideo(fileExt, timeout) {
        const pathWithoutExtension = (0, utils_1.generateVideoImportTmpPath)(this.url, '');
        let timer;
        logger_1.logger.info('Importing youtubeDL video %s to %s', this.url, pathWithoutExtension);
        let options = ['-f', this.getYoutubeDLVideoFormat(), '-o', pathWithoutExtension];
        options = this.wrapWithProxyOptions(options);
        if (process.env.FFMPEG_PATH) {
            options = options.concat(['--ffmpeg-location', process.env.FFMPEG_PATH]);
        }
        logger_1.logger.debug('YoutubeDL options for %s.', this.url, { options });
        return new Promise((res, rej) => {
            YoutubeDL.safeGetYoutubeDL()
                .then(youtubeDL => {
                youtubeDL.exec(this.url, options, processOptions, (err) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    clearTimeout(timer);
                    try {
                        if (yield (0, fs_extra_1.pathExists)(pathWithoutExtension)) {
                            yield (0, fs_extra_1.move)(pathWithoutExtension, pathWithoutExtension + '.mp4');
                        }
                        const path = yield this.guessVideoPathWithExtension(pathWithoutExtension, fileExt);
                        if (err) {
                            (0, fs_extra_1.remove)(path)
                                .catch(err => logger_1.logger.error('Cannot delete path on YoutubeDL error.', { err }));
                            return rej(err);
                        }
                        return res(path);
                    }
                    catch (err) {
                        return rej(err);
                    }
                }));
                timer = setTimeout(() => {
                    const err = new Error('YoutubeDL download timeout.');
                    this.guessVideoPathWithExtension(pathWithoutExtension, fileExt)
                        .then(path => (0, fs_extra_1.remove)(path))
                        .finally(() => rej(err))
                        .catch(err => {
                        logger_1.logger.error('Cannot remove file in youtubeDL timeout.', { err });
                        return rej(err);
                    });
                }, timeout);
            })
                .catch(err => rej(err));
        });
    }
    buildOriginallyPublishedAt(obj) {
        let originallyPublishedAt = null;
        const uploadDateMatcher = /^(\d{4})(\d{2})(\d{2})$/.exec(obj.upload_date);
        if (uploadDateMatcher) {
            originallyPublishedAt = new Date();
            originallyPublishedAt.setHours(0, 0, 0, 0);
            const year = parseInt(uploadDateMatcher[1], 10);
            const month = parseInt(uploadDateMatcher[2], 10) - 1;
            const day = parseInt(uploadDateMatcher[3], 10);
            originallyPublishedAt.setFullYear(year, month, day);
        }
        return originallyPublishedAt;
    }
    guessVideoPathWithExtension(tmpPath, sourceExt) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!(0, videos_1.isVideoFileExtnameValid)(sourceExt)) {
                throw new Error('Invalid video extension ' + sourceExt);
            }
            const extensions = [sourceExt, '.mp4', '.mkv', '.webm'];
            for (const extension of extensions) {
                const path = tmpPath + extension;
                if (yield (0, fs_extra_1.pathExists)(path))
                    return path;
            }
            throw new Error('Cannot guess path of ' + tmpPath);
        });
    }
    normalizeObject(obj) {
        const newObj = {};
        for (const key of Object.keys(obj)) {
            if (key === 'resolution')
                continue;
            const value = obj[key];
            if (typeof value === 'string') {
                newObj[key] = value.normalize();
            }
            else {
                newObj[key] = value;
            }
        }
        return newObj;
    }
    buildVideoInfo(obj) {
        return {
            name: this.titleTruncation(obj.title),
            description: this.descriptionTruncation(obj.description),
            category: this.getCategory(obj.categories),
            licence: this.getLicence(obj.license),
            language: this.getLanguage(obj.language),
            nsfw: this.isNSFW(obj),
            tags: this.getTags(obj.tags),
            thumbnailUrl: obj.thumbnail || undefined,
            originallyPublishedAt: this.buildOriginallyPublishedAt(obj),
            ext: obj.ext
        };
    }
    titleTruncation(title) {
        return (0, core_utils_1.peertubeTruncate)(title, {
            length: constants_1.CONSTRAINTS_FIELDS.VIDEOS.NAME.max,
            separator: /,? +/,
            omission: ' […]'
        });
    }
    descriptionTruncation(description) {
        if (!description || description.length < constants_1.CONSTRAINTS_FIELDS.VIDEOS.DESCRIPTION.min)
            return undefined;
        return (0, core_utils_1.peertubeTruncate)(description, {
            length: constants_1.CONSTRAINTS_FIELDS.VIDEOS.DESCRIPTION.max,
            separator: /,? +/,
            omission: ' […]'
        });
    }
    isNSFW(info) {
        return info.age_limit && info.age_limit >= 16;
    }
    getTags(tags) {
        if (Array.isArray(tags) === false)
            return [];
        return tags
            .filter(t => t.length < constants_1.CONSTRAINTS_FIELDS.VIDEOS.TAG.max && t.length > constants_1.CONSTRAINTS_FIELDS.VIDEOS.TAG.min)
            .map(t => t.normalize())
            .slice(0, 5);
    }
    getLicence(licence) {
        if (!licence)
            return undefined;
        if (licence.includes('Creative Commons Attribution'))
            return 1;
        for (const key of Object.keys(constants_1.VIDEO_LICENCES)) {
            const peertubeLicence = constants_1.VIDEO_LICENCES[key];
            if (peertubeLicence.toLowerCase() === licence.toLowerCase())
                return parseInt(key, 10);
        }
        return undefined;
    }
    getCategory(categories) {
        if (!categories)
            return undefined;
        const categoryString = categories[0];
        if (!categoryString || typeof categoryString !== 'string')
            return undefined;
        if (categoryString === 'News & Politics')
            return 11;
        for (const key of Object.keys(constants_1.VIDEO_CATEGORIES)) {
            const category = constants_1.VIDEO_CATEGORIES[key];
            if (categoryString.toLowerCase() === category.toLowerCase())
                return parseInt(key, 10);
        }
        return undefined;
    }
    getLanguage(language) {
        return constants_1.VIDEO_LANGUAGES[language] ? language : undefined;
    }
    wrapWithProxyOptions(options) {
        if (config_1.CONFIG.IMPORT.VIDEOS.HTTP.PROXY.ENABLED) {
            logger_1.logger.debug('Using proxy for YoutubeDL');
            return ['--proxy', config_1.CONFIG.IMPORT.VIDEOS.HTTP.PROXY.URL].concat(options);
        }
        return options;
    }
    static updateYoutubeDLBinary() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            logger_1.logger.info('Updating youtubeDL binary.');
            const binDirectory = (0, path_1.join)((0, core_utils_1.root)(), 'node_modules', 'youtube-dl', 'bin');
            const bin = (0, path_1.join)(binDirectory, 'youtube-dl');
            const detailsPath = (0, path_1.join)(binDirectory, 'details');
            const url = process.env.YOUTUBE_DL_DOWNLOAD_HOST || 'https://yt-dl.org/downloads/latest/youtube-dl';
            yield (0, fs_extra_1.ensureDir)(binDirectory);
            try {
                const result = yield (0, got_1.default)(url, { followRedirect: false });
                if (result.statusCode !== http_error_codes_1.HttpStatusCode.FOUND_302) {
                    logger_1.logger.error('youtube-dl update error: did not get redirect for the latest version link. Status %d', result.statusCode);
                    return;
                }
                const newUrl = result.headers.location;
                const newVersion = /\/(\d{4}\.\d\d\.\d\d(\.\d)?)\/youtube-dl$/.exec(newUrl)[1];
                const downloadFileStream = got_1.default.stream(newUrl);
                const writeStream = (0, fs_1.createWriteStream)(bin, { mode: 493 });
                yield (0, core_utils_1.pipelinePromise)(downloadFileStream, writeStream);
                const details = JSON.stringify({ version: newVersion, path: bin, exec: 'youtube-dl' });
                yield (0, fs_extra_1.writeFile)(detailsPath, details, { encoding: 'utf8' });
                logger_1.logger.info('youtube-dl updated to version %s.', newVersion);
            }
            catch (err) {
                logger_1.logger.error('Cannot update youtube-dl.', { err });
            }
        });
    }
    static safeGetYoutubeDL() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let youtubeDL;
            try {
                youtubeDL = require('youtube-dl');
            }
            catch (e) {
                yield this.updateYoutubeDLBinary();
                youtubeDL = require('youtube-dl');
            }
            return youtubeDL;
        });
    }
}
exports.YoutubeDL = YoutubeDL;
