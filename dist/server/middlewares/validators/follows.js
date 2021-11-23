"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFollowsValidator = exports.acceptOrRejectFollowerValidator = exports.getFollowerValidator = exports.removeFollowingValidator = exports.followValidator = void 0;
const tslib_1 = require("tslib");
const express_validator_1 = require("express-validator");
const follows_1 = require("@server/helpers/custom-validators/follows");
const actors_1 = require("@server/lib/activitypub/actors");
const follow_1 = require("@server/lib/activitypub/follow");
const application_1 = require("@server/models/application/application");
const http_error_codes_1 = require("../../../shared/models/http/http-error-codes");
const core_utils_1 = require("../../helpers/core-utils");
const actor_1 = require("../../helpers/custom-validators/activitypub/actor");
const servers_1 = require("../../helpers/custom-validators/servers");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const actor_2 = require("../../models/actor/actor");
const actor_follow_1 = require("../../models/actor/actor-follow");
const shared_1 = require("./shared");
const listFollowsValidator = [
    (0, express_validator_1.query)('state')
        .optional()
        .custom(follows_1.isFollowStateValid).withMessage('Should have a valid follow state'),
    (0, express_validator_1.query)('actorType')
        .optional()
        .custom(actor_1.isActorTypeValid).withMessage('Should have a valid actor type'),
    (req, res, next) => {
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        return next();
    }
];
exports.listFollowsValidator = listFollowsValidator;
const followValidator = [
    (0, express_validator_1.body)('hosts')
        .toArray()
        .custom(servers_1.isEachUniqueHostValid).withMessage('Should have an array of unique hosts'),
    (0, express_validator_1.body)('handles')
        .toArray()
        .custom(follows_1.isEachUniqueHandleValid).withMessage('Should have an array of handles'),
    (req, res, next) => {
        if ((0, core_utils_1.isTestInstance)() === false && constants_1.WEBSERVER.SCHEME === 'http') {
            return res
                .status(http_error_codes_1.HttpStatusCode.INTERNAL_SERVER_ERROR_500)
                .json({
                error: 'Cannot follow on a non HTTPS web server.'
            });
        }
        logger_1.logger.debug('Checking follow parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const body = req.body;
        if (body.hosts.length === 0 && body.handles.length === 0) {
            return res
                .status(http_error_codes_1.HttpStatusCode.BAD_REQUEST_400)
                .json({
                error: 'You must provide at least one handle or one host.'
            });
        }
        return next();
    }
];
exports.followValidator = followValidator;
const removeFollowingValidator = [
    (0, express_validator_1.param)('hostOrHandle')
        .custom(value => (0, servers_1.isHostValid)(value) || (0, follows_1.isRemoteHandleValid)(value))
        .withMessage('Should have a valid host/handle'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking unfollowing parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        const serverActor = yield (0, application_1.getServerActor)();
        const { name, host } = (0, follow_1.getRemoteNameAndHost)(req.params.hostOrHandle);
        const follow = yield actor_follow_1.ActorFollowModel.loadByActorAndTargetNameAndHostForAPI(serverActor.id, name, host);
        if (!follow) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: `Follow ${req.params.hostOrHandle} not found.`
            });
        }
        res.locals.follow = follow;
        return next();
    })
];
exports.removeFollowingValidator = removeFollowingValidator;
const getFollowerValidator = [
    (0, express_validator_1.param)('nameWithHost').custom(actor_1.isValidActorHandle).withMessage('Should have a valid nameWithHost'),
    (req, res, next) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        logger_1.logger.debug('Checking get follower parameters', { parameters: req.params });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        let follow;
        try {
            const actorUrl = yield (0, actors_1.loadActorUrlOrGetFromWebfinger)(req.params.nameWithHost);
            const actor = yield actor_2.ActorModel.loadByUrl(actorUrl);
            const serverActor = yield (0, application_1.getServerActor)();
            follow = yield actor_follow_1.ActorFollowModel.loadByActorAndTarget(actor.id, serverActor.id);
        }
        catch (err) {
            logger_1.logger.warn('Cannot get actor from handle.', { handle: req.params.nameWithHost, err });
        }
        if (!follow) {
            return res.fail({
                status: http_error_codes_1.HttpStatusCode.NOT_FOUND_404,
                message: `Follower ${req.params.nameWithHost} not found.`
            });
        }
        res.locals.follow = follow;
        return next();
    })
];
exports.getFollowerValidator = getFollowerValidator;
const acceptOrRejectFollowerValidator = [
    (req, res, next) => {
        logger_1.logger.debug('Checking accept/reject follower parameters', { parameters: req.params });
        const follow = res.locals.follow;
        if (follow.state !== 'pending') {
            return res.fail({ message: 'Follow is not in pending state.' });
        }
        return next();
    }
];
exports.acceptOrRejectFollowerValidator = acceptOrRejectFollowerValidator;
