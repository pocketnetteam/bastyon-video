"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test services', function () {
    let server = null;
    let playlistUUID;
    let playlistDisplayName;
    let video;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
            yield (0, extra_utils_1.setDefaultVideoChannel)([server]);
            {
                const attributes = { name: 'my super name' };
                yield server.videos.upload({ attributes });
                const { data } = yield server.videos.list();
                video = data[0];
            }
            {
                const created = yield server.playlists.create({
                    attributes: {
                        displayName: 'The Life and Times of Scrooge McDuck',
                        privacy: 1,
                        videoChannelId: server.store.channel.id
                    }
                });
                playlistUUID = created.uuid;
                playlistDisplayName = 'The Life and Times of Scrooge McDuck';
                yield server.playlists.addElement({
                    playlistId: created.id,
                    attributes: {
                        videoId: video.id
                    }
                });
            }
        });
    });
    it('Should have a valid oEmbed video response', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const basePath of ['/videos/watch/', '/w/']) {
                for (const suffix of ['', '?param=1']) {
                    const oembedUrl = server.url + basePath + video.uuid + suffix;
                    const res = yield server.services.getOEmbed({ oembedUrl });
                    const expectedHtml = '<iframe width="560" height="315" sandbox="allow-same-origin allow-scripts" ' +
                        `title="${video.name}" src="http://localhost:${server.port}/videos/embed/${video.uuid}" ` +
                        'frameborder="0" allowfullscreen></iframe>';
                    const expectedThumbnailUrl = 'http://localhost:' + server.port + video.previewPath;
                    expect(res.body.html).to.equal(expectedHtml);
                    expect(res.body.title).to.equal(video.name);
                    expect(res.body.author_name).to.equal(server.store.channel.displayName);
                    expect(res.body.width).to.equal(560);
                    expect(res.body.height).to.equal(315);
                    expect(res.body.thumbnail_url).to.equal(expectedThumbnailUrl);
                    expect(res.body.thumbnail_width).to.equal(850);
                    expect(res.body.thumbnail_height).to.equal(480);
                }
            }
        });
    });
    it('Should have a valid playlist oEmbed response', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const basePath of ['/videos/watch/playlist/', '/w/p/']) {
                for (const suffix of ['', '?param=1']) {
                    const oembedUrl = server.url + basePath + playlistUUID + suffix;
                    const res = yield server.services.getOEmbed({ oembedUrl });
                    const expectedHtml = '<iframe width="560" height="315" sandbox="allow-same-origin allow-scripts" ' +
                        `title="${playlistDisplayName}" src="http://localhost:${server.port}/video-playlists/embed/${playlistUUID}" ` +
                        'frameborder="0" allowfullscreen></iframe>';
                    expect(res.body.html).to.equal(expectedHtml);
                    expect(res.body.title).to.equal('The Life and Times of Scrooge McDuck');
                    expect(res.body.author_name).to.equal(server.store.channel.displayName);
                    expect(res.body.width).to.equal(560);
                    expect(res.body.height).to.equal(315);
                    expect(res.body.thumbnail_url).exist;
                    expect(res.body.thumbnail_width).to.equal(280);
                    expect(res.body.thumbnail_height).to.equal(157);
                }
            }
        });
    });
    it('Should have a valid oEmbed response with small max height query', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            for (const basePath of ['/videos/watch/', '/w/']) {
                const oembedUrl = 'http://localhost:' + server.port + basePath + video.uuid;
                const format = 'json';
                const maxHeight = 50;
                const maxWidth = 50;
                const res = yield server.services.getOEmbed({ oembedUrl, format, maxHeight, maxWidth });
                const expectedHtml = '<iframe width="50" height="50" sandbox="allow-same-origin allow-scripts" ' +
                    `title="${video.name}" src="http://localhost:${server.port}/videos/embed/${video.uuid}" ` +
                    'frameborder="0" allowfullscreen></iframe>';
                expect(res.body.html).to.equal(expectedHtml);
                expect(res.body.title).to.equal(video.name);
                expect(res.body.author_name).to.equal(server.store.channel.displayName);
                expect(res.body.height).to.equal(50);
                expect(res.body.width).to.equal(50);
                expect(res.body).to.not.have.property('thumbnail_url');
                expect(res.body).to.not.have.property('thumbnail_width');
                expect(res.body).to.not.have.property('thumbnail_height');
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
