"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsCommand = void 0;
const tslib_1 = require("tslib");
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class NotificationsCommand extends shared_1.AbstractCommand {
    updateMySettings(options) {
        const path = '/api/v1/users/me/notification-settings';
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: options.settings, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    list(options) {
        const { start, count, unread, sort = '-createdAt' } = options;
        const path = '/api/v1/users/me/notifications';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: {
                start,
                count,
                sort,
                unread
            }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    markAsRead(options) {
        const { ids } = options;
        const path = '/api/v1/users/me/notifications/read';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: { ids }, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    markAsReadAll(options) {
        const path = '/api/v1/users/me/notifications/read-all';
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    getLastest(options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { total, data } = yield this.list(Object.assign(Object.assign({}, options), { start: 0, count: 1, sort: '-createdAt' }));
            if (total === 0)
                return undefined;
            return data[0];
        });
    }
}
exports.NotificationsCommand = NotificationsCommand;
