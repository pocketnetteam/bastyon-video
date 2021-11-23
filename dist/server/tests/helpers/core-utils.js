"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai = (0, tslib_1.__importStar)(require("chai"));
const lodash_1 = require("lodash");
const validator_1 = (0, tslib_1.__importDefault)(require("validator"));
const core_utils_1 = require("@shared/core-utils");
const core_utils_2 = require("../../helpers/core-utils");
const expect = chai.expect;
describe('Parse Bytes', function () {
    it('Should pass when given valid value', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            expect((0, core_utils_2.parseBytes)(1024)).to.be.eq(1024);
            expect((0, core_utils_2.parseBytes)(1048576)).to.be.eq(1048576);
            expect((0, core_utils_2.parseBytes)('1024')).to.be.eq(1024);
            expect((0, core_utils_2.parseBytes)('1048576')).to.be.eq(1048576);
            expect((0, core_utils_2.parseBytes)('1B')).to.be.eq(1024);
            expect((0, core_utils_2.parseBytes)('1MB')).to.be.eq(1048576);
            expect((0, core_utils_2.parseBytes)('1GB')).to.be.eq(1073741824);
            expect((0, core_utils_2.parseBytes)('1TB')).to.be.eq(1099511627776);
            expect((0, core_utils_2.parseBytes)('5GB')).to.be.eq(5368709120);
            expect((0, core_utils_2.parseBytes)('5TB')).to.be.eq(5497558138880);
            expect((0, core_utils_2.parseBytes)('1024B')).to.be.eq(1048576);
            expect((0, core_utils_2.parseBytes)('1024MB')).to.be.eq(1073741824);
            expect((0, core_utils_2.parseBytes)('1024GB')).to.be.eq(1099511627776);
            expect((0, core_utils_2.parseBytes)('1024TB')).to.be.eq(1125899906842624);
            expect((0, core_utils_2.parseBytes)('1 GB')).to.be.eq(1073741824);
            expect((0, core_utils_2.parseBytes)('1\tGB')).to.be.eq(1073741824);
            expect((0, core_utils_2.parseBytes)('1TB 1024MB')).to.be.eq(1100585369600);
            expect((0, core_utils_2.parseBytes)('4GB 1024MB')).to.be.eq(5368709120);
            expect((0, core_utils_2.parseBytes)('4TB 1024GB')).to.be.eq(5497558138880);
            expect((0, core_utils_2.parseBytes)('4TB 1024GB 0MB')).to.be.eq(5497558138880);
            expect((0, core_utils_2.parseBytes)('1024TB 1024GB 1024MB')).to.be.eq(1127000492212224);
        });
    });
    it('Should be invalid when given invalid value', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            expect((0, core_utils_2.parseBytes)('6GB 1GB')).to.be.eq(6);
        });
    });
});
describe('Object', function () {
    it('Should convert an object', function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            function keyConverter(k) {
                return (0, lodash_1.snakeCase)(k);
            }
            function valueConverter(v) {
                if (validator_1.default.isNumeric(v + ''))
                    return parseInt('' + v, 10);
                return v;
            }
            const obj = {
                mySuperKey: 'hello',
                mySuper2Key: '45',
                mySuper3Key: {
                    mySuperSubKey: '15',
                    mySuperSub2Key: 'hello',
                    mySuperSub3Key: ['1', 'hello', 2],
                    mySuperSub4Key: 4
                },
                mySuper4Key: 45,
                toto: {
                    super_key: '15',
                    superKey2: 'hello'
                },
                super_key: {
                    superKey4: 15
                }
            };
            const res = (0, core_utils_2.objectConverter)(obj, keyConverter, valueConverter);
            expect(res.my_super_key).to.equal('hello');
            expect(res.my_super_2_key).to.equal(45);
            expect(res.my_super_3_key.my_super_sub_key).to.equal(15);
            expect(res.my_super_3_key.my_super_sub_2_key).to.equal('hello');
            expect(res.my_super_3_key.my_super_sub_3_key).to.deep.equal([1, 'hello', 2]);
            expect(res.my_super_3_key.my_super_sub_4_key).to.equal(4);
            expect(res.toto.super_key).to.equal(15);
            expect(res.toto.super_key_2).to.equal('hello');
            expect(res.super_key.super_key_4).to.equal(15);
            expect(res.mySuperKey).to.be.undefined;
            expect(obj['my_super_key']).to.be.undefined;
        });
    });
});
describe('Bitrate', function () {
    it('Should get appropriate max bitrate', function () {
        const tests = [
            { resolution: 240, ratio: 16 / 9, fps: 24, min: 600, max: 800 },
            { resolution: 360, ratio: 16 / 9, fps: 24, min: 1200, max: 1600 },
            { resolution: 480, ratio: 16 / 9, fps: 24, min: 2000, max: 2300 },
            { resolution: 720, ratio: 16 / 9, fps: 24, min: 4000, max: 4400 },
            { resolution: 1080, ratio: 16 / 9, fps: 24, min: 8000, max: 10000 },
            { resolution: 2160, ratio: 16 / 9, fps: 24, min: 25000, max: 30000 }
        ];
        for (const test of tests) {
            expect((0, core_utils_1.getMaxBitrate)(test)).to.be.above(test.min * 1000).and.below(test.max * 1000);
        }
    });
    it('Should get appropriate average bitrate', function () {
        const tests = [
            { resolution: 240, ratio: 16 / 9, fps: 24, min: 350, max: 450 },
            { resolution: 360, ratio: 16 / 9, fps: 24, min: 700, max: 900 },
            { resolution: 480, ratio: 16 / 9, fps: 24, min: 1100, max: 1300 },
            { resolution: 720, ratio: 16 / 9, fps: 24, min: 2300, max: 2500 },
            { resolution: 1080, ratio: 16 / 9, fps: 24, min: 4700, max: 5000 },
            { resolution: 2160, ratio: 16 / 9, fps: 24, min: 15000, max: 17000 }
        ];
        for (const test of tests) {
            expect((0, core_utils_1.getAverageBitrate)(test)).to.be.above(test.min * 1000).and.below(test.max * 1000);
        }
    });
});
