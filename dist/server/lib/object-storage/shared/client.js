"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.getEndpointParsed = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const logger_2 = require("./logger");
let endpointParsed;
function getEndpointParsed() {
    if (endpointParsed)
        return endpointParsed;
    endpointParsed = new URL(getEndpoint());
    return endpointParsed;
}
exports.getEndpointParsed = getEndpointParsed;
let s3Client;
function getClient() {
    if (s3Client)
        return s3Client;
    const OBJECT_STORAGE = config_1.CONFIG.OBJECT_STORAGE;
    s3Client = new client_s3_1.S3Client({
        endpoint: getEndpoint(),
        region: OBJECT_STORAGE.REGION,
        credentials: OBJECT_STORAGE.CREDENTIALS.ACCESS_KEY_ID
            ? {
                accessKeyId: OBJECT_STORAGE.CREDENTIALS.ACCESS_KEY_ID,
                secretAccessKey: OBJECT_STORAGE.CREDENTIALS.SECRET_ACCESS_KEY
            }
            : undefined
    });
    s3Client.middlewareStack.add((next, _context) => (args) => {
        var _a;
        if (typeof ((_a = args.request) === null || _a === void 0 ? void 0 : _a.body) === 'string' && args.request.body.includes('CompletedMultipartUpload')) {
            args.request.body = args.request.body.replace(/CompletedMultipartUpload/g, 'CompleteMultipartUpload');
        }
        return next(args);
    }, {
        step: 'build',
        priority: 'high'
    });
    logger_1.logger.info('Initialized S3 client %s with region %s.', getEndpoint(), OBJECT_STORAGE.REGION, (0, logger_2.lTags)());
    return s3Client;
}
exports.getClient = getClient;
let endpoint;
function getEndpoint() {
    if (endpoint)
        return endpoint;
    const endpointConfig = config_1.CONFIG.OBJECT_STORAGE.ENDPOINT;
    endpoint = endpointConfig.startsWith('http://') || endpointConfig.startsWith('https://')
        ? config_1.CONFIG.OBJECT_STORAGE.ENDPOINT
        : 'https://' + config_1.CONFIG.OBJECT_STORAGE.ENDPOINT;
    return endpoint;
}
