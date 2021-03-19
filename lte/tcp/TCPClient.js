import {FRAME_HEAD_LE_ARR} from '../define/LTEProto'
import {FIX_HEAD_ARR} from "../define/IotProto";
import {createNewLteCtrl} from './LTEControllers'
import {createNewIotCtrl} from "./IotCtl";
import {TCP_TIME_OUT} from '../define/constants'

class TCPClient {
    /**
     *  构建tcp连接，接受发送消息
     * @param {Socket} client tcp客户端
     */
    constructor(client) {
        /**
         * socket客户端
         * @type {Socket}
         * @private
         */
        this._client = client;
        this.remoteAddress = this._client.address();
        this.authenticated = false;
        this._initClient();
        // 风扇板子暂时没有心跳 临时解决方案
        if (this.remoteAddress === '192.168.2.52') {
            createNewIotCtrl(this.remoteAddress, this);
            this.authenticated = true;
        }
    }

    /**
     * 初始化客户端，注册相关事件
     * @private
     */
    _initClient() {
        this._client.setTimeout(TCP_TIME_OUT);
        this._client.on('close', (hadError) => {
            if (hadError) {
                console.error(hadError);
                console.log(`client [${this.remoteAddress}] close and err occur`);
            } else {
                console.log(`client [${this.remoteAddress}] close`);
            }
        });
        this._client.on('data', (data) => {
            if (!this.authenticated) {
                if (Buffer.isBuffer(data)) {
                    const headFrameBuf = Buffer.allocUnsafe(4);
                    data.copy(headFrameBuf, 0, 0, 4);
                    if (headFrameBuf.compare(Buffer.from(FRAME_HEAD_LE_ARR)) === 0) {
                        console.log('new lte client authenticated successful');
                        const lteCtrl = createNewLteCtrl(this.remoteAddress, this);
                        if (lteCtrl) {
                            lteCtrl.handMsg(data);
                        }
                        this.authenticated = true;
                    }
                    else if (headFrameBuf.compare(Buffer.from(FIX_HEAD_ARR)) === 0) {
                        console.log('new iot client authenticated successful');
                        createNewIotCtrl(this.remoteAddress, this).handleMsg(data);
                        this.authenticated = true;
                    }
                    else {
                        console.warn(`client [${this.remoteAddress}] recv msg headframe invalid`);
                    }
                } else {
                    console.warn(`recv data not buffer ,data:${data}`);
                }
            }
        });
        this._client.on('end', () => {
            console.warn(`client [${this.remoteAddress}] end!`);
        });
        this._client.on('error', (err) => {
            console.warn(`client [${this.remoteAddress}] got error:[${err}]`);
        });
        this._client.on('timeout', () => {
            console.warn(`client [${this.remoteAddress}] timeout`);
        });
        console.log(`client [${this.remoteAddress}] init success`);
    }

    /**
     * 发送数据
     * @param data {string|Buffer}
     * @param cb
     */
    sendData(data,cb) {
        if (data && (typeof data === 'string' || Buffer.isBuffer(data))) {
            this._client.write(data,cb);
        } else {
            console.warn(`client [${this.remoteAddress}] send invalid data:[${data}]`);
        }
    }

    /**
     * 为socket client 注册事件
     * @param eventName 事件名称
     * @param cb 事件发生的回调
     */
    registerHandler(eventName, cb) {
        this._client.on(eventName, cb);
        console.log(`register event[${eventName}] on client[${this.remoteAddress}] successful`);
    }

    /**
     * 销毁tcp连接
     */
    destroy() {
        this._client.destroy();
    }
}

export default TCPClient;