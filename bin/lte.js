import TCPServer from '../lte/tcp/TCPServer'
import {initLog} from '../utils/log'
import '../lte/server/ws';
import lteSchedule from '../lte/schedule'
import {initLteCtrl} from "../lte/tcp/LTEControllers";

initLog('lte');

process.on('error', console.error);
process.on('uncaughtException', console.error);
initLteCtrl();
lteSchedule.start();
const server = new TCPServer(3345).startServer();
