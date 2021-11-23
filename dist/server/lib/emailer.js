"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emailer = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const lodash_1 = require("lodash");
const nodemailer_1 = require("nodemailer");
const path_1 = require("path");
const core_utils_1 = require("../helpers/core-utils");
const logger_1 = require("../helpers/logger");
const config_1 = require("../initializers/config");
const constants_1 = require("../initializers/constants");
const job_queue_1 = require("./job-queue");
const Email = require('email-templates');
class Emailer {
    constructor() {
        this.initialized = false;
    }
    init() {
        if (this.initialized === true)
            return;
        this.initialized = true;
        if (!(0, config_1.isEmailEnabled)()) {
            if (!(0, core_utils_1.isTestInstance)()) {
                logger_1.logger.error('Cannot use SMTP server because of lack of configuration. PeerTube will not be able to send mails!');
            }
            return;
        }
        if (config_1.CONFIG.SMTP.TRANSPORT === 'smtp')
            this.initSMTPTransport();
        else if (config_1.CONFIG.SMTP.TRANSPORT === 'sendmail')
            this.initSendmailTransport();
    }
    checkConnection() {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!this.transporter || config_1.CONFIG.SMTP.TRANSPORT !== 'smtp')
                return;
            logger_1.logger.info('Testing SMTP server...');
            try {
                const success = yield this.transporter.verify();
                if (success !== true)
                    this.warnOnConnectionFailure();
                logger_1.logger.info('Successfully connected to SMTP server.');
            }
            catch (err) {
                this.warnOnConnectionFailure(err);
            }
        });
    }
    addPasswordResetEmailJob(username, to, resetPasswordUrl) {
        const emailPayload = {
            template: 'password-reset',
            to: [to],
            subject: 'Reset your account password',
            locals: {
                username,
                resetPasswordUrl
            }
        };
        return job_queue_1.JobQueue.Instance.createJob({ type: 'email', payload: emailPayload });
    }
    addPasswordCreateEmailJob(username, to, createPasswordUrl) {
        const emailPayload = {
            template: 'password-create',
            to: [to],
            subject: 'Create your account password',
            locals: {
                username,
                createPasswordUrl
            }
        };
        return job_queue_1.JobQueue.Instance.createJob({ type: 'email', payload: emailPayload });
    }
    addVerifyEmailJob(username, to, verifyEmailUrl) {
        const emailPayload = {
            template: 'verify-email',
            to: [to],
            subject: `Verify your email on ${config_1.CONFIG.INSTANCE.NAME}`,
            locals: {
                username,
                verifyEmailUrl
            }
        };
        return job_queue_1.JobQueue.Instance.createJob({ type: 'email', payload: emailPayload });
    }
    addUserBlockJob(user, blocked, reason) {
        const reasonString = reason ? ` for the following reason: ${reason}` : '';
        const blockedWord = blocked ? 'blocked' : 'unblocked';
        const to = user.email;
        const emailPayload = {
            to: [to],
            subject: 'Account ' + blockedWord,
            text: `Your account ${user.username} on ${config_1.CONFIG.INSTANCE.NAME} has been ${blockedWord}${reasonString}.`
        };
        return job_queue_1.JobQueue.Instance.createJob({ type: 'email', payload: emailPayload });
    }
    addContactFormJob(fromEmail, fromName, subject, body) {
        const emailPayload = {
            template: 'contact-form',
            to: [config_1.CONFIG.ADMIN.EMAIL],
            replyTo: `"${fromName}" <${fromEmail}>`,
            subject: `(contact form) ${subject}`,
            locals: {
                fromName,
                fromEmail,
                body,
                hideNotificationPreferences: true
            }
        };
        return job_queue_1.JobQueue.Instance.createJob({ type: 'email', payload: emailPayload });
    }
    sendMail(options) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (!(0, config_1.isEmailEnabled)()) {
                throw new Error('Cannot send mail because SMTP is not configured.');
            }
            const fromDisplayName = options.from
                ? options.from
                : config_1.CONFIG.INSTANCE.NAME;
            const email = new Email({
                send: true,
                message: {
                    from: `"${fromDisplayName}" <${config_1.CONFIG.SMTP.FROM_ADDRESS}>`
                },
                transport: this.transporter,
                views: {
                    root: (0, path_1.join)((0, core_utils_1.root)(), 'dist', 'server', 'lib', 'emails')
                },
                subjectPrefix: config_1.CONFIG.EMAIL.SUBJECT.PREFIX
            });
            const toEmails = (0, lodash_1.isArray)(options.to)
                ? options.to
                : [options.to];
            for (const to of toEmails) {
                const baseOptions = {
                    template: 'common',
                    message: {
                        to,
                        from: options.from,
                        subject: options.subject,
                        replyTo: options.replyTo
                    },
                    locals: {
                        WEBSERVER: constants_1.WEBSERVER,
                        EMAIL: config_1.CONFIG.EMAIL,
                        instanceName: config_1.CONFIG.INSTANCE.NAME,
                        text: options.text,
                        subject: options.subject
                    }
                };
                const sendOptions = (0, lodash_1.merge)(baseOptions, options);
                yield email.send(sendOptions)
                    .then(res => logger_1.logger.debug('Sent email.', { res }))
                    .catch(err => logger_1.logger.error('Error in email sender.', { err }));
            }
        });
    }
    warnOnConnectionFailure(err) {
        logger_1.logger.error('Failed to connect to SMTP %s:%d.', config_1.CONFIG.SMTP.HOSTNAME, config_1.CONFIG.SMTP.PORT, { err });
    }
    initSMTPTransport() {
        logger_1.logger.info('Using %s:%s as SMTP server.', config_1.CONFIG.SMTP.HOSTNAME, config_1.CONFIG.SMTP.PORT);
        let tls;
        if (config_1.CONFIG.SMTP.CA_FILE) {
            tls = {
                ca: [(0, fs_extra_1.readFileSync)(config_1.CONFIG.SMTP.CA_FILE)]
            };
        }
        let auth;
        if (config_1.CONFIG.SMTP.USERNAME && config_1.CONFIG.SMTP.PASSWORD) {
            auth = {
                user: config_1.CONFIG.SMTP.USERNAME,
                pass: config_1.CONFIG.SMTP.PASSWORD
            };
        }
        this.transporter = (0, nodemailer_1.createTransport)({
            host: config_1.CONFIG.SMTP.HOSTNAME,
            port: config_1.CONFIG.SMTP.PORT,
            secure: config_1.CONFIG.SMTP.TLS,
            debug: config_1.CONFIG.LOG.LEVEL === 'debug',
            logger: logger_1.bunyanLogger,
            ignoreTLS: config_1.CONFIG.SMTP.DISABLE_STARTTLS,
            tls,
            auth
        });
    }
    initSendmailTransport() {
        logger_1.logger.info('Using sendmail to send emails');
        this.transporter = (0, nodemailer_1.createTransport)({
            sendmail: true,
            newline: 'unix',
            path: config_1.CONFIG.SMTP.SENDMAIL,
            logger: logger_1.bunyanLogger
        });
    }
    static get Instance() {
        return this.instance || (this.instance = new this());
    }
}
exports.Emailer = Emailer;
