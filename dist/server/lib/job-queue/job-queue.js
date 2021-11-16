"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueue = exports.jobTypes = void 0;
const tslib_1 = require("tslib");
const bull_1 = tslib_1.__importDefault(require("bull"));
const jobs_1 = require("@server/helpers/custom-validators/jobs");
const config_1 = require("@server/initializers/config");
const video_redundancy_1 = require("@server/lib/job-queue/handlers/video-redundancy");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const redis_1 = require("../redis");
const activitypub_cleaner_1 = require("./handlers/activitypub-cleaner");
const activitypub_follow_1 = require("./handlers/activitypub-follow");
const activitypub_http_broadcast_1 = require("./handlers/activitypub-http-broadcast");
const activitypub_http_fetcher_1 = require("./handlers/activitypub-http-fetcher");
const activitypub_http_unicast_1 = require("./handlers/activitypub-http-unicast");
const activitypub_refresher_1 = require("./handlers/activitypub-refresher");
const actor_keys_1 = require("./handlers/actor-keys");
const email_1 = require("./handlers/email");
const move_to_object_storage_1 = require("./handlers/move-to-object-storage");
const video_file_import_1 = require("./handlers/video-file-import");
const video_import_1 = require("./handlers/video-import");
const video_live_ending_1 = require("./handlers/video-live-ending");
const video_transcoding_1 = require("./handlers/video-transcoding");
const video_views_1 = require("./handlers/video-views");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const handlers = {
    'activitypub-http-broadcast': activitypub_http_broadcast_1.processActivityPubHttpBroadcast,
    'activitypub-http-unicast': activitypub_http_unicast_1.processActivityPubHttpUnicast,
    'activitypub-http-fetcher': activitypub_http_fetcher_1.processActivityPubHttpFetcher,
    'activitypub-cleaner': activitypub_cleaner_1.processActivityPubCleaner,
    'activitypub-follow': activitypub_follow_1.processActivityPubFollow,
    'video-file-import': video_file_import_1.processVideoFileImport,
    'video-transcoding': video_transcoding_1.processVideoTranscoding,
    'email': email_1.processEmail,
    'video-import': video_import_1.processVideoImport,
    'videos-views': video_views_1.processVideosViews,
    'activitypub-refresher': activitypub_refresher_1.refreshAPObject,
    'video-live-ending': video_live_ending_1.processVideoLiveEnding,
    'actor-keys': actor_keys_1.processActorKeys,
    'video-redundancy': video_redundancy_1.processVideoRedundancy,
    'move-to-object-storage': move_to_object_storage_1.processMoveToObjectStorage
};
const jobTypes = [
    'activitypub-follow',
    'activitypub-http-broadcast',
    'activitypub-http-fetcher',
    'activitypub-http-unicast',
    'activitypub-cleaner',
    'email',
    'video-transcoding',
    'video-file-import',
    'video-import',
    'videos-views',
    'activitypub-refresher',
    'video-redundancy',
    'actor-keys',
    'video-live-ending',
    'move-to-object-storage'
];
exports.jobTypes = jobTypes;
class JobQueue {
    constructor() {
        this.queues = {};
        this.initialized = false;
    }
    init() {
        if (this.initialized === true)
            return;
        this.initialized = true;
        this.jobRedisPrefix = 'bull-' + constants_1.WEBSERVER.HOST;
        const queueOptions = {
            prefix: this.jobRedisPrefix,
            redis: redis_1.Redis.getRedisClientOptions(),
            settings: {
                maxStalledCount: 10
            }
        };
        for (const handlerName of Object.keys(handlers)) {
            const queue = new bull_1.default(handlerName, queueOptions);
            const handler = handlers[handlerName];
            queue.process(this.getJobConcurrency(handlerName), handler)
                .catch(err => logger_1.logger.error('Error in job queue processor %s.', handlerName, { err }));
            queue.on('failed', (job, err) => {
                logger_1.logger.error('Cannot execute job %d in queue %s.', job.id, handlerName, { payload: job.data, err });
                const errorData = {
                    info: job.data,
                    errText: err
                };
                return node_fetch_1.default(constants_1.LOGGER_ENDPOINT, {
                    body: Object.assign({}, errorData)
                });
            });
            queue.on('error', err => {
                logger_1.logger.error('Error in job queue %s.', handlerName, { err });
            });
            this.queues[handlerName] = queue;
        }
        this.addRepeatableJobs();
    }
    terminate() {
        for (const queueName of Object.keys(this.queues)) {
            const queue = this.queues[queueName];
            queue.close();
        }
    }
    createJob(obj, options = {}) {
        this.createJobWithPromise(obj, options)
            .catch(err => logger_1.logger.error('Cannot create job.', { err, obj }));
    }
    createJobWithPromise(obj, options = {}) {
        const queue = this.queues[obj.type];
        if (queue === undefined) {
            logger_1.logger.error('Unknown queue %s: cannot create job.', obj.type);
            return;
        }
        const jobArgs = {
            backoff: { delay: 60 * 1000, type: 'exponential' },
            attempts: constants_1.JOB_ATTEMPTS[obj.type],
            timeout: constants_1.JOB_TTL[obj.type],
            priority: options.priority,
            delay: options.delay
        };
        return queue.add(obj.payload, jobArgs);
    }
    listForApi(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { state, start, count, asc, jobType } = options;
            const states = state ? [state] : jobs_1.jobStates;
            let results = [];
            const filteredJobTypes = this.filterJobTypes(jobType);
            for (const jobType of filteredJobTypes) {
                const queue = this.queues[jobType];
                if (queue === undefined) {
                    logger_1.logger.error('Unknown queue %s to list jobs.', jobType);
                    continue;
                }
                const jobs = yield queue.getJobs(states, 0, start + count, asc);
                results = results.concat(jobs);
            }
            results.sort((j1, j2) => {
                if (j1.timestamp < j2.timestamp)
                    return -1;
                else if (j1.timestamp === j2.timestamp)
                    return 0;
                return 1;
            });
            if (asc === false)
                results.reverse();
            return results.slice(start, start + count);
        });
    }
    count(state, jobType) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const states = state ? [state] : jobs_1.jobStates;
            let total = 0;
            const filteredJobTypes = this.filterJobTypes(jobType);
            for (const type of filteredJobTypes) {
                const queue = this.queues[type];
                if (queue === undefined) {
                    logger_1.logger.error('Unknown queue %s to count jobs.', type);
                    continue;
                }
                const counts = yield queue.getJobCounts();
                for (const s of states) {
                    total += counts[s];
                }
            }
            return total;
        });
    }
    removeOldJobs() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const key of Object.keys(this.queues)) {
                const queue = this.queues[key];
                yield queue.clean(constants_1.JOB_COMPLETED_LIFETIME, 'completed');
            }
        });
    }
    addRepeatableJobs() {
        this.queues['videos-views'].add({}, {
            repeat: constants_1.REPEAT_JOBS['videos-views']
        }).catch(err => logger_1.logger.error('Cannot add repeatable job.', { err }));
        if (config_1.CONFIG.FEDERATION.VIDEOS.CLEANUP_REMOTE_INTERACTIONS) {
            this.queues['activitypub-cleaner'].add({}, {
                repeat: constants_1.REPEAT_JOBS['activitypub-cleaner']
            }).catch(err => logger_1.logger.error('Cannot add repeatable job.', { err }));
        }
    }
    filterJobTypes(jobType) {
        if (!jobType)
            return jobTypes;
        return jobTypes.filter(t => t === jobType);
    }
    getJobConcurrency(jobType) {
        if (jobType === 'video-transcoding')
            return config_1.CONFIG.TRANSCODING.CONCURRENCY;
        if (jobType === 'video-import')
            return config_1.CONFIG.IMPORT.VIDEOS.CONCURRENCY;
        return constants_1.JOB_CONCURRENCY[jobType];
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
    getQueues(type, state = ['active', 'completed', 'failed', 'waiting', 'delayed', 'paused']) {
        const queue = this.queues[type];
        return queue.getJobs(state);
    }
}
exports.JobQueue = JobQueue;
