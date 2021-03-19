import WSClient from '../utils/WSClient';
import {LTEWSCfg} from '../config/config.js'
import {EnumErrorDefine} from '../define/error'

class LteWS {
    constructor() {
        this.ws = new WSClient(`${LTEWSCfg.host}:${LTEWSCfg.port}`, LTEWSCfg.namespace);
        this.ws.init(async () => {
            const res = await this.ws.emitAsync('register', {deviceID: 'lte_aaa'});
        });
        this.startListen();
    }

    startListen() {
        const {listen, wrap} = this.ws;

        listen('ping', (data, res) => {
            wrap(res, data, EnumErrorDefine.ERR_UNKNOWN);
        });
    }
}

export default LteWS;
