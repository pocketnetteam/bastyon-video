"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isURISearch = exports.buildMutedForSearchIndex = exports.isSearchIndexSearch = void 0;
const tslib_1 = require("tslib");
const config_1 = require("@server/initializers/config");
const account_blocklist_1 = require("@server/models/account/account-blocklist");
const application_1 = require("@server/models/application/application");
const server_blocklist_1 = require("@server/models/server/server-blocklist");
function isSearchIndexSearch(query) {
    if (query.searchTarget === 'search-index')
        return true;
    const searchIndexConfig = config_1.CONFIG.SEARCH.SEARCH_INDEX;
    if (searchIndexConfig.ENABLED !== true)
        return false;
    if (searchIndexConfig.DISABLE_LOCAL_SEARCH)
        return true;
    if (searchIndexConfig.IS_DEFAULT_SEARCH && !query.searchTarget)
        return true;
    return false;
}
exports.isSearchIndexSearch = isSearchIndexSearch;
function buildMutedForSearchIndex(res) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const serverActor = yield application_1.getServerActor();
        const accountIds = [serverActor.Account.id];
        if (res.locals.oauth) {
            accountIds.push(res.locals.oauth.token.User.Account.id);
        }
        const [blockedHosts, blockedAccounts] = yield Promise.all([
            server_blocklist_1.ServerBlocklistModel.listHostsBlockedBy(accountIds),
            account_blocklist_1.AccountBlocklistModel.listHandlesBlockedBy(accountIds)
        ]);
        return {
            blockedHosts,
            blockedAccounts
        };
    });
}
exports.buildMutedForSearchIndex = buildMutedForSearchIndex;
function isURISearch(search) {
    if (!search)
        return false;
    return search.startsWith('http://') || search.startsWith('https://');
}
exports.isURISearch = isURISearch;
