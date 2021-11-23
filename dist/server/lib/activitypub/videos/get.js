"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateAPVideo = void 0;
const tslib_1 = require("tslib");
const activitypub_1 = require("@server/helpers/activitypub");
const database_utils_1 = require("@server/helpers/database-utils");
const job_queue_1 = require("@server/lib/job-queue");
const model_loaders_1 = require("@server/lib/model-loaders");
const refresh_1 = require("./refresh");
const shared_1 = require("./shared");
function getOrCreateAPVideo(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const syncParam = options.syncParam || { likes: true, dislikes: true, shares: true, comments: true, thumbnail: true, refreshVideo: false };
        const fetchType = options.fetchType || 'all';
        const allowRefresh = options.allowRefresh !== false;
        const videoUrl = (0, activitypub_1.getAPId)(options.videoObject);
        let videoFromDatabase = yield (0, model_loaders_1.loadVideoByUrl)(videoUrl, fetchType);
        if (videoFromDatabase) {
            if (allowRefresh === true) {
                videoFromDatabase = yield scheduleRefresh(videoFromDatabase, fetchType, syncParam);
            }
            return { video: videoFromDatabase, created: false };
        }
        const { videoObject } = yield (0, shared_1.fetchRemoteVideo)(videoUrl);
        if (!videoObject)
            throw new Error('Cannot fetch remote video with url: ' + videoUrl);
        if (videoObject.id !== videoUrl)
            return getOrCreateAPVideo(Object.assign(Object.assign({}, options), { fetchType: 'all', videoObject }));
        try {
            const creator = new shared_1.APVideoCreator(videoObject);
            const { autoBlacklisted, videoCreated } = yield (0, database_utils_1.retryTransactionWrapper)(creator.create.bind(creator), syncParam.thumbnail);
            yield (0, shared_1.syncVideoExternalAttributes)(videoCreated, videoObject, syncParam);
            return { video: videoCreated, created: true, autoBlacklisted };
        }
        catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                const alreadyCreatedVideo = yield (0, model_loaders_1.loadVideoByUrl)(videoUrl, fetchType);
                if (alreadyCreatedVideo)
                    return { video: alreadyCreatedVideo, created: false };
            }
            throw err;
        }
    });
}
exports.getOrCreateAPVideo = getOrCreateAPVideo;
function scheduleRefresh(video, fetchType, syncParam) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (!video.isOutdated())
            return video;
        const refreshOptions = {
            video,
            fetchedType: fetchType,
            syncParam
        };
        if (syncParam.refreshVideo === true) {
            return (0, refresh_1.refreshVideoIfNeeded)(refreshOptions);
        }
        yield job_queue_1.JobQueue.Instance.createJobWithPromise({
            type: 'activitypub-refresher',
            payload: { type: 'video', url: video.url }
        });
        return video;
    });
}
