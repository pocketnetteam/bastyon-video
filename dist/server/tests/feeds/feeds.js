"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = tslib_1.__importStar(require("chai"));
const fast_xml_parser_1 = require("fast-xml-parser");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
chai.use(require('chai-xml'));
chai.use(require('chai-json-schema'));
chai.config.includeStack = true;
const expect = chai.expect;
describe('Test syndication feeds', () => {
    let servers = [];
    let serverHLSOnly;
    let userAccessToken;
    let rootAccountId;
    let rootChannelId;
    let userAccountId;
    let userChannelId;
    let userFeedToken;
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield extra_utils_1.createMultipleServers(2);
            serverHLSOnly = yield extra_utils_1.createSingleServer(3, {
                transcoding: {
                    enabled: true,
                    webtorrent: { enabled: false },
                    hls: { enabled: true }
                }
            });
            yield extra_utils_1.setAccessTokensToServers([...servers, serverHLSOnly]);
            yield extra_utils_1.doubleFollow(servers[0], servers[1]);
            {
                const user = yield servers[0].users.getMyInfo();
                rootAccountId = user.account.id;
                rootChannelId = user.videoChannels[0].id;
            }
            {
                userAccessToken = yield servers[0].users.generateUserAndToken('john');
                const user = yield servers[0].users.getMyInfo({ token: userAccessToken });
                userAccountId = user.account.id;
                userChannelId = user.videoChannels[0].id;
                const token = yield servers[0].users.getMyScopedTokens({ token: userAccessToken });
                userFeedToken = token.feedToken;
            }
            {
                yield servers[0].videos.upload({ token: userAccessToken, attributes: { name: 'user video' } });
            }
            {
                const attributes = {
                    name: 'my super name for server 1',
                    description: 'my super description for server 1',
                    fixture: 'video_short.webm'
                };
                const { id } = yield servers[0].videos.upload({ attributes });
                yield servers[0].comments.createThread({ videoId: id, text: 'super comment 1' });
                yield servers[0].comments.createThread({ videoId: id, text: 'super comment 2' });
            }
            {
                const attributes = { name: 'unlisted video', privacy: 2 };
                const { id } = yield servers[0].videos.upload({ attributes });
                yield servers[0].comments.createThread({ videoId: id, text: 'comment on unlisted video' });
            }
            yield extra_utils_1.waitJobs(servers);
        });
    });
    describe('All feed', function () {
        it('Should be well formed XML (covers RSS 2.0 and ATOM 1.0 endpoints)', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const feed of ['video-comments', 'videos']) {
                    const rss = yield servers[0].feed.getXML({ feed });
                    expect(rss).xml.to.be.valid();
                    const atom = yield servers[0].feed.getXML({ feed, format: 'atom' });
                    expect(atom).xml.to.be.valid();
                }
            });
        });
        it('Should be well formed JSON (covers JSON feed 1.0 endpoint)', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const feed of ['video-comments', 'videos']) {
                    const jsonText = yield servers[0].feed.getJSON({ feed });
                    expect(JSON.parse(jsonText)).to.be.jsonSchema({ type: 'object' });
                }
            });
        });
        it('Should serve the endpoint with a classic request', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({
                    url: servers[0].url,
                    path: '/feeds/videos.xml',
                    accept: 'application/xml',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
            });
        });
        it('Should serve the endpoint as a cached request', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const res = yield extra_utils_1.makeGetRequest({
                    url: servers[0].url,
                    path: '/feeds/videos.xml',
                    accept: 'application/xml',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                expect(res.headers['x-api-cache-cached']).to.equal('true');
            });
        });
        it('Should not serve the endpoint as a cached request', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const res = yield extra_utils_1.makeGetRequest({
                    url: servers[0].url,
                    path: '/feeds/videos.xml?v=186',
                    accept: 'application/xml',
                    expectedStatus: models_1.HttpStatusCode.OK_200
                });
                expect(res.headers['x-api-cache-cached']).to.not.exist;
            });
        });
        it('Should refuse to serve the endpoint without accept header', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.makeGetRequest({ url: servers[0].url, path: '/feeds/videos.xml', expectedStatus: models_1.HttpStatusCode.NOT_ACCEPTABLE_406 });
            });
        });
    });
    describe('Videos feed', function () {
        it('Should contain a valid enclosure (covers RSS 2.0 endpoint)', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const rss = yield server.feed.getXML({ feed: 'videos' });
                    expect(fast_xml_parser_1.validate(rss)).to.be.true;
                    const xmlDoc = fast_xml_parser_1.parse(rss, { parseAttributeValue: true, ignoreAttributes: false });
                    const enclosure = xmlDoc.rss.channel.item[0].enclosure;
                    expect(enclosure).to.exist;
                    expect(enclosure['@_type']).to.equal('application/x-bittorrent');
                    expect(enclosure['@_length']).to.equal(218910);
                    expect(enclosure['@_url']).to.contain('720.torrent');
                }
            });
        });
        it('Should contain a valid \'attachments\' object (covers JSON feed 1.0 endpoint)', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const json = yield server.feed.getJSON({ feed: 'videos' });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(2);
                    expect(jsonObj.items[0].attachments).to.exist;
                    expect(jsonObj.items[0].attachments.length).to.be.eq(1);
                    expect(jsonObj.items[0].attachments[0].mime_type).to.be.eq('application/x-bittorrent');
                    expect(jsonObj.items[0].attachments[0].size_in_bytes).to.be.eq(218910);
                    expect(jsonObj.items[0].attachments[0].url).to.contain('720.torrent');
                }
            });
        });
        it('Should filter by account', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const json = yield servers[0].feed.getJSON({ feed: 'videos', query: { accountId: rootAccountId } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(1);
                    expect(jsonObj.items[0].title).to.equal('my super name for server 1');
                    expect(jsonObj.items[0].author.name).to.equal('root');
                }
                {
                    const json = yield servers[0].feed.getJSON({ feed: 'videos', query: { accountId: userAccountId } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(1);
                    expect(jsonObj.items[0].title).to.equal('user video');
                    expect(jsonObj.items[0].author.name).to.equal('john');
                }
                for (const server of servers) {
                    {
                        const json = yield server.feed.getJSON({ feed: 'videos', query: { accountName: 'root@localhost:' + servers[0].port } });
                        const jsonObj = JSON.parse(json);
                        expect(jsonObj.items.length).to.be.equal(1);
                        expect(jsonObj.items[0].title).to.equal('my super name for server 1');
                    }
                    {
                        const json = yield server.feed.getJSON({ feed: 'videos', query: { accountName: 'john@localhost:' + servers[0].port } });
                        const jsonObj = JSON.parse(json);
                        expect(jsonObj.items.length).to.be.equal(1);
                        expect(jsonObj.items[0].title).to.equal('user video');
                    }
                }
            });
        });
        it('Should filter by video channel', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                {
                    const json = yield servers[0].feed.getJSON({ feed: 'videos', query: { videoChannelId: rootChannelId } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(1);
                    expect(jsonObj.items[0].title).to.equal('my super name for server 1');
                    expect(jsonObj.items[0].author.name).to.equal('root');
                }
                {
                    const json = yield servers[0].feed.getJSON({ feed: 'videos', query: { videoChannelId: userChannelId } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(1);
                    expect(jsonObj.items[0].title).to.equal('user video');
                    expect(jsonObj.items[0].author.name).to.equal('john');
                }
                for (const server of servers) {
                    {
                        const query = { videoChannelName: 'root_channel@localhost:' + servers[0].port };
                        const json = yield server.feed.getJSON({ feed: 'videos', query });
                        const jsonObj = JSON.parse(json);
                        expect(jsonObj.items.length).to.be.equal(1);
                        expect(jsonObj.items[0].title).to.equal('my super name for server 1');
                    }
                    {
                        const query = { videoChannelName: 'john_channel@localhost:' + servers[0].port };
                        const json = yield server.feed.getJSON({ feed: 'videos', query });
                        const jsonObj = JSON.parse(json);
                        expect(jsonObj.items.length).to.be.equal(1);
                        expect(jsonObj.items[0].title).to.equal('user video');
                    }
                }
            });
        });
        it('Should correctly have videos feed with HLS only', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(120000);
                yield serverHLSOnly.videos.upload({ attributes: { name: 'hls only video' } });
                yield extra_utils_1.waitJobs([serverHLSOnly]);
                const json = yield serverHLSOnly.feed.getJSON({ feed: 'videos' });
                const jsonObj = JSON.parse(json);
                expect(jsonObj.items.length).to.be.equal(1);
                expect(jsonObj.items[0].attachments).to.exist;
                expect(jsonObj.items[0].attachments.length).to.be.eq(4);
                for (let i = 0; i < 4; i++) {
                    expect(jsonObj.items[0].attachments[i].mime_type).to.be.eq('application/x-bittorrent');
                    expect(jsonObj.items[0].attachments[i].size_in_bytes).to.be.greaterThan(0);
                    expect(jsonObj.items[0].attachments[i].url).to.exist;
                }
            });
        });
    });
    describe('Video comments feed', function () {
        it('Should contain valid comments (covers JSON feed 1.0 endpoint) and not from unlisted videos', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                for (const server of servers) {
                    const json = yield server.feed.getJSON({ feed: 'video-comments' });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(2);
                    expect(jsonObj.items[0].html_content).to.equal('super comment 2');
                    expect(jsonObj.items[1].html_content).to.equal('super comment 1');
                }
            });
        });
        it('Should not list comments from muted accounts or instances', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                const remoteHandle = 'root@localhost:' + servers[0].port;
                yield servers[1].blocklist.addToServerBlocklist({ account: remoteHandle });
                {
                    const json = yield servers[1].feed.getJSON({ feed: 'video-comments', query: { version: 2 } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(0);
                }
                yield servers[1].blocklist.removeFromServerBlocklist({ account: remoteHandle });
                {
                    const videoUUID = (yield servers[1].videos.quickUpload({ name: 'server 2' })).uuid;
                    yield extra_utils_1.waitJobs(servers);
                    yield servers[0].comments.createThread({ videoId: videoUUID, text: 'super comment' });
                    yield extra_utils_1.waitJobs(servers);
                    const json = yield servers[1].feed.getJSON({ feed: 'video-comments', query: { version: 3 } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(3);
                }
                yield servers[1].blocklist.addToMyBlocklist({ account: remoteHandle });
                {
                    const json = yield servers[1].feed.getJSON({ feed: 'video-comments', query: { version: 4 } });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(2);
                }
            });
        });
    });
    describe('Video feed from my subscriptions', function () {
        let feeduserAccountId;
        let feeduserFeedToken;
        it('Should list no videos for a user with no videos and no subscriptions', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const attr = { username: 'feeduser', password: 'password' };
                yield servers[0].users.create({ username: attr.username, password: attr.password });
                const feeduserAccessToken = yield servers[0].login.getAccessToken(attr);
                {
                    const user = yield servers[0].users.getMyInfo({ token: feeduserAccessToken });
                    feeduserAccountId = user.account.id;
                }
                {
                    const token = yield servers[0].users.getMyScopedTokens({ token: feeduserAccessToken });
                    feeduserFeedToken = token.feedToken;
                }
                {
                    const body = yield servers[0].subscriptions.listVideos({ token: feeduserAccessToken });
                    expect(body.total).to.equal(0);
                    const query = { accountId: feeduserAccountId, token: feeduserFeedToken };
                    const json = yield servers[0].feed.getJSON({ feed: 'subscriptions', query });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(0);
                }
            });
        });
        it('Should fail with an invalid token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const query = { accountId: feeduserAccountId, token: 'toto' };
                yield servers[0].feed.getJSON({ feed: 'subscriptions', query, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should fail with a token of another user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const query = { accountId: feeduserAccountId, token: userFeedToken };
                yield servers[0].feed.getJSON({ feed: 'subscriptions', query, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should list no videos for a user with videos but no subscriptions', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const body = yield servers[0].subscriptions.listVideos({ token: userAccessToken });
                expect(body.total).to.equal(0);
                const query = { accountId: userAccountId, token: userFeedToken };
                const json = yield servers[0].feed.getJSON({ feed: 'subscriptions', query });
                const jsonObj = JSON.parse(json);
                expect(jsonObj.items.length).to.be.equal(0);
            });
        });
        it('Should list self videos for a user with a subscription to themselves', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].subscriptions.add({ token: userAccessToken, targetUri: 'john_channel@localhost:' + servers[0].port });
                yield extra_utils_1.waitJobs(servers);
                {
                    const body = yield servers[0].subscriptions.listVideos({ token: userAccessToken });
                    expect(body.total).to.equal(1);
                    expect(body.data[0].name).to.equal('user video');
                    const query = { accountId: userAccountId, token: userFeedToken, version: 1 };
                    const json = yield servers[0].feed.getJSON({ feed: 'subscriptions', query });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(1);
                }
            });
        });
        it('Should list videos of a user\'s subscription', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield servers[0].subscriptions.add({ token: userAccessToken, targetUri: 'root_channel@localhost:' + servers[0].port });
                yield extra_utils_1.waitJobs(servers);
                {
                    const body = yield servers[0].subscriptions.listVideos({ token: userAccessToken });
                    expect(body.total).to.equal(2, "there should be 2 videos part of the subscription");
                    const query = { accountId: userAccountId, token: userFeedToken, version: 2 };
                    const json = yield servers[0].feed.getJSON({ feed: 'subscriptions', query });
                    const jsonObj = JSON.parse(json);
                    expect(jsonObj.items.length).to.be.equal(2);
                }
            });
        });
        it('Should renew the token, and so have an invalid old token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield servers[0].users.renewMyScopedTokens({ token: userAccessToken });
                const query = { accountId: userAccountId, token: userFeedToken, version: 3 };
                yield servers[0].feed.getJSON({ feed: 'subscriptions', query, expectedStatus: models_1.HttpStatusCode.FORBIDDEN_403 });
            });
        });
        it('Should succeed with the new token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const token = yield servers[0].users.getMyScopedTokens({ token: userAccessToken });
                userFeedToken = token.feedToken;
                const query = { accountId: userAccountId, token: userFeedToken, version: 4 };
                yield servers[0].feed.getJSON({ feed: 'subscriptions', query });
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield extra_utils_1.cleanupTests([...servers, serverHLSOnly]);
        });
    });
});
