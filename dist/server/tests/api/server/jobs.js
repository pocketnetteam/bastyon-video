"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test jobs', function () {
    let servers;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should create some jobs', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            yield servers[1].videos.upload({ attributes: { name: 'video1' } });
            yield servers[1].videos.upload({ attributes: { name: 'video2' } });
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    it('Should list jobs', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield servers[1].jobs.list({ state: 'completed' });
            expect(body.total).to.be.above(2);
            expect(body.data).to.have.length.above(2);
        });
    });
    it('Should list jobs with sort, pagination and job type', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            {
                const body = yield servers[1].jobs.list({
                    state: 'completed',
                    start: 1,
                    count: 2,
                    sort: 'createdAt'
                });
                expect(body.total).to.be.above(2);
                expect(body.data).to.have.lengthOf(2);
                let job = body.data[0];
                if (job.type === 'videos-views')
                    job = body.data[1];
                expect(job.state).to.equal('completed');
                expect(job.type.startsWith('activitypub-')).to.be.true;
                expect((0, extra_utils_1.dateIsValid)(job.createdAt)).to.be.true;
                expect((0, extra_utils_1.dateIsValid)(job.processedOn)).to.be.true;
                expect((0, extra_utils_1.dateIsValid)(job.finishedOn)).to.be.true;
            }
            {
                const body = yield servers[1].jobs.list({
                    state: 'completed',
                    start: 0,
                    count: 100,
                    sort: 'createdAt',
                    jobType: 'activitypub-http-broadcast'
                });
                expect(body.total).to.be.above(2);
                for (const j of body.data) {
                    expect(j.type).to.equal('activitypub-http-broadcast');
                }
            }
        });
    });
    it('Should list all jobs', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield servers[1].jobs.list();
            expect(body.total).to.be.above(2);
            const jobs = body.data;
            expect(jobs).to.have.length.above(2);
            expect(jobs.find(j => j.state === 'delayed')).to.not.be.undefined;
            expect(jobs.find(j => j.state === 'completed')).to.not.be.undefined;
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
