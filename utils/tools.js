import {v4} from 'uuid';
import crypto from 'crypto'
import {DEVICE_ID_FILE_PATH, DeviceTypeMap, EnumDeviceType} from "../define/device.js";
import fs from 'fs';
import assert from 'assert';

/**
 * 生成设备ID
 * @param {EnumDeviceType} deviceType 设备类型
 * @return {string}
 */
export function generateDeviceID(deviceType) {
    const deviceInfo = DeviceTypeMap.get(deviceType);
    let deviceID;
    const fileName = `${DEVICE_ID_FILE_PATH}/${deviceInfo.prefix}_DEVICEID`;
    try {
        deviceID = fs.readFileSync(fileName,'utf-8');
    } catch (e) {
    }
    if (!deviceID) {
        const md5 = crypto.createHash('md5');
        const splitStr = '|';
        deviceID = `${deviceInfo.prefix}${splitStr}${
            md5.update(v4()).digest('hex').toUpperCase().slice(0, 12)}`;
        fs.writeFileSync(fileName, deviceID, 'utf-8');
    }
    assert(deviceID.length === 16);
    return deviceID
}

if (require.main === module) {
    console.log(generateDeviceID(EnumDeviceType.LTE));
}
