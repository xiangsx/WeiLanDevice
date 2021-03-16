import {MsgStruct, STRUCT_TYPE} from '../structUtils'

export const FIX_HEAD = 0xAABBCCDD;
export const FIX_HEAD_ARR = [0xAA, 0xBB, 0xCC, 0xDD];
export const FIX_END = 0x7E;
const IPV4_IP_LEN = 4;
const MAC_LEN = 6;

/**
 * 功能码枚举
 * @enum {number} EnumFunCode
 */
export const EnumFunCode = {
    // 客户端IP
    CLIENT_IP: 0xD1,
    // 客户端子网掩码
    CLIENT_SUBNET_MASK: 0xD2,
    // 客户端网关
    CLIENT_GATEWAY: 0xD3,
    // 客户端端口
    CLIENT_PORT: 0xD4,
    // 客户端mac地址
    CLIENT_MAC: 0xD5,
    // 服务端IP
    SERVER_IP: 0xD6,
    // 服务端地址
    SERVER_PORT: 0xD7,

    // 风扇转速
    FAN_SPEED: 0x01,
    // 温度
    TEMPERATURE: 0x02,
    // 电池电压
    BATTERY_VOLTAGE: 0x03,

    // 各种BAND 功率发射电压
    B1_TPV: 0x04,
    B3_TPV: 0x05,
    B5_TPV: 0x06,
    B8_TPV: 0x07,
    B34_TPV: 0x08,
    B39_TPV: 0x09,
    B40_TPV: 0x0A,
    B38_TPV: 0x0B,
    B41_TPV: 0x0C,
};

/**
 * 命令枚举
 * @enum {number} EnumCmd
 */
export const EnumCmd = {
    // 设置
    CMD_SET: 0x01,
    // 查询
    CMD_QUERY: 0x02,
    // 设置成功
    CMD_SET_SUCC: 0x81,
    // 设置失败
    CMD_SET_FAIL: 0xF1,
    // 查询成功
    CMD_QUERY_SUCC: 0x82,
    // 查询失败
    CMD_QUERY_FAIL: 0xF2
};

export class IotProto {
    constructor () {
        this.HEAD_STRUCT = new MsgStruct([
            [STRUCT_TYPE.word32Ube, 'fixHead'],
            [STRUCT_TYPE.word8Ube, 'funCode'],
            [STRUCT_TYPE.word8Ube, 'cmd'],
            [STRUCT_TYPE.word8Ube, 'contentLength'],
        ]);
        this.HEAD_LEN = this.HEAD_STRUCT.length;
        this.END_STRUCT = new MsgStruct([[STRUCT_TYPE.word8Ube, 'fixEnd']]);
        this.END_LEN = this.END_STRUCT.length;
        this.IOT_COMMON_QUERY = new MsgStruct([]);
        /**
         *
         * @type {Map<number|EnumFunCode, MsgStruct>}
         * @private
         */
        this._bodyStructMap = new Map();
        this.initBodyStructMap();
    }

    /**
     * 绑定结构体和消息类型,所有新定义的结构体必须在此绑定消息类型
     */
    initBodyStructMap () {
        this._bodyStructMap.set(EnumFunCode.CLIENT_IP, this._CLIENT_IP_STRUCT);
        this._bodyStructMap.set(EnumFunCode.CLIENT_MAC, this._CLIENT_MAC_STRUCT);
        this._bodyStructMap.set(EnumFunCode.SERVER_IP, this._SERVER_IP_STRUCT);
        this._bodyStructMap.set(EnumFunCode.SERVER_PORT, this._SERVER_PORT_STRUCT);
        this._bodyStructMap.set(EnumFunCode.FAN_SPEED, this._FAN_SPEED_STRUCT);
        this._bodyStructMap.set(EnumFunCode.TEMPERATURE, this._TEMPERATURE_STRUCT);
        this._bodyStructMap.set(EnumFunCode.BATTERY_VOLTAGE, this._BATTERY_VOLTAGE_STRUCT);
    }

    /**
     * 获取body 结构体
     * @param {number|EnumFunCode} funCode
     * @return {MsgStruct}
     */
    getBodyStruct (funCode) {
        if (!this._bodyStructMap.has(funCode)) {
            console.error(`IotProto.getBodyStruct not support this function code :[${funCode}]`);
        }
        return this._bodyStructMap.get(funCode);
    }

    /**
     * 客户端IP结构体
     * @type {MsgStruct}
     * @private
     */
    _CLIENT_IP_STRUCT = new MsgStruct([[STRUCT_TYPE.array, 'clientIP', [IPV4_IP_LEN, STRUCT_TYPE.word8Ube]]]);

    /**
     * 客户端MAC地址结构体
     * @type {MsgStruct}
     * @private
     */
    _CLIENT_MAC_STRUCT = new MsgStruct([[STRUCT_TYPE.array, 'clientMAC', [MAC_LEN, STRUCT_TYPE.word8Ube]]]);

    /**
     * 风扇转速结构体
     * @type {MsgStruct}
     * @private
     */
    _FAN_SPEED_STRUCT = new MsgStruct([[STRUCT_TYPE.word8Ube, 'fanSpeed']]);

    /**
     * 温度结构体
     * @type {MsgStruct}
     * @private
     */
    _TEMPERATURE_STRUCT = new MsgStruct([[STRUCT_TYPE.word16Ube, 'temperature']]);

    /**
     * 电池电压结构体
     * @type {MsgStruct}
     * @private
     */
    _BATTERY_VOLTAGE_STRUCT = new MsgStruct([[STRUCT_TYPE.word8, 'batteryVoltage']]);

    /**
     * 服务端IP结构体
     * @type {MsgStruct}
     * @private
     */
    _SERVER_IP_STRUCT = new MsgStruct([[STRUCT_TYPE.array, 'serverIP', [IPV4_IP_LEN, STRUCT_TYPE.word8Ube]]]);

    /**
     * 服务端port结构体
     * @type {MsgStruct}
     * @private
     */
    _SERVER_PORT_STRUCT = new MsgStruct([[STRUCT_TYPE.word32Ube, 'serverPort']]);
}

/**
 *
 * @enum {number} EnumIotStatus
 */
export const EnumIotStatus = {
    DISCONNECTED: 0,
    CONNECTED: 1,
};

/**
 *
 * @type {Map<number|EnumIotStatus, {value:number,text:string}>}
 */
export const IotStatusMap = new Map();
IotStatusMap.set(EnumIotStatus.DISCONNECTED, {value: EnumIotStatus.DISCONNECTED, text: '连接断开'});
IotStatusMap.set(EnumIotStatus.CONNECTED, {value: EnumIotStatus.CONNECTED, text: '已连接'});