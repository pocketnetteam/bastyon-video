"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAvailable = exports.removePrefix = exports.removeObject = exports.storeObject = exports.buildKey = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const path_1 = require("path");
const client_s3_1 = require("@aws-sdk/client-s3");
const core_utils_1 = require("@server/helpers/core-utils");
const misc_1 = require("@server/helpers/custom-validators/misc");
const logger_1 = require("@server/helpers/logger");
const config_1 = require("@server/initializers/config");
const urls_1 = require("../urls");
const client_1 = require("./client");
const logger_2 = require("./logger");
function storeObject(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { inputPath, objectStorageKey, bucketInfo } = options;
        logger_1.logger.debug('Uploading file %s to %s%s in bucket %s', inputPath, bucketInfo.PREFIX, objectStorageKey, bucketInfo.BUCKET_NAME, logger_2.lTags());
        const stats = yield fs_extra_1.stat(inputPath);
        if (stats.size > config_1.CONFIG.OBJECT_STORAGE.MAX_UPLOAD_PART) {
            return multiPartUpload({ inputPath, objectStorageKey, bucketInfo });
        }
        const fileStream = fs_extra_1.createReadStream(inputPath);
        return objectStoragePut({ objectStorageKey, content: fileStream, bucketInfo });
    });
}
exports.storeObject = storeObject;
function removeObject(filename, bucketInfo) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketInfo.BUCKET_NAME,
            Key: buildKey(filename, bucketInfo)
        });
        return client_1.getClient().send(command);
    });
}
exports.removeObject = removeObject;
function removePrefix(prefix, bucketInfo) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const s3Client = client_1.getClient();
        const commandPrefix = bucketInfo.PREFIX + prefix;
        const listCommand = new client_s3_1.ListObjectsV2Command({
            Bucket: bucketInfo.BUCKET_NAME,
            Prefix: commandPrefix
        });
        const listedObjects = yield s3Client.send(listCommand);
        if (misc_1.isArray(listedObjects.Contents) !== true) {
            const message = `Cannot remove ${commandPrefix} prefix in bucket ${bucketInfo.BUCKET_NAME}: no files listed.`;
            logger_1.logger.error(message, Object.assign({ response: listedObjects }, logger_2.lTags()));
            throw new Error(message);
        }
        for (const object of listedObjects.Contents) {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucketInfo.BUCKET_NAME,
                Key: object.Key
            });
            yield s3Client.send(command);
        }
        if (listedObjects.IsTruncated)
            yield removePrefix(prefix, bucketInfo);
    });
}
exports.removePrefix = removePrefix;
function makeAvailable(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { key, destination, bucketInfo } = options;
        yield fs_extra_1.ensureDir(path_1.dirname(options.destination));
        const command = new client_s3_1.GetObjectCommand({
            Bucket: bucketInfo.BUCKET_NAME,
            Key: buildKey(key, bucketInfo)
        });
        const response = yield client_1.getClient().send(command);
        const file = fs_extra_1.createWriteStream(destination);
        yield core_utils_1.pipelinePromise(response.Body, file);
        file.close();
    });
}
exports.makeAvailable = makeAvailable;
function buildKey(key, bucketInfo) {
    return bucketInfo.PREFIX + key;
}
exports.buildKey = buildKey;
function objectStoragePut(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { objectStorageKey, content, bucketInfo } = options;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketInfo.BUCKET_NAME,
            Key: buildKey(objectStorageKey, bucketInfo),
            Body: content,
            ACL: 'public-read'
        });
        yield client_1.getClient().send(command);
        return urls_1.getPrivateUrl(bucketInfo, objectStorageKey);
    });
}
function multiPartUpload(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { objectStorageKey, inputPath, bucketInfo } = options;
        const key = buildKey(objectStorageKey, bucketInfo);
        const s3Client = client_1.getClient();
        const statResult = yield fs_extra_1.stat(inputPath);
        const createMultipartCommand = new client_s3_1.CreateMultipartUploadCommand({
            Bucket: bucketInfo.BUCKET_NAME,
            Key: key,
            ACL: 'public-read'
        });
        const createResponse = yield s3Client.send(createMultipartCommand);
        const fd = yield fs_extra_1.open(inputPath, 'r');
        let partNumber = 1;
        const parts = [];
        const partSize = config_1.CONFIG.OBJECT_STORAGE.MAX_UPLOAD_PART;
        for (let start = 0; start < statResult.size; start += partSize) {
            logger_1.logger.debug('Uploading part %d of file to %s%s in bucket %s', partNumber, bucketInfo.PREFIX, objectStorageKey, bucketInfo.BUCKET_NAME, logger_2.lTags());
            const stream = fs_extra_1.createReadStream(inputPath, { fd, autoClose: false, start, end: (start + partSize) - 1 });
            stream.byteLength = lodash_1.min([statResult.size - start, partSize]);
            const uploadPartCommand = new client_s3_1.UploadPartCommand({
                Bucket: bucketInfo.BUCKET_NAME,
                Key: key,
                UploadId: createResponse.UploadId,
                PartNumber: partNumber,
                Body: stream
            });
            const uploadResponse = yield s3Client.send(uploadPartCommand);
            parts.push({ ETag: uploadResponse.ETag, PartNumber: partNumber });
            partNumber += 1;
        }
        yield fs_extra_1.close(fd);
        const completeUploadCommand = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: bucketInfo.BUCKET_NAME,
            Key: key,
            UploadId: createResponse.UploadId,
            MultipartUpload: { Parts: parts }
        });
        yield s3Client.send(completeUploadCommand);
        logger_1.logger.debug('Completed %s%s in bucket %s in %d parts', bucketInfo.PREFIX, objectStorageKey, bucketInfo.BUCKET_NAME, partNumber - 1, logger_2.lTags());
        return urls_1.getPrivateUrl(bucketInfo, objectStorageKey);
    });
}
