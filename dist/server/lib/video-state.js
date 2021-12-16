"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveToNextState = exports.buildNextVideoState = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const database_1 = require("@server/initializers/database");
const video_1 = require("@server/models/video/video");
const video_job_info_1 = require("@server/models/video/video-job-info");
const videos_1 = require("./activitypub/videos");
const notifier_1 = require("./notifier");
const video_2 = require("./video");
function buildNextVideoState(currentState) {
    if (currentState === 1) {
        throw new Error('Video is already in its final state');
    }
    if (currentState !== 2 &&
        currentState !== 6 &&
        config_1.CONFIG.TRANSCODING.ENABLED) {
        return 2;
    }
    if (currentState !== 6 &&
        config_1.CONFIG.OBJECT_STORAGE.ENABLED) {
        return 6;
    }
    return 1;
}
exports.buildNextVideoState = buildNextVideoState;
function moveToNextState(video, isNewVideo = true) {
    return database_1.sequelizeTypescript.transaction((t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoDatabase = yield video_1.VideoModel.loadAndPopulateAccountAndServerAndTags(video.uuid, t);
        if (!videoDatabase)
            return undefined;
        if (videoDatabase.state === 1) {
            return videos_1.federateVideoIfNeeded(videoDatabase, false, t);
        }
        const newState = buildNextVideoState(videoDatabase.state);
        if (newState === 1) {
            return moveToPublishedState(videoDatabase, isNewVideo, t);
        }
        if (newState === 6) {
            return moveToExternalStorageState(videoDatabase, isNewVideo, t);
        }
    }));
}
exports.moveToNextState = moveToNextState;
function moveToPublishedState(video, isNewVideo, transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Publishing video %s.', video.uuid, { tags: [video.uuid] });
        const previousState = video.state;
        yield video.setNewState(1, isNewVideo, transaction);
        yield videos_1.federateVideoIfNeeded(video, isNewVideo, transaction);
        if (isNewVideo)
            notifier_1.Notifier.Instance.notifyOnNewVideoIfNeeded(video);
        if (previousState === 2) {
            notifier_1.Notifier.Instance.notifyOnVideoPublishedAfterTranscoding(video);
        }
    });
}
function moveToExternalStorageState(video, isNewVideo, transaction) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const videoJobInfo = yield video_job_info_1.VideoJobInfoModel.load(video.id, transaction);
        const pendingTranscode = (videoJobInfo === null || videoJobInfo === void 0 ? void 0 : videoJobInfo.pendingTranscode) || 0;
        if (pendingTranscode !== 0)
            return;
        yield video.setNewState(6, isNewVideo, transaction);
        logger_1.logger.info('Creating external storage move job for video %s.', video.uuid, { tags: [video.uuid] });
        video_2.addMoveToObjectStorageJob(video, isNewVideo)
            .catch(err => logger_1.logger.error('Cannot add move to object storage job', { err }));
    });
}
