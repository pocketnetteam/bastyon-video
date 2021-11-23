"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test follow constraints', function () {
    let servers = [];
    let video1UUID;
    let video2UUID;
    let userToken;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(90000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video server 1' } });
                video1UUID = uuid;
            }
            {
                const { uuid } = yield servers[1].videos.upload({ attributes: { name: 'video server 2' } });
                video2UUID = uuid;
            }
            const user = {
                username: 'user1',
                password: 'super_password'
            };
            yield servers[0].users.create({ username: user.username, password: user.password });
            userToken = yield servers[0].login.getAccessToken(user);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('With a followed instance', function () {
        describe('With an unlogged user', function () {
            it('Should get the local video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.get({ id: video1UUID });
                });
            });
            it('Should get the remote video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.get({ id: video2UUID });
                });
            });
            it('Should list local account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({ handle: 'root@localhost:' + servers[0].port });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list remote account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({ handle: 'root@localhost:' + servers[1].port });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list local channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[0].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list remote channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[1].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
        });
        describe('With a logged user', function () {
            it('Should get the local video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.getWithToken({ token: userToken, id: video1UUID });
                });
            });
            it('Should get the remote video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.getWithToken({ token: userToken, id: video2UUID });
                });
            });
            it('Should list local account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({ token: userToken, handle: 'root@localhost:' + servers[0].port });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list remote account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({ token: userToken, handle: 'root@localhost:' + servers[1].port });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list local channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[0].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ token: userToken, handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list remote channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[1].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ token: userToken, handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
        });
    });
    describe('With a non followed instance', function () {
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].follows.unfollow({ target: servers[1] });
            });
        });
        describe('With an unlogged user', function () {
            it('Should get the local video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.get({ id: video1UUID });
                });
            });
            it('Should not get the remote video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const body = yield servers[0].videos.get({ id: video2UUID, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                    const error = body;
                    const doc = 'https://docs.joinpeertube.org/api-rest-reference.html#section/Errors/does_not_respect_follow_constraints';
                    expect(error.type).to.equal(doc);
                    expect(error.code).to.equal("does_not_respect_follow_constraints");
                    expect(error.detail).to.equal('Cannot get this video regarding follow constraints');
                    expect(error.error).to.equal(error.detail);
                    expect(error.status).to.equal(models_1.HttpStatusCode.FORBIDDEN_403);
                    expect(error.originUrl).to.contains(servers[1].url);
                });
            });
            it('Should list local account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({
                        token: null,
                        handle: 'root@localhost:' + servers[0].port
                    });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should not list remote account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({
                        token: null,
                        handle: 'root@localhost:' + servers[1].port
                    });
                    expect(total).to.equal(0);
                    expect(data).to.have.lengthOf(0);
                });
            });
            it('Should list local channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[0].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ token: null, handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should not list remote channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[1].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ token: null, handle });
                    expect(total).to.equal(0);
                    expect(data).to.have.lengthOf(0);
                });
            });
        });
        describe('With a logged user', function () {
            it('Should get the local video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.getWithToken({ token: userToken, id: video1UUID });
                });
            });
            it('Should get the remote video', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    yield servers[0].videos.getWithToken({ token: userToken, id: video2UUID });
                });
            });
            it('Should list local account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({ token: userToken, handle: 'root@localhost:' + servers[0].port });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list remote account videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const { total, data } = yield servers[0].videos.listByAccount({ token: userToken, handle: 'root@localhost:' + servers[1].port });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list local channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[0].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ token: userToken, handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
            it('Should list remote channel videos', function () {
                return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                    const handle = 'root_channel@localhost:' + servers[1].port;
                    const { total, data } = yield servers[0].videos.listByChannel({ token: userToken, handle });
                    expect(total).to.equal(1);
                    expect(data).to.have.lengthOf(1);
                });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
