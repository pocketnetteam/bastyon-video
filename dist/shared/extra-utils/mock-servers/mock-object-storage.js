"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockObjectStorage = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const got_1 = (0, tslib_1.__importDefault)(require("got"));
const stream_1 = require("stream");
const core_utils_1 = require("@shared/core-utils");
const server_1 = require("../server");
const utils_1 = require("./utils");
class MockObjectStorage {
    initialize() {
        return new Promise(res => {
            const app = (0, express_1.default)();
            app.get('/:bucketName/:path(*)', (req, res, next) => {
                const url = `http://${req.params.bucketName}.${server_1.ObjectStorageCommand.getEndpointHost()}/${req.params.path}`;
                if (process.env.DEBUG) {
                    console.log('Receiving request on mocked server %s.', req.url);
                    console.log('Proxifying request to %s', url);
                }
                return (0, stream_1.pipeline)(got_1.default.stream(url, { throwHttpErrors: false }), res, (err) => {
                    if (!err)
                        return;
                    console.error('Pipeline failed.', err);
                });
            });
            const port = 44000 + (0, core_utils_1.randomInt)(1, 1000);
            this.server = app.listen(port, () => res(port));
        });
    }
    terminate() {
        return (0, utils_1.terminateServer)(this.server);
    }
}
exports.MockObjectStorage = MockObjectStorage;
