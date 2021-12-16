"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewAbuseMessageForModerators = void 0;
const tslib_1 = require("tslib");
const logger_1 = require("@server/helpers/logger");
const url_1 = require("@server/lib/activitypub/url");
const user_1 = require("@server/models/user/user");
const abstract_new_abuse_message_1 = require("./abstract-new-abuse-message");
class NewAbuseMessageForModerators extends abstract_new_abuse_message_1.AbstractNewAbuseMessage {
    prepare() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.moderators = yield user_1.UserModel.listWithRight(6);
            this.moderators = this.moderators.filter(m => m.Account.id !== this.message.accountId);
            if (this.moderators.length === 0)
                return;
            yield this.loadMessageAccount();
        });
    }
    log() {
        logger_1.logger.info('Notifying moderators of new abuse message on %s.', url_1.getAbuseTargetUrl(this.abuse));
    }
    getTargetUsers() {
        return this.moderators;
    }
    createEmail(to) {
        return this.createEmailFor(to, 'moderator');
    }
}
exports.NewAbuseMessageForModerators = NewAbuseMessageForModerators;
