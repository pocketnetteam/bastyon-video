"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
describe('Test video playlists API validator', function () {
    let server;
    let userAccessToken;
    let playlist;
    let privatePlaylistUUID;
    let watchLaterPlaylistId;
    let videoId;
    let elementId;
    let command;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield (0, extra_utils_1.setDefaultVideoChannel)([server]);
            userAccessToken = yield server.users.generateUserAndToken('user1');
            videoId = (yield server.videos.quickUpload({ name: 'video 1' })).id;
            command = server.playlists;
            {
                const { data } = yield command.listByAccount({
                    token: server.accessToken,
                    handle: 'root',
                    start: 0,
                    count: 5,
                    playlistType: 2
                });
                watchLaterPlaylistId = data[0].id;
            }
            {
                playlist = yield command.create({
                    attributes: {
                        displayName: 'super playlist',
                        privacy: 1,
                        videoChannelId: server.store.channel.id
                    }
                });
            }
            {
                const created = yield command.create({
                    attributes: {
                        displayName: 'private',
                        privacy: 3
                    }
                });
                privatePlaylistUUID = created.uuid;
            }
        });
    });
    describe('When listing playlists', function () {
        const globalPath = '/api/v1/video-playlists';
        const accountPath = '/api/v1/accounts/root/video-playlists';
        const videoChannelPath = '/api/v1/video-channels/root_channel/video-playlists';
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, globalPath, server.accessToken);
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, accountPath, server.accessToken);
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, videoChannelPath, server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, globalPath, server.accessToken);
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, accountPath, server.accessToken);
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, videoChannelPath, server.accessToken);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, globalPath, server.accessToken);
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, accountPath, server.accessToken);
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, videoChannelPath, server.accessToken);
            });
        });
        it('Should fail with a bad playlist type', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: globalPath, query: { playlistType: 3 } });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: accountPath, query: { playlistType: 3 } });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: videoChannelPath, query: { playlistType: 3 } });
            });
        });
        it('Should fail with a bad account parameter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const accountPath = '/api/v1/accounts/root2/video-playlists';
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: accountPath,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404,
                    token: server.accessToken
                });
            });
        });
        it('Should fail with a bad video channel parameter', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const accountPath = '/api/v1/video-channels/bad_channel/video-playlists';
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: accountPath,
                    expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404,
                    token: server.accessToken
                });
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: globalPath, expectedStatus: models_1.HttpStatusCode.OK_200, token: server.accessToken });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: accountPath, expectedStatus: models_1.HttpStatusCode.OK_200, token: server.accessToken });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path: videoChannelPath,
                    expectedStatus: models_1.HttpStatusCode.OK_200,
                    token: server.accessToken
                });
            });
        });
    });
    describe('When listing videos of a playlist', function () {
        const path = '/api/v1/video-playlists/';
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path + playlist.shortUUID + '/videos', server.accessToken);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path + playlist.shortUUID + '/videos', server.accessToken);
            });
        });
        it('Should success with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path: path + playlist.shortUUID + '/videos', expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When getting a video playlist', function () {
        it('Should fail with a bad id or uuid', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ playlistId: 'toto', expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with an unknown playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ playlistId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail to get an unlisted playlist with the number id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const playlist = yield command.create({
                    attributes: {
                        displayName: 'super playlist',
                        videoChannelId: server.store.channel.id,
                        privacy: 2
                    }
                });
                yield command.get({ playlistId: playlist.id, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield command.get({ playlistId: playlist.uuid, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.get({ playlistId: playlist.uuid, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When creating/updating a video playlist', function () {
        const getBase = (attributes, wrapper) => {
            return Object.assign({ attributes: Object.assign({ displayName: 'display name', privacy: 2, thumbnailfile: 'thumbnail.jpg', videoChannelId: server.store.channel.id }, attributes), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, wrapper);
        };
        const getUpdate = (params, playlistId) => {
            return Object.assign(Object.assign({}, params), { playlistId: playlistId });
        };
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail without displayName', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ displayName: undefined });
                yield command.create(params);
            });
        });
        it('Should fail with an incorrect display name', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ displayName: 's'.repeat(300) });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail with an incorrect description', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ description: 't' });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail with an incorrect privacy', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ privacy: 45 });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail with an unknown video channel id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ videoChannelId: 42 }, { expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail with an incorrect thumbnail file', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ thumbnailfile: 'video_short.mp4' });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail with a thumbnail file too big', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ thumbnailfile: 'preview-big.png' });
                yield command.create(params);
                yield command.update(getUpdate(params, playlist.shortUUID));
            });
        });
        it('Should fail to set "public" a playlist not assigned to a channel', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ privacy: 1, videoChannelId: undefined });
                const params2 = getBase({ privacy: 1, videoChannelId: 'null' });
                const params3 = getBase({ privacy: undefined, videoChannelId: 'null' });
                yield command.create(params);
                yield command.create(params2);
                yield command.update(getUpdate(params, privatePlaylistUUID));
                yield command.update(getUpdate(params2, playlist.shortUUID));
                yield command.update(getUpdate(params3, playlist.shortUUID));
            });
        });
        it('Should fail with an unknown playlist to update', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.update(getUpdate(getBase({}, { expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 }), 42));
            });
        });
        it('Should fail to update a playlist of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.update(getUpdate(getBase({}, { token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 }), playlist.shortUUID));
            });
        });
        it('Should fail to update the watch later playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.update(getUpdate(getBase({}, { expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }), watchLaterPlaylistId));
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({}, { expectedStatus: models_1.HttpStatusCode.OK_200 });
                    yield command.create(params);
                }
                {
                    const params = getBase({}, { expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
                    yield command.update(getUpdate(params, playlist.shortUUID));
                }
            });
        });
    });
    describe('When adding an element in a playlist', function () {
        const getBase = (attributes, wrapper) => {
            return Object.assign({ attributes: Object.assign({ videoId, startTimestamp: 2, stopTimestamp: 3 }, attributes), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400, playlistId: playlist.id }, wrapper);
        };
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield command.addElement(params);
            });
        });
        it('Should fail with the playlist of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                yield command.addElement(params);
            });
        });
        it('Should fail with an unknown or incorrect playlist id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({}, { playlistId: 'toto' });
                    yield command.addElement(params);
                }
                {
                    const params = getBase({}, { playlistId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield command.addElement(params);
                }
            });
        });
        it('Should fail with an unknown or incorrect video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ videoId: 42 }, { expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield command.addElement(params);
            });
        });
        it('Should fail with a bad start/stop timestamp', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ startTimestamp: -42 });
                    yield command.addElement(params);
                }
                {
                    const params = getBase({ stopTimestamp: 'toto' });
                    yield command.addElement(params);
                }
            });
        });
        it('Succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { expectedStatus: models_1.HttpStatusCode.OK_200 });
                const created = yield command.addElement(params);
                elementId = created.id;
            });
        });
    });
    describe('When updating an element in a playlist', function () {
        const getBase = (attributes, wrapper) => {
            return Object.assign({ attributes: Object.assign({ startTimestamp: 1, stopTimestamp: 2 }, attributes), elementId, playlistId: playlist.id, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, wrapper);
        };
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield command.updateElement(params);
            });
        });
        it('Should fail with the playlist of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                yield command.updateElement(params);
            });
        });
        it('Should fail with an unknown or incorrect playlist id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({}, { playlistId: 'toto' });
                    yield command.updateElement(params);
                }
                {
                    const params = getBase({}, { playlistId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield command.updateElement(params);
                }
            });
        });
        it('Should fail with an unknown or incorrect playlistElement id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({}, { elementId: 'toto' });
                    yield command.updateElement(params);
                }
                {
                    const params = getBase({}, { elementId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield command.updateElement(params);
                }
            });
        });
        it('Should fail with a bad start/stop timestamp', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ startTimestamp: 'toto' });
                    yield command.updateElement(params);
                }
                {
                    const params = getBase({ stopTimestamp: -42 });
                    yield command.updateElement(params);
                }
            });
        });
        it('Should fail with an unknown element', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { elementId: 888, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield command.updateElement(params);
            });
        });
        it('Succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
                yield command.updateElement(params);
            });
        });
    });
    describe('When reordering elements of a playlist', function () {
        let videoId3;
        let videoId4;
        const getBase = (attributes, wrapper) => {
            return Object.assign({ attributes: Object.assign({ startPosition: 1, insertAfterPosition: 2, reorderLength: 3 }, attributes), playlistId: playlist.shortUUID, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, wrapper);
        };
        before(function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                videoId3 = (yield server.videos.quickUpload({ name: 'video 3' })).id;
                videoId4 = (yield server.videos.quickUpload({ name: 'video 4' })).id;
                for (const id of [videoId3, videoId4]) {
                    yield command.addElement({ playlistId: playlist.shortUUID, attributes: { videoId: id } });
                }
            });
        });
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield command.reorderElements(params);
            });
        });
        it('Should fail with the playlist of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                yield command.reorderElements(params);
            });
        });
        it('Should fail with an invalid playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({}, { playlistId: 'toto' });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({}, { playlistId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield command.reorderElements(params);
                }
            });
        });
        it('Should fail with an invalid start position', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ startPosition: -1 });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({ startPosition: 'toto' });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({ startPosition: 42 });
                    yield command.reorderElements(params);
                }
            });
        });
        it('Should fail with an invalid insert after position', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ insertAfterPosition: 'toto' });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({ insertAfterPosition: -2 });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({ insertAfterPosition: 42 });
                    yield command.reorderElements(params);
                }
            });
        });
        it('Should fail with an invalid reorder length', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ reorderLength: 'toto' });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({ reorderLength: -2 });
                    yield command.reorderElements(params);
                }
                {
                    const params = getBase({ reorderLength: 42 });
                    yield command.reorderElements(params);
                }
            });
        });
        it('Succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({}, { expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
                yield command.reorderElements(params);
            });
        });
    });
    describe('When checking exists in playlist endpoint', function () {
        const path = '/api/v1/users/me/video-playlists/videos-exist';
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    path,
                    query: { videoIds: [1, 2] },
                    expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401
                });
            });
        });
        it('Should fail with invalid video ids', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    query: { videoIds: 'toto' }
                });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    query: { videoIds: ['toto'] }
                });
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    query: { videoIds: [1, 'toto'] }
                });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({
                    url: server.url,
                    token: server.accessToken,
                    path,
                    query: { videoIds: [1, 2] },
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
    });
    describe('When deleting an element in a playlist', function () {
        const getBase = (wrapper) => {
            return Object.assign({ elementId, playlistId: playlist.uuid, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 }, wrapper);
        };
        it('Should fail with an unauthenticated user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ token: null, expectedStatus: models_1.HttpStatusCode.UNAUTHORIZED_401 });
                yield command.removeElement(params);
            });
        });
        it('Should fail with the playlist of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ token: userAccessToken, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
                yield command.removeElement(params);
            });
        });
        it('Should fail with an unknown or incorrect playlist id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ playlistId: 'toto' });
                    yield command.removeElement(params);
                }
                {
                    const params = getBase({ playlistId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield command.removeElement(params);
                }
            });
        });
        it('Should fail with an unknown or incorrect video id', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                {
                    const params = getBase({ elementId: 'toto' });
                    yield command.removeElement(params);
                }
                {
                    const params = getBase({ elementId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                    yield command.removeElement(params);
                }
            });
        });
        it('Should fail with an unknown element', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ elementId: 888, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
                yield command.removeElement(params);
            });
        });
        it('Succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const params = getBase({ expectedStatus: models_1.HttpStatusCode.NO_CONTENT_204 });
                yield command.removeElement(params);
            });
        });
    });
    describe('When deleting a playlist', function () {
        it('Should fail with an unknown playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ playlistId: 42, expectedStatus: models_1.HttpStatusCode.NOT_FOUND_404 });
            });
        });
        it('Should fail with a playlist of another user', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ token: userAccessToken, playlistId: playlist.uuid, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with the watch later playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ playlistId: watchLaterPlaylistId, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with the correct params', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield command.delete({ playlistId: playlist.uuid });
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
