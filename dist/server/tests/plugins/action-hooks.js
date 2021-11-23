"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
describe('Test plugin action hooks', function () {
    let servers;
    let videoUUID;
    let threadId;
    function checkHook(hook) {
        return servers[0].servers.waitUntilLog('Run hook ' + hook);
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield servers[0].plugins.install({ path: extra_utils_1.PluginsCommand.getPluginTestPath() });
            yield (0, extra_utils_1.killallServers)([servers[0]]);
            yield servers[0].run({
                live: {
                    enabled: true
                }
            });
        });
    });
    describe('Application hooks', function () {
        it('Should run action:application.listening', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield checkHook('action:application.listening');
            });
        });
    });
    describe('Videos hooks', function () {
        it('Should run action:api.video.uploaded', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const { uuid } = yield servers[0].videos.upload({ attributes: { name: 'video' } });
                videoUUID = uuid;
                yield checkHook('action:api.video.uploaded');
            });
        });
        it('Should run action:api.video.updated', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.update({ id: videoUUID, attributes: { name: 'video updated' } });
                yield checkHook('action:api.video.updated');
            });
        });
        it('Should run action:api.video.viewed', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].videos.view({ id: videoUUID });
                yield checkHook('action:api.video.viewed');
            });
        });
    });
    describe('Live hooks', function () {
        it('Should run action:api.live-video.created', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const attributes = {
                    name: 'live',
                    privacy: 1,
                    channelId: servers[0].store.channel.id
                };
                yield servers[0].live.create({ fields: attributes });
                yield checkHook('action:api.live-video.created');
            });
        });
    });
    describe('Comments hooks', function () {
        it('Should run action:api.video-thread.created', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const created = yield servers[0].comments.createThread({ videoId: videoUUID, text: 'thread' });
                threadId = created.id;
                yield checkHook('action:api.video-thread.created');
            });
        });
        it('Should run action:api.video-comment-reply.created', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].comments.addReply({ videoId: videoUUID, toCommentId: threadId, text: 'reply' });
                yield checkHook('action:api.video-comment-reply.created');
            });
        });
        it('Should run action:api.video-comment.deleted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].comments.delete({ videoId: videoUUID, commentId: threadId });
                yield checkHook('action:api.video-comment.deleted');
            });
        });
    });
    describe('Users hooks', function () {
        let userId;
        it('Should run action:api.user.registered', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].users.register({ username: 'registered_user' });
                yield checkHook('action:api.user.registered');
            });
        });
        it('Should run action:api.user.created', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const user = yield servers[0].users.create({ username: 'created_user' });
                userId = user.id;
                yield checkHook('action:api.user.created');
            });
        });
        it('Should run action:api.user.oauth2-got-token', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].login.login({ user: { username: 'created_user' } });
                yield checkHook('action:api.user.oauth2-got-token');
            });
        });
        it('Should run action:api.user.blocked', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].users.banUser({ userId });
                yield checkHook('action:api.user.blocked');
            });
        });
        it('Should run action:api.user.unblocked', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].users.unbanUser({ userId });
                yield checkHook('action:api.user.unblocked');
            });
        });
        it('Should run action:api.user.updated', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].users.update({ userId, videoQuota: 50 });
                yield checkHook('action:api.user.updated');
            });
        });
        it('Should run action:api.user.deleted', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].users.remove({ userId });
                yield checkHook('action:api.user.deleted');
            });
        });
    });
    describe('Playlist hooks', function () {
        let playlistId;
        let videoId;
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const { id } = yield servers[0].playlists.create({
                        attributes: {
                            displayName: 'My playlist',
                            privacy: 3
                        }
                    });
                    playlistId = id;
                }
                {
                    const { id } = yield servers[0].videos.upload({ attributes: { name: 'my super name' } });
                    videoId = id;
                }
            });
        });
        it('Should run action:api.video-playlist-element.created', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].playlists.addElement({ playlistId, attributes: { videoId } });
                yield checkHook('action:api.video-playlist-element.created');
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
