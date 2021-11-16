"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInReadCommittedTransaction = exports.deleteAllModels = exports.filterNonExistingModels = exports.afterCommitIfTransaction = exports.updateInstanceWithAnother = exports.transactionRetryer = exports.retryTransactionWrapper = exports.resetSequelizeInstance = void 0;
const tslib_1 = require("tslib");
const retry_1 = tslib_1.__importDefault(require("async/retry"));
const sequelize_1 = require("sequelize");
const database_1 = require("@server/initializers/database");
const logger_1 = require("./logger");
function retryTransactionWrapper(functionToRetry, ...args) {
    return transactionRetryer(callback => {
        functionToRetry.apply(null, args)
            .then((result) => callback(null, result))
            .catch(err => callback(err));
    })
        .catch(err => {
        logger_1.logger.error(`Cannot execute ${functionToRetry.name} with many retries.`, { err });
        throw err;
    });
}
exports.retryTransactionWrapper = retryTransactionWrapper;
function transactionRetryer(func) {
    return new Promise((res, rej) => {
        retry_1.default({
            times: 5,
            errorFilter: err => {
                const willRetry = (err.name === 'SequelizeDatabaseError');
                logger_1.logger.debug('Maybe retrying the transaction function.', { willRetry, err, tags: ['sql', 'retry'] });
                return willRetry;
            }
        }, func, (err, data) => err ? rej(err) : res(data));
    });
}
exports.transactionRetryer = transactionRetryer;
function updateInstanceWithAnother(instanceToUpdate, baseInstance) {
    const obj = baseInstance.toJSON();
    for (const key of Object.keys(obj)) {
        instanceToUpdate[key] = obj[key];
    }
}
exports.updateInstanceWithAnother = updateInstanceWithAnother;
function resetSequelizeInstance(instance, savedFields) {
    Object.keys(savedFields).forEach(key => {
        instance[key] = savedFields[key];
    });
}
exports.resetSequelizeInstance = resetSequelizeInstance;
function filterNonExistingModels(fromDatabase, newModels) {
    return fromDatabase.filter(f => !newModels.find(newModel => newModel.hasSameUniqueKeysThan(f)));
}
exports.filterNonExistingModels = filterNonExistingModels;
function deleteAllModels(models, transaction) {
    return Promise.all(models.map(f => f.destroy({ transaction })));
}
exports.deleteAllModels = deleteAllModels;
function runInReadCommittedTransaction(fn) {
    const options = { isolationLevel: sequelize_1.Transaction.ISOLATION_LEVELS.READ_COMMITTED };
    return database_1.sequelizeTypescript.transaction(options, t => fn(t));
}
exports.runInReadCommittedTransaction = runInReadCommittedTransaction;
function afterCommitIfTransaction(t, fn) {
    if (t)
        return t.afterCommit(() => fn());
    return fn();
}
exports.afterCommitIfTransaction = afterCommitIfTransaction;
