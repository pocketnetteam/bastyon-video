"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitJobs = void 0;
const tslib_1 = require("tslib");
const miscs_1 = require("../miscs");
function waitJobs(serversArg, skipDelayed = false) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const pendingJobWait = process.env.NODE_PENDING_JOB_WAIT
            ? parseInt(process.env.NODE_PENDING_JOB_WAIT, 10)
            : 250;
        let servers;
        if (Array.isArray(serversArg) === false)
            servers = [serversArg];
        else
            servers = serversArg;
        const states = ['waiting', 'active'];
        if (!skipDelayed)
            states.push('delayed');
        const repeatableJobs = ['videos-views', 'activitypub-cleaner'];
        let pendingRequests;
        function tasksBuilder() {
            const tasks = [];
            for (const server of servers) {
                for (const state of states) {
                    const p = server.jobs.list({
                        state,
                        start: 0,
                        count: 10,
                        sort: '-createdAt'
                    }).then(body => body.data)
                        .then(jobs => jobs.filter(j => !repeatableJobs.includes(j.type)))
                        .then(jobs => {
                        if (jobs.length !== 0) {
                            pendingRequests = true;
                        }
                    });
                    tasks.push(p);
                }
                const p = server.debug.getDebug()
                    .then(obj => {
                    if (obj.activityPubMessagesWaiting !== 0) {
                        pendingRequests = true;
                    }
                });
                tasks.push(p);
            }
            return tasks;
        }
        do {
            pendingRequests = false;
            yield Promise.all(tasksBuilder());
            if (pendingRequests === false) {
                yield (0, miscs_1.wait)(pendingJobWait);
                yield Promise.all(tasksBuilder());
            }
            if (pendingRequests) {
                yield (0, miscs_1.wait)(pendingJobWait);
            }
        } while (pendingRequests);
    });
}
exports.waitJobs = waitJobs;
