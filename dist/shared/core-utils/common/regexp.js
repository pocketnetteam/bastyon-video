"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFragmentedMP4Ext = exports.uuidRegex = void 0;
exports.uuidRegex = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
function removeFragmentedMP4Ext(path) {
    return path.replace(/-fragmented.mp4$/i, '');
}
exports.removeFragmentedMP4Ext = removeFragmentedMP4Ext;
