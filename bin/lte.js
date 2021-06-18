import {initLog} from '../utils/log'
initLog('lte');
import '../utils/errHandler';
import TCPServer from '../lte/tcp/TCPServer'
import '../lte/server/ws';
import lteSchedule from '../lte/schedule'
import {initLteCtrl} from "../lte/tcp/LTEControllers";


initLteCtrl();
lteSchedule.start();
new TCPServer(3345).startServer();
