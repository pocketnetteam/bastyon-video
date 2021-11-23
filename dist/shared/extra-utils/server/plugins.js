"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testHelloWorldRegisteredSettings = void 0;
const tslib_1 = require("tslib");
const chai_1 = require("chai");
function testHelloWorldRegisteredSettings(server) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const body = yield server.plugins.getRegisteredSettings({ npmName: 'peertube-plugin-hello-world' });
        const registeredSettings = body.registeredSettings;
        (0, chai_1.expect)(registeredSettings).to.have.length.at.least(1);
        const adminNameSettings = registeredSettings.find(s => s.name === 'admin-name');
        (0, chai_1.expect)(adminNameSettings).to.not.be.undefined;
    });
}
exports.testHelloWorldRegisteredSettings = testHelloWorldRegisteredSettings;
