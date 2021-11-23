"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const lodash_1 = require("lodash");
const models_1 = require("@shared/models");
const extra_utils_1 = require("../../shared/extra-utils");
const expect = chai.expect;
function checkIndexTags(html, title, description, css, config) {
    expect(html).to.contain('<title>' + title + '</title>');
    expect(html).to.contain('<meta name="description" content="' + description + '" />');
    expect(html).to.contain('<style class="custom-css-style">' + css + '</style>');
    const htmlConfig = (0, lodash_1.omit)(config, 'signup');
    const configObjectString = JSON.stringify(htmlConfig);
    const configEscapedString = JSON.stringify(configObjectString);
    expect(html).to.contain(`<script type="application/javascript">window.PeerTubeServerConfig = ${configEscapedString}</script>`);
}
describe('Test a client controllers', function () {
    let servers = [];
    let account;
    const videoName = 'my super name for server 1';
    const videoDescription = 'my<br> super __description__ for *server* 1<p></p>';
    const videoDescriptionPlainText = 'my super description for server 1';
    const playlistName = 'super playlist name';
    const playlistDescription = 'super playlist description';
    let playlist;
    const channelDescription = 'my super channel description';
    const watchVideoBasePaths = ['/videos/watch/', '/w/'];
    const watchPlaylistBasePaths = ['/videos/watch/playlist/', '/w/p/'];
    let videoIds = [];
    let playlistIds = [];
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(120000);
            servers = yield (0, extra_utils_1.createMultipleServers)(2);
            yield (0, extra_utils_1.setAccessTokensToServers)(servers);
            yield (0, extra_utils_1.doubleFollow)(servers[0], servers[1]);
            yield (0, extra_utils_1.setDefaultVideoChannel)(servers);
            yield servers[0].channels.update({
                channelName: servers[0].store.channel.name,
                attributes: { description: channelDescription }
            });
            {
                const attributes = { name: videoName, description: videoDescription };
                yield servers[0].videos.upload({ attributes });
                const { data } = yield servers[0].videos.list();
                expect(data.length).to.equal(1);
                const video = data[0];
                servers[0].store.video = video;
                videoIds = [video.id, video.uuid, video.shortUUID];
            }
            {
                const attributes = {
                    displayName: playlistName,
                    description: playlistDescription,
                    privacy: 1,
                    videoChannelId: servers[0].store.channel.id
                };
                playlist = yield servers[0].playlists.create({ attributes });
                playlistIds = [playlist.id, playlist.shortUUID, playlist.uuid];
                yield servers[0].playlists.addElement({ playlistId: playlist.shortUUID, attributes: { videoId: servers[0].store.video.id } });
            }
            {
                yield servers[0].users.updateMe({ description: 'my account description' });
                account = yield servers[0].accounts.get({ accountName: `${servers[0].store.user.username}@${servers[0].host}` });
            }
            yield (0, extra_utils_1.waitJobs)(servers);
        });
    });
    describe('oEmbed', function () {
        it('Should have valid oEmbed discovery tags for videos', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const basePath of watchVideoBasePaths) {
                    for (const id of videoIds) {
                        const res = yield (0, extra_utils_1.makeGetRequest)({
                            url: servers[0].url,
                            path: basePath + id,
                            accept: 'text/html',
                            expectedStatus: models_1.HttpStatusCode.OK_200
                        });
                        const port = servers[0].port;
                        const expectedLink = '<link rel="alternate" type="application/json+oembed" href="http://localhost:' + port + '/services/oembed?' +
                            `url=http%3A%2F%2Flocalhost%3A${port}%2Fw%2F${servers[0].store.video.shortUUID}" ` +
                            `title="${servers[0].store.video.name}" />`;
                        expect(res.text).to.contain(expectedLink);
                    }
                }
            });
        });
        it('Should have valid oEmbed discovery tags for a playlist', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const basePath of watchPlaylistBasePaths) {
                    for (const id of playlistIds) {
                        const res = yield (0, extra_utils_1.makeGetRequest)({
                            url: servers[0].url,
                            path: basePath + id,
                            accept: 'text/html',
                            expectedStatus: models_1.HttpStatusCode.OK_200
                        });
                        const port = servers[0].port;
                        const expectedLink = '<link rel="alternate" type="application/json+oembed" href="http://localhost:' + port + '/services/oembed?' +
                            `url=http%3A%2F%2Flocalhost%3A${port}%2Fw%2Fp%2F${playlist.shortUUID}" ` +
                            `title="${playlistName}" />`;
                        expect(res.text).to.contain(expectedLink);
                    }
                }
            });
        });
    });
    describe('Open Graph', function () {
        function accountPageTest(path) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                const text = res.text;
                expect(text).to.contain(`<meta property="og:title" content="${account.displayName}" />`);
                expect(text).to.contain(`<meta property="og:description" content="${account.description}" />`);
                expect(text).to.contain('<meta property="og:type" content="website" />');
                expect(text).to.contain(`<meta property="og:url" content="${servers[0].url}/accounts/${servers[0].store.user.username}" />`);
            });
        }
        function channelPageTest(path) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                const text = res.text;
                expect(text).to.contain(`<meta property="og:title" content="${servers[0].store.channel.displayName}" />`);
                expect(text).to.contain(`<meta property="og:description" content="${channelDescription}" />`);
                expect(text).to.contain('<meta property="og:type" content="website" />');
                expect(text).to.contain(`<meta property="og:url" content="${servers[0].url}/video-channels/${servers[0].store.channel.name}" />`);
            });
        }
        function watchVideoPageTest(path) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                const text = res.text;
                expect(text).to.contain(`<meta property="og:title" content="${videoName}" />`);
                expect(text).to.contain(`<meta property="og:description" content="${videoDescriptionPlainText}" />`);
                expect(text).to.contain('<meta property="og:type" content="video" />');
                expect(text).to.contain(`<meta property="og:url" content="${servers[0].url}/w/${servers[0].store.video.shortUUID}" />`);
            });
        }
        function watchPlaylistPageTest(path) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                const text = res.text;
                expect(text).to.contain(`<meta property="og:title" content="${playlistName}" />`);
                expect(text).to.contain(`<meta property="og:description" content="${playlistDescription}" />`);
                expect(text).to.contain('<meta property="og:type" content="video" />');
                expect(text).to.contain(`<meta property="og:url" content="${servers[0].url}/w/p/${playlist.shortUUID}" />`);
            });
        }
        it('Should have valid Open Graph tags on the account page', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield accountPageTest('/accounts/' + servers[0].store.user.username);
                yield accountPageTest('/a/' + servers[0].store.user.username);
                yield accountPageTest('/@' + servers[0].store.user.username);
            });
        });
        it('Should have valid Open Graph tags on the channel page', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield channelPageTest('/video-channels/' + servers[0].store.channel.name);
                yield channelPageTest('/c/' + servers[0].store.channel.name);
                yield channelPageTest('/@' + servers[0].store.channel.name);
            });
        });
        it('Should have valid Open Graph tags on the watch page', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const path of watchVideoBasePaths) {
                    for (const id of videoIds) {
                        yield watchVideoPageTest(path + id);
                    }
                }
            });
        });
        it('Should have valid Open Graph tags on the watch playlist page', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const path of watchPlaylistBasePaths) {
                    for (const id of playlistIds) {
                        yield watchPlaylistPageTest(path + id);
                    }
                }
            });
        });
    });
    describe('Twitter card', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            describe('Not whitelisted', function () {
                function accountPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="summary" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Chocobozzz" />');
                        expect(text).to.contain(`<meta property="twitter:title" content="${account.name}" />`);
                        expect(text).to.contain(`<meta property="twitter:description" content="${account.description}" />`);
                    });
                }
                function channelPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="summary" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Chocobozzz" />');
                        expect(text).to.contain(`<meta property="twitter:title" content="${servers[0].store.channel.displayName}" />`);
                        expect(text).to.contain(`<meta property="twitter:description" content="${channelDescription}" />`);
                    });
                }
                function watchVideoPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="summary_large_image" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Chocobozzz" />');
                        expect(text).to.contain(`<meta property="twitter:title" content="${videoName}" />`);
                        expect(text).to.contain(`<meta property="twitter:description" content="${videoDescriptionPlainText}" />`);
                    });
                }
                function watchPlaylistPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="summary" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Chocobozzz" />');
                        expect(text).to.contain(`<meta property="twitter:title" content="${playlistName}" />`);
                        expect(text).to.contain(`<meta property="twitter:description" content="${playlistDescription}" />`);
                    });
                }
                it('Should have valid twitter card on the watch video page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        for (const path of watchVideoBasePaths) {
                            for (const id of videoIds) {
                                yield watchVideoPageTest(path + id);
                            }
                        }
                    });
                });
                it('Should have valid twitter card on the watch playlist page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        for (const path of watchPlaylistBasePaths) {
                            for (const id of playlistIds) {
                                yield watchPlaylistPageTest(path + id);
                            }
                        }
                    });
                });
                it('Should have valid twitter card on the account page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield accountPageTest('/accounts/' + account.name);
                        yield accountPageTest('/a/' + account.name);
                        yield accountPageTest('/@' + account.name);
                    });
                });
                it('Should have valid twitter card on the channel page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield channelPageTest('/video-channels/' + servers[0].store.channel.name);
                        yield channelPageTest('/c/' + servers[0].store.channel.name);
                        yield channelPageTest('/@' + servers[0].store.channel.name);
                    });
                });
            });
            describe('Whitelisted', function () {
                before(function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const config = yield servers[0].config.getCustomConfig();
                        config.services.twitter = {
                            username: '@Kuja',
                            whitelisted: true
                        };
                        yield servers[0].config.updateCustomConfig({ newCustomConfig: config });
                    });
                });
                function accountPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="summary" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Kuja" />');
                    });
                }
                function channelPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="summary" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Kuja" />');
                    });
                }
                function watchVideoPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="player" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Kuja" />');
                    });
                }
                function watchPlaylistPageTest(path) {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        const res = yield (0, extra_utils_1.makeGetRequest)({ url: servers[0].url, path, accept: 'text/html', expectedStatus: models_1.HttpStatusCode.OK_200 });
                        const text = res.text;
                        expect(text).to.contain('<meta property="twitter:card" content="player" />');
                        expect(text).to.contain('<meta property="twitter:site" content="@Kuja" />');
                    });
                }
                it('Should have valid twitter card on the watch video page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        for (const path of watchVideoBasePaths) {
                            for (const id of videoIds) {
                                yield watchVideoPageTest(path + id);
                            }
                        }
                    });
                });
                it('Should have valid twitter card on the watch playlist page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        for (const path of watchPlaylistBasePaths) {
                            for (const id of playlistIds) {
                                yield watchPlaylistPageTest(path + id);
                            }
                        }
                    });
                });
                it('Should have valid twitter card on the account page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield accountPageTest('/accounts/' + account.name);
                        yield accountPageTest('/a/' + account.name);
                        yield accountPageTest('/@' + account.name);
                    });
                });
                it('Should have valid twitter card on the channel page', function () {
                    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                        yield channelPageTest('/video-channels/' + servers[0].store.channel.name);
                        yield channelPageTest('/c/' + servers[0].store.channel.name);
                        yield channelPageTest('/@' + servers[0].store.channel.name);
                    });
                });
            });
        });
    });
    describe('Index HTML', function () {
        it('Should have valid index html tags (title, description...)', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const config = yield servers[0].config.getConfig();
                const res = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, '/videos/trending');
                const description = 'PeerTube, an ActivityPub-federated video streaming platform using P2P directly in your web browser.';
                checkIndexTags(res.text, 'PeerTube', description, '', config);
            });
        });
        it('Should update the customized configuration and have the correct index html tags', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield servers[0].config.updateCustomSubConfig({
                    newConfig: {
                        instance: {
                            name: 'PeerTube updated',
                            shortDescription: 'my short description',
                            description: 'my super description',
                            terms: 'my super terms',
                            defaultNSFWPolicy: 'blur',
                            defaultClientRoute: '/videos/recently-added',
                            customizations: {
                                javascript: 'alert("coucou")',
                                css: 'body { background-color: red; }'
                            }
                        }
                    }
                });
                const config = yield servers[0].config.getConfig();
                const res = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, '/videos/trending');
                checkIndexTags(res.text, 'PeerTube updated', 'my short description', 'body { background-color: red; }', config);
            });
        });
        it('Should have valid index html updated tags (title, description...)', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const config = yield servers[0].config.getConfig();
                const res = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, '/videos/trending');
                checkIndexTags(res.text, 'PeerTube updated', 'my short description', 'body { background-color: red; }', config);
            });
        });
        it('Should use the original video URL for the canonical tag', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const basePath of watchVideoBasePaths) {
                    for (const id of videoIds) {
                        const res = yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, basePath + id);
                        expect(res.text).to.contain(`<link rel="canonical" href="${servers[0].url}/videos/watch/${servers[0].store.video.uuid}" />`);
                    }
                }
            });
        });
        it('Should use the original account URL for the canonical tag', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const accountURLtest = res => {
                    expect(res.text).to.contain(`<link rel="canonical" href="${servers[0].url}/accounts/root" />`);
                };
                accountURLtest(yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, '/accounts/root@' + servers[0].host));
                accountURLtest(yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, '/a/root@' + servers[0].host));
                accountURLtest(yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, '/@root@' + servers[0].host));
            });
        });
        it('Should use the original channel URL for the canonical tag', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const channelURLtests = res => {
                    expect(res.text).to.contain(`<link rel="canonical" href="${servers[0].url}/video-channels/root_channel" />`);
                };
                channelURLtests(yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, '/video-channels/root_channel@' + servers[0].host));
                channelURLtests(yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, '/c/root_channel@' + servers[0].host));
                channelURLtests(yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, '/@root_channel@' + servers[0].host));
            });
        });
        it('Should use the original playlist URL for the canonical tag', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                for (const basePath of watchPlaylistBasePaths) {
                    for (const id of playlistIds) {
                        const res = yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, basePath + id);
                        expect(res.text).to.contain(`<link rel="canonical" href="${servers[0].url}/video-playlists/${playlist.uuid}" />`);
                    }
                }
            });
        });
        it('Should add noindex meta tag for remote accounts', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const handle = 'root@' + servers[0].host;
                const paths = ['/accounts/', '/a/', '/@'];
                for (const path of paths) {
                    {
                        const { text } = yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, path + handle);
                        expect(text).to.contain('<meta name="robots" content="noindex" />');
                    }
                    {
                        const { text } = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, path + handle);
                        expect(text).to.not.contain('<meta name="robots" content="noindex" />');
                    }
                }
            });
        });
        it('Should add noindex meta tag for remote accounts', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const handle = 'root_channel@' + servers[0].host;
                const paths = ['/video-channels/', '/c/', '/@'];
                for (const path of paths) {
                    {
                        const { text } = yield (0, extra_utils_1.makeHTMLRequest)(servers[1].url, path + handle);
                        expect(text).to.contain('<meta name="robots" content="noindex" />');
                    }
                    {
                        const { text } = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, path + handle);
                        expect(text).to.not.contain('<meta name="robots" content="noindex" />');
                    }
                }
            });
        });
        it('Should add noindex header for some paths', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const paths = ['/about/peertube'];
                for (const path of paths) {
                    const { headers } = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, path);
                    expect(headers['x-robots-tag']).to.equal('noindex');
                }
            });
        });
    });
    describe('Embed HTML', function () {
        it('Should have the correct embed html tags', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const config = yield servers[0].config.getConfig();
                const res = yield (0, extra_utils_1.makeHTMLRequest)(servers[0].url, servers[0].store.video.embedPath);
                checkIndexTags(res.text, 'PeerTube updated', 'my short description', 'body { background-color: red; }', config);
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)(servers);
        });
    });
});
