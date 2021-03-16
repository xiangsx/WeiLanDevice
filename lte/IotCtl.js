import { EnumCmd, EnumFunCode, EnumIotStatus, FIX_END, FIX_HEAD, IotProto, IotStatusMap } from './define/IotProto';
import { ALERT_BATTERY_VOLTAGE, IOT_AUTO_UPDATE_INTERVAL, WARN_BATTERY_VOLTAGE } from './define/constants';

/**
 * @type {Map<string,IotCtl>}
 */
const IotCtlMap = new Map();


export class IotCtl {
    /**
     *
     * @param {string} host
     */
    constructor(host) {
        /**
         * @type {TCPClient}
         * @private
         */
        this._iotClient = undefined;
        this.host = host;
        this._status = IotStatusMap.get(EnumIotStatus.DISCONNECTED);
        this._cacheBuff = Buffer.allocUnsafe(0);
        this._iotProto = new IotProto();
        this.autoUpdateClock = NaN;
        /**
         *
         * @typedef {{fanSpeed:number,temperature:0,batteryVoltage:0}} IotInfo
         * @private
         */
        this._iotInfo = {
            fanSpeed: 0,
            batteryVoltage: 100,
        };
    }

    startUpdateIotInfo () {
        console.log(`iot ctl start query`);
        this.autoUpdateClock = setInterval(() => {
            this.queryBatteryVoltage();
            this.queryFanSpeed();
            // this.queryTemperature()
        }, IOT_AUTO_UPDATE_INTERVAL);
    }

    stopUpdateIotInfo () {
        if (!Number.isNaN(this.autoUpdateClock)) {
            console.log(`iot ctl stop query`);
            clearInterval(this.autoUpdateClock);
        }
    }

    getIotInfo () {
        return this._iotInfo;
    };

    /**
     * 更新iotInfo
     * @param {Object} infos
     * @private
     */
    _updateIotInfo (infos) {
        if (infos) {
            let ifIotInfoChanged = false;
            for (const key in infos) {
                if (key) {
                    const info = infos[key];
                    if (this._iotInfo[key] !== info) {
                        this._iotInfo[key] = info;
                        ifIotInfoChanged = true;
                    }
                }
            }
            if (ifIotInfoChanged) {
                console.log(`iot info has changed,changed info : [${JSON.stringify(this._iotInfo)}]`);
            }
        }
    };

    /**
     *
     * @param {number|EnumIotStatus} status
     */
    updateStatus (status) {
        if (IotStatusMap.has(status)) {
            if (status === EnumIotStatus.DISCONNECTED) {
                this.stopUpdateIotInfo();
            }
            if (status === EnumIotStatus.CONNECTED) {
                this.startUpdateIotInfo();
            }
            const currentStatus = this._status;
            this._status = IotStatusMap.get(status);
            console.log(`iot controller status changed from [${currentStatus.text}] to [${this._status.text}]`);
        }
        else {
            console.warn(`IotCtl.updateStatus invalid status:[${status}]`)
        }
    }

    /**
     *
     * @param {Buffer} data
     */
    handleMsg (data) {
        if (!Buffer.isBuffer(data)) {
            console.error(`recv data from iot client is not buffer ,data:${data}`);
            return;
        }
        console.debug(`recv msg from [${this.host}],buffer:${data.toString('hex')}`);
        this._cacheBuff = Buffer.concat([this._cacheBuff, data]);
        // try {
            while (this._cacheBuff.length >= this._iotProto.HEAD_LEN + this._iotProto.END_LEN) {
                const headBuf = data.slice(0, this._iotProto.HEAD_LEN);
                const headObj = this._iotProto.HEAD_STRUCT.getObj(headBuf);
                const bodyBuf = data.slice(this._iotProto.HEAD_LEN, this._iotProto.HEAD_LEN + headObj.contentLength);
                console.debug(`recv data ,head:${JSON.stringify(headObj)},body buffer:${bodyBuf.toString('hex')}`);
                this._cacheBuff = this._cacheBuff.slice(headObj.contentLength +
                    this._iotProto.HEAD_LEN + this._iotProto.END_LEN);
                this._parseBody(headObj, bodyBuf);
            }
        // } catch (e) {
        //     if (e) {
        //         console.error(`parse msg from iot client[${this.host}] run error ,err:[${e}],msg buffer:[${data}]`);
        //     }
        // }
    }

    /**
     * 封装打包发送消息
     * @param {EnumFunCode} funCode
     * @param {EnumCmd} cmd
     * @param {Object} content
     */
    sendMsg (funCode, cmd, content = {}) {
        if (!funCode || !cmd) {
            console.error(`iotCtl.sendMsg invalid arguments ${JSON.stringify({funCode, cmd, content})}`);
            return;
        }
        let bodyBuff;
        if (cmd === EnumCmd.CMD_SET) {
            bodyBuff = this._iotProto.getBodyStruct(funCode).getBuff(content);
        }
        else {
            bodyBuff = this._iotProto.IOT_COMMON_QUERY.getBuff()
        }
        const headBuff = this._iotProto.HEAD_STRUCT.getBuff({
            fixHead: FIX_HEAD,
            funCode,
            cmd,
            contentLength: bodyBuff.length
        });
        const endBuff = this._iotProto.END_STRUCT.getBuff({fixEnd: FIX_END});
        const msgBuff = Buffer.concat([headBuff, bodyBuff, endBuff]);
        console.debug(`iot client send data:${JSON.stringify({
            funCode,
            cmd,
            content
        })},buffer :[${msgBuff.toString('hex')}]`);
        this._iotClient.sendData(msgBuff);
    }

    /**
     *
     * @param {{fixHead:number,funCode:number,cmd:number,contentLength:number}} headObj
     * @param {Buffer} bodyBuf
     */
    _parseBody (headObj, bodyBuf) {
        const {funCode, cmd} = headObj;
        if (!funCode) {
            console.error(`IotCtl._parseBody get invalid headObj :[${headObj}]`);
            return;
        }
        if (cmd === EnumCmd.CMD_QUERY_SUCC) {
            const bodyStruct = this._iotProto.getBodyStruct(funCode);
            const bodyObj = bodyStruct.getObj(bodyBuf);
            console.debug(`
        recv msg from iot client [${this.host}],headObj:${JSON.stringify(headObj)},bodyObj:${JSON.stringify(bodyObj)}`);
            switch (funCode) {
                case EnumFunCode.CLIENT_IP:
                    console.debug(`recv msg type [CLIENT_IP] from iot client [${this.host}]`);
                    break;
                case EnumFunCode.SERVER_IP:
                    console.debug(`recv msg type [SERVER_IP] from iot client [${this.host}]`);
                    break;
                case EnumFunCode.SERVER_PORT:
                    console.debug(`recv msg type [SERVER_PORT] from iot client [${this.host}]`);
                    break;
                case EnumFunCode.FAN_SPEED:
                    this._handleFanSpeedAck(headObj, bodyObj);
                    console.debug(`recv msg type [FAN_SPEED] from iot client [${this.host}]`);
                    break;
                case EnumFunCode.TEMPERATURE:
                    // this._handleTemperatureAck(headObj, bodyObj);
                    console.debug(`recv msg type [TEMPERATURE] from iot client [${this.host}]`);
                    break;
                case EnumFunCode.BATTERY_VOLTAGE:
                    this._handleBatteryVoltageAck(headObj, bodyObj);
                    console.debug(`recv msg type [BATTERY_VOLTAGE] from iot client [${this.host}]`);
                    break;
                default:
                    console.warn(
                        `IotCtl._parseBody not support this funCode[${funCode}],headObj:[${JSON.stringify(headObj)}]`);
                    break;
            }
        }
        else if (cmd === EnumCmd.CMD_SET_SUCC) {
        }
        else if (cmd === EnumCmd.CMD_SET_FAIL) {
        }
        else {
            console.warn(`recv other cmd msg headObj:${JSON.stringify(headObj)}`);
        }
    }

    _handleBatteryVoltageAck (headObj, bodyObj) {
        const {batteryVoltage} = bodyObj;
        if (batteryVoltage) {
            if (batteryVoltage <= ALERT_BATTERY_VOLTAGE) {
                if (this._iotInfo.batteryVoltage > ALERT_BATTERY_VOLTAGE) {
                }
            } else if (batteryVoltage <= WARN_BATTERY_VOLTAGE && this._iotInfo.batteryVoltage > WARN_BATTERY_VOLTAGE) {
            }
            this._updateIotInfo({batteryVoltage});
        }
        else {
            console.log(`_handleBatteryVoltageAck recv valid arguments,headObj:${
                JSON.stringify(headObj)},bodyObj:${bodyObj}`)

        }
    }

    _handleFanSpeedAck (headObj, bodyObj) {
        const {fanSpeed} = bodyObj;
        if (fanSpeed) {
            this._updateIotInfo({fanSpeed});
        }
        else {
            console.log(`_handleFanSpeedAck recv valid arguments,headObj:${
                JSON.stringify(headObj)},bodyObj:${bodyObj}`)
        }
    }

    _handleTemperatureAck (headObj, bodyObj) {
        let {temperature} = bodyObj;
        temperature = (+temperature - 50) / 10;
        if (temperature && (!Number.isNaN(temperature))) {
            this._updateIotInfo({temperature});
        }
        else {
            console.log(`_handleTemperatureAck recv valid arguments,headObj:${
                JSON.stringify(headObj)},bodyObj:${bodyObj}`);
        }
    }

    queryTemperature () {
        this.sendMsg(EnumFunCode.TEMPERATURE, EnumCmd.CMD_QUERY);
    }

    queryFanSpeed () {
        this.sendMsg(EnumFunCode.FAN_SPEED, EnumCmd.CMD_QUERY);
    }

    queryBatteryVoltage () {
        this.sendMsg(EnumFunCode.BATTERY_VOLTAGE, EnumCmd.CMD_QUERY);
    }

    /**
     * 设置风扇转速
     * @param {number} fanSpeed
     */
    setFanSpeed (fanSpeed) {
        if (fanSpeed === undefined || typeof fanSpeed !== "number") {
            console.error(`iotCtl.setFanSpeed get invalid arguments fanSpeed:${fanSpeed}`);
            return;
        }
        if (fanSpeed > 100 || fanSpeed < 0) {
            console.warn(`iotCtl.setFanSpeed fanSpeed is not in valid range, fanSpeed:${fanSpeed}`);
            return;
        }
        this.sendMsg(EnumFunCode.FAN_SPEED, EnumCmd.CMD_SET, {fanSpeed});
    }

    /**
     * @param {TCPClient} tcpClient
     */
    initClient(tcpClient) {
        if (this._iotClient) {
            console.log(`iot client [${this.host}] reconnected`);
        }
        else {
            console.log(`iot client [${this.host}] connected`);
        }
        this.updateStatus(EnumIotStatus.CONNECTED);
        this._iotClient = tcpClient;
        this._iotClient.registerHandler('data', this.handleMsg.bind(this));
        this._iotClient.registerHandler('error', (err) => {
            if (err) {
                console.error(`iot controller [${this.host}] got error:${err}`);
                this._iotClient.destroy();
            }
        });
        this._iotClient.registerHandler('close', () => {
            this.updateStatus(EnumIotStatus.DISCONNECTED);
            console.warn(`iot controller [${this.host}] disconnected`);
        });
    }
}

/**
 * 新建一个iot控制类实体
 * @param host IP地址
 * @param {TCPClient} tcpClient 客户端
 * @return {IotCtl}
 */
export const createNewIotCtrl = (host, tcpClient) => {
    let iotCtl;
    if (IotCtlMap.has(host)) {
        iotCtl = IotCtlMap.get(host);
        console.warn(`iot controller for [${host}] existed, update its client`);
    }
    else {
        console.log(`init new iot controller [${host}]`);
        iotCtl = new IotCtl(host);
        IotCtlMap.set(host, iotCtl);
    }
    iotCtl.initClient(tcpClient);
    return iotCtl;
};

/**
 * @return {IotCtl}
 */
export function getValidIotCtrl() {
    const iotIterator = IotCtlMap.values();
    const validIot = iotIterator.next().value;
    if (!validIot) {
        console.warn('There is not valid iot device connected');
    }
    return validIot;
}

/**
 * @return {IotInfo}
 */
export function getIotInfo() {
    return getValidIotCtrl().getIotInfo();
}
