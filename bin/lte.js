import TCPServer from '../lte/tcp/TCPServer'
import {initLog} from '../utils/log'
import '../lte/server/ws';
import lteSchedule from '../lte/schedule'
import {initDB} from '../store/db'
import {initLteCtrl} from "../lte/tcp/LTEControllers";

initLog('lte');
initDB();
initLteCtrl();
lteSchedule.start();
const server = new TCPServer(3345).startServer();
