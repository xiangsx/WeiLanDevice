import io from 'socket.io-client';
import {EnumErrorDefine, ErrorMap} from '../define/error'

class WSClient {
    constructor(host, namespace, options = {}) {
        this.host = host;
        this.namespace = namespace;
        this.url = `ws://${host}${namespace}`;
        this.socket = io(this.url, {
            autoConnect: true,
            withCredentials: true,
            reconnection: true,
            ...options
        });
    }

    init = (register) => {
        this.socket.on('connect', () => {
            console.log(`${this.url} connect`);
            register();
        });
    }

    emit = (event, data, cb) => {
        this.socket.emit(event, data, (...rest) => {
            console.log(`[${this.url}]:emit [${event}] data:[${JSON.stringify(data)}] res:[${JSON.stringify(...rest)}]`);
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
            console.log(`ltews listen event[${event}] data[${JSON.stringify(data)}]`);
            handle(data, res);
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
        res(result);
    }
}

export default WSClient;

if (require.main === module) {
    new WSClient('127.0.0.1', '/lte','asdjksahdkjsahd')
}
