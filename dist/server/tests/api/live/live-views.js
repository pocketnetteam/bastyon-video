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
    describe('Live views', function () {
        let liveVideoId;
        let command;
        function countViews(expected) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const video = yield server.videos.get({ id: liveVideoId });
                    expect(video.views).to.equal(expected);
                }
            });
        }
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                const liveAttributes = {
                    name: 'live video',
                    channelId: servers[0].store.channel.id,
                    privacy: 1
                };
                const live = yield servers[0].live.create({ fields: liveAttributes });
                liveVideoId = live.uuid;
                command = yield servers[0].live.sendRTMPStreamInVideo({ videoId: liveVideoId });
                yield (0, extra_utils_1.waitUntilLivePublishedOnAllServers)(servers, liveVideoId);
                yield (0, extra_utils_1.waitJobs)(servers);
            });
        });
        it('Should display no views for a live', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield countViews(0);
            });
        });
        it('Should view a live twice and display 1 view', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].videos.view({ id: liveVideoId });
                yield servers[0].videos.view({ id: liveVideoId });
                yield (0, extra_utils_1.wait)(7000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield countViews(1);
            });
        });
        it('Should wait and display 0 views', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield (0, extra_utils_1.wait)(12000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield countViews(0);
            });
        });
        it('Should view a live on a remote and on local and display 2 views', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].videos.view({ id: liveVideoId });
                yield servers[1].videos.view({ id: liveVideoId });
                yield servers[1].videos.view({ id: liveVideoId });
                yield (0, extra_utils_1.wait)(7000);
                yield (0, extra_utils_1.waitJobs)(servers);
                yield countViews(2);
            });
        });
        after(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.stopFfmpeg)(command);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
