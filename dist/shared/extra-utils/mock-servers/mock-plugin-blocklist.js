"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockBlocklist = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const core_utils_1 = require("@shared/core-utils");
const utils_1 = require("./utils");
class MockBlocklist {
    initialize() {
        return new Promise(res => {
            const app = express_1.default();
            app.get('/blocklist', (req, res) => {
                return res.json(this.body);
            });
            const port = 45000 + core_utils_1.randomInt(1, 1000);
            this.server = app.listen(port, () => res(port));
        });
    }
    replace(body) {
        this.body = body;
    }
    terminate() {
        return utils_1.terminateServer(this.server);
    }
}
exports.MockBlocklist = MockBlocklist;
