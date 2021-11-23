"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCaptionFile = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const supertest_1 = (0, tslib_1.__importDefault)(require("supertest"));
const models_1 = require("@shared/models");
function testCaptionFile(url, captionPath, containsString) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(url)
            .get(captionPath)
            .expect(models_1.HttpStatusCode.OK_200);
        (0, chai_1.expect)(res.text).to.contain(containsString);
    });
}
exports.testCaptionFile = testCaptionFile;
