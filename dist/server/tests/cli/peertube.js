"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const extra_utils_1 = require("../../../shared/extra-utils");
describe('Test CLI wrapper', function () {
    let server;
    let userAccessToken;
    let cliCommand;
    const cmd = 'node ./dist/server/tools/peertube.js';
    before(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(30000);
            server = yield extra_utils_1.createSingleServer(1);
            yield extra_utils_1.setAccessTokensToServers([server]);
            yield server.users.create({ username: 'user_1', password: 'super_password' });
            userAccessToken = yield server.login.getAccessToken({ username: 'user_1', password: 'super_password' });
            {
                const attributes = { name: 'user_channel', displayName: 'User channel', support: 'super support text' };
                yield server.channels.create({ token: userAccessToken, attributes });
            }
            cliCommand = server.cli;
        });
    });
    describe('Authentication and instance selection', function () {
        it('Should get an access token', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const stdout = yield cliCommand.execWithEnv(`${cmd} token --url ${server.url} --username user_1 --password super_password`);
                const token = stdout.trim();
                const body = yield server.users.getMyInfo({ token });
                chai_1.expect(body.username).to.equal('user_1');
            });
        });
        it('Should display no selected instance', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const stdout = yield cliCommand.execWithEnv(`${cmd} --help`);
                chai_1.expect(stdout).to.contain('no instance selected');
            });
        });
        it('Should add a user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield cliCommand.execWithEnv(`${cmd} auth add -u ${server.url} -U user_1 -p super_password`);
            });
        });
        it('Should not fail to add a user if there is a slash at the end of the instance URL', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                let fullServerURL = server.url + '/';
                yield cliCommand.execWithEnv(`${cmd} auth add -u ${fullServerURL} -U user_1 -p super_password`);
                fullServerURL = server.url + '/asdfasdf';
                yield cliCommand.execWithEnv(`${cmd} auth add -u ${fullServerURL} -U user_1 -p super_password`);
            });
        });
        it('Should default to this user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const stdout = yield cliCommand.execWithEnv(`${cmd} --help`);
                chai_1.expect(stdout).to.contain(`instance ${server.url} selected`);
            });
        });
        it('Should remember the user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const stdout = yield cliCommand.execWithEnv(`${cmd} auth list`);
                chai_1.expect(stdout).to.contain(server.url);
            });
        });
    });
    describe('Video upload/import', function () {
        it('Should upload a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const fixture = extra_utils_1.buildAbsoluteFixturePath('60fps_720p_small.mp4');
                const params = `-f ${fixture} --video-name 'test upload' --channel-name user_channel --support 'support_text'`;
                yield cliCommand.execWithEnv(`${cmd} upload ${params}`);
            });
        });
        it('Should have the video uploaded', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { total, data } = yield server.videos.list();
                chai_1.expect(total).to.equal(1);
                const video = yield server.videos.get({ id: data[0].uuid });
                chai_1.expect(video.name).to.equal('test upload');
                chai_1.expect(video.support).to.equal('support_text');
                chai_1.expect(video.channel.name).to.equal('user_channel');
            });
        });
        it('Should import a video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (extra_utils_1.areHttpImportTestsDisabled())
                    return;
                this.timeout(60000);
                const params = `--target-url ${extra_utils_1.FIXTURE_URLS.youtube} --channel-name user_channel`;
                yield cliCommand.execWithEnv(`${cmd} import ${params}`);
            });
        });
        it('Should have imported the video', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (extra_utils_1.areHttpImportTestsDisabled())
                    return;
                this.timeout(60000);
                yield extra_utils_1.waitJobs([server]);
                const { total, data } = yield server.videos.list();
                chai_1.expect(total).to.equal(2);
                const video = data.find(v => v.name === 'small video - youtube');
                chai_1.expect(video).to.not.be.undefined;
                const videoDetails = yield server.videos.get({ id: video.id });
                chai_1.expect(videoDetails.channel.name).to.equal('user_channel');
                chai_1.expect(videoDetails.support).to.equal('super support text');
                chai_1.expect(videoDetails.nsfw).to.be.false;
                yield server.videos.remove({ token: userAccessToken, id: video.id });
            });
        });
        it('Should import and override some imported attributes', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (extra_utils_1.areHttpImportTestsDisabled())
                    return;
                this.timeout(60000);
                const params = `--target-url ${extra_utils_1.FIXTURE_URLS.youtube} ` +
                    `--channel-name user_channel --video-name toto --nsfw --support support`;
                yield cliCommand.execWithEnv(`${cmd} import ${params}`);
                yield extra_utils_1.waitJobs([server]);
                {
                    const { total, data } = yield server.videos.list();
                    chai_1.expect(total).to.equal(2);
                    const video = data.find(v => v.name === 'toto');
                    chai_1.expect(video).to.not.be.undefined;
                    const videoDetails = yield server.videos.get({ id: video.id });
                    chai_1.expect(videoDetails.channel.name).to.equal('user_channel');
                    chai_1.expect(videoDetails.support).to.equal('support');
                    chai_1.expect(videoDetails.nsfw).to.be.true;
                    chai_1.expect(videoDetails.commentsEnabled).to.be.true;
                }
            });
        });
    });
    describe('Admin auth', function () {
        it('Should remove the auth user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield cliCommand.execWithEnv(`${cmd} auth del ${server.url}`);
                const stdout = yield cliCommand.execWithEnv(`${cmd} --help`);
                chai_1.expect(stdout).to.contain('no instance selected');
            });
        });
        it('Should add the admin user', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield cliCommand.execWithEnv(`${cmd} auth add -u ${server.url} -U root -p test${server.internalServerNumber}`);
            });
        });
    });
    describe('Manage plugins', function () {
        it('Should install a plugin', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                yield cliCommand.execWithEnv(`${cmd} plugins install --npm-name peertube-plugin-hello-world`);
            });
        });
        it('Should have registered settings', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield extra_utils_1.testHelloWorldRegisteredSettings(server);
            });
        });
        it('Should list installed plugins', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const res = yield cliCommand.execWithEnv(`${cmd} plugins list`);
                chai_1.expect(res).to.contain('peertube-plugin-hello-world');
            });
        });
        it('Should uninstall the plugin', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const res = yield cliCommand.execWithEnv(`${cmd} plugins uninstall --npm-name peertube-plugin-hello-world`);
                chai_1.expect(res).to.not.contain('peertube-plugin-hello-world');
            });
        });
    });
    describe('Manage video redundancies', function () {
        let anotherServer;
        let video1Server2;
        let servers;
        before(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(120000);
                anotherServer = yield extra_utils_1.createSingleServer(2);
                yield extra_utils_1.setAccessTokensToServers([anotherServer]);
                yield extra_utils_1.doubleFollow(server, anotherServer);
                servers = [server, anotherServer];
                yield extra_utils_1.waitJobs(servers);
                const { uuid } = yield anotherServer.videos.quickUpload({ name: 'super video' });
                yield extra_utils_1.waitJobs(servers);
                video1Server2 = yield server.videos.getId({ uuid });
            });
        });
        it('Should add a redundancy', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const params = `add --video ${video1Server2}`;
                yield cliCommand.execWithEnv(`${cmd} redundancy ${params}`);
                yield extra_utils_1.waitJobs(servers);
            });
        });
        it('Should list redundancies', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                {
                    const params = 'list-my-redundancies';
                    const stdout = yield cliCommand.execWithEnv(`${cmd} redundancy ${params}`);
                    chai_1.expect(stdout).to.contain('super video');
                    chai_1.expect(stdout).to.contain(`localhost:${server.port}`);
                }
            });
        });
        it('Should remove a redundancy', function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(60000);
                const params = `remove --video ${video1Server2}`;
                yield cliCommand.execWithEnv(`${cmd} redundancy ${params}`);
                yield extra_utils_1.waitJobs(servers);
                {
                    const params = 'list-my-redundancies';
                    const stdout = yield cliCommand.execWithEnv(`${cmd} redundancy ${params}`);
                    chai_1.expect(stdout).to.not.contain('super video');
                }
            });
        });
        after(function () {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield extra_utils_1.cleanupTests([anotherServer]);
            });
        });
    });
    after(function () {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.timeout(10000);
            yield extra_utils_1.cleanupTests([server]);
        });
    });
});
