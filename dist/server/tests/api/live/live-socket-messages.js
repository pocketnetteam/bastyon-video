"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("../../../../shared/extra-utils");
const expect = chai.expect;
describe('Test live', function () {
    let servers = [];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield servers[0].config.updateCustomSubConfig({
                newConfig: {
                    live: {
                        enabled: true,
                        allowReplay: true,
                        transcoding: {
                            enabled: false
                        }
                    }
                }
            });
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
        });
    });
    describe('Live socket messages', function () {
        function createLiveWrapper() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const liveAttributes = {
                    name: 'live video',
                    channelId: servers[0].store.channel.id,
                    privacy: 1
                };
                const { uuid } = yield servers[0].live.create({ fields: liveAttributes });
                return uuid;
            });
        }
        it('Should correctly send a message when the live starts and ends', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                const localStateChanges = [];
                const remoteStateChanges = [];
                const liveVideoUUID = yield createLiveWrapper();
                yield (0, extra_utils_1.waitJobs)(servers);
                {
                    const videoId = yield servers[0].videos.getId({ uuid: liveVideoUUID });
                    const localSocket = servers[0].socketIO.getLiveNotificationSocket();
                    localSocket.on('state-change', data => localStateChanges.push(data.state));
                    localSocket.emit('subscribe', { videoId });
                }
                {
                    const videoId = yield servers[1].videos.getId({ uuid: liveVideoUUID });
                    const remoteSocket = servers[1].socketIO.getLiveNotificationSocket();
                    remoteSocket.on('state-change', data => remoteStateChanges.push(data.state));
                    remoteSocket.emit('subscribe', { videoId });
                }
                const ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoUUID);
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const stateChanges of [localStateChanges, remoteStateChanges]) {
                    expect(stateChanges).to.have.length.at.least(1);
                    expect(stateChanges[stateChanges.length - 1]).to.equal(1);
                }
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
                for (const server of servers) {
                    yield server.live.waitUntilEnded({ videoId: liveVideoUUID });
                }
                yield (0, extra_utils_1.waitJobs)(servers);
                for (const stateChanges of [localStateChanges, remoteStateChanges]) {
                    expect(stateChanges).to.have.length.at.least(2);
                    expect(stateChanges[stateChanges.length - 1]).to.equal(5);
                }
            });
        });
        it('Should correctly send views change notification', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(60000);
                let localLastVideoViews = 0;
                let remoteLastVideoViews = 0;
                const liveVideoUUID = yield createLiveWrapper();
                yield (0, extra_utils_1.waitJobs)(servers);
                {
                    const videoId = yield servers[0].videos.getId({ uuid: liveVideoUUID });
                    const localSocket = servers[0].socketIO.getLiveNotificationSocket();
                    localSocket.on('views-change', data => { localLastVideoViews = data.views; });
                    localSocket.emit('subscribe', { videoId });
                }
                {
                    const videoId = yield servers[1].videos.getId({ uuid: liveVideoUUID });
                    const remoteSocket = servers[1].socketIO.getLiveNotificationSocket();
                    remoteSocket.on('views-change', data => { remoteLastVideoViews = data.views; });
                    remoteSocket.emit('subscribe', { videoId });
                }
                const ffmpegCommand = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoUUID);
                yield (0, extra_utils_1.waitJobs)(servers);
                expect(localLastVideoViews).to.equal(0);
                expect(remoteLastVideoViews).to.equal(0);
                yield servers[0].videos.view({ id: liveVideoUUID });
                yield servers[1].videos.view({ id: liveVideoUUID });
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(5000);
                yield (0, extra_utils_1.waitJobs)(servers);
                expect(localLastVideoViews).to.equal(2);
                expect(remoteLastVideoViews).to.equal(2);
                yield (0, extra_utils_1.stopFfmpeg)(ffmpegCommand);
            });
        });
        it('Should not receive a notification after unsubscribe', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(120000);
                const stateChanges = [];
                const liveVideoUUID = yield createLiveWrapper();
                yield (0, extra_utils_1.waitJobs)(servers);
                const videoId = yield servers[0].videos.getId({ uuid: liveVideoUUID });
                const socket = servers[0].socketIO.getLiveNotificationSocket();
                socket.on('state-change', data => stateChanges.push(data.state));
                socket.emit('subscribe', { videoId });
                const command = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoUUID });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoUUID);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield (0, extra_utils_1.wait)(10000);
                expect(stateChanges).to.have.lengthOf(1);
                socket.emit('unsubscribe', { videoId });
                yield (0, extra_utils_1.stopFfmpeg)(command);
                yield (0, extra_utils_1.waitJobs)(servers);
                expect(stateChanges).to.have.lengthOf(1);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
