'use strict';

import log4js from 'log4js';
import Config from '../config/config'

const {log: logCfg} = Config;

export function initLog(filename) {
    logCfg.appenders.fileDefault.filename = `logs/${filename}/default.log`
    logCfg.appenders.fileError.filename = `logs/${filename}/error.log`
    log4js.configure(logCfg);

    const errorLog = log4js.getLogger('error');
    const defaultLog = log4js.getLogger('default');

    console.trace = defaultLog.trace.bind(defaultLog);
    console.debug = defaultLog.debug.bind(defaultLog);
    console.info = defaultLog.info.bind(defaultLog);
    console.log = defaultLog.info.bind(defaultLog);
    console.warn = defaultLog.warn.bind(defaultLog);
    console.error = errorLog.error.bind(errorLog);
}

initLog('lte');
