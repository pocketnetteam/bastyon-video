"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const models_1 = require("@shared/models");
const index_1 = require("../../../../shared/extra-utils/index");
const expect = chai.expect;
function getHomepageState(server) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const config = yield server.config.getConfig();
        return config.homepage.enabled;
    });
}
describe('Test instance homepage actions', function () {
    let server;
    let command;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield index_1.createSingleServer(1);
            yield index_1.setAccessTokensToServers([server]);
            command = server.customPage;
        });
    });
    it('Should not have a homepage', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const state = yield getHomepageState(server);
            expect(state).to.be.false;
            yield command.getInstanceHomepage({ expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
        });
    });
    it('Should set a homepage', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.updateInstanceHomepage({ content: '<picsou-magazine></picsou-magazine>' });
            const page = yield command.getInstanceHomepage();
            expect(page.content).to.equal('<picsou-magazine></picsou-magazine>');
            const state = yield getHomepageState(server);
            expect(state).to.be.true;
        });
    });
    it('Should have the same homepage after a restart', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield index_1.killallServers([server]);
            yield server.run();
            const page = yield command.getInstanceHomepage();
            expect(page.content).to.equal('<picsou-magazine></picsou-magazine>');
            const state = yield getHomepageState(server);
            expect(state).to.be.true;
        });
    });
    it('Should empty the homepage', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield command.updateInstanceHomepage({ content: '' });
            const page = yield command.getInstanceHomepage();
            expect(page.content).to.be.empty;
            const state = yield getHomepageState(server);
            expect(state).to.be.false;
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield index_1.cleanupTests([server]);
        });
    });
});
