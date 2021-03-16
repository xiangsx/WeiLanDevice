const io = require('socket.io-client')

const socket = io('http://127.0.0.1/lte', {
    autoConnect: true,
    withCredentials: true,
    reconnection: true,
});

socket.on('res', (...rest) => {
    console.log(...rest);
});

socket.on('connect', () => {
    socket.emit('helloevent', {data:{name:'sx'}});
});

// socket.onAny((...rest) => {
//     console.log('onAny', ...rest);
// });

socket.on('error', function (err) {
    console.log('error', err);
});

setTimeout(() => {
    socket.emit('hello', 'hello')
}, 1000);
