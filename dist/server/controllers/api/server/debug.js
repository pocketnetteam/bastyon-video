"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const inbox_manager_1 = require("@server/lib/activitypub/inbox-manager");
const remove_dangling_resumable_uploads_scheduler_1 = require("@server/lib/schedulers/remove-dangling-resumable-uploads-scheduler");
const http_error_codes_1 = require("../../../../shared/models/http/http-error-codes");
const middlewares_1 = require("../../../middlewares");
const debugRouter = express_1.default.Router();
exports.debugRouter = debugRouter;
debugRouter.get('/debug', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(4), getDebug);
debugRouter.post('/debug/run-command', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(4), runCommand);
function getDebug(req, res) {
    return res.json({
        ip: req.ip,
        activityPubMessagesWaiting: inbox_manager_1.InboxManager.Instance.getActivityPubMessagesWaiting()
    });
}
function runCommand(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = req.body;
        if (body.command === 'remove-dandling-resumable-uploads') {
            yield remove_dangling_resumable_uploads_scheduler_1.RemoveDanglingResumableUploadsScheduler.Instance.execute();
        }
        return res.status(http_error_codes_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
