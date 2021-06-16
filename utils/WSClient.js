import io from 'socket.io-client';
import domain from 'domain';
import {EnumErrorDefine, ErrorMap} from '../define/error'

class WSClient {
    constructor(host, namespace, options = {}) {
        this.host = host;        this.namespace = namespace;
        this.url = `ws://${host}${namespace}`;
        this.socket = io(this.url, {
            autoConnect: true,
            withCredentials: true,
            reconnection: true,
            ...options
        }).compress(true);
        this.initLog();
        this.init();
    }

    initLog = () => {
        const logMethodList = ['debug', 'log', 'warn', 'error']
        for (let logMethod of logMethodList) {
            this[logMethod] = (...rest) => {
                return console[logMethod](`[${this.socket.id}]`, ...rest);
            };
        }
    };

    init = (register) => {
        this.socket.on('connect', () => {
            this.log(`${this.url} connect`);
        });
    }

    emit = (event, data, cb) => {
        if (!this.connected()) {
            this.warn(`can not emit event, ws client disconnected`);
            cb(EnumErrorDefine.ERR_WS_DISCONNECTED);
            return;
        }
        this.socket.emit(event, data, (...rest) => {
            this.log(`emit [${event}] req:[${JSON.stringify(data)}] res:[${JSON.stringify(...rest)}]`);
            cb(...rest);
        });
    }

    emitAsync = (event, data) => {
        return new Promise(resolve => {
            this.emit(event, data, resolve);
        });
    }

    listen = (event, handle) => {
        this.socket.on(event, (data, res) => {
            this.log(`ltews listened event[${event}] data[${JSON.stringify(data)}]`);
            const newDomain = domain.create();
            newDomain.run(() => handle(data, res));
            newDomain.on('error', (err) => {
                console.error(err);
                this.wrap(res, err.message, EnumErrorDefine.ERR_UNKNOWN);
            });
        });
    }

    wrap = (res, data, code = EnumErrorDefine.SUCCESS) => {
        if (typeof res !== "function") {
            return;
        }
        const result = {
            code: EnumErrorDefine.SUCCESS,
            msg: ErrorMap.get(EnumErrorDefine.SUCCESS).msg,
            data
        };
        if (ErrorMap.has(code)) {
            result.code = code;
            result.msg = ErrorMap.get(code).msg;
        }
        else {
            result.code = EnumErrorDefine.ERR_UNKNOWN;
            result.msg = ErrorMap.get(EnumErrorDefine.ERR_UNKNOWN).msg;
        }
        this.log(`ws wrap msg [${JSON.stringify(result)}]`);
        res(result);
    }

    connected() {
        return this.socket.connected;
    }
}

export default WSClient;

if (require.main === module) {
    new WSClient('127.0.0.1', '/lte','asdjksahdkjsahd')
}
