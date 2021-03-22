import TCPServer from './tcp/TCPServer'
import './ws';
import lteSchedule from './schedule'

lteSchedule.start();
const server = new TCPServer(3345).startServer();