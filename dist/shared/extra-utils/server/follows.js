"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doubleFollow = void 0;
const tslib_1 = require("tslib");
const jobs_1 = require("./jobs");
function doubleFollow(server1, server2) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        yield Promise.all([
            server1.follows.follow({ hosts: [server2.url] }),
            server2.follows.follow({ hosts: [server1.url] })
        ]);
        yield (0, jobs_1.waitJobs)([server1, server2]);
        return true;
    });
}
exports.doubleFollow = doubleFollow;
