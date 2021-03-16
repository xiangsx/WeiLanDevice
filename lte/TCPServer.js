import {createServer} from 'net'
import TCPClient from './TCPClient';

/**
 * 服务类
 */
class TCPServer {
    /**
     * @param port 监听端口
     */
    constructor(port) {
        this._port = port;
        this._server = createServer((socket) => {
            // eslint-disable-next-line no-new
            new TCPClient(socket)
        });
        this._server.on('error', (err) => {
            if (err) {
                console.error(`lte server got error :${err}`);
            }
        });
        this._server.on('close', () => {
            console.error(`lte server closed`);
        });
    }

    /**
     * 启动服务器监听指定端口
     */
    startServer() {
        this._server.listen(this._port);
        console.log(`server listen on port [${this._port}]`);
    }
}

export default TCPServer;