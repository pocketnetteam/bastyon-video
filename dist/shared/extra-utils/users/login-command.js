"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginCommand = void 0;
const tslib_1 = require("tslib");
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class LoginCommand extends shared_1.AbstractCommand {
    login(options = {}) {
        var _a;
        const { client = this.server.store.client, user = this.server.store.user } = options;
        const path = '/api/v1/users/token';
        const body = {
            client_id: client.id,
            client_secret: client.secret,
            username: user.username,
            password: (_a = user.password) !== null && _a !== void 0 ? _a : 'password',
            response_type: 'code',
            grant_type: 'password',
            scope: 'upload'
        };
        return (0, requests_1.unwrapBody)(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, requestType: 'form', fields: body, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    getAccessToken(arg1, password) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            let user;
            if (!arg1)
                user = this.server.store.user;
            else if (typeof arg1 === 'object')
                user = arg1;
            else
                user = { username: arg1, password };
            try {
                const body = yield this.login({ user });
                return body.access_token;
            }
            catch (err) {
                throw new Error(`Cannot authenticate. Please check your username/password. (${err})`);
            }
        });
    }
    loginUsingExternalToken(options) {
        const { username, externalAuthToken } = options;
        const path = '/api/v1/users/token';
        const body = {
            client_id: this.server.store.client.id,
            client_secret: this.server.store.client.secret,
            username: username,
            response_type: 'code',
            grant_type: 'password',
            scope: 'upload',
            externalAuthToken
        };
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, requestType: 'form', fields: body, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    logout(options) {
        const path = '/api/v1/users/revoke-token';
        return (0, requests_1.unwrapBody)(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, requestType: 'form', implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
    }
    refreshToken(options) {
        const path = '/api/v1/users/token';
        const body = {
            client_id: this.server.store.client.id,
            client_secret: this.server.store.client.secret,
            refresh_token: options.refreshToken,
            response_type: 'code',
            grant_type: 'refresh_token'
        };
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, requestType: 'form', fields: body, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    getClient(options = {}) {
        const path = '/api/v1/oauth-clients/local';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, host: this.server.host, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.LoginCommand = LoginCommand;
