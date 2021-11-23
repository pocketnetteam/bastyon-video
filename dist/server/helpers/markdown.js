"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdToPlainText = exports.toSafeHtml = void 0;
const core_utils_1 = require("@shared/core-utils");
const sanitizeOptions = (0, core_utils_1.getSanitizeOptions)();
const sanitizeHtml = require('sanitize-html');
const markdownItEmoji = require('markdown-it-emoji/light');
const MarkdownItClass = require('markdown-it');
const markdownIt = new MarkdownItClass('default', { linkify: true, breaks: true, html: true });
markdownIt.enable(core_utils_1.TEXT_WITH_HTML_RULES);
markdownIt.use(markdownItEmoji);
const toSafeHtml = text => {
    if (!text)
        return '';
    const textWithLineFeed = text.replace(/<br.?\/?>/g, '\r\n');
    const html = markdownIt.render(textWithLineFeed);
    return sanitizeHtml(html, sanitizeOptions);
};
exports.toSafeHtml = toSafeHtml;
const mdToPlainText = text => {
    if (!text)
        return '';
    const html = markdownIt.render(text);
    const safeHtml = sanitizeHtml(html, sanitizeOptions);
    return safeHtml.replace(/<[^>]+>/g, '')
        .replace(/\n$/, '')
        .replace('\n', ', ');
};
exports.mdToPlainText = mdToPlainText;
