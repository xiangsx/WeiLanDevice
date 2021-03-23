import moment from 'moment';
import {
    AUTO_MODING_BAN_MSGTYPE_LIST,
    BandwidthMap,
    DEFAULT_RXGAIN,
    DEFAULT_UePMax,
    DEFAUTL_EnodeBPMax,
    EnbStateMap,
    EnumBandwidth,
    EnumBaseInfoType,
    EnumEnbState,
    EnumLTEStatus,
    EnumMeasReportPeriod,
    EnumMsgType,
    EnumSysMode,
    EnumWorkMode,
    FRAME_HEAD,
    getNetScanList,
    getUlEarfcn,
    LTEProto,
    LteStatusMap,
    OperatorInfos,
    SysModeMap,
} from '../define/LTEProto';
// eslint-disable-next-line no-unused-vars
import {
    BAND_LIMIT_MAP,
    DEFAULT_AIR_SYNC_FAILED_RETRY_TIMES,
    DEFAULT_AUTO_MOD_EARFCN_INTERVAL,
    IF_LIMIT_ADDRESS_CONNECT,
    LIMIT_ADDRESS_LIST,
    LOCATION_TARGET_LOST_START_AUTO_MOD_EARFCN,
    LTE_ACK_CHECK_INTERVAL,
    LTE_ACK_TIMEOUT,
    LTE_DEFAULT_REBOOT_WAIT_TIMEOUT,
    LTE_LOCATION_PRT_OVERTIME,
    TEMPERATURE_ALERT,
    TIME_FORMAT,
    UE_CACHE_INTERVAL,
} from '../define/constants';
import {getCarrieroperator} from '../utils/imsiUtil';
import {getOtherDataByEarfcn, getRandomCellID, getRandomTAC} from '../utils/ArfcnUtils';
import {EnumErrorDefine} from "../../define/error";

/**
 *
 * @type {Map<string, LTEControllers>}
 */
const LteCtrlMap = new Map();

const EnumCBKeyType = {
    TRANSID: 0,
    MSGTYPE: 1,
};

// eslint-disable-next-line no-unused-vars
export class LTEControllers {
    /**
     * @param {string} host
     * @param {object} cellInfo
     */
    constructor(host, cellInfo = {}) {
        /**
         *
         * @type {TCPClient}
         * @private
         */
        this._lteClient = undefined;
        this._lteProto = new LTEProto();
        this.host = host;
        this._initLog();
        /**
         * 针对LTE 板子接口设计的消息缓冲队列，解析分包消息
         * @type {Map<number, Array>}
         */
        this.cacheMsg = new Map();
        // 动态增长的消息缓冲，防止粘包
        this.cacheBuff = Buffer.allocUnsafe(0);
        this.ueListCache = [];
        this.saveProcess = undefined;
        this._TransID = 1;
        this._LTETransID = 1;
        this.autoModEarfcnProcess = setInterval;
        // 75度处理
        this.temperatureAlertTimes75 = 0;
        /**
         * 小区详细信息
         * @typedef  {{
         * Frame: {value: number, text: string},
         * dlEarfcn: number,
         * ulEarfcn: number,
         * Bandwidth: {value: number, text: string},
         * PCI: number,
         * TAC: number,
         * PLMN: string,
         * Band: number,
         * status: {text: string, value: (number|EnumLTEStatus)},
         * MeasUECfg: {},
         * dlEarfcnList:Array
         * blackControlList:Array
         * whiteControlList:Array
         * earfcnAutoModing:boolean
         * modInterval:number
         * bandPwrdereaseMap:Object
         * Pwr1Derease:number
         * settingCellInfo:{
         *     ulEarfcn:number
         *     dlEarfcn:number
         *     Band:number
         *     PLMN:number
         *     CellId:number
         *     UePMax:number
         * }
         * }} CellInfo
         */

        /**
         * @type {CellInfo} 小区信息
         */
        this._cellInfo = {
            Frame: SysModeMap.get(EnumSysMode.FDD),
            Band: 0,
            settingCellInfo: {
                ulEarfcn: 0,
                dlEarfcn: 0,
                Band: 0,
                PLMN: 0,
                CellId: 0,
                UePMax: 0,
            },
            ulEarfcn: 0,
            dlEarfcn: 0,
            PLMN: '',
            SOFTWARE_VERSION: '',
            Bandwidth: BandwidthMap.get(EnumBandwidth.M_20),
            PCI: 0,
            RxGainValueFromReg: 0,
            RxGainValueFromMib: 0,
            Pwr1Derease: 0,
            PowerDereaseValueFromReg: 0,
            PowerDereaseValueFromMib: 0,
            AgcFlag: 0,
            SnfRxGainValueFromReg: 0,
            SnfRxGainValueFromMib: 0,
            RxOrSnfFlag: 0,
            dlEarfcnList: [],
            blackControlList: [],
            whiteControlList: [],
            earfcnAutoModing: false,
            modInterval: DEFAULT_AUTO_MOD_EARFCN_INTERVAL,
            boardTemperature: 0,
            bandPwrdereaseMap: {},
            MeasUECfg: {
                WorkMode: EnumWorkMode.CONTINUED_MODE,
                RedirectSubMode: 4,
                CapturePeriod: 5,
                IMSI: '',
                MeasReportPeriod: EnumMeasReportPeriod.MS_640,
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
        this._updateCellInfo({...cellInfo, status: LteStatusMap.get(EnumLTEStatus.DISCONNECTED)});
        // this._intervalQuery();
        this.cbMap = {};
        this.initCheckCBMap();
        this._airSyncFailedRetryTimes = DEFAULT_AIR_SYNC_FAILED_RETRY_TIMES;
        this._nearbyEarfcnMap = {
            [EnumSysMode.TDD]: {
                [OperatorInfos.CMCC.key]: [],
                [OperatorInfos.CTCC.key]: [],
                [OperatorInfos.CUCC.key]: [],
            },
            [EnumSysMode.FDD]: {
                [OperatorInfos.CMCC.key]: [],
                [OperatorInfos.CTCC.key]: [],
                [OperatorInfos.CUCC.key]: [],
            }
        };
        this._latestMeasInfo = {};
    }

    _initLog = () => {
        const logMethodList = ['debug', 'log', 'warn', 'error']
        for (let logMethod of logMethodList) {
            this[logMethod] = (...rest) => {
                return console[logMethod](`[${this.host}]`, ...rest);
            };
        }
    };

    /**
     * 初始化保存ue进程
     * @private
     */
    getAndClearUEList = () => {
        const ueListCache = this.ueListCache;
        this.ueListCache = [];
        return ueListCache;
    };

    /**
     * 定时任务
     * @private
     */
    _intervalQuery = () => {
        if (this._cellInfo.status.value !== EnumLTEStatus.DISCONNECTED) {
            this.sendBaseInfoQuery(EnumBaseInfoType.BOARD_TEMPERATURE);
            this.checkIfNeedAutoModEarfcn();
        }
    };

    checkIfNeedAutoModEarfcn() {
        if (!LOCATION_TARGET_LOST_START_AUTO_MOD_EARFCN) {
            return;
        }
        const {MeasUECfg, status, earfcnAutoModing, Frame} = this._cellInfo;
        const {WorkMode, IMSI} = MeasUECfg;
        if (status.value === EnumLTEStatus.ACTIVATED
            && WorkMode === EnumWorkMode.LOCATION_MODE
            && !earfcnAutoModing
            && IMSI === this._latestMeasInfo.IMSI
            && moment().unix() - moment(this._latestMeasInfo.prtTime).unix() >= LTE_LOCATION_PRT_OVERTIME) {
            const earfcnMap = this.getNearbyEarfcnMap(Frame.value);
            const operator = getCarrieroperator(IMSI);
            const earfcnList = earfcnMap[operator.key] || [];
            if (earfcnList || earfcnList.length > 0) {
                this.setModEarfcnInfo(earfcnList, DEFAULT_AUTO_MOD_EARFCN_INTERVAL);
            }
            else {
            }
            this.startAutoModEarfcn();
        }
    }

    /**
     * 获取小区基本信息
     * @return {CellInfo}
     */
    getCellInfo = () => {
        return this._cellInfo;
    };

    /**
     * 更新LTE小区基本信息
     * @private
     * @param infos
     */
    _updateCellInfo = (infos) => {
        this.debug(` updating cellInfos:`, JSON.stringify(infos));
        if (infos) {
            let cellInfoChanged = false;
            for (const key in infos) {
                // 判断cellInfo是否改变
                // eslint-disable-next-line no-prototype-builtins
                if (this._cellInfo.hasOwnProperty(key)) {
                    if (Array.isArray(infos[key]) && Array.isArray(this._cellInfo[key])) {
                        this._cellInfo[key] = infos[key];
                        cellInfoChanged = true;
                    }
                    else if (key === 'Frame' || key === 'Bandwidth' || key === 'status') {
                        if (infos[key].value !== this._cellInfo[key].value) {
                            this._cellInfo[key] = infos[key];
                            cellInfoChanged = true;
                        }
                    }
                    else if (key === 'BandPwrdereaseMap') {
                        const info = infos[key];
                        for (const innerKey in info) {
                            if (info[innerKey] !== this._cellInfo[key][innerKey]) {
                                this._cellInfo[key] = info;
                                cellInfoChanged = true;
                                break;
                            }
                        }
                    }
                    else if (typeof infos[key] === 'object') {
                        const info = infos[key];
                        for (const innerKey in info) {
                            if (info[innerKey] !== this._cellInfo[key][innerKey]) {
                                this._cellInfo[key][innerKey] = info[innerKey];
                                cellInfoChanged = true;
                            }
                        }
                    }
                    else if (infos[key] !== this._cellInfo[key]) {
                        this._cellInfo[key] = infos[key];
                        cellInfoChanged = true;
                    }
                }
                else {
                    // 所有cellInfo字段 必须预先定义 不然报错
                    this.error(`LteController._updateCellInfo get invalid key[${key}] in info:[${infos}]`);
                }
            }
            // 如果改变激活事件 CELL_INFO_CHANGED
            if (cellInfoChanged) {
                this.debug(
                    `client  updated info is :[${JSON.stringify(this._cellInfo)}]`);
            }
        }
        else {
            this.error(`LTEComtroller._updateCellInfo :client  recv invalid info: ${infos}`);
        }
    };

    /**
     * 初始化tcp客户端
     * @param {TCPClient} tcpClient
     */
    initClient(tcpClient) {
        if (this._lteClient) {
            this.log(`lte client  reconnected`);
        }
        else {
            this.log(`lte client  connected`);
        }
        this._lteClient = tcpClient;
        this._lteClient.registerHandler('data', this.handMsg.bind(this));
        this._lteClient.registerHandler('error', (err) => {
            if (err) {
                this.error(`lte controller  got error:${err}`);
                this._lteClient.destroy();
            }
        });
        this._lteClient.registerHandler('close', () => {
            this.updateStatus(EnumLTEStatus.DISCONNECTED);
            this.warn(`lte controller  disconnected`);
        });

        this._lteClient.registerHandler('timeout', () => {
            this.updateStatus(EnumLTEStatus.DISCONNECTED);
            this.warn(`lte controller  timeout`);
            this._lteClient.destroy();
        });
    }

    initQuery() {
        const funList = [
            this.sendPowerDereaseQuery,
            this.sendMeasUECfgQuery,
            this.sendMultiBandPowerdereaseQuery,
            () => {
                this.sendControlListQuery(0);
            },
            () => {
                this.sendControlListQuery(1);
            },
            () => {
                this.sendSysRxGainCfg(DEFAULT_RXGAIN, 1, 0);
            },
            () => {
                this.sendBaseInfoQuery(EnumBaseInfoType.SOFTWARE_VERSION);
            },
        ];
        if (this._cellInfo.earfcnAutoModing) {
            funList.push(this.startAutoModEarfcn);
        }
        for (let i = 0; i < funList.length; i += 1) {
            setTimeout(() => {
                funList[i].call(this);
            }, i * 500);
        }
    }

    /**
     * 更新LTE设备的状态
     * @param {number|EnumLTEStatus} nextStatus 即将更新的状态值
     */
    updateStatus(nextStatus) {
        const currStatus = this._cellInfo.status;
        if (currStatus.value !== nextStatus) {
            // eslint-disable-next-line no-prototype-builtins
            if (LteStatusMap.has(nextStatus)) {
                // 增加设备重新连接之后查询设备信息的逻辑(上次状态断开，这次状态不是断开)
                if (this._cellInfo.status.value === EnumLTEStatus.DISCONNECTED
                    && nextStatus !== EnumLTEStatus.DISCONNECTED) {
                    this.initQuery();
                }
                this._cellInfo.status = LteStatusMap.get(nextStatus);
                this.log(`lte status changed from [${currStatus.text}] to [${this._cellInfo.status.text}]`);
            }
            else {
                this.error(`LTEControllers.updateStatus invalid arguments :${nextStatus}`);
            }
        }
        else {
            this.debug(`current state is ${currStatus.text}, not changed`);
        }
    }

    /**
     * 注册消息回调
     * @param idType
     * @param id
     * @param cb
     * @param cfgMsgType
     * @param {EnumMsgType} ackMsgType
     * @param timeout
     * @param doNotNeedCommonHandle
     */
    registerCB(idType, id, cb, {cfgMsgType, ackMsgType, timeout, doNotNeedCommonHandle} = {}) {
        const key = `${idType}_${id}`
        if (this.cbMap[key]) {
            this.warn(` 已存在${key}对应的回调函数`);
        }
        this.cbMap[key] = {
            cb,
            // 回调注册时间 毫秒
            time: moment().unix(),
            cfgMsgType,
            ackMsgType,
            timeout,
            doNotNeedCommonHandle,
        };
        this.log(`注册事件 key:[${key}] info:${JSON.stringify(this.cbMap[key])}`);
    }

    async registerCBAsync(idType, id, options = {}) {
        return new Promise(resolve => {
            this.registerCB(idType, id, (err, msgInfo) => {
                resolve([err, msgInfo]);
            }, options);
        })
    }

    _activateCB(idType, id, error, {headObj, bodyObj}) {
        const key = `${idType}_${id}`
        if (this.cbMap[key]) {
            this.log(` 触发回调事件 ${key}`)
            this.cbMap[key].cb(error, {headObj, bodyObj});
            const {doNotNeedCommonHandle} = this.cbMap[key];
            delete this.cbMap[key];
            return doNotNeedCommonHandle;
        }
        return false;
    }

    initCheckCBMap() {
        setInterval(() => {
            // eslint-disable-next-line
            for (const key in this.cbMap) {
                const cbInfo = this.cbMap[key];
                const {cb, timeout, time} = cbInfo;
                if (moment().unix() - time > (timeout || LTE_ACK_TIMEOUT)) {
                    this.error(`callback ${key} timeout`);
                    cb(EnumErrorDefine.ERR_LTE_QUERY_TIMEOUT);
                    this.error(`clear lte callback key:[${key}] now:[${moment().unix()}] start:[${time}]`);
                    delete this.cbMap[key];
                }
            }
        }, LTE_ACK_CHECK_INTERVAL);
    }

    /**
     *
     * @param {Buffer} data
     */
    handMsg(data) {
        const headList = [];
        if (!Buffer.isBuffer(data)) {
            this.error(`recv data is not buffer ,data:${data}`);
            return;
        }
        this.debug(`recv msg,buffer:${data.toString('hex')}`);
        this.cacheBuff = Buffer.concat([this.cacheBuff, data]);
        try {
            // 记录粘了几个包 一个消息处理次数
            let parsedTimes = 0;
            while (this.cacheBuff.length >= this._lteProto.HEAD_LENGTH) {
                parsedTimes += 1;
                const headBuf = this.cacheBuff.slice(0, this._lteProto.HEAD_LENGTH);
                const headObj = this._lteProto.HEAD.getObj(headBuf);
                this.debug(`head parsed`, JSON.stringify(headObj));
                // 重启之后存在 制式为0的情况
                if (headObj.Frame !== this._cellInfo.Frame.value && SysModeMap.has(headObj.Frame)) {
                    this._updateCellInfo({
                        Frame: SysModeMap.get(headObj.Frame),
                    });
                }
                const ifLeft = headObj.SubSysCode >>> 15;
                let transID = headObj.SubSysCode & 0x7fff;
                this._LTETransID = transID;
                headObj.transID = transID;
                headObj.ifLeft = ifLeft;
                let bodyBuf = this.cacheBuff.slice(this._lteProto.HEAD_LENGTH, headObj.MsgLength);
                this.debug(`slice data ,headBuf:${
                    headBuf.toString('hex')},body buffer:${bodyBuf.toString('hex')}`);
                // 消息未发送完
                if (ifLeft === 1) {
                    // transID += 1;
                    // todo 测试这里transID去除之后是否正常
                    this.log(`收到分包消息，tranID:${transID}`);
                    if (this.cacheMsg.has(transID)) {
                        this.cacheMsg.get(transID).push(bodyBuf);
                    }
                    else {
                        this.cacheMsg.set(transID, [bodyBuf]);
                    }
                    this.cacheBuff = this.cacheBuff.slice(headObj.MsgLength);
                    // eslint-disable-next-line no-continue
                    continue;
                }
                // 收到分包剩余消息
                else if (this.cacheMsg.has(transID)) {
                    bodyBuf = Buffer.concat([...this.cacheMsg.get(transID), bodyBuf]);
                    this.debug(`分包处理完毕, bodyBuf 合体 ${bodyBuf.toString('hex')}`);
                    this.cacheMsg.delete(transID);
                }
                // 去除当前处理完成的消息长度
                this.cacheBuff = this.cacheBuff.slice(headObj.MsgLength);
                // 缓存中有剩余buffer 发生粘包
                if (this.cacheBuff.length > 0) {
                    this.debug(`粘包了 剩余buffer ${this.cacheBuff.toString('hex')}`);
                }
                headList.push(headObj);
                // 处理消息体
                this._parseBody(headObj, bodyBuf);
            }
            this.debug(`parsed msg in ${parsedTimes} times`);
            // 粘包处理完了 还剩buffer 理论上不存在这种情况 但是谁知道呢
            if (this.cacheBuff.length > 0) {
                this.debug(` 粘包处理完了 还剩buffer？ ${this.cacheBuff.toString('hex')}`);
                this.cacheBuff = Buffer.allocUnsafe(0);
            }
        } catch (e) {
            if (e) {
                this.error(`parse msg from lte client run error ,err:[${e}],msg buffer:[${
                    this.cacheBuff.toString('hex')}] headList:${JSON.stringify(headList)}`);
                this.cacheMsg = new Map();
            }
        }
    };


    /**
     * 解析消息体
     * @param {{FrameHeader:number,MsgType:number,MsgLength:number,Frame:number,
     * SubSysCode:number,transID:number}} headObj 消息头对象
     * @param {Buffer} bodyBuf 消息体buffer
     * @private
     */
    _parseBody(headObj, bodyBuf) {
        const {MsgType} = headObj;
        const bodyStruct = this._lteProto.getBodyStruct(MsgType);
        if (!bodyStruct) {
            this.error(`cannot support this msg type [${MsgType}]`);
            return;
        }
        const bodyObj = bodyStruct.getObj(bodyBuf);
        this.debug(` parsed msg ,headObj:${
            JSON.stringify(headObj)},bodyObj:${JSON.stringify(bodyObj)}`);
        const doNotNeedCommonHandle = this._activateCB(EnumCBKeyType.MSGTYPE, headObj.MsgType, null, {
            headObj,
            bodyObj
        });
        this._activateCB(EnumCBKeyType.TRANSID, headObj.transID, null, {headObj, bodyObj});
        if (doNotNeedCommonHandle) {
            return;
        }
        switch (MsgType) {
            case EnumMsgType.O_FL_ENB_TO_LMT_SYS_INIT_SUCC_IND:
                this.debug(`recv msg type:[O_FL_ENB_TO_LMT_SYS_INIT_SUCC_IND],body:${JSON.stringify(bodyObj)}`);
                this._handleSysInitSuccInd(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_SYS_ARFCN_ACK:
                this.debug(`recv msg type:[O_FL_ENB_TO_LMT_SYS_ARFCN_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handSysArfcnAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_UE_INFO_RPT:
                this.debug(`recv msg type:[O_FL_ENB_TO_LMT_UE_INFO_RPT],body:${JSON.stringify(bodyObj)}`);
                this._handleUeInfoPrt(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_SET_ADMIN_STATE_ACK:
                this.debug(`recv msg type:[O_FL_ENB_TO_LMT_SET_ADMIN_STATE_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handSetAdminStateAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_ENB_STATE_IND:
                this.debug(`recv msg type:[O_FL_ENB_TO_LMT_ENB_STATE_IND],body:${JSON.stringify(bodyObj)}`);
                this._handEnbStateInd(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_RXGAIN_POWER_DEREASE_QUERY_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_RXGAIN_POWER_DEREASE_QUERY_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handlePowerDereaseQueryAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_SYS_PWR1_DEREASE_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_SYS_PWR1_DEREASE_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handlePwr1DereaseAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_MEAS_UE_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_MEAS_UE_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleMeasUEAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_MEAS_UE_CFG_QUERY_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_MEAS_UE_CFG_QUERY_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleMeasUECfgQueryAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_MEAS_INFO_RPT:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_MEAS_INFO_RPT],body:${JSON.stringify(bodyObj)}`);
                this._handleMeasInfoPrt(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_SYS_MODE_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_SYS_MODE_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleSysModeAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_CELL_STATE_INFO_QUERY_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_CELL_STATE_INFO_QUERY_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleCellStateInfoQueryAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_SYS_ARFCN_MOD_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_SYS_ARFCN_MOD_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleEarfcnModAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_BASE_INFO_QUERY_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_BASE_INFO_QUERY_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleBaseInfoQueryAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_REBOOT_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_REBOOT_ACK],body:${JSON.stringify(bodyObj)}`);
                this._handleRebootAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_MULTI_BAND_POWERDEREASE_QUERY_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_MULTI_BAND_POWERDEREASE_QUERY_ACK],body:${
                        JSON.stringify(bodyObj)}`);
                this._handleMultiBandPowerdereaseQueryAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_SYS_RxGAIN_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_SYS_RxGAIN_ACK],body:${
                        JSON.stringify(bodyObj)}`);
                this._handleSysRxGainCfgAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ_ACK:
                this.debug(
                    `recv msg type:[O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ_ACK],body:${
                        JSON.stringify(bodyObj)}`);
                this._handleSelfCfgCellParaReqAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_REM_INFO_RPT:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_REM_INFO_RPT],body:${
                        JSON.stringify(bodyObj)}`);
                this._handleRemInfoPrt(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_CONTROL_UE_LIST_CFG_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_CONTROL_UE_LIST_CFG_ACK],body:${
                        JSON.stringify(bodyObj)}`);
                this._handleControlUEListCfgAck(headObj, bodyObj);
                break;
            case EnumMsgType.O_FL_ENB_TO_LMT_CONTROL_LIST_QUERY_ACK:
                this.debug(
                    `recv msg type:[O_FL_ENB_TO_LMT_CONTROL_LIST_QUERY_ACK],body:${
                        JSON.stringify(bodyObj)}`);
                this._handleControlListQueryAck(headObj, bodyObj);
                break;
            default:
                break;
        }
    }

    _sendDataAsync(data) {
        return new Promise(resolve => {
            this._lteClient.sendData(data, () => {
                resolve(true);
            });
        });
    }

    /**
     * 打包消息
     * @param {EnumMsgType} msgType
     * @param {Object} msgBody 消息体对象，不存在传入undefined
     * @param bAck 是否是回复消息 即是否需要transID相同
     */
    packAndSendMsg(msgType, msgBody, bAck = false) {
        if (this._cellInfo.earfcnAutoModing && AUTO_MODING_BAN_MSGTYPE_LIST.includes(msgType)) {
            this.log(`client auto modify earfcn, if you want use other command , stop it first`);
            return;
        }
        let bodyBuf;
        if (!msgBody) {
            bodyBuf = Buffer.from([]);
        }
        else {
            const bodyStruct = this._lteProto.getBodyStruct(msgType);
            bodyBuf = bodyStruct.getBuff(msgBody);
        }
        // const ifLeft = 0;
        let SubSysCode;
        if (bAck) {
            SubSysCode = this._LTETransID;
        }
        else {
            this._TransID += 1;
            SubSysCode = this._TransID;
        }
        const headObj = {
            FrameHeader: FRAME_HEAD,
            MsgType: msgType,
            MsgLength: this._lteProto.HEAD_LENGTH + bodyBuf.length,
            Frame: this._cellInfo.Frame.value,
            SubSysCode,
        };
        this.debug(`lte server send msg to client ,head:${JSON.stringify(headObj)},body:${
            JSON.stringify(msgBody)}`);
        // todo 增加分包发送的逻辑
        const sendSucc = this._sendData(Buffer.concat([this._lteProto.HEAD.getBuff(headObj), bodyBuf],
            this._lteProto.HEAD_LENGTH + bodyBuf.length,));
        if (sendSucc) {
            // eslint-disable-next-line
            return headObj;
        }
    }

    async packAndSendMsgAsync(msgType, msgBody, bAck = false) {
        if (this._cellInfo.status.value === EnumLTEStatus.DISCONNECTED || !this._lteClient) {
            this.warn(`client  disconnected, cannot send data to client`);
            return EnumErrorDefine.ERR_LTE_DISCONNECTED;
        }
        if (this._cellInfo.earfcnAutoModing && AUTO_MODING_BAN_MSGTYPE_LIST.includes(msgType)) {
            this.log(`client auto modify earfcn, if you want use other command , stop it first`);
            return EnumErrorDefine.ERR_LTE_STATUS_EXCEPTION;
        }
        let bodyBuf;
        if (!msgBody) {
            bodyBuf = Buffer.from([]);
        }
        else {
            const bodyStruct = this._lteProto.getBodyStruct(msgType);
            bodyBuf = bodyStruct.getBuff(msgBody);
        }
        // const ifLeft = 0;
        let SubSysCode;
        if (bAck) {
            SubSysCode = this._LTETransID;
        }
        else {
            this._TransID += 1;
            SubSysCode = this._TransID;
        }
        const transID = SubSysCode;
        const headObj = {
            FrameHeader: FRAME_HEAD,
            MsgType: msgType,
            MsgLength: this._lteProto.HEAD_LENGTH + bodyBuf.length,
            Frame: this._cellInfo.Frame.value,
            SubSysCode,
        };
        this.debug(`lte server send msg to client ,head:${JSON.stringify(headObj)},body:${JSON.stringify(msgBody)}`);
        // todo 增加分包发送的逻辑
        const sendSucc = await this._sendDataAsync(Buffer.concat([this._lteProto.HEAD.getBuff(headObj), bodyBuf],
            this._lteProto.HEAD_LENGTH + bodyBuf.length));
        return {...headObj, transID};
    }

    async commonQueryAsync(cfgMsgType, msgBody) {
        const result = await this.packAndSendMsgAsync(cfgMsgType, msgBody);
        if (result < 0) {
            return [result];
        }
        const {transID, MsgType: ackMsgType} = result;
        const [err, msgInfo] = await this.registerCBAsync(EnumCBKeyType.TRANSID, transID, {
            doNotNeedCommonHandle: true,
            cfgMsgType,
            ackMsgType
        });
        return [err, msgInfo];
    }

    _handleMeasInfoPrt(headObj, bodyObj) {
        const {IMSI, UeMeasValue, ProtocolVer} = bodyObj;
        let handledUeMeasValue = UeMeasValue;
        if (this._cellInfo.Frame.value === EnumSysMode.TDD) {
            handledUeMeasValue = UeMeasValue + 54;
        }
        this._latestMeasInfo = {
            host: this.host,
            IMSI,
            UeMeasValue: handledUeMeasValue,
            ProtocolVer,
            prtTime: moment().format(TIME_FORMAT),
            earfcn: this._cellInfo.dlEarfcn || '未知',
            // ueDistance: Math.floor(ueDistance <= 0 ? 0 : ueDistance),
        };
    }

    _handleSysInitSuccInd(headObj, bodyObj) {
        this._intervalQuery();
      const {CellState, Band, ulEarfcn, dlEarfcn, PLMN, Bandwidth, PCI} = bodyObj;
        if (CellState !== undefined) {
            if (CellState === 0xFFFF) {
                this.updateStatus(EnumLTEStatus.CONNECTED);
            }
            else {
                this.updateStatus(CellState);
                if (!(Band === 0xFFFF
                    || ulEarfcn === 0xFFFFFFFF || dlEarfcn === 0xFFFFFFFF
                    || PCI === 0xFFFF || Bandwidth === 0xFF)) {
                    this._updateCellInfo({Band, ulEarfcn, dlEarfcn, PLMN, Bandwidth: BandwidthMap.get(Bandwidth), PCI});
                }
            }
        }
        else {
            this.log('cannot get CellState from SysInitSuccInd Msg body');
        }
        // this.log(JSON.stringify({...headObj, ...bodyObj}))
        this.sendSysInitSuccRsp();
    }

    _handSysArfcnAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
            this.updateStatus(EnumLTEStatus.ACTIVATING);
            const {dlEarfcn, ulEarfcn, Band, PLMN} = this._cellInfo.settingCellInfo;
            if (dlEarfcn && Band) {
                this._updateCellInfo({
                    dlEarfcn,
                    ulEarfcn,
                    Band,
                    PLMN,
                    settingCellInfo: {dlEarfcn: 0, ulEarfcn: 0, Band: 0, CellId: 0, PLMN: 0, UePMax: 0}
                });
            }
        }
        else {
            if (this._cellInfo.settingCellInfo) {
                this._updateCellInfo({
                    settingCellInfo: {
                        dlEarfcn: 0,
                        ulEarfcn: 0,
                        Band: 0,
                        CellId: 0,
                        PLMN: 0,
                        UePMax: 0,
                    }
                });
            }
        }
    }

    _handSetAdminStateAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
        }
        else {
        }
    }

    _handEnbStateInd(headObj, bodyObj) {
        const {CellStateInd} = bodyObj;
        if (CellStateInd) {
            const CellStateInfo = EnbStateMap.get(CellStateInd);
            this.updateStatus(CellStateInfo.CellState);
            // 小区建立重置衰减
            if (CellStateInd === EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_SUCC) {
                this.sendPwr1DereaseCfg({Pwr1Derease: this._cellInfo.Pwr1Derease || 0, IsSave: 1});
            }
            if (CellStateInd === EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_FAIL ||
                CellStateInd === EnumEnbState.WR_FL_ENB_STATE_CELL_SETUP_FAIL ||
              CellStateInd === EnumEnbState.WR_FL_ENB_STATE_GPS_SYNC_FAIL) {
            }
            if (CellStateInd === EnumEnbState.WR_FL_ENB_STATE_SCAN_SUCC) {
                this.debug(`device  scan net succ`);
            }
            if (CellStateInd === EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_FAIL) {
            }
            if (CellStateInd === EnumEnbState.WR_FL_ENB_STATE_AIR_SYNC_FAIL) {
                if (this._airSyncFailedRetryTimes > 0) {
                    this.activateLTEWithLastCellInfo();
                    this._airSyncFailedRetryTimes -= 1;
                }
                else {
                    this._airSyncFailedRetryTimes = DEFAULT_AIR_SYNC_FAILED_RETRY_TIMES;
                }
            }
        }
    }

    _handleUeInfoPrt(headObj, bodyObj) {
        if (bodyObj) {
            const {IMSI, IMEI, RSSI} = bodyObj;
            const prtTime = new Date().getTime();
            this.ueListCache.push({IMSI, IMEI, RSSI, prtTime});
        }
    }

    _handlePowerDereaseQueryAck(headObj, bodyObj) {
        const {
            RxGainValueFromReg,
            RxGainValueFromMib,
            PowerDereaseValueFromReg,
            PowerDereaseValueFromMib,
        } = bodyObj;
        this._updateCellInfo({
            Pwr1Derease: PowerDereaseValueFromReg - (this._cellInfo.bandPwrdereaseMap[this._cellInfo.Band] || 0),
            RxGainValueFromReg,
            RxGainValueFromMib,
            PowerDereaseValueFromReg,
            PowerDereaseValueFromMib,
        });
    }

    sendPwr1DereaseCfg(data) {
        const {Pwr1Derease, IsSave} = data;
        const prePwr1Derease = this._cellInfo.bandPwrdereaseMap[this._cellInfo.Band] || 0;
        this.log(`device prePwr1Derease is `, prePwr1Derease);
        if (Pwr1Derease !== undefined && IsSave !== undefined) {
            this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SYS_PWR1_DEREASE_CFG, {
                Pwr1Derease: Pwr1Derease + prePwr1Derease,
                IsSave: IsSave ? 1 : 0
            });
        }
        else {
            this.error(`LTEController.sendPwr1DereaseCfg recv invalid data:${JSON.stringify(data)}`);
        }
    }

    _handlePwr1DereaseAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
        }
        else {
        }
        this.sendPowerDereaseQuery();
    }

    _handleMeasUEAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
            this.sendMeasUECfgQuery();
        }
        else {
        }
    }

    /**
     * ue测量模式配置查询
     */
    sendMeasUECfgQuery() {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_MEAS_UE_CFG_QUERY, undefined);
    }

    /**
     * ue测量模式配置查询应答处理
     * @param headObj
     * @param bodyObj
     * @private
     */
    _handleMeasUECfgQueryAck(headObj, bodyObj) {
        const {
            WorkMode,
            RedirectSubMode,
            CapturePeriod,
            IMSI,
            MeasReportPeriod,
            SchdUeMaxPowerTxFlag,
            SchdUeMaxPowerValue,
            SchdUeUlFixedPrbSwitch,
            CampOnAllowedFlag,
            SrsSwitch,
            ControlSubMode,
        } = bodyObj;
        this._updateCellInfo({
            MeasUECfg: {
                WorkMode,
                RedirectSubMode,
                CapturePeriod,
                IMSI,
                MeasReportPeriod,
                SchdUeMaxPowerTxFlag,
                SchdUeMaxPowerValue,
                SchdUeUlFixedPrbSwitch,
                CampOnAllowedFlag,
                SrsSwitch,
                ControlSubMode,
            },
        });
    }

    sendSysInitSuccRsp() {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SYS_INIT_SUCC_RSP, undefined, true)
    }

    /**
     * 频点配置
     * @param {{dlEarfcn:number,PLMN:string,Bandwidth:number,Band:number,PCI:number,TAC:number,CellId:number
     * }} ServingCellCfgInfo
     */
    sendSycArfcnCfg(ServingCellCfgInfo) {
        const {dlEarfcn, PLMN, Bandwidth, Band, PCI, TAC, CellId} = ServingCellCfgInfo;
        const bandLimitList = BAND_LIMIT_MAP[this.host];
        if (bandLimitList && bandLimitList.indexOf(Band) === -1) {
            // 延迟发送失败事件，确保监听动作在此之前
            setTimeout(() => {
            }, 1000);
            return;
        }
        if (dlEarfcn && PLMN && Bandwidth && Band && PCI !== undefined && TAC !== undefined && CellId !== undefined) {
            const ulEarfcn = getUlEarfcn(dlEarfcn, this._cellInfo.Frame.value);
            const UePMax = DEFAULT_UePMax;
            const msgBody = {
                ulEarfcn,
                dlEarfcn,
                PLMN,
                Bandwidth: EnumBandwidth.M_5,
                Band,
                PCI,
                TAC,
                CellId,
                UePMax,
                EnodeBPMax: DEFAUTL_EnodeBPMax,
            };
            this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SYS_ARFCN_CFG, msgBody);
            // 提前设置小区状态提升用户体验
            this.updateStatus(EnumLTEStatus.ACTIVATING);
            this._updateCellInfo({
                settingCellInfo: {
                    dlEarfcn,
                    ulEarfcn,
                    Band,
                    CellId,
                    PLMN,
                    UePMax,
                }
            });
        }
        else {
            this.error(`invalid input arguments, ServingCellCfgInfo:${JSON.stringify(ServingCellCfgInfo)}`);
        }
    }

    /**
     * 设置小区状态
     * @param {number} workAdminState 0:去激活小区 1:采用当前配置激活小区，如 果是 TDD 不执行同步 2:激活小区&同步，仅 TDD 支 持
     */
    sendSetAdminStateCfg(workAdminState) {
        if (workAdminState === 0 || workAdminState === 1 || workAdminState === 2) {
            this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SET_ADMIN_STATE_CFG, {workAdminState});
            // 提前设置小区状态提升用户体验
            if (workAdminState === 0) {
                this.updateStatus(EnumLTEStatus.DEACTIVATING);
            }
            else {
                this.updateStatus(EnumLTEStatus.ACTIVATING);
            }
        }
    }

    /**
     * 接收增益和发射功率查询
     */
    sendPowerDereaseQuery() {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_RXGAIN_POWER_DEREASE_QUERY, undefined)
    }

    /**
     * 当前服务小区信息查询
     */
    sendGetArfcn() {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_GET_ARFCN, undefined)
    }

    sendSysModeCfg(data) {
        const {sysMode} = data;
        if (sysMode !== undefined) {
            return this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SYS_MODE_CFG, {sysMode})
        }
        this.warn(`sendSysModeCfg invalid arguments :${JSON.stringify(data)}`);
        return null;
    }

    sendSysModeCfgAsync(data) {
        return new Promise(async resolve => {
            const headObj = this.sendSysModeCfg(data);
            if (!headObj) {
                resolve(['send failed']);
                return;
            }
            const [err, msgInfo] = await this.registerCBAsync(EnumCBKeyType.MSGTYPE,
                EnumMsgType.O_FL_ENB_TO_LMT_SYS_MODE_ACK, {doNotNeedCommonHandle: true});
            if (err) {
                resolve([err]);
                return;
            }
            const {bodyObj} = msgInfo;
            if (bodyObj && bodyObj.CfgResult === 0) {
                resolve([null]);
            }
            else {
                resolve([`cfg failed, err = ${bodyObj.CfgResult}`]);
            }
        });
    }

    activateLTEWithLastCellInfo() {
        const {dlEarfcn, PLMN, Bandwidth, Band, PCI} = this._cellInfo;
        const ServingCellCfgInfo = {
            dlEarfcn,
            PLMN,
            Bandwidth: Bandwidth.value,
            Band,
            PCI,
            TAC: getRandomTAC(),
            CellId: getRandomCellID(),
        };
        this.sendSycArfcnCfg(ServingCellCfgInfo);
    }

    _handleSysModeAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
        }
        else {
        }
    }

    /**
     *
     * @param {EnumWorkMode} workMode
     * @param {Object} options
     */
    sendMeasUECfg(workMode, options) {
        let defaultBody = {
            WorkMode: EnumWorkMode.CONTINUED_MODE,
            RedirectSubMode: 4,
            CapturePeriod: 5,
            IMSI: '',
            MeasReportPeriod: EnumMeasReportPeriod.MS_640,
            SchdUeMaxPowerTxFlag: 0,
            SchdUeMaxPowerValue: DEFAULT_UePMax,
            SchdUeUlFixedPrbSwitch: 0,
            CampOnAllowedFlag: 0,
            SrsSwitch: 0,
            Res: 0,
            ControlSubMode: 0,
            Res1: [0, 0, 0],
            ...this._cellInfo.MeasUECfg,
        };
        let err = false;
        if (workMode === undefined) {
            err = true;
        }
        else {
            defaultBody.WorkMode = workMode;
            switch (workMode) {
                case EnumWorkMode.CONTINUED_MODE: {
                    break;
                }
                case EnumWorkMode.PERIOD_MODE: {
                    const {CapturePeriod} = options;
                    if (CapturePeriod !== undefined) {
                        defaultBody.CapturePeriod = CapturePeriod;
                    }
                    break;
                }
                case EnumWorkMode.LOCATION_MODE: {
                    const {
                        IMSI,
                        MeasReportPeriod,
                        SchdUeMaxPowerValue,
                        SchdUeUlFixedPrbSwitch,
                        CampOnAllowedFlag,
                        SchdUeMaxPowerTxFlag,
                        SrsSwitch,
                    } = options;
                    if (IMSI !== undefined &&
                        MeasReportPeriod !== undefined &&
                        SchdUeMaxPowerValue !== undefined &&
                        SchdUeUlFixedPrbSwitch !== undefined &&
                        CampOnAllowedFlag !== undefined &&
                        SrsSwitch !== undefined) {
                        defaultBody = {
                            ...defaultBody,
                            IMSI,
                            MeasReportPeriod,
                            SchdUeMaxPowerTxFlag,
                            SchdUeMaxPowerValue,
                            SchdUeUlFixedPrbSwitch,
                            CampOnAllowedFlag,
                            SrsSwitch,
                        };
                    }
                    break;
                }
                case EnumWorkMode.CONTROL_MODE: {
                    const {ControlSubMode} = options;
                    if (ControlSubMode !== undefined) {
                        defaultBody.ControlSubMode = ControlSubMode;
                    }
                    break;
                }
                case EnumWorkMode.REDIRECT_MODE: {
                    const {RedirectSubMode} = options;
                    if (RedirectSubMode !== undefined) {
                        defaultBody.RedirectSubMode = RedirectSubMode;
                    }
                    break;
                }
                default:
                    break;
            }
        }
        if (err) {
            this.error(`LTEController.sendMeasUECfg invalid options:${
                JSON.stringify(options)} ,workMode:${workMode}`);
            return;
        }
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_MEAS_UE_CFG, defaultBody)
    }

    setLocateIMSI(IMSI) {
        this.sendMeasUECfg(EnumWorkMode.LOCATION_MODE,{
            WorkMode: EnumWorkMode.LOCATION_MODE,
            IMSI,
            MeasReportPeriod: EnumMeasReportPeriod.MS_1024,
            SchdUeMaxPowerTxFlag: 0,
            SchdUeMaxPowerValue: DEFAULT_UePMax,
            SchdUeUlFixedPrbSwitch: 0,
            CampOnAllowedFlag: 1,
            SrsSwitch: 0,
        });
    }

    sendCellStateInfoQuery() {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_CELL_STATE_INFO_QUERY, undefined)
    }

    _handleCellStateInfoQueryAck(headObj, bodyObj) {
        const {CellState} = bodyObj;
        this.updateStatus(CellState);
    }

    sendEarfcnMod(dlEarfcn) {
        if (dlEarfcn && Number.isInteger(dlEarfcn)) {
            const otherData = getOtherDataByEarfcn(dlEarfcn);
            if (!otherData) {
                return;
            }
            const Band = +otherData.Band;
            const {PLMN} = otherData;
            const ulEarfcn = getUlEarfcn(dlEarfcn, this._cellInfo.Frame.value);
            const CellId = getRandomCellID();
            const UePMax = DEFAULT_UePMax;
            this._updateCellInfo({
                settingCellInfo: {
                    dlEarfcn, ulEarfcn, Band, CellId, PLMN, UePMax
                }
            });
            this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SYS_ARFCN_MOD, {
                ulEarfcn,
                dlEarfcn,
                Band,
                PLMN,
                CellId,
                UePMax
            });
        }
    }

    /**
     * 查询基站基本信息
     * @param {Number} EnbBaseInfoType 查询信息类型
     */
    sendBaseInfoQuery(EnbBaseInfoType) {
        if (EnbBaseInfoType in Object.values(EnumBaseInfoType)) {
            this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_BASE_INFO_QUERY, {EnbBaseInfoType});
        }
        else {
            this.error(`Invalid EnbBaseInfoType`);
        }
    }

    _handleBaseInfoQueryAck(headObj, bodyObj) {
        const {EnbBaseInfoType, EnbBaseInfo} = bodyObj;
        this.log(JSON.stringify(bodyObj));
        switch (EnbBaseInfoType) {
            case EnumBaseInfoType.DEVICE_MODEL:
                break;
            case EnumBaseInfoType.HARDWARE_VERSION:
                break;
            case EnumBaseInfoType.SOFTWARE_VERSION:
                this._updateCellInfo({ SOFTWARE_VERSION: EnbBaseInfo });
                break;
            case EnumBaseInfoType.BOARDSN:
                break;
            case EnumBaseInfoType.MAC:
                break;
            case EnumBaseInfoType.BOARD_TEMPERATURE:
                // eslint-disable-next-line no-case-declarations
                const temperature = Math.round(+EnbBaseInfo);
                if (temperature) {
                    this._updateCellInfo({boardTemperature: temperature});
                    if (temperature >= TEMPERATURE_ALERT) {
                        if (this.temperatureAlertTimes75 % 20 === 0) {
                        }
                        this.temperatureAlertTimes75 += 1;
                    }
                    else {
                        this.temperatureAlertTimes75 = 0;
                    }
                }
                break;
            default:
                break;
        }
    }

    _handleEarfcnModAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
            //     `设备动态频点配置成功`);
            const {dlEarfcn, ulEarfcn, Band, PLMN} = this._cellInfo.settingCellInfo;
            if (dlEarfcn && Band) {
                this._updateCellInfo({
                    dlEarfcn,
                    ulEarfcn,
                    Band,
                    PLMN,
                    settingCellInfo: {dlEarfcn: 0, ulEarfcn: 0, Band: 0, CellId: 0, PLMN: 0, UePMax: 0}
                });
            }
            this.sendPwr1DereaseCfg({Pwr1Derease: this._cellInfo.Pwr1Derease, IsSave: 1});
        }
        else {
            if (this._cellInfo.settingCellInfo) {
                this._updateCellInfo({
                    settingCellInfo: {
                        dlEarfcn: 0,
                        ulEarfcn: 0,
                        Band: 0,
                        CellId: 0,
                        PLMN: 0,
                        UePMax: 0,
                    }
                });
            }
        }
    }

    /**
     * 重启小区
     * @param {number} SelfActiveCfg         // 0：reboot 后自动激活小区 1：reboot 后不自激活小区
     */
    sendRebootCfg(SelfActiveCfg = 1) {
        return this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_REBOOT_CFG, {SelfActiveCfg});
    }

    sendRebootCfgAsync(SelfActiveCfg) {
        return new Promise(async resolve => {
            const headObj = this.sendRebootCfg(SelfActiveCfg);
            if (!headObj) {
                resolve(['send failed']);
                return;
            }
            const [err, msgInfo] = await this.registerCBAsync(EnumCBKeyType.MSGTYPE,
                EnumMsgType.O_FL_ENB_TO_LMT_REBOOT_ACK);
            if (err) {
                resolve([err]);
                return;
            }
            const {bodyObj} = msgInfo;
            if (bodyObj.CfgResult === 0) {
                resolve([null]);
            }
            else {
                resolve([`sendRebootCfgAsync failed, err = ${bodyObj.CfgResult}`]);
            }
        });
    }

    _handleRebootAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
        }
        else {
        }
    }

    sendMultiBandPowerdereaseQuery() {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_MULTI_BAND_POWERDEREASE_QUERY, undefined)
    }

    _handleMultiBandPowerdereaseQueryAck(headObj, bodyObj) {
        const {NumElem} = bodyObj;
        const {bandPwrdereaseMap: bandPwrdereaseList} = bodyObj;
        const bandPwrdereaseMap = {};
        // eslint-disable-next-line
        for (const key in bandPwrdereaseList) {
            if (+key > NumElem) {
                break;
            }
            const bandInfo = bandPwrdereaseList[key];
            const {band, Pwrderease} = bandInfo;
            bandPwrdereaseMap[band] = Pwrderease;
        }
        this.log(`device  bandPwrdereaseMap is `, JSON.stringify(bandPwrdereaseMap));
        this._updateCellInfo({bandPwrdereaseMap});
    }

    setModEarfcnInfo(earfcnList, interval) {
        if (earfcnList && Array.isArray(earfcnList) && interval && Number.isInteger(interval)) {
            const bandLimitList = BAND_LIMIT_MAP[this.host];
            if (bandLimitList) {
                for (const earfcn of earfcnList) {
                    if (earfcn) {
                        const otherData = getOtherDataByEarfcn(earfcn);
                        if (!otherData || bandLimitList.indexOf(+otherData.Band) === -1) {
                            return;
                        }
                    }
                }
            }
            if (interval !== this._cellInfo.modInterval && this._cellInfo.earfcnAutoModing) {
                this.startAutoModEarfcn();
            }
            this._updateCellInfo({dlEarfcnList: earfcnList, modInterval: interval});
        }
        else {
            this.error(`LTEController.setModEarfcnInfo invalid arguments,arg:${JSON.stringify({
                earfcnList,
                interval
            })}`);
        }
    }

    /**
     * 获取轮询的下一个频点
     * @return {number}
     * @private
     */
    _getNextEarfcnToMod() {
        const {dlEarfcnList, dlEarfcn} = this._cellInfo;
        const index = dlEarfcnList.indexOf(dlEarfcn);
        if (index === -1 || index === dlEarfcnList.length - 1) {
            return dlEarfcnList[0];
        }
        return dlEarfcnList[index + 1];
    }

    /**
     * 开启自动轮询频点
     */
    startAutoModEarfcn() {
        if (this._cellInfo.dlEarfcnList.length === 0) {
            this.warn(`device  has no dlEarfcnList, please add first`);
            return;
        }
        if (this._cellInfo.status.value !== EnumLTEStatus.ACTIVATED) {
            this._updateCellInfo({earfcnAutoModing: false});
            return;
        }
        if (this._cellInfo.earfcnAutoModing) {
            if (this.autoModEarfcnProcess) {
                clearInterval(this.autoModEarfcnProcess);
            }
        }
        this.autoModEarfcnProcess = setInterval(() => {
            if (this._cellInfo.status.value !== EnumLTEStatus.ACTIVATED) {
                this.stopAutoModEarfcn();
                return;
            }
            const nextDlEarfcn = this._getNextEarfcnToMod();
            this.log(`device  auto mod earfcn from [${
                this._cellInfo.dlEarfcn}] to [${nextDlEarfcn}]`);
            this.sendEarfcnMod(nextDlEarfcn);
        }, this._cellInfo.modInterval * 1000);
        this._updateCellInfo({earfcnAutoModing: true});
    }

    stopAutoModEarfcn() {
        if (this.autoModEarfcnProcess) {
            clearInterval(this.autoModEarfcnProcess);
        }
        this._updateCellInfo({earfcnAutoModing: false});
    }

    /**
     * 发送数据
     * @param {Buffer} data
     * @return {headObj} headObj
     * @private
     */
    _sendData(data) {
        if (this._cellInfo.status.value === EnumLTEStatus.DISCONNECTED) {
            this.warn(`client  disconnected, cannot send data to client`);
            return;
        }
        if (this._lteClient) {
            this._lteClient.sendData(data, () => {
                this.debug(`send data to client successfully, buffer:${data.toString('hex')}`);
            });
            // eslint-disable-next-line
            return true;
        }
    }

    /**
     * 配置系统接收增益
     * @param Rxgain 接收增益
     * @param RxGainSaveFlag 重启保存 1:save 0:not save
     * @param RxOrSnfFlag 0:rx 1:snf
     */
    sendSysRxGainCfg(RxGain, RxGainSaveFlag, RxOrSnfFlag) {
        const bodyObj = {
            RxGain,
            RxGainSaveFlag: RxGainSaveFlag ? 1 : 0,
            RxOrSnfFlag,
        };
        this._updateCellInfo({RxOrSnfFlag: bodyObj.RxOrSnfFlag});
        this.log(JSON.stringify(bodyObj));
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SYS_RxGAIN_CFG, bodyObj);
    }

    _handleSysRxGainCfgAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
            this.sendPowerDereaseQuery();
        }
        else {
        }
    }

    sendSelfCfgCellParaReq(SelfBand) {
        const body = {SelfBand};
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_SELFCFG_CELLPARA_REQ, body);
    }

    _handleSelfCfgCellParaReqAck(headObj, bodyObj) {
        if (bodyObj.CfgResult === 0) {
        }
        else {
        }
    }

    /**
     * 频点配置
     * @param {{dlEarfcn:number,PLMN:string,Bandwidth:number,Band:number,PCI:number,TAC:number,CellId:number
     * }} ServingCellCfgInfo
     */
    activateWithScanNetResult(ServingCellCfgInfo) {
        // TDD 板子扫网启动
        if (this._cellInfo.Frame.value === EnumSysMode.TDD) {
            this.sendSelfCfgCellParaReq(255);
        }
        else if (ServingCellCfgInfo && ServingCellCfgInfo.dlEarfcn) {
            // FDD 使用手机扫网参数启动
            this.sendSycArfcnCfg(ServingCellCfgInfo);
        }
        else {
        }
    }

    sendRemCfg({wholeBandRem, sysEarfcnList}) {
        const targetList = sysEarfcnList.length > 0 ? sysEarfcnList :
          getNetScanList(this.host, this._cellInfo.Frame.value);
        this.log(`准备启动扫网 目标频点列表 ${targetList}`);
        const body = {
            wholeBandRem: wholeBandRem ? 1 : 0,
            sysEarfcnNum: targetList.length,
            sysEarfcn: targetList,
        };
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_REM_CFG, body);
    }

    _handleRemInfoPrt(head, body) {
        this.log(` 准备处理扫网信息`, body.collectionTypeFlag === 0, JSON.stringify(body));
        if (body.collectionTypeFlag === 0) {
        }
        else {
            this.log(`收到同步扫频消息`);
        }
    }

    /**
     * 增加删除 黑白名单
     * @param ControlMovement 0: 在管控名单中 删除用户 1: 在管控名单中 添加用户
     * @param ControlUEProperty 0：添加/删除黑名 单用户 1：添加/删除白名 单用户
     * @param ControlUEIdentity IMSI列表
     * @param ClearType 0：该字段不起作用 1：删除所有黑名单用户 2:删除所有白名单 用户 3：删除所有黑白名 单用户
     * @param RejCause 0：#cause15 （追 踪区不允许接入） 1： #cause12 (追踪 区无合适小区) 2: #cause3（无效 终端） 3：#cause13 4：#cause22
     */
    sendControlUEListCfg({ControlMovement, ControlUEProperty, ControlUEIdentity, ClearType = 0, RejCause = 0}) {
        if (!ControlUEIdentity || ControlUEIdentity.length === 0) {
            return;
        }
        const body = {
            ControlUEProperty,
            ControlMovement,
            ControlUENum: ControlUEIdentity.length,
            ControlUEIdentity,
            ClearType,
            RejCause,
            Res: []
        };
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_CONTROL_UE_LIST_CFG, body)
    }

    _handleControlUEListCfgAck(_, bodyObj) {
        const { CfgResult, IgnoreUENum, IgnoreUEList = [] } = bodyObj;
        const msgList = [`配置管控名单成功`, `存在${IgnoreUENum}个用户未删除成功 [${IgnoreUEList.join(',')}]`,
            `存在${IgnoreUENum}个用户未添加成功 [${IgnoreUEList.join(',')}]`, `管控名单清除成功`];
        this.initQuery();
    }

    /**
     * 查询管控名单
     * @param ControlListType 0：查询黑名单 1：查询白名单
     */
    sendControlListQuery(ControlListType) {
        this.packAndSendMsg(EnumMsgType.O_FL_LMT_TO_ENB_CONTROL_LIST_QUERY, { ControlListType, Res: [] });
    }

    _handleControlListQueryAck(_, bodyObj) {
        const {ControlListProperty, ControlListUEId} = bodyObj;
        // this.log('_handleControlListQueryAck', JSON.stringify(bodyObj));
        if (ControlListProperty === 0) {
            this._updateCellInfo({blackControlList: ControlListUEId});
        }
        else {
            this._updateCellInfo({whiteControlList: ControlListUEId});
        }
    }

    async syncControlList(ControlListType, ControlUEList) {
        let nowControlList = [];
        if (ControlListType === 0) {
            nowControlList = this._cellInfo.blackControlList;
        }
        else {
            nowControlList = this._cellInfo.whiteControlList;
        }
        const nowControlSet = new Set(nowControlList);
        const controlUESet = new Set(ControlUEList);
        const addSet = new Set();
        const deleteSet = new Set();
        for (const IMSI of ControlUEList) {
            if (!nowControlSet.has(IMSI) && addSet.size < 10) {
                addSet.add(IMSI);
            }
        }
        for (const IMSI of nowControlList) {
            if (!controlUESet.has(IMSI) && deleteSet.size < 10) {
                deleteSet.add(IMSI);
            }
        }
        // this.log(Array.from(nowControlSet), Array.from(addSet), Array.from(deleteSet));
        if (addSet.size > 0) {
            await this.sendControlUEListCfg({
                ControlUEProperty: ControlListType,
                ControlMovement: 1,
                ControlUEIdentity: Array.from(addSet),
            });
        }
        if (deleteSet.size > 0) {
            this.sendControlUEListCfg({
                ControlUEProperty: ControlListType,
                ControlMovement: 0,
                ControlUEIdentity: Array.from(deleteSet),
            });
        }
    }
}

/**
 * 新建一个lte控制类实体
 * @param host IP地址
 * @param {TCPClient} lteClient 客户端
 */
const createNewLteCtrl = (host, lteClient) => {
    let lteCtl;
    if (LteCtrlMap.has(host)) {
        lteCtl = LteCtrlMap.get(host);
        console.warn(`lte controller for [${host}] existed, update its client`);
    }
    else if (!IF_LIMIT_ADDRESS_CONNECT || LIMIT_ADDRESS_LIST.includes(host)) {
        console.log(`init new lte controller [${host}]`);
        lteCtl = new LTEControllers(host);
        LteCtrlMap.set(host, lteCtl);
    }
    else {
        console.warn(`host [${host}] not in limit address list, check host`);
        return undefined;
    }
    lteCtl.initClient(lteClient);
    return lteCtl;
};

/**
 * 初始化创建lte controller
 * @param lteCellInfos
 */
export function createLteCtrls (lteCellInfos) {
    if (lteCellInfos) {
        for (const host in lteCellInfos) {
            if (!LteCtrlMap.has(host)) {
                LteCtrlMap.set(host, new LTEControllers(host, lteCellInfos[host]));
            }
            else {
                console.warn(`createLteCtrls got exception ,lteCellInfos:[${JSON.stringify(lteCellInfos)}]`);
            }
        }
    }
}

/**
 *
 * @param host IP地址
 * @return {LTEControllers}
 */
const getLteCtrl = (host) => {
    return LteCtrlMap.get(host);
};

/**
 * 获取所有设备属性
 * @return {{host:string,cellInfo:CellInfo}[]}
 */
export const getAllLteDevice = () => {
    const deviceList = {};
    const itr = LteCtrlMap.values();
    let lteCtl = itr.next().value;
    while (lteCtl) {
        deviceList[lteCtl.host] = {
            host: lteCtl.host,
            cellInfo: lteCtl.getCellInfo()
        };
        lteCtl = itr.next().value;
    }
    return deviceList;
};

export const getAllLteCtrl = () => {
    const deviceList = [];
    const itr = LteCtrlMap.values();
    let lteCtl = itr.next().value;
    while (lteCtl) {
        deviceList.push(lteCtl);
        lteCtl = itr.next().value;
    }
    return deviceList;
};

/**
 * 获取所有设备属性
 * @return {LTEControllers[]}
 */
export const getAllLteList = () => {
    const lteList = [];
    const itr = LteCtrlMap.values();
    let lteCtl = itr.next().value;
    while (lteCtl) {
        lteList.push(lteCtl);
        lteCtl = itr.next().value;
    }
    return lteList;
};

export function startAllLte() {
    const itr = LteCtrlMap.values();
    let lteCtl = itr.next().value;
    const startList = [];
    while (lteCtl) {
        if (lteCtl.getCellInfo().status.value === EnumLTEStatus.CONNECTED) {
            startList.push(lteCtl);
        }
        lteCtl = itr.next().value;
    }
    for (const lte of startList) {
        lte.activateLTEWithLastCellInfo();
    }
    return startList;
}

export function deleteLTECtl(host) {
    if (LteCtrlMap.has(host)) {
        LteCtrlMap.delete(host);
    } else {
        console.log(`deleteLTECtl host[${host}] not in LteCtrlMap`);
    }
}

export function stopAllLteCell() {
    const itr = LteCtrlMap.values();
    let lteCtl = itr.next().value;
    while (lteCtl) {
        if (lteCtl.getCellInfo().status.value === EnumLTEStatus.ACTIVATED) {
            lteCtl.sendSetAdminStateCfg(0);
        }
        lteCtl = itr.next().value;
    }
}

export {createNewLteCtrl, getLteCtrl};
