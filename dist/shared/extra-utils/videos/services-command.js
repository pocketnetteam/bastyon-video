"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class ServicesCommand extends shared_1.AbstractCommand {
    getOEmbed(options) {
        const path = '/services/oembed';
        const query = {
            url: options.oembedUrl,
            format: options.format,
            maxheight: options.maxHeight,
            maxwidth: options.maxWidth
        };
        return this.getRequest(Object.assign(Object.assign({}, options), { path,
            query, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.OK_200 }));
    }
}
exports.ServicesCommand = ServicesCommand;
