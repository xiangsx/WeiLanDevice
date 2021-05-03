import moment from 'moment';

import {Emitter, EVENTS} from './events'
import {getAllLteCtrl} from "./tcp/LTEControllers";
import {EnumLTEStatus} from "./define/LTEProto";
import {EnumDeviceStatus, EnumDeviceType} from "../define/device";
import {EnumWSRoutes} from "./define/server";
import lteWS from "./server/ws";
import {LTE_DEVICE_INFO_UPDATE_MAX_INTERVAL} from "./define/constants";

class LteCenter {
    constructor() {
        this.status = {};
        this.deviceInfoChanged = true;
        this.listenCellInfoChange()
        this.deviceInfo = {
            status: EnumDeviceStatus.EXCEPTION,
            deviceType: EnumDeviceType.LTE,
            updateTime: moment().unix(),
            deviceDetails: []
        }
    }

    ifNeedSyncDeviceInfo = () => {
        return this.deviceInfoChanged;
    };

    syncedCellInfo() {
        this.deviceInfoChanged = false;
    }

    listenCellInfoChange() {
        Emitter.on(EVENTS.CellInfoChanged, ({host, cellInfo}) => {
            this.updateDeviceInfo();
            this.deviceInfoChanged = true;
        });
    }

    getDeviceInfo() {
        return this.deviceInfo;
    }

    updateDeviceInfo() {
        const lteCtrlList = getAllLteCtrl();
        this.deviceInfo.deviceDetails = lteCtrlList.map(item => ({
            host: item.host,
            cellInfo: item.getCellInfo()
        }));
        const statusNumMap = {
            [EnumLTEStatus.DISCONNECTED]: 0,
            [EnumLTEStatus.CONNECTED]: 0,
            [EnumLTEStatus.ACTIVATING]: 0,
            [EnumLTEStatus.ACTIVATED]: 0,
            [EnumLTEStatus.DEACTIVATING]: 0,
            [EnumLTEStatus.SYNCING]: 0,
        };
        for (const lteCtrl of lteCtrlList) {
            const cellInfo = lteCtrl.getCellInfo();
            statusNumMap[cellInfo.status.value] += 1;
        }
        if (statusNumMap[EnumLTEStatus.ACTIVATED] === lteCtrlList.length) {
            this.deviceInfo.status = EnumDeviceStatus.WORKING;
        }
        else if (statusNumMap[EnumLTEStatus.CONNECTED] === lteCtrlList.length) {
            this.deviceInfo.status = EnumDeviceStatus.IDLE;
        }
        else {
            this.deviceInfo.status = EnumDeviceStatus.EXCEPTION;
        }
    }

    async syncDeviceInfo() {
        if (!this.deviceInfoChanged
            && moment().unix() - this.deviceInfo.updateTime < LTE_DEVICE_INFO_UPDATE_MAX_INTERVAL) {
            return;
        }
        if (!lteWS.connected()) {
            return;
        }
        this.deviceInfo.updateTime = moment().unix();
        const result = await lteWS.emitAsync(EnumWSRoutes.SyncDeviceInfo, {
            ...this.deviceInfo,
            save: this.deviceInfoChanged
        });
        if (result && result.code === 0) {
            console.log(`sync deviceinfo successfully!!!`);
            this.deviceInfoChanged = false;
            return true;
        }
        else {
            console.log(`syncDeviceInfo failed, err = `, result);
            return false;
        }
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
        if (!lteWS.connected()) {
            return false;
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
        const result = await lteWS.emitAsync(EnumWSRoutes.UploadUEList, {ueList: zipUEList});
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

const lteCenter = new LteCenter();

export default lteCenter;
