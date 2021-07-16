import client from 'prom-client'
import Config from '../config/config'
import http from 'http';
import {generateDeviceID} from "./tools";
import {EnumDeviceType} from "../define/device";

const gateway = new client.Pushgateway(`http://${Config.wsServerCfg.host}:${Config.publishGatewayPort}`, {
    timeout: 5000, //Set the request timeout to 5000ms
    agent: new http.Agent({
        keepAlive: true,
        keepAliveMsec: 10000,
        maxSockets: 5,
    }),
});

gateway.pushAdd({jobName: 'device-exporter'}, function (err, resp, body) {
    if (err) {
        console.error(err);
    }
    else {
        console.log(JSON.stringify(resp), JSON.stringify(body));
    }
}); //Add metric and overwrite old ones
const deviceID = generateDeviceID(EnumDeviceType.LTE);

client.collectDefaultMetrics({
    prefix: generateDeviceID(EnumDeviceType.LTE), labels: {
        process: process.env.PN,
        deviceID,
    }
});
