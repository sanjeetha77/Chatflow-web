const userEvents = require('./userEvents');
const messageEvents = require('./messageEvents');
const statusEvents = require('./statusEvents');

const socketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const onlineUsers = new Set(); 

    io.on('connection', (socket) => {
        // Register modular handlers
        userEvents(io, socket, onlineUsers);
        messageEvents(io, socket);
        statusEvents(io, socket);
    });

    return io;
};

module.exports = socketIO;
