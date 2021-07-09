'use strict';

import log4js from 'log4js';
import Config from '../config/config'
import {generateDeviceID} from "./tools";
import {EnumDeviceType} from "../define/device";
import logstashudp from '@log4js-node/logstashudp'

function initLog() {
    const filename = process.env.PN;
    const {log: logCfg} = Config;
    logCfg.appenders.fileDefault.filename = `logs/${filename}/default.log`
    logCfg.appenders.fileError.filename = `logs/${filename}/error.log`
    if (logCfg.appenders.logstash) {
        logCfg.appenders.logstash.type = logstashudp;
        logCfg.appenders.logstash.extraDataProvider = loggingEvent => ({
            type: 'device',
            tag: filename, // this will be added to the fields
            deviceID: generateDeviceID(EnumDeviceType.LTE),
            pid: loggingEvent.pid, // this will be added to the fields
        })
    }
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

initLog();
