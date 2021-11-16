"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class AccountsCommand extends shared_1.AbstractCommand {
    list(options = {}) {
        const { sort = '-createdAt' } = options;
        const path = '/api/v1/accounts';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: { sort }, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    get(options) {
        const path = '/api/v1/accounts/' + options.accountName;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listRatings(options) {
        const { rating, accountName } = options;
        const path = '/api/v1/accounts/' + accountName + '/ratings';
        const query = { rating };
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.AccountsCommand = AccountsCommand;
