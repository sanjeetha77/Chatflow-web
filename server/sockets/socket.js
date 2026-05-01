const socketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    let users = [];

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join', (userId) => {
            const userExists = users.find(u => u.userId === userId);
            if (!userExists) {
                users.push({ userId, socketId: socket.id });
            } else {
                userExists.socketId = socket.id;
            }
            io.emit('getUsers', users);
        });

        socket.on('sendMessage', ({ senderId, receiverId, message }) => {
            const user = users.find(u => u.userId === receiverId);
            if (user) {
                io.to(user.socketId).emit('getMessage', {
                    senderId,
                    message,
                    timestamp: new Date()
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            users = users.filter(u => u.socketId !== socket.id);
            io.emit('getUsers', users);
        });
    });

    return io;
};

module.exports = socketIO;
