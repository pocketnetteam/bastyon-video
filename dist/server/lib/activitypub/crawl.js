"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlCollectionPage = void 0;
const tslib_1 = require("tslib");
const url_1 = require("url");
const database_utils_1 = require("@server/helpers/database-utils");
const logger_1 = require("../../helpers/logger");
const requests_1 = require("../../helpers/requests");
const constants_1 = require("../../initializers/constants");
function crawlCollectionPage(argUrl, handler, cleaner) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        let url = argUrl;
        logger_1.logger.info('Crawling ActivityPub data on %s.', url);
        const options = { activityPub: true };
        const startDate = new Date();
        const response = yield (0, requests_1.doJSONRequest)(url, options);
        const firstBody = response.body;
        const limit = constants_1.ACTIVITY_PUB.FETCH_PAGE_LIMIT;
        let i = 0;
        let nextLink = firstBody.first;
        while (nextLink && i < limit) {
            let body;
            if (typeof nextLink === 'string') {
                const remoteHost = new url_1.URL(nextLink).host;
                if (remoteHost === constants_1.WEBSERVER.HOST)
                    continue;
                url = nextLink;
                const res = yield (0, requests_1.doJSONRequest)(url, options);
                body = res.body;
            }
            else {
                body = nextLink;
            }
            nextLink = body.next;
            i++;
            if (Array.isArray(body.orderedItems)) {
                const items = body.orderedItems;
                logger_1.logger.info('Processing %i ActivityPub items for %s.', items.length, url);
                yield handler(items);
            }
        }
        if (cleaner)
            yield (0, database_utils_1.retryTransactionWrapper)(cleaner, startDate);
    });
}
exports.crawlCollectionPage = crawlCollectionPage;
