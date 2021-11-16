"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerTubeServer = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const core_utils_1 = require("@server/helpers/core-utils");
const core_utils_2 = require("@shared/core-utils");
const bulk_1 = require("../bulk");
const cli_1 = require("../cli");
const custom_pages_1 = require("../custom-pages");
const feeds_1 = require("../feeds");
const logs_1 = require("../logs");
const miscs_1 = require("../miscs");
const moderation_1 = require("../moderation");
const overviews_1 = require("../overviews");
const search_1 = require("../search");
const socket_1 = require("../socket");
const users_1 = require("../users");
const videos_1 = require("../videos");
const comments_command_1 = require("../videos/comments-command");
const config_command_1 = require("./config-command");
const contact_form_command_1 = require("./contact-form-command");
const debug_command_1 = require("./debug-command");
const follows_command_1 = require("./follows-command");
const jobs_command_1 = require("./jobs-command");
const plugins_command_1 = require("./plugins-command");
const redundancy_command_1 = require("./redundancy-command");
const servers_command_1 = require("./servers-command");
const stats_command_1 = require("./stats-command");
const object_storage_command_1 = require("./object-storage-command");
class PeerTubeServer {
    constructor(options) {
        if (options.url) {
            this.setUrl(options.url);
        }
        else {
            this.setServerNumber(options.serverNumber);
        }
        this.store = {
            client: {
                id: null,
                secret: null
            },
            user: {
                username: null,
                password: null
            }
        };
        this.assignCommands();
    }
    setServerNumber(serverNumber) {
        this.serverNumber = serverNumber;
        this.parallel = miscs_1.parallelTests();
        this.internalServerNumber = this.parallel ? this.randomServer() : this.serverNumber;
        this.rtmpPort = this.parallel ? this.randomRTMP() : 1936;
        this.port = 9000 + this.internalServerNumber;
        this.url = `http://localhost:${this.port}`;
        this.host = `localhost:${this.port}`;
        this.hostname = 'localhost';
    }
    setUrl(url) {
        const parsed = new URL(url);
        this.url = url;
        this.host = parsed.host;
        this.hostname = parsed.hostname;
        this.port = parseInt(parsed.port);
    }
    flushAndRun(configOverride, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield servers_command_1.ServersCommand.flushTests(this.internalServerNumber);
            return this.run(configOverride, options);
        });
    }
    run(configOverrideArg, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const serverRunString = {
                'HTTP server listening': false
            };
            const key = 'Database peertube_test' + this.internalServerNumber + ' is ready';
            serverRunString[key] = false;
            const regexps = {
                client_id: 'Client id: (.+)',
                client_secret: 'Client secret: (.+)',
                user_username: 'Username: (.+)',
                user_password: 'User password: (.+)'
            };
            yield this.assignCustomConfigFile();
            const configOverride = this.buildConfigOverride();
            if (configOverrideArg !== undefined) {
                Object.assign(configOverride, configOverrideArg);
            }
            const env = Object.create(process.env);
            env['NODE_ENV'] = 'test';
            env['NODE_APP_INSTANCE'] = this.internalServerNumber.toString();
            env['NODE_CONFIG'] = JSON.stringify(configOverride);
            if (options.env) {
                Object.assign(env, options.env);
            }
            const forkOptions = {
                silent: true,
                env,
                detached: true,
                execArgv: options.nodeArgs || []
            };
            return new Promise((res, rej) => {
                const self = this;
                this.app = child_process_1.fork(path_1.join(core_utils_1.root(), 'dist', 'server.js'), options.peertubeArgs || [], forkOptions);
                const onPeerTubeExit = () => rej(new Error('Process exited'));
                const onParentExit = () => {
                    if (!this.app || !this.app.pid)
                        return;
                    try {
                        process.kill(self.app.pid);
                    }
                    catch (_a) { }
                };
                this.app.on('exit', onPeerTubeExit);
                process.on('exit', onParentExit);
                this.app.stdout.on('data', function onStdout(data) {
                    let dontContinue = false;
                    for (const key of Object.keys(regexps)) {
                        const regexp = regexps[key];
                        const matches = data.toString().match(regexp);
                        if (matches !== null) {
                            if (key === 'client_id')
                                self.store.client.id = matches[1];
                            else if (key === 'client_secret')
                                self.store.client.secret = matches[1];
                            else if (key === 'user_username')
                                self.store.user.username = matches[1];
                            else if (key === 'user_password')
                                self.store.user.password = matches[1];
                        }
                    }
                    for (const key of Object.keys(serverRunString)) {
                        if (data.toString().indexOf(key) !== -1)
                            serverRunString[key] = true;
                        if (serverRunString[key] === false)
                            dontContinue = true;
                    }
                    if (dontContinue === true)
                        return;
                    if (options.hideLogs === false) {
                        console.log(data.toString());
                    }
                    else {
                        process.removeListener('exit', onParentExit);
                        self.app.stdout.removeListener('data', onStdout);
                        self.app.removeListener('exit', onPeerTubeExit);
                    }
                    res();
                });
            });
        });
    }
    kill() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.app)
                return;
            yield this.sql.cleanup();
            process.kill(-this.app.pid);
            this.app = null;
        });
    }
    randomServer() {
        const low = 10;
        const high = 10000;
        return core_utils_2.randomInt(low, high);
    }
    randomRTMP() {
        const low = 1900;
        const high = 2100;
        return core_utils_2.randomInt(low, high);
    }
    assignCustomConfigFile() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.internalServerNumber === this.serverNumber)
                return;
            const basePath = path_1.join(core_utils_1.root(), 'config');
            const tmpConfigFile = path_1.join(basePath, `test-${this.internalServerNumber}.yaml`);
            yield fs_extra_1.copy(path_1.join(basePath, `test-${this.serverNumber}.yaml`), tmpConfigFile);
            this.customConfigFile = tmpConfigFile;
        });
    }
    buildConfigOverride() {
        if (!this.parallel)
            return {};
        return {
            listen: {
                port: this.port
            },
            webserver: {
                port: this.port
            },
            database: {
                suffix: '_test' + this.internalServerNumber
            },
            storage: {
                tmp: `test${this.internalServerNumber}/tmp/`,
                avatars: `test${this.internalServerNumber}/avatars/`,
                videos: `test${this.internalServerNumber}/videos/`,
                streaming_playlists: `test${this.internalServerNumber}/streaming-playlists/`,
                redundancy: `test${this.internalServerNumber}/redundancy/`,
                logs: `test${this.internalServerNumber}/logs/`,
                previews: `test${this.internalServerNumber}/previews/`,
                thumbnails: `test${this.internalServerNumber}/thumbnails/`,
                torrents: `test${this.internalServerNumber}/torrents/`,
                captions: `test${this.internalServerNumber}/captions/`,
                cache: `test${this.internalServerNumber}/cache/`,
                plugins: `test${this.internalServerNumber}/plugins/`
            },
            admin: {
                email: `admin${this.internalServerNumber}@example.com`
            },
            live: {
                rtmp: {
                    port: this.rtmpPort
                }
            }
        };
    }
    assignCommands() {
        this.bulk = new bulk_1.BulkCommand(this);
        this.cli = new cli_1.CLICommand(this);
        this.customPage = new custom_pages_1.CustomPagesCommand(this);
        this.feed = new feeds_1.FeedCommand(this);
        this.logs = new logs_1.LogsCommand(this);
        this.abuses = new moderation_1.AbusesCommand(this);
        this.overviews = new overviews_1.OverviewsCommand(this);
        this.search = new search_1.SearchCommand(this);
        this.contactForm = new contact_form_command_1.ContactFormCommand(this);
        this.debug = new debug_command_1.DebugCommand(this);
        this.follows = new follows_command_1.FollowsCommand(this);
        this.jobs = new jobs_command_1.JobsCommand(this);
        this.plugins = new plugins_command_1.PluginsCommand(this);
        this.redundancy = new redundancy_command_1.RedundancyCommand(this);
        this.stats = new stats_command_1.StatsCommand(this);
        this.config = new config_command_1.ConfigCommand(this);
        this.socketIO = new socket_1.SocketIOCommand(this);
        this.accounts = new users_1.AccountsCommand(this);
        this.blocklist = new users_1.BlocklistCommand(this);
        this.subscriptions = new users_1.SubscriptionsCommand(this);
        this.live = new videos_1.LiveCommand(this);
        this.services = new videos_1.ServicesCommand(this);
        this.blacklist = new videos_1.BlacklistCommand(this);
        this.captions = new videos_1.CaptionsCommand(this);
        this.changeOwnership = new videos_1.ChangeOwnershipCommand(this);
        this.playlists = new videos_1.PlaylistsCommand(this);
        this.history = new videos_1.HistoryCommand(this);
        this.imports = new videos_1.ImportsCommand(this);
        this.streamingPlaylists = new videos_1.StreamingPlaylistsCommand(this);
        this.channels = new videos_1.ChannelsCommand(this);
        this.comments = new comments_command_1.CommentsCommand(this);
        this.sql = new miscs_1.SQLCommand(this);
        this.notifications = new users_1.NotificationsCommand(this);
        this.servers = new servers_command_1.ServersCommand(this);
        this.login = new users_1.LoginCommand(this);
        this.users = new users_1.UsersCommand(this);
        this.videos = new videos_1.VideosCommand(this);
        this.objectStorage = new object_storage_command_1.ObjectStorageCommand(this);
    }
}
exports.PeerTubeServer = PeerTubeServer;
