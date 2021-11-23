"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const mock_proxy_1 = require("@shared/extra-utils/mock-servers/mock-proxy");
const expect = chai.expect;
describe('Test proxy', function () {
    let servers = [];
    let proxy;
    const goodEnv = { HTTP_PROXY: '' };
    const badEnv = { HTTP_PROXY: 'http://localhost:9000' };
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            proxy = new mock_proxy_1.MockProxy();
            const proxyPort = yield proxy.initialize();
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            goodEnv.HTTP_PROXY = 'http://localhost:' + proxyPort;
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    it('Should succeed federation with the appropriate proxy config', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].kill();
            yield servers[0].run({}, { env: goodEnv });
            yield servers[0].videos.quickUpload({ name: 'video 1' });
            yield (0, extra_utils_1.waitJobs)(servers);
            for (const server of servers) {
                const { total, data } = yield server.videos.list();
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
            }
        });
    });
    it('Should fail federation with a wrong proxy config', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield servers[0].kill();
            yield servers[0].run({}, { env: badEnv });
            yield servers[0].videos.quickUpload({ name: 'video 2' });
            yield (0, extra_utils_1.waitJobs)(servers);
            {
                const { total, data } = yield servers[0].videos.list();
                expect(total).to.equal(2);
                expect(data).to.have.lengthOf(2);
            }
            {
                const { total, data } = yield servers[1].videos.list();
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield proxy.terminate();
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
