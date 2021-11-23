"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSaveActorKeys = void 0;
const tslib_1 = require("tslib");
const peertube_crypto_1 = require("@server/helpers/peertube-crypto");
function generateAndSaveActorKeys(actor) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const { publicKey, privateKey } = yield (0, peertube_crypto_1.createPrivateAndPublicKeys)();
        actor.publicKey = publicKey;
        actor.privateKey = privateKey;
        return actor.save();
    });
}
exports.generateAndSaveActorKeys = generateAndSaveActorKeys;
