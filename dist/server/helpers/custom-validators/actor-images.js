"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isActorImageFile = void 0;
const constants_1 = require("../../initializers/constants");
const misc_1 = require("./misc");
const imageMimeTypes = constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.EXTNAME
    .map(v => v.replace('.', ''))
    .join('|');
const imageMimeTypesRegex = `image/(${imageMimeTypes})`;
function isActorImageFile(files, fieldname) {
    return misc_1.isFileValid(files, imageMimeTypesRegex, fieldname, constants_1.CONSTRAINTS_FIELDS.ACTORS.IMAGE.FILE_SIZE.max);
}
exports.isActorImageFile = isActorImageFile;
