"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customConfigUpdateValidator = void 0;
const express_validator_1 = require("express-validator");
const misc_1 = require("@server/helpers/custom-validators/misc");
const config_1 = require("@server/initializers/config");
const plugins_1 = require("../../helpers/custom-validators/plugins");
const users_1 = require("../../helpers/custom-validators/users");
const logger_1 = require("../../helpers/logger");
const theme_utils_1 = require("../../lib/plugins/theme-utils");
const shared_1 = require("./shared");
const customConfigUpdateValidator = [
    (0, express_validator_1.body)('instance.name').exists().withMessage('Should have a valid instance name'),
    (0, express_validator_1.body)('instance.shortDescription').exists().withMessage('Should have a valid instance short description'),
    (0, express_validator_1.body)('instance.description').exists().withMessage('Should have a valid instance description'),
    (0, express_validator_1.body)('instance.terms').exists().withMessage('Should have a valid instance terms'),
    (0, express_validator_1.body)('instance.defaultNSFWPolicy').custom(users_1.isUserNSFWPolicyValid).withMessage('Should have a valid NSFW policy'),
    (0, express_validator_1.body)('instance.defaultClientRoute').exists().withMessage('Should have a valid instance default client route'),
    (0, express_validator_1.body)('instance.customizations.css').exists().withMessage('Should have a valid instance CSS customization'),
    (0, express_validator_1.body)('instance.customizations.javascript').exists().withMessage('Should have a valid instance JavaScript customization'),
    (0, express_validator_1.body)('services.twitter.username').exists().withMessage('Should have a valid twitter username'),
    (0, express_validator_1.body)('services.twitter.whitelisted').isBoolean().withMessage('Should have a valid twitter whitelisted boolean'),
    (0, express_validator_1.body)('cache.previews.size').isInt().withMessage('Should have a valid previews cache size'),
    (0, express_validator_1.body)('cache.captions.size').isInt().withMessage('Should have a valid captions cache size'),
    (0, express_validator_1.body)('cache.torrents.size').isInt().withMessage('Should have a valid torrents cache size'),
    (0, express_validator_1.body)('signup.enabled').isBoolean().withMessage('Should have a valid signup enabled boolean'),
    (0, express_validator_1.body)('signup.limit').isInt().withMessage('Should have a valid signup limit'),
    (0, express_validator_1.body)('signup.requiresEmailVerification').isBoolean().withMessage('Should have a valid requiresEmailVerification boolean'),
    (0, express_validator_1.body)('signup.minimumAge').isInt().withMessage("Should have a valid minimum age required"),
    (0, express_validator_1.body)('admin.email').isEmail().withMessage('Should have a valid administrator email'),
    (0, express_validator_1.body)('contactForm.enabled').isBoolean().withMessage('Should have a valid contact form enabled boolean'),
    (0, express_validator_1.body)('user.videoQuota').custom(users_1.isUserVideoQuotaValid).withMessage('Should have a valid video quota'),
    (0, express_validator_1.body)('user.videoQuotaDaily').custom(users_1.isUserVideoQuotaDailyValid).withMessage('Should have a valid daily video quota'),
    (0, express_validator_1.body)('transcoding.enabled').isBoolean().withMessage('Should have a valid transcoding enabled boolean'),
    (0, express_validator_1.body)('transcoding.allowAdditionalExtensions').isBoolean().withMessage('Should have a valid additional extensions boolean'),
    (0, express_validator_1.body)('transcoding.threads').isInt().withMessage('Should have a valid transcoding threads number'),
    (0, express_validator_1.body)('transcoding.concurrency').isInt({ min: 1 }).withMessage('Should have a valid transcoding concurrency number'),
    (0, express_validator_1.body)('transcoding.resolutions.0p').isBoolean().withMessage('Should have a valid transcoding 0p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.240p').isBoolean().withMessage('Should have a valid transcoding 240p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.360p').isBoolean().withMessage('Should have a valid transcoding 360p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.480p').isBoolean().withMessage('Should have a valid transcoding 480p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.720p').isBoolean().withMessage('Should have a valid transcoding 720p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.1080p').isBoolean().withMessage('Should have a valid transcoding 1080p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.1440p').isBoolean().withMessage('Should have a valid transcoding 1440p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.resolutions.2160p').isBoolean().withMessage('Should have a valid transcoding 2160p resolution enabled boolean'),
    (0, express_validator_1.body)('transcoding.webtorrent.enabled').isBoolean().withMessage('Should have a valid webtorrent transcoding enabled boolean'),
    (0, express_validator_1.body)('transcoding.hls.enabled').isBoolean().withMessage('Should have a valid hls transcoding enabled boolean'),
    (0, express_validator_1.body)('import.videos.concurrency').isInt({ min: 0 }).withMessage('Should have a valid import concurrency number'),
    (0, express_validator_1.body)('import.videos.http.enabled').isBoolean().withMessage('Should have a valid import video http enabled boolean'),
    (0, express_validator_1.body)('import.videos.torrent.enabled').isBoolean().withMessage('Should have a valid import video torrent enabled boolean'),
    (0, express_validator_1.body)('trending.videos.algorithms.default').exists().withMessage('Should have a valid default trending algorithm'),
    (0, express_validator_1.body)('trending.videos.algorithms.enabled').exists().withMessage('Should have a valid array of enabled trending algorithms'),
    (0, express_validator_1.body)('followers.instance.enabled').isBoolean().withMessage('Should have a valid followers of instance boolean'),
    (0, express_validator_1.body)('followers.instance.manualApproval').isBoolean().withMessage('Should have a valid manual approval boolean'),
    (0, express_validator_1.body)('theme.default').custom(v => (0, plugins_1.isThemeNameValid)(v) && (0, theme_utils_1.isThemeRegistered)(v)).withMessage('Should have a valid theme'),
    (0, express_validator_1.body)('broadcastMessage.enabled').isBoolean().withMessage('Should have a valid broadcast message enabled boolean'),
    (0, express_validator_1.body)('broadcastMessage.message').exists().withMessage('Should have a valid broadcast message'),
    (0, express_validator_1.body)('broadcastMessage.level').exists().withMessage('Should have a valid broadcast level'),
    (0, express_validator_1.body)('broadcastMessage.dismissable').isBoolean().withMessage('Should have a valid broadcast dismissable boolean'),
    (0, express_validator_1.body)('live.enabled').isBoolean().withMessage('Should have a valid live enabled boolean'),
    (0, express_validator_1.body)('live.allowReplay').isBoolean().withMessage('Should have a valid live allow replay boolean'),
    (0, express_validator_1.body)('live.maxDuration').isInt().withMessage('Should have a valid live max duration'),
    (0, express_validator_1.body)('live.maxInstanceLives').custom(misc_1.isIntOrNull).withMessage('Should have a valid max instance lives'),
    (0, express_validator_1.body)('live.maxUserLives').custom(misc_1.isIntOrNull).withMessage('Should have a valid max user lives'),
    (0, express_validator_1.body)('live.transcoding.enabled').isBoolean().withMessage('Should have a valid live transcoding enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.threads').isInt().withMessage('Should have a valid live transcoding threads'),
    (0, express_validator_1.body)('live.transcoding.resolutions.240p').isBoolean().withMessage('Should have a valid transcoding 240p resolution enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.resolutions.360p').isBoolean().withMessage('Should have a valid transcoding 360p resolution enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.resolutions.480p').isBoolean().withMessage('Should have a valid transcoding 480p resolution enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.resolutions.720p').isBoolean().withMessage('Should have a valid transcoding 720p resolution enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.resolutions.1080p').isBoolean().withMessage('Should have a valid transcoding 1080p resolution enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.resolutions.1440p').isBoolean().withMessage('Should have a valid transcoding 1440p resolution enabled boolean'),
    (0, express_validator_1.body)('live.transcoding.resolutions.2160p').isBoolean().withMessage('Should have a valid transcoding 2160p resolution enabled boolean'),
    (0, express_validator_1.body)('search.remoteUri.users').isBoolean().withMessage('Should have a remote URI search for users boolean'),
    (0, express_validator_1.body)('search.remoteUri.anonymous').isBoolean().withMessage('Should have a valid remote URI search for anonymous boolean'),
    (0, express_validator_1.body)('search.searchIndex.enabled').isBoolean().withMessage('Should have a valid search index enabled boolean'),
    (0, express_validator_1.body)('search.searchIndex.url').exists().withMessage('Should have a valid search index URL'),
    (0, express_validator_1.body)('search.searchIndex.disableLocalSearch').isBoolean().withMessage('Should have a valid search index disable local search boolean'),
    (0, express_validator_1.body)('search.searchIndex.isDefaultSearch').isBoolean().withMessage('Should have a valid search index default enabled boolean'),
    (req, res, next) => {
        logger_1.logger.debug('Checking customConfigUpdateValidator parameters', { parameters: req.body });
        if ((0, shared_1.areValidationErrors)(req, res))
            return;
        if (!checkInvalidConfigIfEmailDisabled(req.body, res))
            return;
        if (!checkInvalidTranscodingConfig(req.body, res))
            return;
        if (!checkInvalidLiveConfig(req.body, res))
            return;
        return next();
    }
];
exports.customConfigUpdateValidator = customConfigUpdateValidator;
function checkInvalidConfigIfEmailDisabled(customConfig, res) {
    if ((0, config_1.isEmailEnabled)())
        return true;
    if (customConfig.signup.requiresEmailVerification === true) {
        res.fail({ message: 'Emailer is disabled but you require signup email verification.' });
        return false;
    }
    return true;
}
function checkInvalidTranscodingConfig(customConfig, res) {
    if (customConfig.transcoding.enabled === false)
        return true;
    if (customConfig.transcoding.webtorrent.enabled === false && customConfig.transcoding.hls.enabled === false) {
        res.fail({ message: 'You need to enable at least webtorrent transcoding or hls transcoding' });
        return false;
    }
    return true;
}
function checkInvalidLiveConfig(customConfig, res) {
    if (customConfig.live.enabled === false)
        return true;
    if (customConfig.live.allowReplay === true && customConfig.transcoding.enabled === false) {
        res.fail({ message: 'You cannot allow live replay if transcoding is not enabled' });
        return false;
    }
    return true;
}
