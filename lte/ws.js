import WSClient from '../utils/WSClient';
import {LTEWSCfg} from '../config/config.js'
import {EnumErrorDefine} from '../define/error'
import {generateDeviceID} from '../utils/tools'
import {EnumDeviceType} from "../define/device";

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

    /**
     * 发送ue数据
     * @param ueList
     * @return {Promise<boolean>}
     */
    async sendUEList(ueList) {
        if (ueList.length === 0) {
            return true;
        }
        const ueMap = {};
        for (const ue of ueList) {
            const {IMSI, IMEI, RSSI, prtTime} = ue;
            const key = `${IMSI}_${IMEI}`;
            if (ueMap[key]) {
                ueMap[key].prtTimeList.push(prtTime);
                ueMap[key].RSSIList.push(RSSI);
            }
            else {
                ueMap[key] = {
                    IMSI,
                    IMEI,
                    prtTimeList: [prtTime],
                    RSSIList: [RSSI]
                };
            }
        }
        const zipUEList = Object.values(ueMap);
        // console.error(JSON.stringify(zipUEList).length, JSON.stringify(ueList).length);
        const result = await lteWS.emitAsync('uploadUEList', {ueList: zipUEList});
        if (result && result.code === 0) {
            console.log(`upload uelist[${ueList.length}] successfully!!!`);
            return true;
        }
        else {
            console.log(`uploadOfflineUE failed, err = `, result);
            return false;
        }
    }
}

const lteWS = new LteWS();

export default lteWS;
