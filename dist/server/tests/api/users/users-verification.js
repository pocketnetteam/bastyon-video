"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test users account verification', function () {
    let server;
    let userId;
    let userAccessToken;
    let verificationString;
    let expectedEmailsLength = 0;
    const user1 = {
        username: 'user_1',
        password: 'super password'
    };
    const user2 = {
        username: 'user_2',
        password: 'super password'
    };
    const emails = [];
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            const port = yield extra_utils_1.MockSmtpServer.Instance.collectEmails(emails);
            const overrideConfig = {
                smtp: {
                    hostname: 'localhost',
                    port
                }
            };
            server = yield extra_utils_1.createSingleServer(1, overrideConfig);
            yield extra_utils_1.setAccessTokensToServers([server]);
        });
    });
    it('Should register user and send verification email if verification required', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield server.config.updateCustomSubConfig({
                newConfig: {
                    signup: {
                        enabled: true,
                        requiresEmailVerification: true,
                        limit: 10
                    }
                }
            });
            yield server.users.register(user1);
            yield extra_utils_1.waitJobs(server);
            expectedEmailsLength++;
            expect(emails).to.have.lengthOf(expectedEmailsLength);
            const email = emails[expectedEmailsLength - 1];
            const verificationStringMatches = /verificationString=([a-z0-9]+)/.exec(email['text']);
            expect(verificationStringMatches).not.to.be.null;
            verificationString = verificationStringMatches[1];
            expect(verificationString).to.have.length.above(2);
            const userIdMatches = /userId=([0-9]+)/.exec(email['text']);
            expect(userIdMatches).not.to.be.null;
            userId = parseInt(userIdMatches[1], 10);
            const body = yield server.users.get({ userId });
            expect(body.emailVerified).to.be.false;
        });
    });
    it('Should not allow login for user with unverified email', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { detail } = yield server.login.login({ user: user1, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            expect(detail).to.contain('User email is not verified.');
        });
    });
    it('Should verify the user via email and allow login', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.users.verifyEmail({ userId, verificationString });
            const body = yield server.login.login({ user: user1 });
            userAccessToken = body.access_token;
            const user = yield server.users.get({ userId });
            expect(user.emailVerified).to.be.true;
        });
    });
    it('Should be able to change the user email', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            let updateVerificationString;
            {
                yield server.users.updateMe({
                    token: userAccessToken,
                    email: 'updated@example.com',
                    currentPassword: user1.password
                });
                yield extra_utils_1.waitJobs(server);
                expectedEmailsLength++;
                expect(emails).to.have.lengthOf(expectedEmailsLength);
                const email = emails[expectedEmailsLength - 1];
                const verificationStringMatches = /verificationString=([a-z0-9]+)/.exec(email['text']);
                updateVerificationString = verificationStringMatches[1];
            }
            {
                const me = yield server.users.getMyInfo({ token: userAccessToken });
                expect(me.email).to.equal('user_1@example.com');
                expect(me.pendingEmail).to.equal('updated@example.com');
            }
            {
                yield server.users.verifyEmail({ userId, verificationString: updateVerificationString, isPendingEmail: true });
                const me = yield server.users.getMyInfo({ token: userAccessToken });
                expect(me.email).to.equal('updated@example.com');
                expect(me.pendingEmail).to.be.null;
            }
        });
    });
    it('Should register user not requiring email verification if setting not enabled', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(5000);
            yield server.config.updateCustomSubConfig({
                newConfig: {
                    signup: {
                        enabled: true,
                        requiresEmailVerification: false,
                        limit: 10
                    }
                }
            });
            yield server.users.register(user2);
            yield extra_utils_1.waitJobs(server);
            expect(emails).to.have.lengthOf(expectedEmailsLength);
            const accessToken = yield server.login.getAccessToken(user2);
            const user = yield server.users.getMyInfo({ token: accessToken });
            expect(user.emailVerified).to.be.null;
        });
    });
    it('Should allow login for user with unverified email when setting later enabled', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield server.config.updateCustomSubConfig({
                newConfig: {
                    signup: {
                        enabled: true,
                        requiresEmailVerification: true,
                        limit: 10
                    }
                }
            });
            yield server.login.getAccessToken(user2);
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            extra_utils_1.MockSmtpServer.Instance.kill();
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
