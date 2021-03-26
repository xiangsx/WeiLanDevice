'use strict';

import log4js from 'log4js';
import logCfg from '../config/log.json'

log4js.configure(logCfg);

const errorLog = log4js.getLogger('error');
const defaultLog = log4js.getLogger('default');

const replaceConsole = () => {
    console.log = defaultLog.info.bind(defaultLog);
    console.debug = defaultLog.trace.bind(defaultLog);
    console.warn = defaultLog.warn.bind(defaultLog);
    console.error = errorLog.error.bind(errorLog);
};

replaceConsole();