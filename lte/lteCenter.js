import {Emitter, EVENTS} from './events'
import {getAllLteCtrl, initLteCtrl} from "./tcp/LTEControllers";
import {EnumLTEStatus} from "./define/LTEProto";
import {EnumDeviceStatus, EnumDeviceType} from "../define/device";
import {EnumWSRoutes} from "./define/server";
import lteWS from "./server/ws";
import {LTE_DEVICE_INFO_UPDATE_MAX_INTERVAL} from "./define/constants";
import coordtransform from 'coordtransform';
import {nowUnix} from "../utils/tools";

class LteCenter {
    constructor() {
        initLteCtrl();
        this.status = {};
        this.deviceInfoChanged = true;
        this.listenCellInfoChange();
        this.deviceInfo = {
            status: EnumDeviceStatus.EXCEPTION,
            liveGps: {
                // 经度
                Longitude: 0,
                // 纬度
                Latitude: 0,
                // 高度
                Altitude: 0,
            },
            deviceType: EnumDeviceType.LTE,
            updateTime: nowUnix(),
            deviceDetails: []
        }
        this.updateDeviceInfo()
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
        const LongitudeList = []
        const LatitudeList = [];
        const AltitudeList = [];
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
            if(cellInfo.Longitude){
                LongitudeList.push(cellInfo.Longitude);
            }
            if(cellInfo.Latitude){
                LatitudeList.push(cellInfo.Latitude);
            }
            if(cellInfo.Altitude){
                AltitudeList.push(cellInfo.Altitude);
            }
        }
        if (LongitudeList.length > 0 && LatitudeList.length > 0 && AltitudeList.length > 0) {
            let Longitude = LongitudeList.reduce((a, b) => a + b) / LongitudeList.length;
            let Latitude = LatitudeList.reduce((a, b) => a + b) / LatitudeList.length;
            let Altitude = AltitudeList.reduce((a, b) => a + b) / AltitudeList.length;
            // 转换坐标系 先gpswgs84 转 国测局坐标gcj02 再转 百度坐标bd09
            const gcj02Point = coordtransform.wgs84togcj02(Longitude, Latitude);
            const bd09Point = coordtransform.gcj02tobd09(...gcj02Point);
            this.deviceInfo.liveGps = {
                Longitude: bd09Point[0],
                Latitude: bd09Point[1],
                Altitude,
            };
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
            && nowUnix() - this.deviceInfo.updateTime < LTE_DEVICE_INFO_UPDATE_MAX_INTERVAL) {
            return;
        }
        if (!lteWS.connected()) {
            return;
        }
        this.deviceInfo.updateTime = nowUnix();
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
