"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStorageCommand = void 0;
const tslib_1 = require("tslib");
const models_1 = require("@shared/models");
const requests_1 = require("../requests");
const shared_1 = require("../shared");
class ObjectStorageCommand extends shared_1.AbstractCommand {
    static getDefaultConfig() {
        return {
            object_storage: {
                enabled: true,
                endpoint: 'http://' + this.getEndpointHost(),
                region: this.getRegion(),
                credentials: this.getCredentialsConfig(),
                streaming_playlists: {
                    bucket_name: this.DEFAULT_PLAYLIST_BUCKET
                },
                videos: {
                    bucket_name: this.DEFAULT_WEBTORRENT_BUCKET
                }
            }
        };
    }
    static getCredentialsConfig() {
        return {
            access_key_id: 'AKIAIOSFODNN7EXAMPLE',
            secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        };
    }
    static getEndpointHost() {
        return 'localhost:9444';
    }
    static getRegion() {
        return 'us-east-1';
    }
    static getWebTorrentBaseUrl() {
        return `http://${this.DEFAULT_WEBTORRENT_BUCKET}.${this.getEndpointHost()}/`;
    }
    static getPlaylistBaseUrl() {
        return `http://${this.DEFAULT_PLAYLIST_BUCKET}.${this.getEndpointHost()}/`;
    }
    static prepareDefaultBuckets() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.createBucket(this.DEFAULT_PLAYLIST_BUCKET);
            yield this.createBucket(this.DEFAULT_WEBTORRENT_BUCKET);
        });
    }
    static createBucket(name) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield requests_1.makePostBodyRequest({
                url: this.getEndpointHost(),
                path: '/ui/' + name + '?delete',
                expectedStatus: models_1.HttpStatusCode.TEMPORARY_REDIRECT_307
            });
            yield requests_1.makePostBodyRequest({
                url: this.getEndpointHost(),
                path: '/ui/' + name + '?create',
                expectedStatus: models_1.HttpStatusCode.TEMPORARY_REDIRECT_307
            });
            yield requests_1.makePostBodyRequest({
                url: this.getEndpointHost(),
                path: '/ui/' + name + '?make-public',
                expectedStatus: models_1.HttpStatusCode.TEMPORARY_REDIRECT_307
            });
        });
    }
}
exports.ObjectStorageCommand = ObjectStorageCommand;
ObjectStorageCommand.DEFAULT_PLAYLIST_BUCKET = 'streaming-playlists';
ObjectStorageCommand.DEFAULT_WEBTORRENT_BUCKET = 'videos';
