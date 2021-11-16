"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactFormCommand = void 0;
const models_1 = require("@shared/models");
const shared_1 = require("../shared");
class ContactFormCommand extends shared_1.AbstractCommand {
    send(options) {
        const path = '/api/v1/server/contact';
        const body = {
            fromEmail: options.fromEmail,
            fromName: options.fromName,
            subject: options.subject,
            body: options.body
        };
        return this.postBodyRequest(Object.assign(Object.assign({}, options), { path, fields: body, implicitToken: false, defaultExpectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 }));
    }
}
exports.ContactFormCommand = ContactFormCommand;
