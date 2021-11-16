"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminateServer = void 0;
function terminateServer(server) {
    if (!server)
        return Promise.resolve();
    return new Promise((res, rej) => {
        server.close(err => {
            if (err)
                return rej(err);
            return res();
        });
    });
}
exports.terminateServer = terminateServer;
