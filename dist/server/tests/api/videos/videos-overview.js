"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test a videos overview', function () {
    let server = null;
    function testOverviewCount(overview, expected) {
        expect(overview.tags).to.have.lengthOf(expected);
        expect(overview.categories).to.have.lengthOf(expected);
        expect(overview.channels).to.have.lengthOf(expected);
    }
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
        });
    });
    it('Should send empty overview', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const body = yield server.overviews.getVideos({ page: 1 });
            testOverviewCount(body, 0);
        });
    });
    it('Should upload 5 videos in a specific category, tag and channel but not include them in overview', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            yield (0, extra_utils_1.wait)(3000);
            yield server.videos.upload({
                attributes: {
                    name: 'video 0',
                    category: 3,
                    tags: ['coucou1', 'coucou2']
                }
            });
            const body = yield server.overviews.getVideos({ page: 1 });
            testOverviewCount(body, 0);
        });
    });
    it('Should upload another video and include all videos in the overview', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            {
                for (let i = 1; i < 6; i++) {
                    yield server.videos.upload({
                        attributes: {
                            name: 'video ' + i,
                            category: 3,
                            tags: ['coucou1', 'coucou2']
                        }
                    });
                }
                yield (0, extra_utils_1.wait)(3000);
            }
            {
                const body = yield server.overviews.getVideos({ page: 1 });
                testOverviewCount(body, 1);
            }
            {
                const overview = yield server.overviews.getVideos({ page: 2 });
                expect(overview.tags).to.have.lengthOf(1);
                expect(overview.categories).to.have.lengthOf(0);
                expect(overview.channels).to.have.lengthOf(0);
            }
        });
    });
    it('Should have the correct overview', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const overview1 = yield server.overviews.getVideos({ page: 1 });
            const overview2 = yield server.overviews.getVideos({ page: 2 });
            for (const arr of [overview1.tags, overview1.categories, overview1.channels, overview2.tags]) {
                expect(arr).to.have.lengthOf(1);
                const obj = arr[0];
                expect(obj.videos).to.have.lengthOf(6);
                expect(obj.videos[0].name).to.equal('video 5');
                expect(obj.videos[1].name).to.equal('video 4');
                expect(obj.videos[2].name).to.equal('video 3');
                expect(obj.videos[3].name).to.equal('video 2');
                expect(obj.videos[4].name).to.equal('video 1');
                expect(obj.videos[5].name).to.equal('video 0');
            }
            const tags = [overview1.tags[0].tag, overview2.tags[0].tag];
            expect(tags.find(t => t === 'coucou1')).to.not.be.undefined;
            expect(tags.find(t => t === 'coucou2')).to.not.be.undefined;
            expect(overview1.categories[0].category.id).to.equal(3);
            expect(overview1.channels[0].channel.name).to.equal('root_channel');
        });
    });
    it('Should hide muted accounts', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const token = yield server.users.generateUserAndToken('choco');
            yield server.blocklist.addToMyBlocklist({ token, account: 'root@' + server.host });
            {
                const body = yield server.overviews.getVideos({ page: 1 });
                testOverviewCount(body, 1);
            }
            {
                const body = yield server.overviews.getVideos({ page: 1, token });
                testOverviewCount(body, 0);
            }
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
