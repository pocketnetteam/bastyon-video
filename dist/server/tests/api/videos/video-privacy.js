"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
describe('Test video privacy', function () {
    const servers = [];
    let anotherUserToken;
    let privateVideoId;
    let privateVideoUUID;
    let internalVideoId;
    let internalVideoUUID;
    let unlistedVideo;
    let nonFederatedUnlistedVideoUUID;
    let now;
    const dontFederateUnlistedConfig = {
        federation: {
            videos: {
                federate_unlisted: false
            }
        }
    };
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(50000);
            servers.push(yield (0, extra_utils_1.createSingleServer)(1, dontFederateUnlistedConfig));
            servers.push(yield (0, extra_utils_1.createSingleServer)(2));
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('Private and internal videos', function () {
        it('Should upload a private and internal videos on server 1', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                for (const privacy of [3, 4]) {
                    const attributes = { privacy };
                    yield servers[0].videos.upload({ attributes });
                }
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should not have these private and internal videos on server 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield servers[1].videos.list();
                expect(total).to.equal(0);
                expect(data).to.have.lengthOf(0);
            });
        });
        it('Should not list the private and internal videos for an unauthenticated user on server 1', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield servers[0].videos.list();
                expect(total).to.equal(0);
                expect(data).to.have.lengthOf(0);
            });
        });
        it('Should not list the private video and list the internal video for an authenticated user on server 1', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield servers[0].videos.listWithToken();
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
                expect(data[0].privacy.id).to.equal(4);
            });
        });
        it('Should list my (private and internal) videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield servers[0].videos.listMyVideos();
                expect(total).to.equal(2);
                expect(data).to.have.lengthOf(2);
                const privateVideo = data.find(v => v.privacy.id === 3);
                privateVideoId = privateVideo.id;
                privateVideoUUID = privateVideo.uuid;
                const internalVideo = data.find(v => v.privacy.id === 4);
                internalVideoId = internalVideo.id;
                internalVideoUUID = internalVideo.uuid;
            });
        });
        it('Should not be able to watch the private/internal video with non authenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.get({ id: privateVideoUUID, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield servers[0].videos.get({ id: internalVideoUUID, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
            });
        });
        it('Should not be able to watch the private video with another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const user = {
                    username: 'hello',
                    password: 'super password'
                };
                yield servers[0].users.create({ username: user.username, password: user.password });
                anotherUserToken = yield servers[0].login.getAccessToken(user);
                yield servers[0].videos.getWithToken({
                    token: anotherUserToken,
                    id: privateVideoUUID,
                    expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403
                });
            });
        });
        it('Should be able to watch the internal video with another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.getWithToken({ token: anotherUserToken, id: internalVideoUUID });
            });
        });
        it('Should be able to watch the private video with the correct user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.getWithToken({ id: privateVideoUUID });
            });
        });
    });
    describe('Unlisted videos', function () {
        it('Should upload an unlisted video on server 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                const attributes = {
                    name: 'unlisted video',
                    privacy: 2
                };
                yield servers[1].videos.upload({ attributes });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should not have this unlisted video listed on server 1 and 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const { total, data } = yield server.videos.list();
                    expect(total).to.equal(0);
                    expect(data).to.have.lengthOf(0);
                }
            });
        });
        it('Should list my (unlisted) videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield servers[1].videos.listMyVideos();
                expect(total).to.equal(1);
                expect(data).to.have.lengthOf(1);
                unlistedVideo = data[0];
            });
        });
        it('Should not be able to get this unlisted video using its id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[1].videos.get({ id: unlistedVideo.id, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should be able to get this unlisted video using its uuid/shortUUID', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    for (const id of [unlistedVideo.uuid, unlistedVideo.shortUUID]) {
                        const video = yield server.videos.get({ id });
                        expect(video.name).to.equal('unlisted video');
                    }
                }
            });
        });
        it('Should upload a non-federating unlisted video to server 1', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                const attributes = {
                    name: 'unlisted video',
                    privacy: 2
                };
                yield servers[0].videos.upload({ attributes });
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should list my new unlisted video', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { total, data } = yield servers[0].videos.listMyVideos();
                expect(total).to.equal(3);
                expect(data).to.have.lengthOf(3);
                nonFederatedUnlistedVideoUUID = data[0].uuid;
            });
        });
        it('Should be able to get non-federated unlisted video from origin', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const video = yield servers[0].videos.get({ id: nonFederatedUnlistedVideoUUID });
                expect(video.name).to.equal('unlisted video');
            });
        });
        it('Should not be able to get non-federated unlisted video from federated server', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[1].videos.get({ id: nonFederatedUnlistedVideoUUID, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
    });
    describe('Privacy update', function () {
        it('Should update the private and internal videos to public on server 1', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                now = Date.now();
                {
                    const attributes = {
                        name: 'private video becomes public',
                        privacy: 1
                    };
                    yield servers[0].videos.update({ id: privateVideoId, attributes });
                }
                {
                    const attributes = {
                        name: 'internal video becomes public',
                        privacy: 1
                    };
                    yield servers[0].videos.update({ id: internalVideoId, attributes });
                }
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should have this new public video listed on server 1 and 2', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const { total, data } = yield server.videos.list();
                    expect(total).to.equal(2);
                    expect(data).to.have.lengthOf(2);
                    const privateVideo = data.find(v => v.name === 'private video becomes public');
                    const internalVideo = data.find(v => v.name === 'internal video becomes public');
                    expect(privateVideo).to.not.be.undefined;
                    expect(internalVideo).to.not.be.undefined;
                    expect(new Date(privateVideo.publishedAt).getTime()).to.be.at.least(now);
                    expect(new Date(internalVideo.publishedAt).getTime()).to.be.below(now);
                    expect(privateVideo.privacy.id).to.equal(1);
                    expect(internalVideo.privacy.id).to.equal(1);
                }
            });
        });
        it('Should set these videos as private and internal', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield servers[0].videos.update({ id: internalVideoId, attributes: { privacy: 3 } });
                yield servers[0].videos.update({ id: privateVideoId, attributes: { privacy: 4 } });
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const server of servers) {
                    const { total, data } = yield server.videos.list();
                    expect(total).to.equal(0);
                    expect(data).to.have.lengthOf(0);
                }
                {
                    const { total, data } = yield servers[0].videos.listMyVideos();
                    expect(total).to.equal(3);
                    expect(data).to.have.lengthOf(3);
                    const privateVideo = data.find(v => v.name === 'private video becomes public');
                    const internalVideo = data.find(v => v.name === 'internal video becomes public');
                    expect(privateVideo).to.not.be.undefined;
                    expect(internalVideo).to.not.be.undefined;
                    expect(privateVideo.privacy.id).to.equal(4);
                    expect(internalVideo.privacy.id).to.equal(3);
                }
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
