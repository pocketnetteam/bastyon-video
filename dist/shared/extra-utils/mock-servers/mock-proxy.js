"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProxy = void 0;
const tslib_1 = require("tslib");
const http_1 = require("http");
const proxy_1 = (0, tslib_1.__importDefault)(require("proxy"));
const core_utils_1 = require("@shared/core-utils");
const utils_1 = require("./utils");
class MockProxy {
    initialize() {
        return new Promise(res => {
            const port = 46000 + (0, core_utils_1.randomInt)(1, 1000);
            this.server = (0, proxy_1.default)((0, http_1.createServer)());
            this.server.listen(port, () => res(port));
        });
    }
    terminate() {
        return (0, utils_1.terminateServer)(this.server);
    }
}
exports.MockProxy = MockProxy;
