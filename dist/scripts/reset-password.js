"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const register_ts_paths_1 = require("../server/helpers/register-ts-paths");
(0, register_ts_paths_1.registerTSPaths)();
const commander_1 = require("commander");
const database_1 = require("../server/initializers/database");
const user_1 = require("../server/models/user/user");
const users_1 = require("../server/helpers/custom-validators/users");
commander_1.program
    .option('-u, --user [user]', 'User')
    .parse(process.argv);
const options = commander_1.program.opts();
if (options.user === undefined) {
    console.error('All parameters are mandatory.');
    process.exit(-1);
}
(0, database_1.initDatabaseModels)(true)
    .then(() => {
    return user_1.UserModel.loadByUsername(options.user);
})
    .then(user => {
    if (!user) {
        console.error('Unknown user.');
        process.exit(-1);
    }
    const readline = require('readline');
    const Writable = require('stream').Writable;
    const mutableStdout = new Writable({
        write: function (_chunk, _encoding, callback) {
            callback();
        }
    });
    const rl = readline.createInterface({
        input: process.stdin,
        output: mutableStdout,
        terminal: true
    });
    console.log('New password?');
    rl.on('line', function (password) {
        if (!(0, users_1.isUserPasswordValid)(password)) {
            console.error('New password is invalid.');
            process.exit(-1);
        }
        user.password = password;
        user.save()
            .then(() => console.log('User password updated.'))
            .catch(err => console.error(err))
            .finally(() => process.exit(0));
    });
})
    .catch(err => {
    console.error(err);
    process.exit(-1);
});
