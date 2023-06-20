/* eslint-disable promise/prefer-await-to-callbacks */
import Transport from 'winston-transport';
import { MESSAGE, LEVEL } from './constants';

export default class VSCTransport extends Transport {
    constructor(options) {
        super(options);

        this.name = options.name || this.constructor.name;
        this.outputChannel = options.window.createOutputChannel(this.name, { log: true });
        this.outputChannel.clear();
        this.outputChannel.show();
    }

    levelToVSCMethod(level) {
        if ([ 'debug', 'info', 'warn', 'error', 'trace' ].includes(level)) return level;

        return 'appendLine';
    }

    log(info, callback) {
        setImmediate(() => this.emit('logged', info));
        const message = info[MESSAGE];
        const vscMethod = this.levelToVSCMethod(info[LEVEL]);

        this.outputChannel[vscMethod](message);

        callback();
    }
}
