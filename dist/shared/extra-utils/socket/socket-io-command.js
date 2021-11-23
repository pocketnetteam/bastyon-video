"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOCommand = void 0;
const socket_io_client_1 = require("socket.io-client");
const shared_1 = require("../shared");
class SocketIOCommand extends shared_1.AbstractCommand {
    getUserNotificationSocket(options = {}) {
        var _a;
        return (0, socket_io_client_1.io)(this.server.url + '/user-notifications', {
            query: { accessToken: (_a = options.token) !== null && _a !== void 0 ? _a : this.server.accessToken }
        });
    }
    getLiveNotificationSocket() {
        return (0, socket_io_client_1.io)(this.server.url + '/live-videos');
    }
}
exports.SocketIOCommand = SocketIOCommand;
