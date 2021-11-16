"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHTML = exports.getCustomMarkupSanitizeOptions = exports.getSanitizeOptions = void 0;
function getSanitizeOptions() {
    return {
        allowedTags: ['a', 'p', 'span', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
        allowedSchemes: ['http', 'https'],
        allowedAttributes: {
            'a': ['href', 'class', 'target', 'rel'],
            '*': ['data-*']
        },
        transformTags: {
            a: (tagName, attribs) => {
                let rel = 'noopener noreferrer';
                if (attribs.rel === 'me')
                    rel += ' me';
                return {
                    tagName,
                    attribs: Object.assign(attribs, {
                        target: '_blank',
                        rel
                    })
                };
            }
        }
    };
}
exports.getSanitizeOptions = getSanitizeOptions;
function getCustomMarkupSanitizeOptions(additionalAllowedTags = []) {
    const base = getSanitizeOptions();
    return {
        allowedTags: [
            ...base.allowedTags,
            ...additionalAllowedTags,
            'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'
        ],
        allowedSchemes: base.allowedSchemes,
        allowedAttributes: Object.assign(Object.assign({}, base.allowedAttributes), { 'img': ['src', 'alt'], '*': ['data-*', 'style'] })
    };
}
exports.getCustomMarkupSanitizeOptions = getCustomMarkupSanitizeOptions;
function escapeHTML(stringParam) {
    if (!stringParam)
        return '';
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return String(stringParam).replace(/[&<>"'`=/]/g, s => entityMap[s]);
}
exports.escapeHTML = escapeHTML;
