"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelsCommand = void 0;
const tslib_1 = require("tslib");
const core_utils_1 = require("@shared/core-utils");
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class ChannelsCommand extends shared_1.AbstractCommand {
    list(options = {}) {
        const path = '/api/v1/video-channels';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: core_utils_1.pick(options, ['start', 'count', 'sort', 'withStats']), implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    listByAccount(options) {
        const { accountName, sort = 'createdAt' } = options;
        const path = '/api/v1/accounts/' + accountName + '/video-channels';
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, query: Object.assign({ sort }, core_utils_1.pick(options, ['start', 'count', 'withStats', 'search'])), implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    create(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const path = '/api/v1/video-channels/';
            const defaultAttributes = {
                displayName: 'my super video channel',
                description: 'my super channel description',
                support: 'my super channel support'
            };
            const attributes = Object.assign(Object.assign({}, defaultAttributes), options.attributes);
            const body = yield requests_1.unwrapBody(this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 })));
            return body.videoChannel;
        });
    }
    update(options) {
        const { channelName, attributes } = options;
        const path = '/api/v1/video-channels/' + channelName;
        return this.putBodyRequest(Object.assign(Object.assign({}, options), { path, fields: attributes, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    delete(options) {
        const path = '/api/v1/video-channels/' + options.channelName;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
    get(options) {
        const path = '/api/v1/video-channels/' + options.channelName;
        return this.getRequestBody(Object.assign(Object.assign({}, options), { path, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    updateImage(options) {
        const { channelName, fixture, type } = options;
        const path = `/api/v1/video-channels/${channelName}/${type}/pick`;
        return this.updateImageRequest(Object.assign(Object.assign({}, options), { path,
            fixture, fieldname: type + 'file', implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
    deleteImage(options) {
        const { channelName, type } = options;
        const path = `/api/v1/video-channels/${channelName}/${type}`;
        return this.deleteRequest(Object.assign(Object.assign({}, options), { path, implicitToken: true, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.ChannelsCommand = ChannelsCommand;
