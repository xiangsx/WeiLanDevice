import TCPServer from '../lte/tcp/TCPServer'
import '../lte/ws';
import lteSchedule from '../lte/schedule'
import {initDB} from '../store/db'

initDB();
lteSchedule.start();
const server = new TCPServer(3345).startServer();