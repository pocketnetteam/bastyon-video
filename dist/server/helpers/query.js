"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickSearchChannelQuery = exports.pickSearchPlaylistQuery = exports.pickSearchVideoQuery = exports.pickCommonVideoQuery = void 0;
const core_utils_1 = require("@shared/core-utils");
function pickCommonVideoQuery(query) {
    return core_utils_1.pick(query, [
        'start',
        'count',
        'sort',
        'nsfw',
        'isLive',
        'categoryOneOf',
        'licenceOneOf',
        'languageOneOf',
        'tagsOneOf',
        'tagsAllOf',
        'filter',
        'skipCount'
    ]);
}
exports.pickCommonVideoQuery = pickCommonVideoQuery;
function pickSearchVideoQuery(query) {
    return Object.assign(Object.assign({}, pickCommonVideoQuery(query)), core_utils_1.pick(query, [
        'searchTarget',
        'search',
        'host',
        'startDate',
        'endDate',
        'originallyPublishedStartDate',
        'originallyPublishedEndDate',
        'durationMin',
        'durationMax',
        'uuids'
    ]));
}
exports.pickSearchVideoQuery = pickSearchVideoQuery;
function pickSearchChannelQuery(query) {
    return core_utils_1.pick(query, [
        'searchTarget',
        'search',
        'start',
        'count',
        'sort',
        'host',
        'handles'
    ]);
}
exports.pickSearchChannelQuery = pickSearchChannelQuery;
function pickSearchPlaylistQuery(query) {
    return core_utils_1.pick(query, [
        'searchTarget',
        'search',
        'start',
        'count',
        'sort',
        'host',
        'uuids'
    ]);
}
exports.pickSearchPlaylistQuery = pickSearchPlaylistQuery;
