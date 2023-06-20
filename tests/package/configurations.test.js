import { assert } from 'chai';
import { createLogger } from 'winston';
import transport from '../entry';

suite('Configurations');


class MockOutputChannel {
    constructor(array) {
        this.array = array;
    }

    getMockFunction = name => (...args) => this.array.push({ name, args });

    debug = this.getMockFunction('debug');

    info = this.getMockFunction('info');

    warn = this.getMockFunction('warn');

    error = this.getMockFunction('error');

    trace = this.getMockFunction('trace');

    appendLine = this.getMockFunction('appendLine');

    show = this.getMockFunction('show');

    clear = this.getMockFunction('clear');
}

class MockWindow {
    constructor(array) {
        this.array = array;
    }

    createOutputChannel(name, opts) {
        assert.exists(name);
        assert.deepEqual(opts, {
            log : true
        });

        return new MockOutputChannel(this.array);
    }
}


test('Default configuration', function () {
    const array = [];
    const logger = createLogger({
        level      : 'debug',
        transports : [ new transport({
            window : new MockWindow(array)
        }) ]
    });

    assert.exists(
        array.find(a => a.name === 'clear'),
        'clear is called'
    );

    assert.exists(
        array.find(a => a.name === 'show'),
        'show is called'
    );
    logger.log('info', 'abc');

    assert.deepEqual(array.find(a => a.name === 'info'), {
        name : 'info',
        args : [ '{"level":"info","message":"abc"}' ]
    });
});

test('fallback level', function () {
    const array = [];
    const logger = createLogger({
        level      : 'debug',
        transports : [ new transport({
            window : new MockWindow(array)
        }) ]
    });

    logger.log('verbose', 'abc');

    assert.deepEqual(array.find(a => a.name === 'appendLine'), {
        name : 'appendLine',
        args : [ '{"level":"verbose","message":"abc"}' ]
    });

    assert.isEmpty(
        array.filter(a => [ 'debug', 'info', 'warn', 'error', 'trace' ].includes(a.name))
    );
});
