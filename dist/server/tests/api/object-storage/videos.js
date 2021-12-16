"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const lodash_1 = require("lodash");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
const expect = chai.expect;
function checkFiles(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { video, playlistBucket, webtorrentBucket, baseMockUrl, playlistPrefix, webtorrentPrefix } = options;
        let allFiles = video.files;
        for (const file of video.files) {
            const baseUrl = baseMockUrl
                ? `${baseMockUrl}/${webtorrentBucket}/`
                : `http://${webtorrentBucket}.${extra_utils_1.ObjectStorageCommand.getEndpointHost()}/`;
            const prefix = webtorrentPrefix || '';
            const start = baseUrl + prefix;
            extra_utils_1.expectStartWith(file.fileUrl, start);
            const res = yield extra_utils_1.makeRawRequest(file.fileDownloadUrl, models_1.HttpStatusCode.FOUND_302);
            const location = res.headers['location'];
            extra_utils_1.expectStartWith(location, start);
            yield extra_utils_1.makeRawRequest(location, models_1.HttpStatusCode.OK_200);
        }
        const hls = video.streamingPlaylists[0];
        if (hls) {
            allFiles = allFiles.concat(hls.files);
            const baseUrl = baseMockUrl
                ? `${baseMockUrl}/${playlistBucket}/`
                : `http://${playlistBucket}.${extra_utils_1.ObjectStorageCommand.getEndpointHost()}/`;
            const prefix = playlistPrefix || '';
            const start = baseUrl + prefix;
            extra_utils_1.expectStartWith(hls.playlistUrl, start);
            extra_utils_1.expectStartWith(hls.segmentsSha256Url, start);
            yield extra_utils_1.makeRawRequest(hls.playlistUrl, models_1.HttpStatusCode.OK_200);
            const resSha = yield extra_utils_1.makeRawRequest(hls.segmentsSha256Url, models_1.HttpStatusCode.OK_200);
            expect(JSON.stringify(resSha.body)).to.not.throw;
            for (const file of hls.files) {
                extra_utils_1.expectStartWith(file.fileUrl, start);
                const res = yield extra_utils_1.makeRawRequest(file.fileDownloadUrl, models_1.HttpStatusCode.FOUND_302);
                const location = res.headers['location'];
                extra_utils_1.expectStartWith(location, start);
                yield extra_utils_1.makeRawRequest(location, models_1.HttpStatusCode.OK_200);
            }
        }
        for (const file of allFiles) {
            const torrent = yield extra_utils_1.webtorrentAdd(file.magnetUri, true);
            expect(torrent.files).to.be.an('array');
            expect(torrent.files.length).to.equal(1);
            expect(torrent.files[0].path).to.exist.and.to.not.equal('');
            const res = yield extra_utils_1.makeRawRequest(file.fileUrl, models_1.HttpStatusCode.OK_200);
            expect(res.body).to.have.length.above(100);
        }
        return allFiles.map(f => f.fileUrl);
    });
}
function runTestSuite(options) {
    const mockObjectStorage = new extra_utils_1.MockObjectStorage();
    let baseMockUrl;
    let servers;
    let keptUrls = [];
    const uuidsToDelete = [];
    let deletedUrls = [];
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            const port = yield mockObjectStorage.initialize();
            baseMockUrl = options.useMockBaseUrl ? `http://localhost:${port}` : undefined;
            yield extra_utils_1.ObjectStorageCommand.createBucket(options.playlistBucket);
            yield extra_utils_1.ObjectStorageCommand.createBucket(options.webtorrentBucket);
            const config = {
                object_storage: {
                    enabled: true,
                    endpoint: 'http://' + extra_utils_1.ObjectStorageCommand.getEndpointHost(),
                    region: extra_utils_1.ObjectStorageCommand.getRegion(),
                    credentials: extra_utils_1.ObjectStorageCommand.getCredentialsConfig(),
                    max_upload_part: options.maxUploadPart || '2MB',
                    streaming_playlists: {
                        bucket_name: options.playlistBucket,
                        prefix: options.playlistPrefix,
                        base_url: baseMockUrl
                            ? `${baseMockUrl}/${options.playlistBucket}`
                            : undefined
                    },
                    videos: {
                        bucket_name: options.webtorrentBucket,
                        prefix: options.webtorrentPrefix,
                        base_url: baseMockUrl
                            ? `${baseMockUrl}/${options.webtorrentBucket}`
                            : undefined
                    }
                }
            };
            servers = yield extra_utils_1.createMultipleServers(2, config);
            yield extra_utils_1.setAccessTokensToServers(servers);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            for (const server of servers) {
                const { uuid } = yield server.videos.quickUpload({ name: 'video to keep' });
                yield extra_utils_1.waitJobs(servers);
                const files = yield server.videos.listFiles({ id: uuid });
                keptUrls = keptUrls.concat(files.map(f => f.fileUrl));
            }
        });
    });
    it('Should upload a video and move it to the object storage without transcoding', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(20000);
            const { uuid } = yield servers[0].videos.quickUpload({ name: 'video 1' });
            uuidsToDelete.push(uuid);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const video = yield server.videos.get({ id: uuid });
                const files = yield checkFiles(Object.assign(Object.assign({}, options), { video, baseMockUrl }));
                deletedUrls = deletedUrls.concat(files);
            }
        });
    });
    it('Should upload a video and move it to the object storage with transcoding', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(40000);
            const { uuid } = yield servers[1].videos.quickUpload({ name: 'video 2' });
            uuidsToDelete.push(uuid);
            yield extra_utils_1.waitJobs(servers);
            for (const server of servers) {
                const video = yield server.videos.get({ id: uuid });
                const files = yield checkFiles(Object.assign(Object.assign({}, options), { video, baseMockUrl }));
                deletedUrls = deletedUrls.concat(files);
            }
        });
    });
    it('Should correctly delete the files', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield servers[0].videos.remove({ id: uuidsToDelete[0] });
            yield servers[1].videos.remove({ id: uuidsToDelete[1] });
            yield extra_utils_1.waitJobs(servers);
            for (const url of deletedUrls) {
                yield extra_utils_1.makeRawRequest(url, models_1.HttpStatusCode.NOT_FOUND_404);
            }
        });
    });
    it('Should have kept other files', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const url of keptUrls) {
                yield extra_utils_1.makeRawRequest(url, models_1.HttpStatusCode.OK_200);
            }
        });
    });
    it('Should have an empty tmp directory', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                yield extra_utils_1.checkTmpIsEmpty(server);
            }
        });
    });
    it('Should not have downloaded files from object storage', function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const server of servers) {
                yield extra_utils_1.expectLogDoesNotContain(server, 'from object storage');
            }
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield mockObjectStorage.terminate();
            yield extra_utils_1.cleanupTests(servers);
        });
    });
}
describe('Object storage for videos', function () {
    if (extra_utils_1.areObjectStorageTestsDisabled())
        return;
    describe('Test config', function () {
        let server;
        const baseConfig = {
            object_storage: {
                enabled: true,
                endpoint: 'http://' + extra_utils_1.ObjectStorageCommand.getEndpointHost(),
                region: extra_utils_1.ObjectStorageCommand.getRegion(),
                credentials: extra_utils_1.ObjectStorageCommand.getCredentialsConfig(),
                streaming_playlists: {
                    bucket_name: extra_utils_1.ObjectStorageCommand.DEFAULT_PLAYLIST_BUCKET
                },
                videos: {
                    bucket_name: extra_utils_1.ObjectStorageCommand.DEFAULT_WEBTORRENT_BUCKET
                }
            }
        };
        const badCredentials = {
            access_key_id: 'AKIAIOSFODNN7EXAMPLE',
            secret_access_key: 'aJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        };
        it('Should fail with same bucket names without prefix', function (done) {
            const config = lodash_1.merge({}, baseConfig, {
                object_storage: {
                    streaming_playlists: {
                        bucket_name: 'aaa'
                    },
                    videos: {
                        bucket_name: 'aaa'
                    }
                }
            });
            extra_utils_1.createSingleServer(1, config)
                .then(() => done(new Error('Did not throw')))
                .catch(() => done());
        });
        it('Should fail with bad credentials', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
                const config = lodash_1.merge({}, baseConfig, {
                    object_storage: {
                        credentials: badCredentials
                    }
                });
                server = yield extra_utils_1.createSingleServer(1, config);
                yield extra_utils_1.setAccessTokensToServers([server]);
                const { uuid } = yield server.videos.quickUpload({ name: 'video' });
                yield extra_utils_1.waitJobs([server], true);
                const video = yield server.videos.get({ id: uuid });
                extra_utils_1.expectStartWith(video.files[0].fileUrl, server.url);
                yield extra_utils_1.killallServers([server]);
            });
        });
        it('Should succeed with credentials from env', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield extra_utils_1.ObjectStorageCommand.prepareDefaultBuckets();
                const config = lodash_1.merge({}, baseConfig, {
                    object_storage: {
                        credentials: {
                            access_key_id: '',
                            secret_access_key: ''
                        }
                    }
                });
                const goodCredentials = extra_utils_1.ObjectStorageCommand.getCredentialsConfig();
                server = yield extra_utils_1.createSingleServer(1, config, {
                    env: {
                        AWS_ACCESS_KEY_ID: goodCredentials.access_key_id,
                        AWS_SECRET_ACCESS_KEY: goodCredentials.secret_access_key
                    }
                });
                yield extra_utils_1.setAccessTokensToServers([server]);
                const { uuid } = yield server.videos.quickUpload({ name: 'video' });
                yield extra_utils_1.waitJobs([server], true);
                const video = yield server.videos.get({ id: uuid });
                extra_utils_1.expectStartWith(video.files[0].fileUrl, extra_utils_1.ObjectStorageCommand.getWebTorrentBaseUrl());
            });
        });
        after(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.killallServers([server]);
            });
        });
    });
    describe('Test simple object storage', function () {
        runTestSuite({
            playlistBucket: 'streaming-playlists',
            webtorrentBucket: 'videos'
        });
    });
    describe('Test object storage with prefix', function () {
        runTestSuite({
            playlistBucket: 'mybucket',
            webtorrentBucket: 'mybucket',
            playlistPrefix: 'streaming-playlists_',
            webtorrentPrefix: 'webtorrent_'
        });
    });
    describe('Test object storage with prefix and base URL', function () {
        runTestSuite({
            playlistBucket: 'mybucket',
            webtorrentBucket: 'mybucket',
            playlistPrefix: 'streaming-playlists/',
            webtorrentPrefix: 'webtorrent/',
            useMockBaseUrl: true
        });
    });
    describe('Test object storage with small upload part', function () {
        runTestSuite({
            playlistBucket: 'streaming-playlists',
            webtorrentBucket: 'videos',
            maxUploadPart: '5KB'
        });
    });
});
