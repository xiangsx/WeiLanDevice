import '../utils/log'
import '../utils/errHandler';
import '../utils/promethusExporter';
import TCPServer from '../lte/tcp/TCPServer'
import '../lte/server/ws';
import lteSchedule from '../lte/schedule'
lteSchedule.start();
new TCPServer(3345).startServer();
