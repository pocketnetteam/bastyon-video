"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test logs', function () {
    let server;
    let logsCommand;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            logsCommand = server.logs;
        });
    });
    describe('With the standard log file', function () {
        it('Should get logs with a start date', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.videos.upload({ attributes: { name: 'video 1' } });
                yield extra_utils_1.waitJobs([server]);
                const now = new Date();
                yield server.videos.upload({ attributes: { name: 'video 2' } });
                yield extra_utils_1.waitJobs([server]);
                const body = yield logsCommand.getLogs({ startDate: now });
                const logsString = JSON.stringify(body);
                expect(logsString.includes('video 1')).to.be.false;
                expect(logsString.includes('video 2')).to.be.true;
            });
        });
        it('Should get logs with an end date', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield server.videos.upload({ attributes: { name: 'video 3' } });
                yield extra_utils_1.waitJobs([server]);
                const now1 = new Date();
                yield server.videos.upload({ attributes: { name: 'video 4' } });
                yield extra_utils_1.waitJobs([server]);
                const now2 = new Date();
                yield server.videos.upload({ attributes: { name: 'video 5' } });
                yield extra_utils_1.waitJobs([server]);
                const body = yield logsCommand.getLogs({ startDate: now1, endDate: now2 });
                const logsString = JSON.stringify(body);
                expect(logsString.includes('video 3')).to.be.false;
                expect(logsString.includes('video 4')).to.be.true;
                expect(logsString.includes('video 5')).to.be.false;
            });
        });
        it('Should get filter by level', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                const now = new Date();
                yield server.videos.upload({ attributes: { name: 'video 6' } });
                yield extra_utils_1.waitJobs([server]);
                {
                    const body = yield logsCommand.getLogs({ startDate: now, level: 'info' });
                    const logsString = JSON.stringify(body);
                    expect(logsString.includes('video 6')).to.be.true;
                }
                {
                    const body = yield logsCommand.getLogs({ startDate: now, level: 'warn' });
                    const logsString = JSON.stringify(body);
                    expect(logsString.includes('video 6')).to.be.false;
                }
            });
        });
        it('Should log ping requests', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const now = new Date();
                yield server.servers.ping();
                const body = yield logsCommand.getLogs({ startDate: now, level: 'info' });
                const logsString = JSON.stringify(body);
                expect(logsString.includes('/api/v1/ping')).to.be.true;
            });
        });
        it('Should not log ping requests', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield extra_utils_1.killallServers([server]);
                yield server.run({ log: { log_ping_requests: false } });
                const now = new Date();
                yield server.servers.ping();
                const body = yield logsCommand.getLogs({ startDate: now, level: 'info' });
                const logsString = JSON.stringify(body);
                expect(logsString.includes('/api/v1/ping')).to.be.false;
            });
        });
    });
    describe('With the audit log', function () {
        it('Should get logs with a start date', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(20000);
                yield server.videos.upload({ attributes: { name: 'video 7' } });
                yield extra_utils_1.waitJobs([server]);
                const now = new Date();
                yield server.videos.upload({ attributes: { name: 'video 8' } });
                yield extra_utils_1.waitJobs([server]);
                const body = yield logsCommand.getAuditLogs({ startDate: now });
                const logsString = JSON.stringify(body);
                expect(logsString.includes('video 7')).to.be.false;
                expect(logsString.includes('video 8')).to.be.true;
                expect(body).to.have.lengthOf(1);
                const item = body[0];
                const message = JSON.parse(item.message);
                expect(message.domain).to.equal('videos');
                expect(message.action).to.equal('create');
            });
        });
        it('Should get logs with an end date', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield server.videos.upload({ attributes: { name: 'video 9' } });
                yield extra_utils_1.waitJobs([server]);
                const now1 = new Date();
                yield server.videos.upload({ attributes: { name: 'video 10' } });
                yield extra_utils_1.waitJobs([server]);
                const now2 = new Date();
                yield server.videos.upload({ attributes: { name: 'video 11' } });
                yield extra_utils_1.waitJobs([server]);
                const body = yield logsCommand.getAuditLogs({ startDate: now1, endDate: now2 });
                const logsString = JSON.stringify(body);
                expect(logsString.includes('video 9')).to.be.false;
                expect(logsString.includes('video 10')).to.be.true;
                expect(logsString.includes('video 11')).to.be.false;
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
