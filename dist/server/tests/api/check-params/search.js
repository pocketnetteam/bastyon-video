"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const extra_utils_1 = require("@shared/extra-utils");
const models_1 = require("@shared/models");
function updateSearchIndex(server, enabled, disableLocalSearch = false) {
    return server.config.updateCustomSubConfig({
        newConfig: {
            search: {
                searchIndex: {
                    enabled,
                    disableLocalSearch
                }
            }
        }
    });
}
describe('Test videos API validator', function () {
    let server;
    before(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield (0, extra_utils_1.createSingleServer)(1);
            yield (0, extra_utils_1.setAccessTokensToServers)([server]);
        });
    });
    describe('When searching videos', function () {
        const path = '/api/v1/search/videos/';
        const query = {
            search: 'coucou'
        };
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, null, query);
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should fail with an invalid category', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { categoryOneOf: ['aa', 'b'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const customQuery2 = Object.assign(Object.assign({}, query), { categoryOneOf: 'a' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with a valid category', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { categoryOneOf: [1, 7] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const customQuery2 = Object.assign(Object.assign({}, query), { categoryOneOf: 1 });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should fail with an invalid licence', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { licenceOneOf: ['aa', 'b'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const customQuery2 = Object.assign(Object.assign({}, query), { licenceOneOf: 'a' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with a valid licence', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { licenceOneOf: [1, 2] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const customQuery2 = Object.assign(Object.assign({}, query), { licenceOneOf: 1 });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should succeed with a valid language', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { languageOneOf: ['fr', 'en'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const customQuery2 = Object.assign(Object.assign({}, query), { languageOneOf: 'fr' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should succeed with valid tags', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { tagsOneOf: ['tag1', 'tag2'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const customQuery2 = Object.assign(Object.assign({}, query), { tagsOneOf: 'tag1' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const customQuery3 = Object.assign(Object.assign({}, query), { tagsAllOf: ['tag1', 'tag2'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery3, expectedStatus: models_1.HttpStatusCode.OK_200 });
                const customQuery4 = Object.assign(Object.assign({}, query), { tagsAllOf: 'tag1' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery4, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should fail with invalid durations', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { durationMin: 'hello' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const customQuery2 = Object.assign(Object.assign({}, query), { durationMax: 'hello' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with invalid dates', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery1 = Object.assign(Object.assign({}, query), { startDate: 'hello' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery1, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const customQuery2 = Object.assign(Object.assign({}, query), { endDate: 'hello' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery2, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const customQuery3 = Object.assign(Object.assign({}, query), { originallyPublishedStartDate: 'hello' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery3, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                const customQuery4 = Object.assign(Object.assign({}, query), { originallyPublishedEndDate: 'hello' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery4, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with an invalid host', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery = Object.assign(Object.assign({}, query), { host: '6565' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with a host', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery = Object.assign(Object.assign({}, query), { host: 'example.com' });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
        it('Should fail with invalid uuids', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery = Object.assign(Object.assign({}, query), { uuids: ['6565', 'dfd70b83-639f-4980-94af-304a56ab4b35'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with valid uuids', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery = Object.assign(Object.assign({}, query), { uuids: ['dfd70b83-639f-4980-94af-304a56ab4b35'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When searching video playlists', function () {
        const path = '/api/v1/search/video-playlists/';
        const query = {
            search: 'coucou',
            host: 'example.com'
        };
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with an invalid host', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: Object.assign(Object.assign({}, query), { host: '6565' }), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with invalid uuids', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const customQuery = Object.assign(Object.assign({}, query), { uuids: ['6565', 'dfd70b83-639f-4980-94af-304a56ab4b35'] });
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('When searching video channels', function () {
        const path = '/api/v1/search/video-channels/';
        const query = {
            search: 'coucou',
            host: 'example.com'
        };
        it('Should fail with a bad start pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadStartPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with a bad count pagination', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadCountPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with an incorrect sort', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.checkBadSortPagination)(server.url, path, null, query);
            });
        });
        it('Should fail with an invalid host', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: Object.assign(Object.assign({}, query), { host: '6565' }), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should fail with invalid handles', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: Object.assign(Object.assign({}, query), { handles: [''] }), expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
            });
        });
        it('Should succeed with the correct parameters', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query, expectedStatus: models_1.HttpStatusCode.OK_200 });
            });
        });
    });
    describe('Search target', function () {
        it('Should fail/succeed depending on the search target', function () {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                this.timeout(10000);
                const query = { search: 'coucou' };
                const paths = [
                    '/api/v1/search/video-playlists/',
                    '/api/v1/search/video-channels/',
                    '/api/v1/search/videos/'
                ];
                for (const path of paths) {
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: 'hello' });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                    }
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: undefined });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.OK_200 });
                    }
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: 'local' });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.OK_200 });
                    }
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: 'search-index' });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                    }
                    yield updateSearchIndex(server, true, true);
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: 'local' });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.BAD_REQUEST_400 });
                    }
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: 'search-index' });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.OK_200 });
                    }
                    yield updateSearchIndex(server, true, false);
                    {
                        const customQuery = Object.assign(Object.assign({}, query), { searchTarget: 'local' });
                        yield (0, extra_utils_1.makeGetRequest)({ url: server.url, path, query: customQuery, expectedStatus: models_1.HttpStatusCode.OK_200 });
                    }
                    yield updateSearchIndex(server, false, false);
                }
            });
        });
    });
    after(function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield (0, extra_utils_1.cleanupTests)([server]);
        });
    });
});
