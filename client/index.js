const io = require('socket.io-client')

class WSClient {
    constructor(host, namespace, key, options = {}) {
        this.host = host;
        this.namespace = namespace;
        this.url = `ws://${host}${namespace}`;
        this.key = key;
        this.socket = io(this.url, {
            autoConnect: true,
            withCredentials: true,
            reconnection: true,
            ...options
        });
        this.initEvent();
    }

    initEvent() {
        this.socket.on('connect', async () => {
            console.log(`${this.url} connect`);
            const res = await this.emitAsync('register', {deviceKey:this.key});
            console.log(res);
        });
    }

    emit(event, data, cb) {
        this.socket.emit(event, data, (...rest) => {
            console.log(`[${this.url}]:emit [${event}] data:[${JSON.stringify(data)}] res:[${JSON.stringify(...rest)}]`);
            cb(...rest);
        });
    }

    emitAsync(event, data, cb) {
        return new Promise(resolve => {
            this.emit(event, data, resolve);
        });
    }
}

if (require.main === module) {
    new WSClient('127.0.0.1', '/lte','asdjksahdkjsahd')
}
