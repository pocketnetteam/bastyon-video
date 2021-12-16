"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProxy = void 0;
const tslib_1 = require("tslib");
const http_1 = require("http");
const proxy_1 = tslib_1.__importDefault(require("proxy"));
const core_utils_1 = require("@shared/core-utils");
const utils_1 = require("./utils");
class MockProxy {
    initialize() {
        return new Promise(res => {
            const port = 46000 + core_utils_1.randomInt(1, 1000);
            this.server = proxy_1.default(http_1.createServer());
            this.server.listen(port, () => res(port));
        });
    }
    terminate() {
        return utils_1.terminateServer(this.server);
    }
}
exports.MockProxy = MockProxy;
