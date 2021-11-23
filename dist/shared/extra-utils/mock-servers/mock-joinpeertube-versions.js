"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockJoinPeerTubeVersions = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const core_utils_1 = require("@shared/core-utils");
class MockJoinPeerTubeVersions {
    initialize() {
        return new Promise(res => {
            const app = (0, express_1.default)();
            app.use('/', (req, res, next) => {
                if (process.env.DEBUG)
                    console.log('Receiving request on mocked server %s.', req.url);
                return next();
            });
            app.get('/versions.json', (req, res) => {
                return res.json({
                    peertube: {
                        latestVersion: this.latestVersion
                    }
                });
            });
            const port = 43000 + (0, core_utils_1.randomInt)(1, 1000);
            app.listen(port, () => res(port));
        });
    }
    setLatestVersion(latestVersion) {
        this.latestVersion = latestVersion;
    }
}
exports.MockJoinPeerTubeVersions = MockJoinPeerTubeVersions;
