"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAbuseMessageForReporter = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const url_1 = require("@server/lib/activitypub/url");
const user_1 = require("@server/models/user/user");
const abstract_new_abuse_message_1 = require("./abstract-new-abuse-message");
class NewAbuseMessageForReporter extends abstract_new_abuse_message_1.AbstractNewAbuseMessage {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.abuse.ReporterAccount.isOwned() !== true)
                return;
            yield this.loadMessageAccount();
            const reporter = yield user_1.UserModel.loadByAccountActorId(this.abuse.ReporterAccount.actorId);
            if (reporter.Account.id === this.message.accountId)
                return;
            this.reporter = reporter;
        });
    }
    log() {
        logger_1.logger.info('Notifying reporter of new abuse message on %s.', url_1.getAbuseTargetUrl(this.abuse));
    }
    getTargetUsers() {
        if (!this.reporter)
            return [];
        return [this.reporter];
    }
    createEmail(to) {
        return this.createEmailFor(to, 'reporter');
    }
}
exports.NewAbuseMessageForReporter = NewAbuseMessageForReporter;
