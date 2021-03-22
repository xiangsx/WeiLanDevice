import {scheduleJob} from 'node-schedule'
import lteWS from './ws'

const LteScheduleList = [
    {
        enable: true,
        // 每秒一次
        schedule: '*/1 * * * * *',
        handle: lteSchedule => lteSchedule.syncDeviceStatus
    }
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
}

const lteSchedule = new LteSchedule();

export default lteSchedule;