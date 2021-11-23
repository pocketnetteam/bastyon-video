"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lTags = void 0;
const logger_1 = require("@server/helpers/logger");
const lTags = (0, logger_1.loggerTagsFactory)('object-storage');
exports.lTags = lTags;
