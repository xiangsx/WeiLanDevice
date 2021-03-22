export const EnumDeviceType = {
    LTE: 0,
};

export const DeviceTypeMap = new Map();
DeviceTypeMap.set(EnumDeviceType.LTE, {prefix: 'LTE'});

export const DEVICE_ID_FILE_PATH = process.platform === 'win32' ? 'c:/' : '/proc';