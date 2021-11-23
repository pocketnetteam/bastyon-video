"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("../../../shared/extra-utils");
describe('Test reset password scripts', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield server.users.create({ username: 'user_1', password: 'super password' });
        });
    });
    it('Should change the user password from CLI', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(60000);
            const env = server.cli.getEnv();
            yield extra_utils_1.CLICommand.exec(`echo coucou | ${env} npm run reset-password -- -u user_1`);
            yield server.login.login({ user: { username: 'user_1', password: 'coucou' } });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
