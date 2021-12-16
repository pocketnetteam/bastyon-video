"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerTubeVersionCheckScheduler = void 0;
const tslib_1 = require("tslib");
const requests_1 = require("@server/helpers/requests");
const application_1 = require("@server/models/application/application");
const core_utils_1 = require("@shared/core-utils");
const logger_1 = require("../../helpers/logger");
const config_1 = require("../../initializers/config");
const constants_1 = require("../../initializers/constants");
const notifier_1 = require("../notifier");
const abstract_scheduler_1 = require("./abstract-scheduler");
class PeerTubeVersionCheckScheduler extends abstract_scheduler_1.AbstractScheduler {
    constructor() {
        super();
        this.schedulerIntervalMs = constants_1.SCHEDULER_INTERVALS_MS.checkPeerTubeVersion;
    }
    internalExecute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.checkLatestVersion();
        });
    }
    checkLatestVersion() {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (config_1.CONFIG.PEERTUBE.CHECK_LATEST_VERSION.ENABLED === false)
                return;
            logger_1.logger.info('Checking latest PeerTube version.');
            const { body } = yield requests_1.doJSONRequest(config_1.CONFIG.PEERTUBE.CHECK_LATEST_VERSION.URL);
            if (!((_a = body === null || body === void 0 ? void 0 : body.peertube) === null || _a === void 0 ? void 0 : _a.latestVersion)) {
                logger_1.logger.warn('Cannot check latest PeerTube version: body is invalid.', { body });
                return;
            }
            const latestVersion = body.peertube.latestVersion;
            const application = yield application_1.ApplicationModel.load();
            if (application.latestPeerTubeVersion === latestVersion)
                return;
            if (core_utils_1.compareSemVer(constants_1.PEERTUBE_VERSION, latestVersion) < 0) {
                application.latestPeerTubeVersion = latestVersion;
                yield application.save();
                notifier_1.Notifier.Instance.notifyOfNewPeerTubeVersion(application, latestVersion);
            }
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.PeerTubeVersionCheckScheduler = PeerTubeVersionCheckScheduler;
