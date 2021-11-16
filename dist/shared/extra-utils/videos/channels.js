"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultVideoChannel = void 0;
function setDefaultVideoChannel(servers) {
    const tasks = [];
    for (const server of servers) {
        const p = server.users.getMyInfo()
            .then(user => { server.store.channel = user.videoChannels[0]; });
        tasks.push(p);
    }
    return Promise.all(tasks);
}
exports.setDefaultVideoChannel = setDefaultVideoChannel;
