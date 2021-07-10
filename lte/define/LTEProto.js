import { MsgStruct, STRUCT_TYPE } from '../utils/structUtils';

// <<<<<<<<<<<常量定义<<<<<<<<<<<<<
export const MAX_PCI = 503;
export const MAX_TAC = 65535;
export const MIN_PCI = 0;
export const MIN_TAC = 0;
export const MAX_CELL_ID = 0xFFFFFFF;
// 终端最大发射功率
const DEFAULT_UePMax = 23;

// 基站广播参考信号功率
const DEFAUTL_EnodeBPMax = 20;

export const DEFAULT_RXGAIN = 42;

/**
 * 消息帧头
 * @type {number}
 */
export const FRAME_HEAD = 0x5555AAAA;

// >>>>>>>>>>>常量定义>>>>>>>>>>>>>

/**
 * FRAME_HEAD 大端格式的array
 * @type {number[]}
 */
const FRAME_HEAD_BE_ARR = [
    (FRAME_HEAD & 0xFF000000) >> 24,
    (FRAME_HEAD & 0x00FF000) >> 16,
    (FRAME_HEAD & 0x0000FF00) >> 8,
    (FRAME_HEAD & 0x000000FF)
];

/**
 * HEAD_FRAME小端格式的array
 * @type {number[]}
 */
const FRAME_HEAD_LE_ARR = [
    (FRAME_HEAD & 0x000000FF),
    (FRAME_HEAD & 0x0000FF00) >> 8,
    (FRAME_HEAD & 0x00FF0000) >> 16,
    (FRAME_HEAD & 0xFF000000) >> 24,
];

// eslint-disable-next-line no-unused-vars
const PROTO_CONSTANT = {
    C_MAX_S_TMSI_LEN: 5,
    // IMSI 数据长度
    C_MAX_IMSI_LEN: 17,
    // IMEI 数据长度
    C_MAX_IMEI_LEN: 17,
    // 黑白名单配置时每次最大可以添 加/删除的 UE 数
    C_MAX_CONTROL_PROC_UE_NUM: 10,
    // 黑白名单中可以各含有的最大 UE 数
    C_MAX_CONTROL_LIST_UE_NUM: 100,
    // 定位黑名单中可以含有的最大 UE 数
    C_MAX_LOCATION_BLACKLIST_UE_CFG_NUM: 20,
    // 查询定位黑名单中最大 UE 数
    C_MAX_LOCATION_BLACKLIST_UE_QUERY_NUM: 100,
    // 小 区 自 配 置 对 应 的 默 认 扫 频 ARFCN 总数
    C_MAX_DEFAULT_ARFCN_NUM: 50,
    // 重定向白名单中单次配置 IMSI 最 大数目,
    C_MAX_UE_REDIRECT_IMSI_ADD_NUM: 20

};

// eslint-disable-next-line no-unused-vars
/**
 * 消息类型枚举
 * @enum {number}
 */
const EnumMsgType = {
    O_FL_LMT_TO_ENB_SYS_MODE_CFG: 0xF001,
    O_FL_ENB_TO_LMT_SYS_MODE_ACK: 0xF002,
    O_FL_LMT_TO_ENB_SYS_ARFCN_CFG: 0xF003,
    O_FL_ENB_TO_LMT_SYS_ARFCN_ACK: 0xF004,
    O_FL_ENB_TO_LMT_UE_INFO_RPT: 0xF005,
    O_FL_LMT_TO_ENB_MEAS_UE_CFG: 0xF006,
    O_FL_ENB_TO_LMT_MEAS_UE_ACK: 0xF007,
    O_FL_ENB_TO_LMT_MEAS_INFO_RPT: 0xF008,
    O_FL_LMT_TO_ENB_REM_CFG: 0xF009,
    O_FL_ENB_TO_LMT_REM_INFO_RPT: 0xF00A,
    O_FL_LMT_TO_ENB_REBOOT_CFG: 0xF00B,
    O_FL_ENB_TO_LMT_REBOOT_ACK: 0xF00C,
    O_FL_LMT_TO_ENB_SET_ADMIN_STATE_CFG: 0xF00D,
    O_FL_ENB_TO_LMT_SET_ADMIN_STATE_ACK: 0xF00E,
    O_FL_ENB_TO_LMT_SYS_INIT_SUCC_IND: 0xF010,
    O_FL_LMT_TO_ENB_SYS_INIT_SUCC_RSP: 0xF011,
    O_FL_LMT_TO_ENB_SYS_RxGAIN_CFG: 0xF013,
    O_FL_ENB_TO_LMT_SYS_RxGAIN_ACK: 0xF014,
    O_FL_LMT_TO_ENB_SYS_PWR1_DEREASE_CFG: 0xF015,
    O_FL_ENB_TO_LMT_SYS_PWR1_DEREASE_ACK: 0xF016,
    O_FL_LMT_TO_ENB_REDIRECT_INFO_CFG: 0xF017,
    O_FL_ENB_TO_LMT_REDIRECT_INFO_ACK: 0xF018,
    O_FL_LMT_TO_ENB_GET_ENB_STATE: 0xF01A,
    O_FL_ENB_TO_LMT_ENB_STATE_IND: 0xF019,
    O_FL_LMT_TO_ENB_IP_CFG: 0xF01B,
    O_FL_ENB_TO_LMT_IP_CFG_ACK: 0xF01C,
    O_FL_LMT_TO_ENB_RESET_CFG: 0xF01D,
    O_FL_ENB_TO_LMT_RESET_ACK: 0xF01E,
    O_FL_LMT_TO_ENB_SET_SYS_TMR: 0xF01F,
    O_FL_ENB_TO_LMT_SET_SYS_TMR_ACK: 0xF020,
    O_FL_LMT_TO_ENB_SET_QRXLEVMIN: 0xF021,
    O_FL_ENB_TO_LMT_SET_QRXLEVMIN_ACK: 0xF022,
    O_FL_LMT_TO_ENB_REM_MODE_CFG: 0xF023,
    O_FL_ENB_TO_LMT_REM_MODE_CFG_ACK: 0xF024,
    O_FL_LMT_TO_ENB_LMTIP_CFG: 0xF025,
    O_FL_ENB_TO_LMT_LMTIP_CFG_ACK: 0xF026,
    O_FL_LMT_TO_ENB_GET_ARFCN: 0xF027,
    O_FL_ENB_TO_LMT_ARFCN_IND: 0xF028,
    O_FL_LMT_TO_ENB_GPS_PP1S_CFG: 0xF029,
    O_FL_ENB_TO_LMT_GPS_PP1S_ACK: 0xF02A,
    O_FL_LMT_TO_ENB_BASE_INFO_QUERY: 0xF02B,
    O_FL_ENB_TO_LMT_BASE_INFO_QUERY_ACK: 0xF02C,
    O_FL_LMT_TO_ENB_SYNC_INFO_QUERY: 0xF02D,
    O_FL_ENB_TO_LMT_SYNC_INFO_QUERY_ACK: 0xF02E,
    O_FL_LMT_TO_ENB_CELL_STATE_INFO_QUERY: 0xF02F,
    O_FL_ENB_TO_LMT_CELL_STATE_INFO_QUERY_ACK: 0xF030,
    O_FL_LMT_TO_ENB_RXGAIN_POWER_DEREASE_QUERY: 0xF031,
    O_FL_ENB_TO_LMT_RXGAIN_POWER_DEREASE_QUERY_ACK: 0xF032,
    O_FL_LMT_TO_ENB_ENB_IP_QUERY: 0xF033,
    O_FL_ENB_TO_LMT_ENB_IP_QUERY_ACK: 0xF034,
    O_FL_LMT_TO_ENB_QRXLEVMIN_VALUE_QUERY: 0xF035,
    O_FL_ENB_TO_LMT_QRXLEVMIN_VALUE_QUERY_ACK: 0xF036,
    O_FL_LMT_TO_ENB_REM_CFG_QUERY: 0xF037,
    O_FL_ENB_TO_LMT_REM_CFG_QUERY_ACK: 0xF038,
    O_FL_LMT_TO_ENB_CONTROL_UE_LIST_CFG: 0xF039,
    O_FL_ENB_TO_LMT_CONTROL_UE_LIST_CFG_ACK: 0xF03A,
    O_FL_LMT_TO_ENB_SELF_ACTIVE_CFG_PWR_ON: 0xF03B,
    O_FL_ENB_TO_LMT_SELF_ACTIVE_CFG_PWR_ON_ACK: 0xF03C,
    O_FL_LMT_TO_ENB_MEAS_UE_CFG_QUERY: 0xF03D,
    O_FL_ENB_TO_LMT_MEAS_UE_CFG_QUERY_ACK: 0xF03E,
    O_FL_LMT_TO_ENB_REDIRECT_INFO_CFG_QUERY: 0xF03F,
    O_FL_ENB_TO_LMT_REDIRECT_INFO_CFG_QUERY_ACK: 0xF040,
    O_FL_LMT_TO_ENB_SELF_ACTIVE_CFG_PWR_ON_QUERY: 0xF041,
    O_FL_ENB_TO_LMT_SELF_ACTIVE_CFG_PWR_ON_QUERY_ACK: 0xF042,
    O_FL_LMT_TO_ENB_CONTROL_LIST_QUERY: 0xF043,
    O_FL_ENB_TO_LMT_CONTROL_LIST_QUERY_ACK: 0xF044,
    O_FL_LMT_TO_ENB_SYS_LOG_LEVL_SET: 0xF045,
    O_FL_ENB_TO_LMT_SYS_LOG_LEVL_SET_ACK: 0xF046,
    O_FL_LMT_TO_ENB_SYS_LOG_LEVL_QUERY: 0xF047,
    O_FL_ENB_TO_LMT_SYS_LOG_LEVL_QUERY_ACK: 0xF048,
    O_FL_LMT_TO_ENB_TDD_SUBFRAME_ASSIGNMENT_SET: 0xF049,
    O_FL_ENB_TO_LMT_TDD_SUBFRAME_ASSIGNMENT_SET_ACK: 0xF04A,
    O_FL_LMT_TO_ENB_TDD_SUBFRAME_ASSIGNMENT_QUERY: 0xF04B,
    O_FL_ENB_TO_LMT_TDD_SUBFRAME_ASSIGNMENT_QUERY_ACK: 0xF04C,
    O_FL_LMT_TO_ENB_SELFCFG_ARFCN_QUERY: 0xF04D,
    O_FL_ENB_TO_LMT_SELFCFG_ARFCN_QUERY_ACK: 0xF04E,
    O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ: 0xF04F,
    O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ_ACK: 0xF050,
    O_FL_LMT_TO_ENB_SELFCFG_ARFCN_CFG_REQ: 0xF051,
    O_FL_ENB_TO_LMT_SELFCFG_ARFCN_CFG_REQ_ACK: 0xF052,
    O_FL_LMT_TO_ENB_LOCATION_UE_BLACKLIST_CFG: 0xF053,
    O_FL_ENB_TO_LMT_LOCATION_UE_BLACKLIST_CFG_ACK: 0xF054,
    O_FL_LMT_TO_ENB_LOCATION_UE_BLACKLIST_QUERY: 0xF055,
    O_FL_ENB_TO_LMT_LOCATION_UE_BLACKLIST_QUERY_ACK: 0xF056,
    O_FL_LMT_TO_ENB_TAU_ATTACH_REJECT_CAUSE_CFG: 0xF057,
    O_FL_ENB_TO_LMT_TAU_ATTACH_REJECT_CAUSE_CFG_ACK: 0xF058,
    O_FL_LMT_TO_ENB_FREQ_OFFSET_CFG: 0xF059,
    O_FL_ENB_TO_LMT_FREQ_OFFSET_CFG_ACK: 0xF05A,
    O_FL_ENB_TO_LMT_ALARMING_TYPE_IND: 0xF05B,
    O_FL_LMT_TO_ENB_GPS_LOCATION_QUERY: 0xF05C,
    O_FL_ENB_TO_LMT_GPS_LOCATION_QUERY_ACK: 0xF05D,
    O_FL_LMT_TO_ENB_SECONDARY_PLMNS_SET: 0xF060,
    O_FL_ENB_TO_LMT_SECONDARY_PLMNS_SET_ACK: 0xF061,
    O_FL_LMT_TO_ENB_SECONDARY_PLMNS_QUERY: 0xF062,
    O_FL_ENB_TO_LMT_SECONDARY_PLMNS_QUERY_ACK: 0xF063,
    O_FL_LMT_TO_ENB_RA_ACCESS_QUERY: 0xF065,
    O_FL_ENB_TO_LMT_RA_ACCESS_QUERY_ACK: 0xF066,
    O_FL_LMT_TO_ENB_RA_ACCESS_EMPTY_REQ: 0xF067,
    O_FL_ENB_TO_LMT_RA_ACCESS_EMPTY_REQ_ACK: 0xF068,
    O_FL_LMT_TO_ENB_TAC_MODIFY_REQ: 0xF069,
    O_FL_ENB_TO_LMT_TAC_MODIFY_REQ_ACK: 0xF06A,
    O_FL_LMT_TO_ENB_TAU_ATTACH_REJECT_CAUSE_QUERY: 0xF06B,
    O_FL_ENB_TO_LMT_TAU_ATTACH_REJECT_CAUSE_QUERY_ACK: 0xF06C,
    O_FL_LMT_TO_ENB_GPS_INFO_RESET: 0xF06D,
    O_FL_ENB_TO_LMT_GPS_INFO_RESET_ACK: 0xF06E,
    O_FL_LMT_TO_ENB_UPDATE_SOFT_VERSION_CFG: 0xF06F,
    O_FL_ENB_TO_LMT_UPDATE_SOFT_VERSION_CFG_ACK: 0xF070,
    O_FL_LMT_TO_ENB_GET_ENB_LOG: 0xF071,
    O_FL_ENB_TO_LMT_GET_ENB_LOG_ACK: 0xF072,
    O_FL_LMT_TO_ENB_GPS1PPS_QUERY: 0xF073,
    O_FL_ENB_TO_LMT_GSP1PPS_QUERY_ACK: 0xF074,
    O_FL_LMT_TO_ENB_NTP_SERVER_IP_CFG: 0xF075,
    O_FL_ENB_TO_LMT_NTP_SERVER_IP_CFG_ACK: 0xF076,
    O_FL_LMT_TO_ENB_AGC_SET: 0xF079,
    O_FL_ENB_TO_LMT_AGC_SET_ACK: 0xF07A,
    O_FL_LMT_TO_ENB_GMT_QUERY: 0Xf07B,
    O_FL_LMT_TO_ENB_GMT_QUERY_ACK: 0Xf07C,
    O_FL_LMT_TO_ENB_REM_ANT_CFG: 0Xf07D,
    O_FL_LMT_TO_ENB_REM_ANT_CFG_ACK: 0Xf07E,
    O_FL_LMT_TO_ENB_SYS_ARFCN_MOD: 0xF080,
    O_FL_ENB_TO_LMT_SYS_ARFCN_MOD_ACK: 0xF081,
    O_FL_LMT_TO_ENB_SELECT_FREQ_CFG: 0xF082,
    O_FL_ENB_TO_LMT_SELECT_FREQ_CFG_ACK: 0xF083,
    O_FL_LMT_TO_ENB_SRS_CFG: 0xF084,
    O_FL_ENB_TO_LMT_SRS_CFG_ACK: 0xF085,
    O_FL_LMT_TO_ENB_TIME_TO_RESET_CFG: 0xF086,
    O_FL_LMT_TO_ENB_TIME_TO_RESET_CFG_ACK: 0xF087,
    O_FL_LMT_TO_ENB_SELECT_FREQ_CFG_QUERY: 0xF088,
    O_FL_ENB_TO_LMT_SELECT_FREQ_CFG_QUERY_ACK: 0xF089,
    O_FL_LMT_TO_ENB_IMEI_REQUEST_CFG: 0xF08A,
    O_FL_ENB_TO_LMT_IMEI_REQUEST_CFG_ACK: 0xF08B,
    O_FL_LMT_TO_ENB_UE_REDIRECT_IMSI_LIST_CFG: 0xF08E,
    O_FL_ENB_TO_LMT_UE_REDIRECT_IMSI_LIST_CFG_ACK: 0xF08F,
    O_FL_LMT_TO_ENB_FDD_GPS_RESYNC_CFG: 0xF090,
    O_FL_ENB_TO_LMT_FDD_GPS_RESYNC_CFG_ACK: 0xF091,
    O_FL_LMT_TO_ENB_UL_POWER_CONTROL_ALPHA_CFG: 0xF092,
    O_FL_ENB_TO_LMT_UL_POWER_CONTROL_ALPHA_CFG_ACK: 0xF093,
    O_FL_LMT_TO_ENB_UPLOAD_IMSI_FILE_CFG_QUERY: 0xF094,
    O_FL_ENB_TO_LMT_UPLOAD_IMSI_FILE_CFG_QUERY_ACK: 0xF095,
    O_FL_LMT_TO_ENB_UE_INFO_RPT_ACK: 0xF096,
    O_FL_LMT_TO_ENB_GPS_OR_BEIDOU_CFG: 0xF097,
    O_FL_ENB_TO_LMT_GPS_OR_BEIDOU_CFG_ACK: 0xF098,
    O_FL_LMT_TO_ENB_GPS_OR_BEIDOU_CFG_QUERY: 0xF099,
    O_FL_ENB_TO_LMT_GPS_OR_BEIDOU_CFG_QUERY_ACK: 0xF09A,
    O_FL_LMT_TO_ENB_NTP_SYNC_STATE_QUERY: 0xF09B,
    O_FL_ENB_TO_LMT_NTP_SYNC_STATE_QUERY_ACK: 0xF09C,
    O_FL_LMT_TO_ENB_SRS_CFG_QUERY: 0xF09D,
    O_FL_ENB_TO_LMT_SRS_CFG_QUERY_ACK: 0xF09E,
    O_FL_LMT_TO_ENB_PINX_SWITCH_CFG: 0xF09F,
    O_FL_ENB_TO_LMT_PINX_SWITCH_CFG_ACK: 0xF0A0,
    O_FL_LMT_TO_ENB_DW_FLOW_TYPE_CFG: 0xF0A1,
    O_FL_ENB_TO_LMT_DW_FLOW_TYPE_CFG_ACK: 0xF0A2,
    O_FL_LMT_TO_ENB_DW_FLOW_TYPE_QUERY: 0xF0A3,
    O_FL_ENB_TO_LMT_DW_FLOW_TYPE_QUERY_ACK: 0xF0A4,
    O_FL_LMT_TO_ENB_DW_FLOW_DYN_CFG: 0xF0A5,
    O_FL_ENB_TO_LMT_DW_FLOW_DYN_CFG_ACK: 0xF0A6,
    O_FL_LMT_TO_ENB_MULTI_BAND_POWERDEREASE_CFG: 0xF0A7,
    O_FL_ENB_TO_LMT_MULTI_BAND_POWERDEREASE_ACK: 0xF0A8,
    O_FL_LMT_TO_ENB_MULTI_BAND_POWERDEREASE_QUERY: 0xF0A9,
    O_FL_ENB_TO_LMT_MULTI_BAND_POWERDEREASE_QUERY_ACK: 0xF0AA,
    O_FL_LMT_TO_ENB_GET_RX_PARAMS: 0xF0AB,
    O_FL_ENB_TO_LMT_GET_RX_PARAMS_ACK: 0xF0AC,
    O_FL_LMT_TO_ENB_REM_PORT_QUERY: 0xF0AD,
    O_FL_ENB_TO_LMT_REM_PORT_QUERY_ACK: 0xF0AE,
    O_FL_LMT_TO_ENB_MSG4_POWER_BOOST_CFG: 0xF0AF,
    O_FL_ENB_TO_LMT_MSG4_POWER_BOOST_CFG_ACK: 0xF0B0,
    O_FL_LMT_TO_ENB_MULTI_BAND_RXGAIN_CFG: 0xF0C8,
    O_FL_ENB_TO_LMT_MULTI_BAND_RXGAIN_CFG_ACK: 0xF0C9,
    O_FL_LMT_TO_ENB_MULTI_BAND_RXGAIN_QUERY: 0xF0CA,
    O_FL_ENB_TO_LMT_MULTI_BAND_RXGAIN_QUERY_ACK: 0xF0CB,
    O_FL_LMT_TO_ENB_FTP_GET_PUT_CFG: 0xF0D0,
    O_FL_ENB_TO_LMT_FTP_GET_PUT_CFG_ACK: 0xF0D1,
};

/**
 * LTE设备状态枚举
 * @readonly
 * @enum {{value:number,text:string}} 状态属性
 */
const EnumLTEStatus = {
    // 连接断开
    DISCONNECTED: -1,
    // 连接初始化状态，可进行任何操作
    CONNECTED: 0,
    // 同步或扫频中
    SYNCING: 1,
    // 小区激活中
    ACTIVATING: 2,
    // 小区已激活
    ACTIVATED: 3,
    // 小区去激活中
    DEACTIVATING: 4,
};

/**
 * @typedef {{text:string,value:number|EnumLTEStatus}} LteStatus
 */

/**
 * @type {Map<number|EnumLTEStatus, LteStatus>}
 */
const LteStatusMap = new Map();
LteStatusMap.set(EnumLTEStatus.DISCONNECTED, {text: '连接断开', value: EnumLTEStatus.DISCONNECTED});
LteStatusMap.set(EnumLTEStatus.CONNECTED, {text: '空闲状态', value: EnumLTEStatus.CONNECTED});
LteStatusMap.set(EnumLTEStatus.SYNCING, {text: '同步或扫频中', value: EnumLTEStatus.SYNCING});
LteStatusMap.set(EnumLTEStatus.ACTIVATING, {text: '小区激活中', value: EnumLTEStatus.ACTIVATING});
LteStatusMap.set(EnumLTEStatus.ACTIVATED, {text: '小区已激活', value: EnumLTEStatus.ACTIVATED});
LteStatusMap.set(EnumLTEStatus.DEACTIVATING, {text: '小区去激活中', value: EnumLTEStatus.DEACTIVATING});


class LTEProto {

    constructor() {
        // 消息头结构体
        this.HEAD = new MsgStruct([
            [STRUCT_TYPE.word32Ule, 'FrameHeader'],
            [STRUCT_TYPE.word16Ule, 'MsgType'],
            [STRUCT_TYPE.word16Ule, 'MsgLength'],
            [STRUCT_TYPE.word16Ule, 'Frame'],
            [STRUCT_TYPE.word16Ule, 'SubSysCode'],
        ]);

        /**
         * 消息头长度
         * @type {number}
         */
        this.HEAD_LENGTH = this.HEAD.length;
        /**
         *
         * @type {Map<EnumMsgType, MsgStruct>}
         * @private
         */
        this._MsgStructMap = new Map();
        this._initMsgStructMap()
    }

    /**
     * 获取消息体结构体
     * @param {number} msgType 消息类型
     * @return {MsgStruct} 结构体
     */
    getBodyStruct(msgType) {
        if (!this._MsgStructMap.has(msgType)) {
            // eslint-disable-next-line max-len
            console.warn(`LteProto.getBodyStruct error invalid ${msgType}, please make sure you define this struct before`);
        }
        return this._MsgStructMap.get(msgType);
    }

    /**
     * 心跳指示（eNB -> LMT）
     */
    SYS_INIT_SUCC_IND = new MsgStruct([
        [STRUCT_TYPE.word16Ule, 'CellState'],
        [STRUCT_TYPE.word16Ule, 'Band'],
        [STRUCT_TYPE.word32Ule, 'ulEarfcn'],
        [STRUCT_TYPE.word32Ule, 'dlEarfcn'],
        [STRUCT_TYPE.chars, 'PLMN', [7]],
        [STRUCT_TYPE.word8, 'Bandwidth'],
        [STRUCT_TYPE.word16Ule, 'PCI'],
        [STRUCT_TYPE.word16Ule, 'TAC'],
    ]);

    SYS_ARFCN_CFG = new MsgStruct([
        // 上行频点
        [STRUCT_TYPE.word32Ule, 'ulEarfcn'],
        // 下行频点
        [STRUCT_TYPE.word32Ule, 'dlEarfcn'],
        //
        [STRUCT_TYPE.chars, 'PLMN', [7]],

        /*
        25  5M     tdd+fdd
        50  10M    tdd+fdd
        75  15M    only fdd
        100 20M    tdd+fdd
        */
        [STRUCT_TYPE.word8Ule, 'Bandwidth'],
        // FDD:1 3 7  TDD:38 39 40 41
        [STRUCT_TYPE.word32Ule, 'Band'],
        [STRUCT_TYPE.word16Ule, 'PCI'],
        [STRUCT_TYPE.word16Ule, 'TAC'],
        [STRUCT_TYPE.word32Ule, 'CellId'],
        // 默认值 23
        [STRUCT_TYPE.word16Ule, 'UePMax'],
        // 默认值 20
        [STRUCT_TYPE.word16Ule, 'EnodeBPMax'],
    ]);

    // 采集用户信息上报
    UE_INFO_RPT = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'UeIdType '],
        [STRUCT_TYPE.chars, 'IMSI', [PROTO_CONSTANT.C_MAX_IMSI_LEN]],
        [STRUCT_TYPE.chars, 'IMEI', [PROTO_CONSTANT.C_MAX_IMEI_LEN]],
        // todo 测试使用无符号还是有符号
        [STRUCT_TYPE.word8Ule, 'RSSI'],
        [STRUCT_TYPE.word8Ule, 'STMSIPresent'],
        [STRUCT_TYPE.array, 'S_TMSI', [PROTO_CONSTANT.C_MAX_S_TMSI_LEN, STRUCT_TYPE.word8Ule]],
        [STRUCT_TYPE.array, 'Res', [3, STRUCT_TYPE.word8Ule]],
    ]);

    // 设置基站状态
    SET_ADMIN_STATE_CFG = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'workAdminState'],
    ]);

    // 小区实时状态上报
    ENB_STATE_IND = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'CellStateInd'],
    ]);

    // 发射功率衰减配置
    PWR1_DEREASE_CFG = new MsgStruct([
        // 功率衰减，每步长代表 0.25dB
        [STRUCT_TYPE.word32Ule, 'Pwr1Derease'],
        // 配置值是否保存到配 置，重启之后也保留 1: 重启保留配置 0：设备重启不保留 配置
        [STRUCT_TYPE.word8Ule, 'IsSave'],
        [STRUCT_TYPE.array, 'Res', [3, STRUCT_TYPE.word8Ule]],
    ]);

    // 接受增益和发射功率查询
    POWER_DEREASE_QUERY_ACK = new MsgStruct([
        // 寄存器中的值，实际生 效的值（FDD 模式下仅 在建立完小区查询，该 值有效）
        [STRUCT_TYPE.word8Ule, 'RxGainValueFromReg'],
        // 数据库中的保存值，重 启保留生效的值,
        [STRUCT_TYPE.word8Ule, 'RxGainValueFromMib'],
        // 寄存器中的值，实际生 效的值（FDD 模式下仅 在建立完小区查询，该 值有效）
        [STRUCT_TYPE.word8Ule, 'PowerDereaseValueFromReg'],
        // 数据库中的保存值，重 启保留生效的值
        [STRUCT_TYPE.word8Ule, 'PowerDereaseValueFromMib'],
        // FDD AGC 开关
        [STRUCT_TYPE.word8Ule, 'AgcFlag'],
        // 只在FDD模式下有效， 寄存器中的值，实际生 效的值,该值只有在扫 频完成后，建立小区前 查询有效
        [STRUCT_TYPE.word8Ule, 'SnfRxGainValueFromReg'],
        // eeprom 中的保存值，重 启保留生效的值
        [STRUCT_TYPE.word8Ule, 'SnfRxGainValueFromMib'],
        [STRUCT_TYPE.word8Ule, 'Res'],
    ]);

    // 基站测量UE配置
    MEAS_UE_CFG = new MsgStruct([
        // 0: 持续侦码模式 1: 周期侦码模式 2: 定位模式 3: 管控模式 4: 重定向模式
        [STRUCT_TYPE.word8Ule, 'WorkMode'],
        /*
        0: 名单中的用户执行重定向；名单外的全 部踢回公网
        1: 名单中的用户踢回公网；名单外的全部 重定向
        2: 名单中的用户执行重定向；名单外的 全部吸附在本站
        3: 名单中的用户吸附在本站;名单外的全 部重定向
        4: 所有目标重定向
         */
        [STRUCT_TYPE.word8Ule, 'RedirectSubMode'],
        // 周期模式参数，指示针对同一个 IMSI 的抓号周期
        [STRUCT_TYPE.word16Ule, 'CapturePeriod'],
        // 定位模式，定位的终端 IMSI
        [STRUCT_TYPE.chars, 'IMSI', [PROTO_CONSTANT.C_MAX_IMSI_LEN]],
        // 定位模式，终端测量值的上报周期， 建议设置为 1024ms
        [STRUCT_TYPE.word8Ule, 'MeasReportPeriod'],
        // 定位模式，调度定位终端最大功率 发射开关，需要设置为 0
        [STRUCT_TYPE.word8Ule, 'SchdUeMaxPowerTxFlag'],
        // 定位模式，UE 最大发射功率，最大值不超过wrFLLmtToEnbSysArfcnCfg 配置的 UePMax，建议设置为 23dBm
        [STRUCT_TYPE.word8Ule, 'SchdUeMaxPowerValue'],
        // 定位模式，由于目前都采用SRS方案配合单兵，因此此值需要设置为 disable，否则大用户量时有定位终 端掉线概率。
        [STRUCT_TYPE.word8Ule, 'SchdUeUlFixedPrbSwitch'],
        // 1：非定位终端继续 被本小区吸附,  0：把非定位终端踢 回公网  建议设置为 0
        [STRUCT_TYPE.word8Ule, 'CampOnAllowedFlag'],
        // 定位模式，是否对定位终端建立 SRS 配置。 0: disable 1: enable
        [STRUCT_TYPE.word8Ule, 'SrsSwitch'],
        [STRUCT_TYPE.word8Ule, 'Res'],
        //  0：黑名单子模式； 1：白名单子模式  管控模式的子模式
        [STRUCT_TYPE.word8Ule, 'ControlSubMode'],
        [STRUCT_TYPE.array, 'Res1', [3, STRUCT_TYPE.word8Ule]],
    ]);

    MEAS_INFO_RPT = new MsgStruct([
        // 定位 UE 的测量值  0~255
        [STRUCT_TYPE.word8Ule, 'UeMeasValue'],
        [STRUCT_TYPE.chars, 'IMSI', [PROTO_CONSTANT.C_MAX_IMSI_LEN]],
        [STRUCT_TYPE.word8Ule, 'Res'],
        // 0：R8 1：R10 终端类型
        [STRUCT_TYPE.word8Ule, 'ProtocolVer'],
    ]);

    SYS_MODE_CFG = new MsgStruct([
        // 0:TDD， 1:FDD,. 2: 硬件上区分启动是 TDD 还 FDD
        [STRUCT_TYPE.word32Ule, 'sysMode']
    ]);

    CELL_STATE_INFO = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'CellState'],
    ]);

    ARFCN_MOD = new MsgStruct([
        // 上行频点
        [STRUCT_TYPE.word32Ule, 'ulEarfcn'],
        // 下行频点
        [STRUCT_TYPE.word32Ule, 'dlEarfcn'],
        //
        [STRUCT_TYPE.chars, 'PLMN', [7]],
        // FDD:1 3 7  TDD:38 39 40 41
        [STRUCT_TYPE.word8Ule, 'Band'],
        [STRUCT_TYPE.word32Ule, 'CellId'],
        // 默认值 23
        [STRUCT_TYPE.word16Ule, 'UePMax'],
    ]);

    BASE_INFO_QUERY = new MsgStruct([
        // 查询信息类型
        // 0: 设备型号 1：硬件版本 2：软件版本 3：SN 号 4：MAC 地址 5：uboot 版本号 6：板卡温度
        [STRUCT_TYPE.word32Ule, 'EnbBaseInfoType']
    ]);

    BASE_INFO_QUERY_ACK = new MsgStruct([
        // 查询信息类型
        // 0: 设备型号 1：硬件版本 2：软件版本 3：SN 号 4：MAC 地址 5：uboot 版本号 6：板卡温度
        [STRUCT_TYPE.word32Ule, 'EnbBaseInfoType'],
        [STRUCT_TYPE.chars, 'EnbBaseInfo', [100]],
    ]);

    REBOOT_CFG = new MsgStruct([
        // 0：reboot 后自动激活小区 1：reboot 后不自激活小区
        [STRUCT_TYPE.word32Ule, 'SelfActiveCfg']
    ]);

    MULTI_BAND_POWERDEREASE_QUERY_ACK = new MsgStruct([
            [STRUCT_TYPE.word8, 'NumElem'],
            [STRUCT_TYPE.chars, 'Reserved', [3]],
            [STRUCT_TYPE.array, 'bandPwrdereaseMap', [
                32,
                STRUCT_TYPE.struct,
                MsgStruct.CustomStruct().word8('band').word8('Pwrderease').chars('Reserved', 2)
            ]]
        ]
    );

    SYS_RXGAIN_CFG = new MsgStruct([
        // 接收增益 0~127(dB)
        [STRUCT_TYPE.word32Ule, 'RxGain'],
        // 0: notsave, 1:save
        [STRUCT_TYPE.word8, 'RxGainSaveFlag'],
        // 0：rx 1：snf  配置该增益是修改 rx 口 增益还是 snf口增益 注：仅 FDD 有效 对于 TDD，该字段无意 义，基站不做判断
        [STRUCT_TYPE.word8, 'RxOrSnfFlag'],
        [STRUCT_TYPE.chars, 'Res', [3]],
    ]);

    SELFCFG_CELLPARA_REQ = new MsgStruct([
        // 38,39,40,41 （ TDD 频段） 255 指定自配置的频段
        [STRUCT_TYPE.word8, 'SelfBand'],
        [STRUCT_TYPE.chars, 'Res', [3]],
    ]);

    _remInfoPrtMain = new MsgStruct([
        // 采集的小区数目 1~8
        [STRUCT_TYPE.word16Ule, 'collectionCellNum'],
        // 扫频信息标识/同 步信息标识 0：扫频 1：同步
        [STRUCT_TYPE.word16Ule, 'collectionTypeFlag'],
    ]);

    _wrFLCellInfo = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'dlEarfcn'],
        [STRUCT_TYPE.word16Ule, 'PCI'],
        [STRUCT_TYPE.word16Ule, 'TAC'],
        [STRUCT_TYPE.word16Ule, 'PLMN'],
        // TDD 子帧配置值
        [STRUCT_TYPE.word16Ule, 'TddSfAssignment'],
        [STRUCT_TYPE.word32Ule, 'CellId'],
        // 本小区频点优先级 1~7
        [STRUCT_TYPE.word32Ule, 'Priority'],
        // 下行参考信号强度 0~97
        [STRUCT_TYPE.word8, 'RSRP'],
        // LTE 参考信号接收质量 0~33
        [STRUCT_TYPE.word8, 'RSRQ'],
        // 6, 15, 25, 50, 75, 100
        [STRUCT_TYPE.word8, 'Bandwidth'],
        // TDD 特殊子帧配置
        [STRUCT_TYPE.word8, 'TddSpecialSfPatterns'],
    ]);

    _wrIntraFreqNeighCellInfo = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'dlEarfcn'],
        [STRUCT_TYPE.word16Ule, 'PCI'],
        // indicate a cell specific offset. 取值依次对应 dB 如下所示：
        // ENUMERATED  {dB-24=0, dB-22, dB-20, dB-18, dB-16, dB-14, dB-12, dB-10, dB-8, dB-6,dB-5, dB-4, dB-3, dB-2,
        // dB-1, dB0, dB1, dB2, dB3, dB4, dB5,dB6, dB8, dB10, dB12, dB14, dB16, dB18, dB20, dB22, dB24}
        [STRUCT_TYPE.word16Ule, 'QoffsetCell'],
    ]);

    _stFlLteIntreFreqLst = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'dlEarfcn'],
        [STRUCT_TYPE.word8, 'cellReselectPriotry'],
        [STRUCT_TYPE.word8, 'Q_offsetFreq'],
        [STRUCT_TYPE.word16Ule, 'measBandWidth'],
        // 邻区数目 0~ MAX_INTER_FREQ_N GH
        [STRUCT_TYPE.word32Ule, 'interFreqNghNum'],
    ]);

    _wrFLInterNeighCellInfo = new MsgStruct([
        [STRUCT_TYPE.word16Ule, 'PCI'],
        [STRUCT_TYPE.word16Ule, 'QoffsetCell'],
    ]);

    /**
     * @type {MsgStruct}
     */
    REM_INFO_RPT = {
        length: 0,
        /**
         * @param remInfoBuffer
         */
        // eslint-disable-next-line no-unused-vars
        getObj: (remInfoBuffer) => {
            try {
                const totalLen = remInfoBuffer.length;
                let parsedLen;
                const stCollCellInfoLen = this._remInfoPrtMain.length;
                let parsingBuffer = remInfoBuffer.slice(0, stCollCellInfoLen);
                const mRemInfoPrtMain = this._remInfoPrtMain.getObj(parsingBuffer);
                parsedLen = stCollCellInfoLen;
                const stCollCellInfo = [];
                while (totalLen > parsedLen) {
                    /**
                     * wrFLCollectionCellInfo
                     * @type {{stCellInfo,IntraFreqNeighCellNum:Number,stIntraFreqNeighCellInfo:[],
                     * InterFreqNum:Number,stInterFreqLstInfo:[]}}
                     */
                    const mWrFLCollectionCellInfo = {
                        stCellInfo: [],
                        IntraFreqNeighCellNum: 0,
                        stIntraFreqNeighCellInfo: [],
                        InterFreqNum: 0,
                        stInterFreqLstInfo: []
                    };
                    const wrFLCellInfoLen = this._wrFLCellInfo.length;
                    parsingBuffer = remInfoBuffer.slice(parsedLen, parsedLen + wrFLCellInfoLen);
                    mWrFLCollectionCellInfo.stCellInfo = this._wrFLCellInfo.getObj(parsingBuffer);// 解析wrFLCellInfo
                    if (mWrFLCollectionCellInfo.stCellInfo.Priority > 7) {
                        mWrFLCollectionCellInfo.stCellInfo.Priority = 0;
                    }
                    parsedLen += wrFLCellInfoLen;
                    parsingBuffer = remInfoBuffer.slice(parsedLen, parsedLen + 4);// 解析NeighNum
                    const NeighNum = new Int32Array(parsingBuffer)[0];
                    mWrFLCollectionCellInfo.IntraFreqNeighCellNum = NeighNum;
                    parsedLen += 4;
                    const mStIntraFreqNeighCellInfo = [];
                    for (let pos = 0; pos < NeighNum; pos += 1) { // 解析stIntraFreqNeighCellInf
                        const wrFLNeighCellInfoLen = this._wrIntraFreqNeighCellInfo.length;
                        parsingBuffer = remInfoBuffer.slice(parsedLen, parsedLen + wrFLNeighCellInfoLen);
                        mStIntraFreqNeighCellInfo.push(this._wrIntraFreqNeighCellInfo.getObj(parsingBuffer));
                        parsedLen += wrFLCellInfoLen;
                    }
                    mWrFLCollectionCellInfo.stIntraFreqNeighCellInfo = mStIntraFreqNeighCellInfo;
                    parsingBuffer = remInfoBuffer.slice(parsedLen, parsedLen + 4);// 解析NumOfInterFreq
                    const NumOfInterFreq = new Int32Array(parsingBuffer)[0];
                    mWrFLCollectionCellInfo.InterFreqNum = NumOfInterFreq;
                    parsedLen += 4;
                    const mstInterFreqLstInfo = [];
                    for (let pos = 0; pos < NumOfInterFreq; pos += 1) { // 解析 stInterFreqLstInfo
                        const stFlLteIntreFreqLstLen = this._stFlLteIntreFreqLst.length;
                        parsingBuffer = remInfoBuffer.slice(parsedLen, parsedLen + stFlLteIntreFreqLstLen);
                        const stInterFreqLstInfo = this._stFlLteIntreFreqLst.getObj(parsingBuffer);
                        parsedLen += stFlLteIntreFreqLstLen;
                        stInterFreqLstInfo.stInterFreqNeighCell = [];
                        for (let i = 0; i < stInterFreqLstInfo.interFreqNghNum; i += 1) { // 解析 stInterFreqNeighCell
                            const stInterFreqNeighCellLen = this._wrFLInterNeighCellInfo.length;
                            parsingBuffer = remInfoBuffer.slice(parsedLen, parsedLen + stInterFreqNeighCellLen);
                            stInterFreqLstInfo.stInterFreqNeighCell.push(
                                this._wrFLInterNeighCellInfo.getObj(parsingBuffer));
                            parsedLen += stInterFreqNeighCellLen;
                        }
                        mstInterFreqLstInfo.push(stInterFreqLstInfo);
                    }
                    mWrFLCollectionCellInfo.stInterFreqLstInfo = mstInterFreqLstInfo;
                    stCollCellInfo.push(JSON.parse(JSON.stringify(mWrFLCollectionCellInfo)));
                    console.debug('########################################');
                    console.debug(JSON.stringify(mWrFLCollectionCellInfo))
                    console.debug('########################################')
                    // 解析完成先退出 防止粘包
                    if (stCollCellInfo.length === mRemInfoPrtMain.collectionCellNum) {
                        break;
                    }
                }
                mRemInfoPrtMain.stCollCellInfo = stCollCellInfo;
                return mRemInfoPrtMain;
            } catch (e) {
                console.error(`parsing rem info prt failed, err = `, e);
                return null;
            }
        }
    };

    REM_CFG = new MsgStruct([
        [STRUCT_TYPE.word32Ule, 'wholeBandRem'],
        [STRUCT_TYPE.word32Ule, 'sysEarfcnNum'],
        [STRUCT_TYPE.array, 'sysEarfcn', [10, STRUCT_TYPE.word32Ule]],
    ]);

    // 黑白名单查询
    CONTROL_LIST_QUERY = new MsgStruct([
        // 0：查询黑名单 1：查询白名单
        [STRUCT_TYPE.word8, 'ControlListType'],
        [STRUCT_TYPE.array, 'Res', [3, STRUCT_TYPE.word8Ule]]
    ]);

    // 黑白名单查询回复
    CONTROL_LIST_QUERY_ACK = {
        getObj(buffer) {
            const preBodyBuf = buffer.slice(0, 2);
            const preBody = new MsgStruct([
                // 0:黑名单 1:白名单
                [STRUCT_TYPE.word8, 'ControlListProperty'],
                // 名 单 中 含 有 的 UE 数目 0~ C_MAX_CONTROL_LIST_UE_N UM
                [STRUCT_TYPE.word8, 'ControlListUENum'],

            ]).getObj(preBodyBuf);
            const body = {
                ...preBody,
                ControlListUEId: [],
            };
            if (preBody.ControlListUENum > 0) {
                const leftBodyBuff = buffer.slice(2, buffer.length);
                body.ControlListUEId = Object.values(new MsgStruct([
                    // IMSI 字符串，如： "46001111111111 1" 非有效 UE ID 为 '\0'。 (该字段为固定长 度)
                    [STRUCT_TYPE.array, 'ControlListUEId',
                        [preBody.ControlListUENum, STRUCT_TYPE.chars, PROTO_CONSTANT.C_MAX_IMSI_LEN]],
                ]).getObj(leftBodyBuff).ControlListUEId);
            }
            return body;
        },
    };

    // 黑白名单列表配置
    CONTROL_UE_LIST_CFG = {
        getBuff(obj) {
            return new MsgStruct([
                // 0: 在管控名单中 删除用户 1: 在管控名单中 添加用户
                [STRUCT_TYPE.word8, 'ControlMovement'],
                // 添加/删除 UE 数目 0~C_MAX_CONTROL_PROC_UE_NUM
                [STRUCT_TYPE.word8, 'ControlUENum'],
                // 0：添加/删除黑名 单用户 1：添加/删除白名 单用户
                [STRUCT_TYPE.word8, 'ControlUEProperty'],
                [STRUCT_TYPE.array, 'ControlUEIdentity', [obj.ControlUENum, STRUCT_TYPE.chars,
                    PROTO_CONSTANT.C_MAX_IMSI_LEN]],
                // 0：该字段不起作用 1：删除所有黑名单用户 2:删除所有白名单 用户 3：删除所有黑白名 单用户
                [STRUCT_TYPE.word8, 'ClearType'],
                // 0：#cause15 （追 踪区不允许接入） 1： #cause12 (追踪 区无合适小区) 2: #cause3（无效 终端） 3：#cause13 4：#cause22
                [STRUCT_TYPE.word8, 'RejCause'],
                [STRUCT_TYPE.word8, 'Res'],
            ]).getBuff(obj);
        }
    };

    // 黑白名单列表配置回复
    CONTROL_UE_LIST_CFG_ACK = {
        getObj(buffer) {
            const preBodyBuf = buffer.slice(0, 2);
            const preBody = new MsgStruct([
                // 4:管控名单清除成 功； 3：管控名单配置中 含有无效值； 2：存在用户未添加 成功； 1：存在用户未删除 成功； 0：配置成功
                [STRUCT_TYPE.word8, 'CfgResult'],
                // 未操作成功 UE 数目
                [STRUCT_TYPE.word8, 'IgnoreUENum'],
            ]).getObj(preBodyBuf);
            const body = {
                ...preBody,
                IgnoreUEList: []
            };
            if (preBody.IgnoreUENum > 0) {
                const leftBodyBuff = buffer.slice(2, buffer.length);
                body.IgnoreUEList = Object.values(new MsgStruct([
                    [STRUCT_TYPE.array, 'IgnoreUEList', [preBody.IgnoreUENum, STRUCT_TYPE.chars,
                        PROTO_CONSTANT.C_MAX_IMSI_LEN]]
                ]).getObj(leftBodyBuff).IgnoreUEList);
            }
            return body;
        }
    };

    GPS_LOCATION_QUERY_ACK = new MsgStruct([
        [STRUCT_TYPE.word32Ule,'Paraoff1'],
        // 经度lng
        [STRUCT_TYPE.doublele,'Longitude'],
        // 纬度lat
        [STRUCT_TYPE.doublele,'Latitude'],
        [STRUCT_TYPE.doublele,'Altitude'],
        [STRUCT_TYPE.word32Ule,'RateOfPro'],
        [STRUCT_TYPE.word32Ule,'Paraoff2'],
    ]);

    COMMON_SET_ACK = new MsgStruct([
        // 配置结果 0：成功  >0 错误编号
        [STRUCT_TYPE.word32Ule, 'CfgResult'],
    ]);

    COMMON_QUERY = new MsgStruct([]);

    /**
     * 初始化map
     * @private
     */
    _initMsgStructMap() {
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SYS_INIT_SUCC_IND, this.SYS_INIT_SUCC_IND);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SYS_INIT_SUCC_RSP, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SYS_ARFCN_CFG, this.SYS_ARFCN_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_UE_INFO_RPT, this.UE_INFO_RPT);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SYS_ARFCN_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SET_ADMIN_STATE_CFG, this.SET_ADMIN_STATE_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SET_ADMIN_STATE_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_ENB_STATE_IND, this.ENB_STATE_IND);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SYS_PWR1_DEREASE_CFG, this.PWR1_DEREASE_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SYS_PWR1_DEREASE_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_RXGAIN_POWER_DEREASE_QUERY, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_RXGAIN_POWER_DEREASE_QUERY_ACK,
          this.POWER_DEREASE_QUERY_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_GET_ARFCN, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_MEAS_UE_CFG, this.MEAS_UE_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_MEAS_UE_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_ARFCN_IND, this.SYS_ARFCN_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_MEAS_UE_CFG_QUERY, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_MEAS_UE_CFG_QUERY_ACK, this.MEAS_UE_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_MEAS_INFO_RPT, this.MEAS_INFO_RPT);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SYS_MODE_CFG, this.SYS_MODE_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SYS_MODE_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_CELL_STATE_INFO_QUERY, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_CELL_STATE_INFO_QUERY_ACK, this.CELL_STATE_INFO);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SYS_ARFCN_MOD, this.ARFCN_MOD);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SYS_ARFCN_MOD_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_BASE_INFO_QUERY, this.BASE_INFO_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_BASE_INFO_QUERY_ACK, this.BASE_INFO_QUERY_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_REBOOT_CFG, this.REBOOT_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_REBOOT_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_MULTI_BAND_POWERDEREASE_QUERY_ACK,
            this.MULTI_BAND_POWERDEREASE_QUERY_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_MULTI_BAND_POWERDEREASE_QUERY, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SYS_RxGAIN_CFG, this.SYS_RXGAIN_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_SYS_RxGAIN_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ, this.SELFCFG_CELLPARA_REQ);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ_ACK, this.COMMON_SET_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_REM_INFO_RPT, this.REM_INFO_RPT);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_REM_CFG, this.REM_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_CONTROL_LIST_QUERY, this.CONTROL_LIST_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_CONTROL_LIST_QUERY_ACK, this.CONTROL_LIST_QUERY_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_CONTROL_UE_LIST_CFG, this.CONTROL_UE_LIST_CFG);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_CONTROL_UE_LIST_CFG_ACK, this.CONTROL_UE_LIST_CFG_ACK);
        this._MsgStructMap.set(EnumMsgType.O_FL_LMT_TO_ENB_GPS_LOCATION_QUERY, this.COMMON_QUERY);
        this._MsgStructMap.set(EnumMsgType.O_FL_ENB_TO_LMT_GPS_LOCATION_QUERY_ACK, this.GPS_LOCATION_QUERY_ACK);
    }
}

/**
 * @enum {number}
 */
export const EnumEnbState = {
    // 空口同步成功
    WR_FL_ENB_STATE_AIR_SYNC_SUCC: 0,
    // 空口同步失败
    WR_FL_ENB_STATE_AIR_SYNC_FAIL: 1,
    // GPS 同步成功
    WR_FL_ENB_STATE_GPS_SYNC_SUCC: 2,
    // GPS 同步失败
    WR_FL_ENB_STATE_GPS_SYNC_FAIL: 3,
    // 扫频成功
    WR_FL_ENB_STATE_SCAN_SUCC: 4,
    // 扫频失败
    WR_FL_ENB_STATE_SCAN_FAIL: 5,
    // 小区建立成功
    WR_FL_ENB_STATE_CELL_SETUP_SUCC: 6,
    // 小区建立失败
    WR_FL_ENB_STATE_CELL_SETUP_FAIL: 7,
    // 小区去激活
    WR_FL_ENB_STATE_CELL_INACTIVE: 8,
    // 空口同步中
    WR_FL_ENB_STATE_AIR_SYNC_ON_GOING: 9,
    // GPS 同步中
    WR_FL_ENB_STATE_GPS_SYNC_ON_GOING: 10,
    // 扫频中
    WR_FL_ENB_STATE_SCAN_ON_GOING: 11,
    // 小区建立中
    WR_FL_ENB_STATE_CELL_SETUP_ON_GOING: 12,
    // 小区去激活中
    WR_FL_ENB_STATE_INACTIVE_ON_GOING: 13,
    // 无效状态
    WR_FL_ENB_STATE_INVALID: 0xFFFF,
};

/**
 * @type {Map<EnumEnbState|number, {value:number,text:string,CellState:number|EnumLTEStatus}>}
 */
const EnbStateMap = new Map();
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_SUCC, {
    value: 0,
    text: '空口同步成功',
    CellState: EnumLTEStatus.ACTIVATING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_FAIL, {
    value: 1,
    text: '空口同步失败',
    CellState: EnumLTEStatus.ACTIVATING
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_SUCC, {
    value: EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_SUCC,
    text: 'GPS同步成功',
    CellState: EnumLTEStatus.DEACTIVATING
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_FAIL, {
    value: EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_FAIL,
    text: 'GPS同步失败',
    CellState: EnumLTEStatus.ACTIVATING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_SCAN_SUCC, {
    value: EnumEnbState.WR_FL_ENB_STATE_SCAN_SUCC,
    text: '扫频成功',
    CellState: EnumLTEStatus.CONNECTED,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_SCAN_FAIL, {
    value: EnumEnbState.WR_FL_ENB_STATE_SCAN_FAIL,
    text: '扫频失败',
    CellState: EnumLTEStatus.CONNECTED,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_SUCC, {
    value: EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_SUCC,
    text: '小区建立成功',
    CellState: EnumLTEStatus.ACTIVATED,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_FAIL, {
    value: EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_FAIL,
    text: '小区建立失败',
    CellState: EnumLTEStatus.CONNECTED,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_CELL_INACTIVE, {
    value: EnumEnbState.WR_FL_ENB_STATE_CELL_INACTIVE,
    text: '小区去激活',
    CellState: EnumLTEStatus.CONNECTED,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_ON_GOING, {
    value: EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_ON_GOING,
    text: '空口同步中',
    CellState: EnumLTEStatus.SYNCING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_ON_GOING, {
    value: EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_ON_GOING,
    text: 'GPS同步中',
    CellState: EnumLTEStatus.SYNCING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_SCAN_ON_GOING, {
    value: EnumEnbState.WR_FL_ENB_STATE_SCAN_ON_GOING,
    text: '扫频中',
    CellState: EnumLTEStatus.SYNCING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_ON_GOING, {
    value: EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_ON_GOING,
    text: '小区建立中',
    CellState: EnumLTEStatus.ACTIVATING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_INACTIVE_ON_GOING, {
    value: EnumEnbState.WR_FL_ENB_STATE_INACTIVE_ON_GOING,
    text: '小区去激活中',
    CellState: EnumLTEStatus.DEACTIVATING,
});
EnbStateMap.set(EnumEnbState.WR_FL_ENB_STATE_INVALID, {
    value: EnumEnbState.WR_FL_ENB_STATE_INVALID,
    text: '无效状态',
    CellState: EnumLTEStatus.CONNECTED,
});

/**
 *
 * @enum {number} 系统带宽枚举
 */
const EnumBandwidth = {
    M_5: 25,
    M_10: 50,
    M_15: 75,
    M_20: 100,
    // NOT_SUPPORT: NaN
};

/**
 *
 * @type {Map<number|EnumBandwidth, {value:number,text:string}>}
 */
const BandwidthMap = new Map();
BandwidthMap.set(EnumBandwidth.M_5, {value: EnumBandwidth.M_5, text: '5M'});
BandwidthMap.set(EnumBandwidth.M_10, {value: EnumBandwidth.M_10, text: '10M'});
BandwidthMap.set(EnumBandwidth.M_15, {value: EnumBandwidth.M_15, text: '15M'});
BandwidthMap.set(EnumBandwidth.M_20, {value: EnumBandwidth.M_20, text: '20M'});
// BandwidthMap.set(EnumBandwidth.NOT_SUPPORT, {value: EnumBandwidth.NOT_SUPPORT, text: '暂不支持此BAND'});

// todo 组装整机后确定TDD、FDD两款板子支持的Band
/**
 * LTE 板子支持建立的小区列表
 * @enum {{BAND_FDD: number[], BAND_TDD: number[]}}
 */
const EnumBandSupList = {
    BAND_FDD: [1, 3, 5, 8],
    BAND_TDD: [34, 38, 39, 40, 41],
};

/**
 * 工作模式枚举
 * @enum {number} EnumSysMode
 */
export const EnumSysMode = {
    TDD: 0x00FF,
    FDD: 0xFF00,
};

/**
 *
 * @type {Map<number|EnumSysMode, {value:number,text:string}>}
 */
export const SysModeMap = new Map();
SysModeMap.set(EnumSysMode.FDD, { value: EnumSysMode.FDD, text: 'FDD' });
SysModeMap.set(EnumSysMode.TDD, { value: EnumSysMode.TDD, text: 'TDD' });

/**
 * @enum {number} EnumWorkMode
 */
export const EnumWorkMode = {
    // 持续侦码模式
    CONTINUED_MODE: 0,
    // 周期侦码模式
    PERIOD_MODE: 1,
    // 定位模式
    LOCATION_MODE: 2,
    // 管控模式
    CONTROL_MODE: 3,
    // 重定向模式
    REDIRECT_MODE: 4,
};

/**
 * @type {Map<EnumWorkMode|number, {value:EnumWorkMode|number,text:string}>}
 */
export const WorkModeMap = new Map();
WorkModeMap.set(EnumWorkMode.CONTINUED_MODE, { value: EnumWorkMode.CONTINUED_MODE, text: '持续侦码模式' });
WorkModeMap.set(EnumWorkMode.PERIOD_MODE, { value: EnumWorkMode.PERIOD_MODE, text: '周期侦码模式' });
WorkModeMap.set(EnumWorkMode.LOCATION_MODE, { value: EnumWorkMode.LOCATION_MODE, text: '定位模式' });
WorkModeMap.set(EnumWorkMode.CONTROL_MODE, { value: EnumWorkMode.CONTROL_MODE, text: '管控模式' });
WorkModeMap.set(EnumWorkMode.REDIRECT_MODE, { value: EnumWorkMode.REDIRECT_MODE, text: '重定向模式' });

/**
 * 定位模式 终端测量值的上报周期
 * @enum {number} EnumMeasReportPeriod
 */
export const EnumMeasReportPeriod = {
    MS_120: 0,
    MS_240: 1,
    MS_480: 2,
    MS_640: 3,
    MS_1024: 4,
    MS_2048: 5,
};

/**
 * @type {Map<EnumMeasReportPeriod|number, {value:EnumMeasReportPeriod|number,text:string}>}
 */
export const MeasReportPeriodMap = new Map();
MeasReportPeriodMap.set(EnumMeasReportPeriod.MS_120, { value: EnumMeasReportPeriod.MS_120, text: '120ms' });
MeasReportPeriodMap.set(EnumMeasReportPeriod.MS_240, { value: EnumMeasReportPeriod.MS_240, text: '240ms' });
MeasReportPeriodMap.set(EnumMeasReportPeriod.MS_480, { value: EnumMeasReportPeriod.MS_480, text: '480ms' });
MeasReportPeriodMap.set(EnumMeasReportPeriod.MS_640, { value: EnumMeasReportPeriod.MS_640, text: '640ms' });
MeasReportPeriodMap.set(EnumMeasReportPeriod.MS_1024, { value: EnumMeasReportPeriod.MS_1024, text: '1024ms' });
MeasReportPeriodMap.set(EnumMeasReportPeriod.MS_2048, { value: EnumMeasReportPeriod.MS_2048, text: '2048ms' });

/**
 * 小区配置指令参数
 * @type {{DEACTIVE: number, ACTIVE_SYNC: number, ACTIVE_NOT_SYNC: number}}
 */
export const EnumAdminStateSet = {
    DEACTIVE: 0,
    ACTIVE_NOT_SYNC: 1,
    ACTIVE_SYNC: 2,
};

/**
 * @enum {number} EnumProtocolVer
 */
const EnumProtocolVer = {
    R8: 0,
    R10: 1,
};

/**
 * 终端类型
 * @type {Map<EnumProtocolVer|number, {value:number|EnumProtocolVer,text:string}>}
 */
const ProtocolVerMap = new Map();
ProtocolVerMap.set(EnumProtocolVer.R8, { value: EnumProtocolVer.R8, text: 'R8' });
ProtocolVerMap.set(EnumProtocolVer.R10, { value: EnumProtocolVer.R10, text: 'R10' });

/**
 *
 * @param {number} dlEarfcn 下行频点
 * @param {number|EnumSysMode} sysMode 工作模式
 * @return {number} 上行频点
 */
export const getUlEarfcn = (dlEarfcn, sysMode) => {
    if (sysMode === EnumSysMode.FDD) {
        return 18000 + dlEarfcn;
    }
    return 255;
};

export const EnumBaseInfoType = {
    // 0: 设备型号 1：硬件版本 2：软件版本 3：SN 号 4：MAC 地址 5：uboot 版本号 6：板卡温度
    DEVICE_MODEL: 0,
    HARDWARE_VERSION: 1,
    SOFTWARE_VERSION: 2,
    BOARDSN: 3,
    MAC: 4,
    UBOOT_VERSION: 5,
    BOARD_TEMPERATURE: 6,
};

/**
 * @typedef {{PLMNList: number[], frequencyArrange: number[][], text: string,key:number}} OperatorInfo
 */

/**
 * @enum {OperatorInfo} 运营商信息枚举
 */
export const OperatorInfos = {
    // 中国移动
    CMCC: {
        frequencyRange: [
            [939, 949],
            [1805, 1830],
            [1880, 1920],
            [2010, 2025],
            [2320, 2370],
            [2515, 2675],
        ],
        PLMNList: [46000],
        text: '中国移动',
        shortHand: '移动',
        key: 0,
    },
    // 中国联通
    CUCC: {
        frequencyRange: [
            [949, 960],
            [1830, 1860],
            [2130, 2170],
            [2300, 2320],
        ],
        PLMNList: [46001],
        text: '中国联通',
        shortHand: '联通',
        key: 1,
    },
    // 中国电信
    CTCC: {
        frequencyRange: [
            [869, 894],
            [925, 938],
            [1860, 1880],
            [2110, 2130],
            [2370, 2390],
        ],
        PLMNList: [46011],
        text: '中国电信',
        shortHand: '电信',
        key: 2,
    },
    OTHER: {
        frequencyRange: [],
        PLMNList: [],
        text: '未知',
        shortHand: '未知',
        key: -1,
    },
    ALL: {
        frequencyRange: [],
        PLMNList: [],
        text: '全部运营商',
        shortHand: '全部',
        key: 99,
    },
};

export const DEFAULT_CELL_INFO = {
    Frame: SysModeMap.get(EnumSysMode.TDD),
    Band: NaN,
    ulEarfcn: NaN,
    dlEarfcn: NaN,
    PLMN: '',
    Bandwidth: BandwidthMap.get(EnumBandwidth.M_20),
    PCI: NaN,
    RxGainValueFromReg: NaN,
    RxGainValueFromMib: NaN,
    PowerDereaseValueFromReg: NaN,
    PowerDereaseValueFromMib: NaN,
    AgcFlag: NaN,
    SnfRxGainValueFromReg: NaN,
    SnfRxGainValueFromMib: NaN,
    MeasUECfg: {
        WorkMode: EnumWorkMode.CONTINUED_MODE,
        RedirectSubMode: 4,
        CapturePeriod: 5,
        IMSI: '',
        MeasReportPeriod: EnumMeasReportPeriod.MS_120,
        SchdUeMaxPowerTxFlag: 0,
        SchdUeMaxPowerValue: DEFAULT_UePMax,
        SchdUeUlFixedPrbSwitch: 0,
        CampOnAllowedFlag: 0,
        SrsSwitch: 0,
        ControlSubMode: 0,
    },
    // 状态初始化始终为断开连接
    status: LteStatusMap.get(EnumLTEStatus.DISCONNECTED),
};

export const AUTO_MODING_BAN_MSGTYPE_LIST = [
    EnumMsgType.O_FL_LMT_TO_ENB_SYS_ARFCN_CFG,
    EnumMsgType.O_FL_LMT_TO_ENB_SET_ADMIN_STATE_CFG,
    EnumMsgType.O_FL_LMT_TO_ENB_SYS_MODE_CFG,
    EnumMsgType.O_FL_LMT_TO_ENB_MEAS_UE_CFG,
];

export const EnumPwr1DereaseLevel = {
    // 4*6
    high: 0,
    // 4*3
    mid: 12,
    low: 24,
};

/**
 *
 * @param {string} host
 * @param {EnumSysMode} Frame
 */
export const getAllowedEarfcn = (host, Frame) => {
    if (host.includes('2.53')) {
        if (Frame === EnumSysMode.TDD) {
            return [38400, 38544, 36275];
        }

            return [1650, 1825];

    }
    if (host.includes('2.54')) {
        if (Frame === EnumSysMode.TDD) {
            return [37900, 38098, 38950, 39148, 40738, 40940];
        }

            return [100, 2452, 3650];

    }
    return [];
};

export const getNetScanList = (host, Frame) => {
    if (host.includes('2.53')) {
        if (Frame === EnumSysMode.TDD) {
            return [38400, 38544, 36275];
        }

        return [1650, 1825, 1850, 1307];

    }
    if (host.includes('2.54')) {
        if (Frame === EnumSysMode.TDD) {
            return [37900, 38098, 38950, 39148, 40738, 40940, 39450, 38750];
        }

        return [100, 2452, 3650, 3515];

    }
    return [];
};

export function getBandLimit(host, frame = EnumSysMode.TDD) {
    if (host.includes('2.53')) {
        if (frame === EnumSysMode.TDD) {
            return [39, 34];
        }
        return [3]
    }
    if (host.includes('2.54')) {
        if (frame === EnumSysMode.TDD) {
            return [38, 40, 41];
        }
        return [1, 5, 8]
    }
    return [];
}

export const EnumRxGainLevel = {
    HIGH: { MAX: 54, DAFAULT: 42, MIN: 41, KEY: 'far', NAME: '远' },
    MID: { MAX: 40, DAFAULT: 30, MIN: 23, KEY: 'mid', NAME: '中' },
    LOW: { MAX: 22, DAFAULT: 11, MIN: 5, KEY: 'close', NAME: '近' },
};

export {
    FRAME_HEAD_BE_ARR,
    FRAME_HEAD_LE_ARR,
    LTEProto,
    EnumLTEStatus,
    EnumMsgType,
    LteStatusMap,
    DEFAULT_UePMax,
    DEFAUTL_EnodeBPMax,
    EnumBandSupList,
    EnumBandwidth,
    BandwidthMap,
    EnbStateMap,
};
