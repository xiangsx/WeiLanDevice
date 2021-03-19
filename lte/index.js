import TCPServer from './tcp/TCPServer'
import LteWS from './ws';

new LteWS();
const server = new TCPServer(3345).startServer();