import WSClient from '../../utils/WSClient';
import {LTEWSCfg} from '../../config/config.js'
import {EnumErrorDefine} from '../../define/error'
import {generateDeviceID} from '../../utils/tools'
import {EnumDeviceType} from "../../define/device";
import {EnumWSRoutes} from '../define/server';
import {Hello, SetAutoModEarfcn} from "./controller";

class LteWS {
    constructor() {
        this.deviceID = generateDeviceID(EnumDeviceType.LTE);
        this.ws = new WSClient(`${LTEWSCfg.host}:${LTEWSCfg.port}`, LTEWSCfg.namespace,
            {query: {deviceID: this.deviceID}});
        this.startListen();
    }

    connected() {
        return this.ws.connected();
    }

    startListen() {
        const {listen, wrap} = this.ws;

        listen('hello', this.handler(Hello));

        listen('setAutoModEarfcn',this.handler(SetAutoModEarfcn))
    }

    handler(func) {
        const {listen, wrap} = this.ws;
        return (data, res) => {
            try {
                const [err, resData] = func(data) || [];
                wrap(res, resData, err);
            } catch (e) {// 捕捉意外的异常 返回ERR_UNKNOWN
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
