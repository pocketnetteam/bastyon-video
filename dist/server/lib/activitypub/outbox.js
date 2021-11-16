"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFetchOutboxJob = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const application_1 = require("@server/models/application/application");
const job_queue_1 = require("../job-queue");
function addFetchOutboxJob(actor) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const serverActor = yield application_1.getServerActor();
        if (serverActor.id === actor.id) {
            logger_1.logger.error('Cannot fetch our own outbox!');
            return undefined;
        }
        const payload = {
            uri: actor.outboxUrl,
            type: 'activity'
        };
        return job_queue_1.JobQueue.Instance.createJob({ type: 'activitypub-http-fetcher', payload });
    });
}
exports.addFetchOutboxJob = addFetchOutboxJob;
