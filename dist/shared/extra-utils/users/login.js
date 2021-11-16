"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAccessTokensToServers = void 0;
function setAccessTokensToServers(servers) {
    const tasks = [];
    for (const server of servers) {
        const p = server.login.getAccessToken()
            .then(t => { server.accessToken = t; });
        tasks.push(p);
    }
    return Promise.all(tasks);
}
exports.setAccessTokensToServers = setAccessTokensToServers;
