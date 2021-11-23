"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLICommand = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const shared_1 = require("../shared");
class CLICommand extends shared_1.AbstractCommand {
    static exec(command) {
        return new Promise((res, rej) => {
            (0, child_process_1.exec)(command, (err, stdout, _stderr) => {
                if (err)
                    return rej(err);
                return res(stdout);
            });
        });
    }
    getEnv() {
        return `NODE_ENV=test NODE_APP_INSTANCE=${this.server.internalServerNumber}`;
    }
    execWithEnv(command) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            return CLICommand.exec(`${this.getEnv()} ${command}`);
        });
    }
}
exports.CLICommand = CLICommand;
