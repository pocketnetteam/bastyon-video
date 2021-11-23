"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customPageRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const server_config_manager_1 = require("@server/lib/server-config-manager");
const actor_custom_page_1 = require("@server/models/account/actor-custom-page");
const models_1 = require("@shared/models");
const middlewares_1 = require("../../middlewares");
const customPageRouter = express_1.default.Router();
exports.customPageRouter = customPageRouter;
customPageRouter.get('/homepage/instance', (0, middlewares_1.asyncMiddleware)(getInstanceHomepage));
customPageRouter.put('/homepage/instance', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(9), (0, middlewares_1.asyncMiddleware)(updateInstanceHomepage));
function getInstanceHomepage(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const page = yield actor_custom_page_1.ActorCustomPageModel.loadInstanceHomepage();
        if (!page) {
            return res.fail({
                status: models_1.HttpStatusCode.NOT_FOUND_404,
                message: 'Instance homepage could not be found'
            });
        }
        return res.json(page.toFormattedJSON());
    });
}
function updateInstanceHomepage(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const content = req.body.content;
        yield actor_custom_page_1.ActorCustomPageModel.updateInstanceHomepage(content);
        server_config_manager_1.ServerConfigManager.Instance.updateHomepageState(content);
        return res.status(models_1.HttpStatusCode.NO_CONTENT_204).end();
    });
}
