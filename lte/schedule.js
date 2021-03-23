import {scheduleJob} from 'node-schedule'
import lteWS from './ws'
import {getAllLteCtrl} from './tcp/LTEControllers'
import {getOfflineUEList, saveOfflineUE} from "../store/db";

const LteScheduleList = [
    {
        enable: false,
        // 每秒一次
        schedule: '*/1 * * * * *',
        handle: lteSchedule => lteSchedule.syncDeviceStatus
    }, {
        enable: true,
        // 每秒一次
        schedule: '*/5 * * * * *',
        handle: lteSchedule => lteSchedule.uploadUEList
    }, {
        enable: true,
        // 每秒一次
        schedule: '*/20 * * * * *',
        handle: lteSchedule => lteSchedule.uploadOfflineUE
    },
];

class LteSchedule {
    constructor() {

    }

    start() {
        for (const scheduleInfo of LteScheduleList) {
            const {enable, handle, schedule} = scheduleInfo;
            if (!enable) {
                continue;
            }
            scheduleJob(schedule, handle(this));
        }
    }

    syncDeviceStatus() {
        console.log('syncDeviceStatus');
    };

    async uploadUEList() {
        const allLteCtrl = getAllLteCtrl();
        const ueList = [];
        for (const lteCtrl of allLteCtrl) {
            const ueListCache = lteCtrl.getAndClearUEList();
            ueList.push(...ueListCache);
        }
        if (ueList.length === 0) {
            return;
        }

        const sendSucc = await lteWS.sendUEList(ueList)
        if (!sendSucc) {
            saveOfflineUE(ueList);
        }
    }

    async uploadOfflineUE() {
        if (!lteWS.connected()) {
            return;
        }
        const {rows, deleteRows} = getOfflineUEList();
        if (rows.length === 0) {
            return;
        }
        await lteWS.sendUEList(rows);
    }
}

const lteSchedule = new LteSchedule();

export default lteSchedule;