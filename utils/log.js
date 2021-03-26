'use strict';

const log4js = require('log4js');
// log the cheese logger messages to a file, and the console ones as well.
log4js.configure({
    appenders: {
        fileError: {type: 'file', filename: 'logs/error.log'},
        fileDefault: {type: 'file', filename: 'logs/default.log'},
        console: {type: 'console'}
    },
    categories: {
        error: {appenders: ['console', 'fileError', 'fileDefault'], level: 'error'},
        default: {appenders: ['console', 'fileDefault'], level: 'trace'}
    },
    pm2: true
});

const errorLog = log4js.getLogger('error');
const defaultLog = log4js.getLogger('default');

console.log = defaultLog.info.bind(defaultLog);
console.debug = defaultLog.trace.bind(defaultLog);
console.warn = defaultLog.warn.bind(defaultLog);
console.error = errorLog.error.bind(errorLog);