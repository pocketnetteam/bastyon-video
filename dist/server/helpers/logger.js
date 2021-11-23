"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bunyanLogger = exports.loggerTagsFactory = exports.logger = exports.mtimeSortFilesDesc = exports.jsonLoggerFormat = exports.consoleLoggerFormat = exports.labelFormatter = exports.timestampFormatter = exports.buildLogger = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const path_1 = require("path");
const sql_formatter_1 = require("sql-formatter");
const winston_1 = require("winston");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const label = config_1.CONFIG.WEBSERVER.HOSTNAME + ':' + config_1.CONFIG.WEBSERVER.PORT;
(0, fs_extra_1.mkdirpSync)(config_1.CONFIG.STORAGE.LOG_DIR);
function getLoggerReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (key === 'cert')
            return 'Replaced by the logger to avoid large log message';
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value))
                return;
            seen.add(value);
        }
        if (value instanceof Set) {
            return Array.from(value);
        }
        if (value instanceof Map) {
            return Array.from(value.entries());
        }
        if (value instanceof Error) {
            const error = {};
            Object.getOwnPropertyNames(value).forEach(key => { error[key] = value[key]; });
            return error;
        }
        return value;
    };
}
const consoleLoggerFormat = winston_1.format.printf(info => {
    const toOmit = ['label', 'timestamp', 'level', 'message', 'sql', 'tags'];
    const obj = (0, lodash_1.omit)(info, ...toOmit);
    let additionalInfos = JSON.stringify(obj, getLoggerReplacer(), 2);
    if (additionalInfos === undefined || additionalInfos === '{}')
        additionalInfos = '';
    else
        additionalInfos = ' ' + additionalInfos;
    if (info.sql) {
        if (config_1.CONFIG.LOG.PRETTIFY_SQL) {
            additionalInfos += '\n' + (0, sql_formatter_1.format)(info.sql, {
                language: 'sql',
                indent: '  '
            });
        }
        else {
            additionalInfos += ' - ' + info.sql;
        }
    }
    return `[${info.label}] ${info.timestamp} ${info.level}: ${info.message}${additionalInfos}`;
});
exports.consoleLoggerFormat = consoleLoggerFormat;
const jsonLoggerFormat = winston_1.format.printf(info => {
    return JSON.stringify(info, getLoggerReplacer());
});
exports.jsonLoggerFormat = jsonLoggerFormat;
const timestampFormatter = winston_1.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
});
exports.timestampFormatter = timestampFormatter;
const labelFormatter = (suffix) => {
    return winston_1.format.label({
        label: suffix ? `${label} ${suffix}` : label
    });
};
exports.labelFormatter = labelFormatter;
const fileLoggerOptions = {
    filename: (0, path_1.join)(config_1.CONFIG.STORAGE.LOG_DIR, constants_1.LOG_FILENAME),
    handleExceptions: true,
    format: winston_1.format.combine(winston_1.format.timestamp(), jsonLoggerFormat)
};
if (config_1.CONFIG.LOG.ROTATION.ENABLED) {
    fileLoggerOptions.maxsize = config_1.CONFIG.LOG.ROTATION.MAX_FILE_SIZE;
    fileLoggerOptions.maxFiles = config_1.CONFIG.LOG.ROTATION.MAX_FILES;
}
const logger = buildLogger();
exports.logger = logger;
function buildLogger(labelSuffix) {
    return (0, winston_1.createLogger)({
        level: config_1.CONFIG.LOG.LEVEL,
        format: winston_1.format.combine(labelFormatter(labelSuffix), winston_1.format.splat()),
        transports: [
            new winston_1.transports.File(fileLoggerOptions),
            new winston_1.transports.Console({
                handleExceptions: true,
                format: winston_1.format.combine(timestampFormatter, winston_1.format.colorize(), consoleLoggerFormat)
            })
        ],
        exitOnError: true
    });
}
exports.buildLogger = buildLogger;
function bunyanLogFactory(level) {
    return function () {
        let meta = null;
        let args = [];
        args.concat(arguments);
        if (arguments[0] instanceof Error) {
            meta = arguments[0].toString();
            args = Array.prototype.slice.call(arguments, 1);
            args.push(meta);
        }
        else if (typeof (args[0]) !== 'string') {
            meta = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
            args.push(meta);
        }
        logger[level].apply(logger, args);
    };
}
const bunyanLogger = {
    trace: bunyanLogFactory('debug'),
    debug: bunyanLogFactory('debug'),
    info: bunyanLogFactory('info'),
    warn: bunyanLogFactory('warn'),
    error: bunyanLogFactory('error'),
    fatal: bunyanLogFactory('error')
};
exports.bunyanLogger = bunyanLogger;
function loggerTagsFactory(...defaultTags) {
    return (...tags) => {
        return { tags: defaultTags.concat(tags) };
    };
}
exports.loggerTagsFactory = loggerTagsFactory;
function mtimeSortFilesDesc(files, basePath) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const promises = [];
        const out = [];
        for (const file of files) {
            const p = (0, fs_extra_1.stat)(basePath + '/' + file)
                .then(stats => {
                if (stats.isFile())
                    out.push({ file, mtime: stats.mtime.getTime() });
            });
            promises.push(p);
        }
        yield Promise.all(promises);
        out.sort((a, b) => b.mtime - a.mtime);
        return out;
    });
}
exports.mtimeSortFilesDesc = mtimeSortFilesDesc;
