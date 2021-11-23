"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockInstancesIndex = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const core_utils_1 = require("@shared/core-utils");
class MockInstancesIndex {
    constructor() {
        this.indexInstances = [];
    }
    initialize() {
        return new Promise(res => {
            const app = (0, express_1.default)();
            app.use('/', (req, res, next) => {
                if (process.env.DEBUG)
                    console.log('Receiving request on mocked server %s.', req.url);
                return next();
            });
            app.get('/api/v1/instances/hosts', (req, res) => {
                const since = req.query.since;
                const filtered = this.indexInstances.filter(i => {
                    if (!since)
                        return true;
                    return i.createdAt > since;
                });
                return res.json({
                    total: filtered.length,
                    data: filtered
                });
            });
            const port = 42000 + (0, core_utils_1.randomInt)(1, 1000);
            app.listen(port, () => res(port));
        });
    }
    addInstance(host) {
        this.indexInstances.push({ host, createdAt: new Date().toISOString() });
    }
}
exports.MockInstancesIndex = MockInstancesIndex;
