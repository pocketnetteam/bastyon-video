"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hlsInfohashExist = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const core_utils_1 = require("@server/helpers/core-utils");
const requests_1 = require("../requests");
function hlsInfohashExist(serverUrl, masterPlaylistUrl, fileNumber) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const path = '/tracker/announce';
        const infohash = core_utils_1.sha1(`2${masterPlaylistUrl}+V${fileNumber}`);
        const infohashBinary = escape(Buffer.from(infohash, 'hex').toString('binary')).replace(/[@*/+]/g, function (char) {
            return '%' + char.charCodeAt(0).toString(16).toUpperCase();
        });
        const res = yield requests_1.makeGetRequest({
            url: serverUrl,
            path,
            rawQuery: `peer_id=-WW0105-NkvYO/egUAr4&info_hash=${infohashBinary}&port=42100`,
            expectedStatus: 200
        });
        chai_1.expect(res.text).to.not.contain('failure');
    });
}
exports.hlsInfohashExist = hlsInfohashExist;
