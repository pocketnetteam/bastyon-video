"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test contact form API validators', function () {
    let server;
    const emails = [];
    const defaultBody = {
        fromName: 'super name',
        fromEmail: 'toto@example.com',
        subject: 'my subject',
        body: 'Hello, how are you?'
    };
    let emailPort;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(60000);
            emailPort = yield extra_utils_1.MockSmtpServer.Instance.collectEmails(emails);
            server = yield extra_utils_1.createSingleServer(1);
            command = server.contactForm;
        });
    });
    it('Should not accept a contact form if emails are disabled', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.send(Object.assign(Object.assign({}, defaultBody), { expectedStatus: models_1.HttpStatusCode.CONFLICT_409 }));
        });
    });
    it('Should not accept a contact form if it is disabled in the configuration', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(25000);
            yield extra_utils_1.killallServers([server]);
            yield server.run({ smtp: { hostname: 'localhost', port: emailPort }, contact_form: { enabled: false } });
            yield command.send(Object.assign(Object.assign({}, defaultBody), { expectedStatus: models_1.HttpStatusCode.CONFLICT_409 }));
        });
    });
    it('Should not accept a contact form if from email is invalid', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(25000);
            yield extra_utils_1.killallServers([server]);
            yield server.run({ smtp: { hostname: 'localhost', port: emailPort } });
            yield command.send(Object.assign(Object.assign({}, defaultBody), { fromEmail: 'badEmail', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
            yield command.send(Object.assign(Object.assign({}, defaultBody), { fromEmail: 'badEmail@', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
            yield command.send(Object.assign(Object.assign({}, defaultBody), { fromEmail: undefined, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
        });
    });
    it('Should not accept a contact form if from name is invalid', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.send(Object.assign(Object.assign({}, defaultBody), { fromName: 'name'.repeat(100), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
            yield command.send(Object.assign(Object.assign({}, defaultBody), { fromName: '', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
            yield command.send(Object.assign(Object.assign({}, defaultBody), { fromName: undefined, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
        });
    });
    it('Should not accept a contact form if body is invalid', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.send(Object.assign(Object.assign({}, defaultBody), { body: 'body'.repeat(5000), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
            yield command.send(Object.assign(Object.assign({}, defaultBody), { body: 'a', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
            yield command.send(Object.assign(Object.assign({}, defaultBody), { body: undefined, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }));
        });
    });
    it('Should accept a contact form with the correct parameters', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.send(defaultBody);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
