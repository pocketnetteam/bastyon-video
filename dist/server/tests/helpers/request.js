"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const extra_utils_1 = require("../../../shared/extra-utils");
const requests_1 = require("../../helpers/requests");
describe('Request helpers', function () {
    const destPath1 = path_1.join(extra_utils_1.root(), 'test-output-1.txt');
    const destPath2 = path_1.join(extra_utils_1.root(), 'test-output-2.txt');
    it('Should throw an error when the bytes limit is exceeded for request', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield requests_1.doRequest(extra_utils_1.FIXTURE_URLS.file4K, { bodyKBLimit: 3 });
            }
            catch (_a) {
                return;
            }
            throw new Error('No error thrown by do request');
        });
    });
    it('Should throw an error when the bytes limit is exceeded for request and save file', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield requests_1.doRequestAndSaveToFile(extra_utils_1.FIXTURE_URLS.file4K, destPath1, { bodyKBLimit: 3 });
            }
            catch (_a) {
                yield extra_utils_1.wait(500);
                chai_1.expect(yield fs_extra_1.pathExists(destPath1)).to.be.false;
                return;
            }
            throw new Error('No error thrown by do request and save to file');
        });
    });
    it('Should succeed if the file is below the limit', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield requests_1.doRequest(extra_utils_1.FIXTURE_URLS.file4K, { bodyKBLimit: 5 });
            yield requests_1.doRequestAndSaveToFile(extra_utils_1.FIXTURE_URLS.file4K, destPath2, { bodyKBLimit: 5 });
            chai_1.expect(yield fs_extra_1.pathExists(destPath2)).to.be.true;
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.remove(destPath1);
            yield fs_extra_1.remove(destPath2);
        });
    });
});
