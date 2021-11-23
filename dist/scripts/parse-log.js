"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const register_ts_paths_1 = require("../server/helpers/register-ts-paths");
(0, register_ts_paths_1.registerTSPaths)();
const commander_1 = require("commander");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const readline_1 = require("readline");
const winston = (0, tslib_1.__importStar)(require("winston"));
const logger_1 = require("../server/helpers/logger");
const config_1 = require("../server/initializers/config");
const util_1 = require("util");
const sql_formatter_1 = require("sql-formatter");
commander_1.program
    .option('-l, --level [level]', 'Level log (debug/info/warn/error)')
    .option('-f, --files [file...]', 'Files to parse. If not provided, the script will parse the latest log file from config)')
    .option('-t, --tags [tags...]', 'Display only lines with these tags')
    .option('-nt, --not-tags [tags...]', 'Donrt display lines containing these tags')
    .parse(process.argv);
const options = commander_1.program.opts();
const excludedKeys = {
    level: true,
    message: true,
    splat: true,
    timestamp: true,
    tags: true,
    label: true,
    sql: true
};
function keysExcluder(key, value) {
    return excludedKeys[key] === true ? undefined : value;
}
const loggerFormat = winston.format.printf((info) => {
    let additionalInfos = JSON.stringify(info, keysExcluder, 2);
    if (additionalInfos === '{}')
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
    return `[${info.label}] ${toTimeFormat(info.timestamp)} ${info.level}: ${info.message}${additionalInfos}`;
});
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: options.level || 'debug',
            stderrLevels: [],
            format: winston.format.combine(winston.format.splat(), (0, logger_1.labelFormatter)(), winston.format.colorize(), loggerFormat)
        })
    ],
    exitOnError: true
});
const logLevels = {
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger)
};
run()
    .then(() => process.exit(0))
    .catch(err => console.error(err));
function run() {
    return new Promise((res) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const files = yield getFiles();
        for (const file of files) {
            if (file === 'peertube-audit.log')
                continue;
            console.log('Opening %s.', file);
            const stream = (0, fs_extra_1.createReadStream)(file);
            const rl = (0, readline_1.createInterface)({
                input: stream
            });
            rl.on('line', line => {
                try {
                    const log = JSON.parse(line);
                    if (options.tags && !containsTags(log.tags, options.tags)) {
                        return;
                    }
                    if (options.notTags && containsTags(log.tags, options.notTags)) {
                        return;
                    }
                    Object.assign(log, { splat: undefined });
                    logLevels[log.level](log);
                }
                catch (err) {
                    console.error('Cannot parse line.', (0, util_1.inspect)(line));
                    throw err;
                }
            });
            stream.once('close', () => res());
        }
    }));
}
function getNewestFile(files, basePath) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const sorted = yield (0, logger_1.mtimeSortFilesDesc)(files, basePath);
        return (sorted.length > 0) ? sorted[0].file : '';
    });
}
function getFiles() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        if (options.files)
            return options.files;
        const logFiles = yield (0, fs_extra_1.readdir)(config_1.CONFIG.STORAGE.LOG_DIR);
        const filename = yield getNewestFile(logFiles, config_1.CONFIG.STORAGE.LOG_DIR);
        return [(0, path_1.join)(config_1.CONFIG.STORAGE.LOG_DIR, filename)];
    });
}
function toTimeFormat(time) {
    const timestamp = Date.parse(time);
    if (isNaN(timestamp) === true)
        return 'Unknown date';
    const d = new Date(timestamp);
    return d.toLocaleString() + `.${d.getMilliseconds()}`;
}
function containsTags(loggerTags, optionsTags) {
    if (!loggerTags)
        return false;
    for (const lt of loggerTags) {
        for (const ot of optionsTags) {
            if (lt === ot)
                return true;
        }
    }
    return false;
}
