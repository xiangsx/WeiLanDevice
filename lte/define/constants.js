export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const FILE_TIME_FORMAT = 'YYYY_MM_DD_HH_mm_ss';
export const CHART_TIME_FORMAT = 'HH:mm:ss';
export const REALM_TIME_FORMAT = 'YYYY-MM-DD@HH:mm:ss:sss';

export const EnumBelongList = {
  BELONG_NONE: 0,
  BELONG_WHITE_LIST: 1,
  BELONG_BLACK_LIST: 2,
  ALL: 3,
};

/**
 * @typedef EnumLoginErr
 */
export const EnumLoginErr = {
  USERNAME_NOT_EXISTED: 0,
  PASSWORD_NOT_RIGHT: 1,
  AUTHOR_HAS_EXPIRED: 2
};

/**
 * @type {Map<EnumLoginErr, string>}
 */
export const LoginErrDescMap = new Map();
LoginErrDescMap.set(EnumLoginErr.USERNAME_NOT_EXISTED, '用户名不存在');
LoginErrDescMap.set(EnumLoginErr.PASSWORD_NOT_RIGHT, '密码不正确');
LoginErrDescMap.set(EnumLoginErr.AUTHOR_HAS_EXPIRED, '软件版本已过期');

export const MAX_PASSWORD_RETRY_TIMES = 10;

// ue上报缓存间隔（指定时间保存到数据库一次）单位 ms
export const UE_CACHE_INTERVAL = 1000;

export const LTE_TEMPERATURE_QUERY_INTERVAL = 3 * 1000;

export const ALLOW_LOG = true;
// 是否允许保存log文件
export const ALLOW_LOG_FILE = true;

export const AES_KEY = 'XIANG_SECURITY';

export const MAX_SECURITY_FILE_SIZE = 200;

export const SECURITY_SEPARATOR = '|';

// iot设备轮询间隔 单位ms
export const IOT_AUTO_UPDATE_INTERVAL = 3 * 1000;

// ue上报 场强缓存列表长度
export const MAX_PRT_RSSI_CACHE_LENGTH = 10;
// ue上报 上报时间缓存列表长度
export const MAX_PRT_TIME_CACHE_LENGTH = 10;
// 定位测量值上报 场强缓存列表长度
export const MAX_MEAS_VALUE_CACHE_LENGTH = 500;
export const MAX_MEAS_VALUE_SHOW_LENGTH = 100;

// 是否限制使用时长
export const ALLOW_USE_TIME_LIMIT = true;

// 陀螺仪传感器 更新时间 单位：ms
export const MAGNETOMETER_UPDATE_RATE = 1;

// 允许IP地址
export const LIMIT_ADDRESS_LIST = ['192.168.2.53', '192.168.2.54'];

// 是否限制IP连接
export const IF_LIMIT_ADDRESS_CONNECT = false;

// IMEI限制列表
export const LIMIT_IMEI_LIST = [
  '860401044106291',
  '860401044356292',
  '864365050010448',
  '864365050510447',
  '862497043502264'];

// 是否限制IMEI登录
export const IF_LIMIT_IMEI_LOGIN = true;
export const IF_NEED_MOCK = false;

// 是否允许UDP发送LOG
export const ALLOW_LOG_SEND_UDP = false;
export const LOG_SEND_TARGET_PORT = 5670;
export const LOG_SEND_TARGET_IP = 'shengxiang.site';

// 动态切换频点时间间隔 unit s
export const DEFAULT_AUTO_MOD_EARFCN_INTERVAL = 5;

export const DEFAULT_TTS_RATE = 0.99;

export const BAND_LIMIT_MAP = {
  '192.168.2.53': [39, 3, 34],
  '192.168.2.54': [38, 40, 41, 1, 5, 8],
};

// 客户端连接超时 10秒
export const TCP_TIME_OUT = 10 * 1000;

// 小区启动超时
export const LTE_START_TIME_OUT = 20 * 1000;

export const PRIMARY_COLOR = '#4179f2';

export const LOG_FILE_ROCORD_INTERVAL = 5 * 1000;

// 4g侦码设备配置返回超时时间 5s
export const LTE_ACK_TIMEOUT = 10;

// 1s
export const LTE_ACK_CHECK_INTERVAL = 1000;

// 重启最大等待时间 240s
export const LTE_DEFAULT_REBOOT_WAIT_TIMEOUT = 240;

// 全局定时任务 检查时间
export const MODEL_TIMER_INTERVAL = 1000;

// 定位上号 超时时间 单位s
export const LTE_LOCATION_PRT_OVERTIME = 10;

// 扫网建站启动时长 包括定位扫网启动 单位秒
export const LTE_SCAN_START_TIMEOUT = 360;

// 风扇转速
export const FAN_SPEED_HIGH = 100;
export const FAN_SPEED_HIGH_LINE = 80;
export const FAN_SPEED_MID = 50;
export const FAN_SPEED_LOW_LINE = 20;
export const FAN_SPEED_LOW = 5;

// 温度档位
// 高温告警
export const TEMPERATURE_ALERT = 75;
// 高温切换风扇档位-》high
export const TEMPERATURE_WARN = 65;
// 低温切换风扇档位-》mid
export const TEMPERATURE_MID = 50;

// 默认空口同步失败重试次数
export const DEFAULT_AIR_SYNC_FAILED_RETRY_TIMES = 2;

export const LOCATION_TARGET_LOST_START_AUTO_MOD_EARFCN = false;

export const IP_53 = '192.168.2.53';
export const IP_54 = '192.168.2.54';

export const WARN_BATTERY_VOLTAGE = 20;
export const ALERT_BATTERY_VOLTAGE = 10;

// LTE device info 更新最大间隔值，如果超过这个值，不论状态是否变化都上传状态
export const LTE_DEVICE_INFO_UPDATE_MAX_INTERVAL = 30;
