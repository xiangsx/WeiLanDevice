import TCPServer from '../lte/tcp/TCPServer'
import '../utils/log'
import '../lte/ws';
import lteSchedule from '../lte/schedule'
import {initDB} from '../store/db'

console.error(new Error('haha'));
initDB();
lteSchedule.start();
const server = new TCPServer(3345).startServer();