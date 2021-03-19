import WSClient from '../utils/WSClient';
import {LTEWSCfg} from '../config/config.js'

class LteWS {
    constructor() {
        this.ws = new WSClient(`${LTEWSCfg.host}:${LTEWSCfg.port}`, LTEWSCfg.namespace);
        this.ws.init(async () => {
            const res = await this.ws.emitAsync('register', {deviceID: 'wswswsw'});
        });
        this.startListen();
    }

    startListen() {
        const {listen, wrap} = this.ws;

        listen('ping', (data, res) => {
            console.log(data);
            wrap(res, {res: data});
        });
    }
}

export default LteWS;