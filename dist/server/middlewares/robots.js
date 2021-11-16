"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableRobots = void 0;
function disableRobots(req, res, next) {
    res.setHeader('X-Robots-Tag', 'noindex');
    return next();
}
exports.disableRobots = disableRobots;
