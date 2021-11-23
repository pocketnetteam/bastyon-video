"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSignatureValueValid = exports.isSignatureCreatorValid = exports.isSignatureTypeValid = void 0;
const misc_1 = require("../misc");
const misc_2 = require("./misc");
function isSignatureTypeValid(signatureType) {
    return (0, misc_1.exists)(signatureType) && signatureType === 'RsaSignature2017';
}
exports.isSignatureTypeValid = isSignatureTypeValid;
function isSignatureCreatorValid(signatureCreator) {
    return (0, misc_1.exists)(signatureCreator) && (0, misc_2.isActivityPubUrlValid)(signatureCreator);
}
exports.isSignatureCreatorValid = isSignatureCreatorValid;
function isSignatureValueValid(signatureValue) {
    return (0, misc_1.exists)(signatureValue) && signatureValue.length > 0;
}
exports.isSignatureValueValid = isSignatureValueValid;
