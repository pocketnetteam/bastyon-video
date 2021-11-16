"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveCommand = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const path_1 = require("path");
const models_1 = require("@shared/models");
const miscs_1 = require("../miscs");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
const live_1 = require("./live");
class LiveCommand extends shared_1.AbstractCommand {
    get(options) {
        const path = '/api/v1/videos/live';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path: path + '/' + options.videoId, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    update(options) {
        const { videoId, fields } = options;
        const path = '/api/v1/videos/live';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path: path + '/' + videoId, fields, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    create(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { fields } = options;
            const path = '/api/v1/videos/live';
            const attaches = {};
            if (fields.thumbnailfile)
                attaches.thumbnailfile = fields.thumbnailfile;
            if (fields.previewfile)
                attaches.previewfile = fields.previewfile;
            const body = yield requests_1.unwrapBody(this.postUploadRequest(Object.assign(Object.assign({}, options), { path,
                attaches, fields: lodash_1.omit(fields, 'thumbnailfile', 'previewfile'), implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
            return body.video;
        });
    }
    sendRTMPStreamInVideo(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { videoId, fixtureName, copyCodecs } = options;
            const videoLive = yield this.get({ videoId });
            return live_1.sendRTMPStream({ rtmpBaseUrl: videoLive.rtmpUrl, streamKey: videoLive.streamKey, fixtureName, copyCodecs });
        });
    }
    runAndTestStreamError(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const command = yield this.sendRTMPStreamInVideo(options);
            return live_1.testFfmpegStreamError(command, options.shouldHaveError);
        });
    }
    waitUntilPublished(options) {
        const { videoId } = options;
        return this.waitUntilState({ videoId, state: 1 });
    }
    waitUntilWaiting(options) {
        const { videoId } = options;
        return this.waitUntilState({ videoId, state: 4 });
    }
    waitUntilEnded(options) {
        const { videoId } = options;
        return this.waitUntilState({ videoId, state: 5 });
    }
    waitUntilSegmentGeneration(options) {
        const { resolution, segment, videoUUID } = options;
        const segmentName = `${resolution}-00000${segment}.ts`;
        return this.server.servers.waitUntilLog(`${videoUUID}/${segmentName}`, 2, false);
    }
    waitUntilSaved(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let video;
            do {
                video = yield this.server.videos.getWithToken({ token: options.token, id: options.videoId });
                yield miscs_1.wait(500);
            } while (video.isLive === true || video.state.id !== 1);
        });
    }
    countPlaylists(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const basePath = this.server.servers.buildDirectory('streaming-playlists');
            const hlsPath = path_1.join(basePath, 'hls', options.videoUUID);
            const files = yield fs_extra_1.readdir(hlsPath);
            return files.filter(f => f.endsWith('.m3u8')).length;
        });
    }
    waitUntilState(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let video;
            do {
                video = yield this.server.videos.getWithToken({ token: options.token, id: options.videoId });
                yield miscs_1.wait(500);
            } while (video.state.id !== options.state);
        });
    }
}
exports.LiveCommand = LiveCommand;
