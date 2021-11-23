"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSmtpServer = void 0;
const tslib_1 = require("tslib");
const maildev_1 = (0, tslib_1.__importDefault)(require("maildev"));
const core_utils_1 = require("@shared/core-utils");
const miscs_1 = require("../miscs");
class MockSmtpServer {
    constructor() {
        this.started = false;
    }
    collectEmails(emailsCollection) {
        return new Promise((res, rej) => {
            const port = (0, miscs_1.parallelTests)() ? (0, core_utils_1.randomInt)(1000, 2000) : 1025;
            this.emails = emailsCollection;
            if (this.started) {
                return res(undefined);
            }
            const maildev = new maildev_1.default({
                ip: '127.0.0.1',
                smtp: port,
                disableWeb: true,
                silent: true
            });
            maildev.on('new', email => {
                this.emails.push(email);
            });
            maildev.listen(err => {
                if (err)
                    return rej(err);
                this.started = true;
                return res(port);
            });
        });
    }
    kill() {
        if (!this.emailChildProcess)
            return;
        process.kill(this.emailChildProcess.pid);
        this.emailChildProcess = null;
        MockSmtpServer.instance = null;
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.MockSmtpServer = MockSmtpServer;
