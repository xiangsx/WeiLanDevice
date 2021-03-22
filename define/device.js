export const EnumDeviceType = {
    LTE: 0,
};

export const DeviceTypeMap = new Map();
DeviceTypeMap.set(EnumDeviceType.LTE, {prefix: 'LTE'});

export const DEVICE_ID_FILE_PATH = process.platform === 'win32' ? 'c:/' : '/proc';

export const EnumDeviceStatus = {
    // 断开连接
    DISCONNECTED: 0,
    // 已连接  初始化状态
    CONNECTED: 1,
    // 状态异常
    EXCEPTION: 2,
    WORKING: 100
};