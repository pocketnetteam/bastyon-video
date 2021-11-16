"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlocklistCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class BlocklistCommand extends shared_1.AbstractCommand {
    listMyAccountBlocklist(options) {
        const path = '/api/v1/users/me/blocklist/accounts';
        return this.listBlocklist(options, path);
    }
    listMyServerBlocklist(options) {
        const path = '/api/v1/users/me/blocklist/servers';
        return this.listBlocklist(options, path);
    }
    listServerAccountBlocklist(options) {
        const path = '/api/v1/server/blocklist/accounts';
        return this.listBlocklist(options, path);
    }
    listServerServerBlocklist(options) {
        const path = '/api/v1/server/blocklist/servers';
        return this.listBlocklist(options, path);
    }
    addToMyBlocklist(options) {
        const { account, server } = options;
        const path = account
            ? '/api/v1/users/me/blocklist/accounts'
            : '/api/v1/users/me/blocklist/servers';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: {
                accountName: account,
                host: server
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    addToServerBlocklist(options) {
        const { account, server } = options;
        const path = account
            ? '/api/v1/server/blocklist/accounts'
            : '/api/v1/server/blocklist/servers';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: {
                accountName: account,
                host: server
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    removeFromMyBlocklist(options) {
        const { account, server } = options;
        const path = account
            ? '/api/v1/users/me/blocklist/accounts/' + account
            : '/api/v1/users/me/blocklist/servers/' + server;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    removeFromServerBlocklist(options) {
        const { account, server } = options;
        const path = account
            ? '/api/v1/server/blocklist/accounts/' + account
            : '/api/v1/server/blocklist/servers/' + server;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    listBlocklist(options, path) {
        const { start, count, sort = '-createdAt' } = options;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { start, count, sort }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.BlocklistCommand = BlocklistCommand;
