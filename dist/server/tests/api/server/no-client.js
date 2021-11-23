"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Start and stop server without web client routes', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1, {}, { peertubeArgs: ['--no-client'] });
        });
    });
    it('Should fail getting the client', function () {
        const req = (0, supertest_1.default)(server.url)
            .get('/');
        return req.expect(models_1.HttpStatusCode.NOT_FOUND_404);
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
