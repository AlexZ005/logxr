import { MessageType } from './Message.js';
import { XRConsole } from './XRConsole.js';
const buildMessage = (messageType, ...args) => {
    return {
        type: messageType,
        timestamp: Date.now(),
        content: args.join(' '),
    };
};
export class XRConsoleFactory {
    constructor() {
        this._messageQueue = [];
        this._consoleInstances = [];
        this._maxNumMessages = 100;
        const log = console.log.bind(console);
        console.log = (...args) => {
            const message = buildMessage(MessageType.Log, ...args);
            this._pushMessage(message);
            log(...args);
            this._consoleInstances.forEach((consoleInstance) => {
                consoleInstance.needsUpdate = true;
            });
        };
        const error = console.error.bind(console);
        console.error = (...args) => {
            const message = buildMessage(MessageType.Error, ...args);
            this._pushMessage(message);
            error(...args);
            this._consoleInstances.forEach((consoleInstance) => {
                consoleInstance.needsUpdate = true;
            });
        };
        const warn = console.warn.bind(console);
        console.warn = (...args) => {
            const message = buildMessage(MessageType.Warning, ...args);
            this._pushMessage(message);
            warn(...args);
            this._consoleInstances.forEach((consoleInstance) => {
                consoleInstance.needsUpdate = true;
            });
        };
        const info = console.info.bind(console);
        console.info = (...args) => {
            const message = buildMessage(MessageType.Info, ...args);
            this._pushMessage(message);
            info(...args);
            this._consoleInstances.forEach((consoleInstance) => {
                consoleInstance.needsUpdate = true;
            });
        };
        const debug = console.debug.bind(console);
        console.debug = (...args) => {
            const message = buildMessage(MessageType.Debug, ...args);
            this._pushMessage(message);
            debug(...args);
            this._consoleInstances.forEach((consoleInstance) => {
                consoleInstance.needsUpdate = true;
            });
        };
        const clear = console.clear.bind(console);
        console.clear = () => {
            this._messageQueue = [];
            clear();
            this._consoleInstances.forEach((consoleInstance) => {
                consoleInstance.needsUpdate = true;
            });
        };
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new XRConsoleFactory();
        }
        return this._instance;
    }
    _pushMessage(message) {
        this._messageQueue.unshift(message);
        this._messageQueue = this._messageQueue.slice(0, this._maxNumMessages);
    }
    get maxNumMessages() {
        return this._maxNumMessages;
    }
    set maxNumMessages(value) {
        this._maxNumMessages = value;
        this._messageQueue = this._messageQueue.slice(0, value);
    }
    createConsole(options) {
        const consoleInstance = new XRConsole(options);
        this._consoleInstances.push(consoleInstance);
        return consoleInstance;
    }
    getMessages(messageType, count) {
        return messageType === MessageType.All
            ? this._messageQueue
            : this._messageQueue
                .filter((message) => {
                return message.type === messageType;
            })
                .slice(0, count);
    }
}
