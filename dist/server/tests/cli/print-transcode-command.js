"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const ffprobe_utils_1 = require("@server/helpers/ffprobe-utils");
const core_utils_1 = require("@shared/core-utils");
const extra_utils_1 = require("@shared/extra-utils");
const expect = chai.expect;
describe('Test print transcode jobs', function () {
    it('Should print the correct command for each resolution', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const fixturePath = (0, extra_utils_1.buildAbsoluteFixturePath)('video_short.webm');
            const fps = yield (0, ffprobe_utils_1.getVideoFileFPS)(fixturePath);
            const bitrate = yield (0, ffprobe_utils_1.getVideoFileBitrate)(fixturePath);
            for (const resolution of [
                720,
                1080
            ]) {
                const command = yield extra_utils_1.CLICommand.exec(`npm run print-transcode-command -- ${fixturePath} -r ${resolution}`);
                const targetBitrate = Math.min((0, core_utils_1.getMaxBitrate)({ resolution, fps, ratio: 16 / 9 }), bitrate + (bitrate * 0.3));
                expect(command).to.includes(`-vf scale=w=-2:h=${resolution}`);
                expect(command).to.includes(`-y -acodec aac -vcodec libx264`);
                expect(command).to.includes('-f mp4');
                expect(command).to.includes('-movflags faststart');
                expect(command).to.includes('-b:a 256k');
                expect(command).to.includes('-r 25');
                expect(command).to.includes('-level:v 3.1');
                expect(command).to.includes('-g:v 50');
                expect(command).to.includes(`-maxrate ${targetBitrate}`);
                expect(command).to.includes(`-bufsize ${targetBitrate * 2}`);
            }
        });
    });
});
