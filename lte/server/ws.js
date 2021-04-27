import WSClient from '../../utils/WSClient';
import {LTEWSCfg} from '../../config/config.js'
import {EnumErrorDefine} from '../../define/error'
import {generateDeviceID} from '../../utils/tools'
import {EnumDeviceType} from "../../define/device";
import {EnumWSRoutes} from '../define/server';

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

        listen('hello', (data, res) => {
            wrap(res, data, EnumErrorDefine.ERR_UNKNOWN);
        });
    }

    emitAsync(...rest) {
        return this.ws.emitAsync(...rest);
    }
}

const lteWS = new LteWS();

export default lteWS;
