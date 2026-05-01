const socketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Phase 1: In-memory map for online users
    let onlineUsers = {}; // { userId: socketId }

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Phase 2: Join event
        socket.on('join', (userId) => {
            onlineUsers[userId] = socket.id;
            console.log(`User ${userId} joined. Current onlineUsers:`, onlineUsers);
            
            // Broadcast to everyone that a new user is online
            io.emit('userJoined', userId);
            io.emit('getOnlineUsers', Object.keys(onlineUsers));
        });

        // Phase 3: Message handling
        socket.on('sendMessage', (data) => {
            console.log('Server received sendMessage:', data);
            const { senderId, receiverId, message, timestamp } = data;
            
            const receiverSocket = onlineUsers[receiverId];
            console.log(`Searching for receiverId ${receiverId}. Found socketId: ${receiverSocket}`);

            if (receiverSocket) {
                console.log(`Emitting receiveMessage to socket ${receiverSocket}`);
                io.to(receiverSocket).emit('receiveMessage', {
                    senderId,
                    message,
                    timestamp: timestamp || new Date()
                });
            } else {
                console.log(`Receiver ${receiverId} is NOT online. Available users:`, Object.keys(onlineUsers));
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            // Remove user from map
            for (const [userId, socketId] of Object.entries(onlineUsers)) {
                if (socketId === socket.id) {
                    delete onlineUsers[userId];
                    break;
                }
            }
            io.emit('getOnlineUsers', Object.keys(onlineUsers));
        });
    });

    return io;
};

module.exports = socketIO;
