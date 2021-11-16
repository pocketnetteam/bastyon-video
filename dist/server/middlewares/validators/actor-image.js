"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBannerValidator = exports.updateAvatarValidator = void 0;
const express_validator_1 = require("express-validator");
const actor_images_1 = require("@server/helpers/custom-validators/actor-images");
const express_utils_1 = require("../../helpers/express-utils");
const logger_1 = require("../../helpers/logger");
const constants_1 = require("../../initializers/constants");
const shared_1 = require("./shared");
const updateActorImageValidatorFactory = (fieldname) => ([
    express_validator_1.body(fieldname).custom((value, { req }) => actor_images_1.isActorImageFile(req.files, fieldname)).withMessage('This file is not supported or too large. Please, make sure it is of the following type : ' +
        constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.EXTNAME.join(', ')),
    (req, res, next) => {
        logger_1.logger.debug('Checking updateActorImageValidator parameters', { files: req.files });
        if (shared_1.areValidationErrors(req, res))
            return express_utils_1.cleanUpReqFiles(req);
        return next();
    }
]);
const updateAvatarValidator = updateActorImageValidatorFactory('avatarfile');
exports.updateAvatarValidator = updateAvatarValidator;
const updateBannerValidator = updateActorImageValidatorFactory('bannerfile');
exports.updateBannerValidator = updateBannerValidator;
