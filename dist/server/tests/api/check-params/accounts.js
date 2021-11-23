"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test accounts API validators', function () {
    const path = '/api/v1/accounts/';
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
        });
    });
    describe('When listing accounts', function () {
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, server.accessToken);
            });
        });
    });
    describe('When getting an account', function () {
        it('Should return 404 with a non existing name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield server.accounts.get({ accountName: 'arfaze', expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
