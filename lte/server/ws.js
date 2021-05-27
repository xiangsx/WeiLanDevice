import WSClient from '../../utils/WSClient';
import Config from '../../config/config.js'
import {EnumErrorDefine} from '../../define/error'
import {generateDeviceID} from '../../utils/tools'
import {EnumDeviceType} from "../../define/device";
import {EnumWSRoutes} from '../define/server';
import {HandleConfig, Hello} from "./controller";

const {wsServerCfg} = Config;

class LteWS {
    constructor() {
        this.deviceID = generateDeviceID(EnumDeviceType.LTE);
        this.ws = new WSClient(`${wsServerCfg.host}:${wsServerCfg.port}`, wsServerCfg.namespace,
            {query: {deviceID: this.deviceID}});
        this.startListen();
    }

    connected() {
        return this.ws.connected();
    }

    startListen() {
        const {listen, wrap} = this.ws;

        listen('hello', this.handler(Hello));

        listen('config', this.handler(HandleConfig));
    }

    handler(func) {
        const {listen, wrap} = this.ws;
        return async (data, res) => {
            try {
                const [err, resData] = await func(data) || [];
                wrap(res, resData, err === null || undefined ? undefined : err);
            } catch (e) {// 捕捉意外的异常 返回ERR_UNKNOWN
                console.error(e);
                wrap(res, null, e);
            }
        };
    }

    emitAsync(...rest) {
        return this.ws.emitAsync(...rest);
    }
}

const lteWS = new LteWS();

export default lteWS;
