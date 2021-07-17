import client from 'prom-client'
import http from 'http';
import {scheduleJob} from 'node-schedule'
import Config from '../config/config'
import {generateDeviceID} from "./tools";
import {EnumDeviceType} from "../define/device";

const gateway = new client.Pushgateway(`http://${Config.wsServerCfg.host}:${Config.pushGatewayPort}`, {
    timeout: 5000, //Set the request timeout to 5000ms
    agent: new http.Agent({
        keepAlive: true,
        keepAliveMsec: 10000,
        maxSockets: 5,
    }),
});

function push() {
    gateway.push({
        jobName: 'device-exporter',
        groupings: {
            instance: `${deviceID}|${process.env.PN}`
        },
    }, function (err, resp, body) {
        if (err) {
            console.error(err);
        } else {
            console.debug(`promethus init successfully!!!`);
        }
    })
}

const deviceID = generateDeviceID(EnumDeviceType.LTE);

client.collectDefaultMetrics({
    labels: {
        process: process.env.PN,
        deviceID,
    }
});

scheduleJob(`*/${Config.pushInterval} * * * * *`, push);
