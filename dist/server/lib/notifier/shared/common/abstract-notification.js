"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNotification = void 0;
class AbstractNotification {
    constructor(payload) {
        this.payload = payload;
    }
    isDisabled() {
        return false;
    }
}
exports.AbstractNotification = AbstractNotification;
