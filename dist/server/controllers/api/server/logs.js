"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = (0, tslib_1.__importDefault)(require("express"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("../../../initializers/config");
const constants_1 = require("../../../initializers/constants");
const middlewares_1 = require("../../../middlewares");
const logs_1 = require("../../../middlewares/validators/logs");
const logsRouter = express_1.default.Router();
exports.logsRouter = logsRouter;
logsRouter.get('/logs', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(3), logs_1.getLogsValidator, (0, middlewares_1.asyncMiddleware)(getLogs));
logsRouter.get('/audit-logs', middlewares_1.authenticate, (0, middlewares_1.ensureUserHasRight)(3), logs_1.getAuditLogsValidator, (0, middlewares_1.asyncMiddleware)(getAuditLogs));
const auditLogNameFilter = generateLogNameFilter(constants_1.AUDIT_LOG_FILENAME);
function getAuditLogs(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const output = yield generateOutput({
            startDateQuery: req.query.startDate,
            endDateQuery: req.query.endDate,
            level: 'audit',
            nameFilter: auditLogNameFilter
        });
        return res.json(output).end();
    });
}
const logNameFilter = generateLogNameFilter(constants_1.LOG_FILENAME);
function getLogs(req, res) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const output = yield generateOutput({
            startDateQuery: req.query.startDate,
            endDateQuery: req.query.endDate,
            level: req.query.level || 'info',
            nameFilter: logNameFilter
        });
        return res.json(output).end();
    });
}
function generateOutput(options) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { startDateQuery, level, nameFilter } = options;
        const logFiles = yield (0, fs_extra_1.readdir)(config_1.CONFIG.STORAGE.LOG_DIR);
        const sortedLogFiles = yield (0, logger_1.mtimeSortFilesDesc)(logFiles, config_1.CONFIG.STORAGE.LOG_DIR);
        let currentSize = 0;
        const startDate = new Date(startDateQuery);
        const endDate = options.endDateQuery ? new Date(options.endDateQuery) : new Date();
        let output = [];
        for (const meta of sortedLogFiles) {
            if (nameFilter.exec(meta.file) === null)
                continue;
            const path = (0, path_1.join)(config_1.CONFIG.STORAGE.LOG_DIR, meta.file);
            logger_1.logger.debug('Opening %s to fetch logs.', path);
            const result = yield getOutputFromFile(path, startDate, endDate, level, currentSize);
            if (!result.output)
                break;
            output = result.output.concat(output);
            currentSize = result.currentSize;
            if (currentSize > constants_1.MAX_LOGS_OUTPUT_CHARACTERS || (result.logTime && result.logTime < startDate.getTime()))
                break;
        }
        return output;
    });
}
function getOutputFromFile(path, startDate, endDate, level, currentSize) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        let logTime;
        const logsLevel = {
            audit: -1,
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        const content = yield (0, fs_extra_1.readFile)(path);
        const lines = content.toString().split('\n');
        const output = [];
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            let log;
            try {
                log = JSON.parse(line);
            }
            catch (_a) {
                continue;
            }
            logTime = new Date(log.timestamp).getTime();
            if (logTime >= startTime && logTime <= endTime && logsLevel[log.level] >= logsLevel[level]) {
                output.push(log);
                currentSize += line.length;
                if (currentSize > constants_1.MAX_LOGS_OUTPUT_CHARACTERS)
                    break;
            }
            else if (logTime < startTime) {
                break;
            }
        }
        return { currentSize, output: output.reverse(), logTime };
    });
}
function generateLogNameFilter(baseName) {
    return new RegExp('^' + baseName.replace(/\.log$/, '') + '\\d*.log$');
}
